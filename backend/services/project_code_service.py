# backend/services/project_code_service.py
import os
import zipfile
from io import BytesIO
from typing import List, Tuple, Dict, Any
from fastapi import UploadFile, HTTPException

IGNORE_DIRS = {
    "node_modules", ".git", ".github", "__pycache__", ".venv", "venv",
    "dist", "build", ".next", ".nuxt", ".idea", ".vscode", "coverage",
    ".pytest_cache", ".mypy_cache", ".cargo", "target", "bin", "obj",
    "vendor", ".turbo", ".cache", "logs", "tmp"
}

ALLOWED_CODE_EXTENSIONS = {
    # Core Languages
    ".py", ".js", ".jsx", ".ts", ".tsx", ".java", ".go", ".cs", ".cpp",
    ".c", ".h", ".hpp", ".php", ".rb", ".rs", ".kt", ".swift", ".scala",
    # Web & Templates
    ".html", ".css", ".scss", ".vue", ".svelte",
    # Config, API Schemas, Databases
    ".json", ".yaml", ".yml", ".sql", ".prisma", ".graphql", ".proto",
    ".env.example", ".md", ".txt"
}

NAMED_FILES = {
    "dockerfile", "docker-compose.yml", "docker-compose.yaml",
    "package.json", "requirements.txt", "pom.xml", "build.gradle",
    "cargo.toml", "go.mod", "makefile"
}

MAX_TOTAL_CODE_CHARS = 120_000  # Generous budget for Gemini Flash context
MAX_SINGLE_FILE_CHARS = 15_000


def should_process_path(rel_path: str) -> bool:
    normalized = rel_path.replace("\\", "/").strip("/")
    parts = normalized.split("/")
    
    # Check ignored directories
    for part in parts[:-1]:
        if part in IGNORE_DIRS or part.startswith("."):
            return False

    filename = parts[-1].lower()
    if filename.startswith(".") and not filename == ".env.example":
        return False

    if filename in NAMED_FILES:
        return True

    ext = os.path.splitext(filename)[1].lower()
    return ext in ALLOWED_CODE_EXTENSIONS


def detect_language(ext: str) -> str:
    mapping = {
        ".py": "Python",
        ".ts": "TypeScript",
        ".tsx": "TypeScript/React",
        ".js": "JavaScript",
        ".jsx": "JavaScript/React",
        ".java": "Java",
        ".go": "Go",
        ".cs": "C#",
        ".cpp": "C++",
        ".php": "PHP",
        ".rb": "Ruby",
        ".rs": "Rust",
        ".sql": "SQL",
        ".json": "JSON",
        ".yaml": "YAML",
        ".yml": "YAML",
        ".html": "HTML",
    }
    return mapping.get(ext.lower(), "Text")


async def extract_project_from_zip(file: UploadFile) -> Tuple[str, List[Dict[str, Any]], str, List[str]]:
    """
    Extracts code files from an uploaded .zip project archive.
    Returns: (project_name, file_tree_items, aggregated_code_text, detected_languages)
    """
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="The uploaded ZIP file is empty.")

    try:
        zip_buffer = BytesIO(contents)
        with zipfile.ZipFile(zip_buffer, "r") as zf:
            namelist = zf.namelist()
            valid_files = [name for name in namelist if not name.endswith("/") and should_process_path(name)]

            if not valid_files:
                raise HTTPException(
                    status_code=400,
                    detail="No source code or config files found in the uploaded archive. Ensure it contains source files (.py, .js, .ts, etc.)."
                )

            # Sort files logically (configs and routes first, then general code)
            valid_files.sort()

            aggregated_text = []
            total_chars = 0
            file_tree_items = []
            languages = set()

            project_name = os.path.splitext(file.filename or "project")[0]

            for rel_path in valid_files:
                try:
                    with zf.open(rel_path) as f:
                        file_bytes = f.read()
                        try:
                            code_str = file_bytes.decode("utf-8")
                        except UnicodeDecodeError:
                            code_str = file_bytes.decode("latin-1", errors="ignore")

                        ext = os.path.splitext(rel_path)[1]
                        lang = detect_language(ext)
                        if lang != "Text":
                            languages.add(lang)

                        file_tree_items.append({
                            "path": rel_path,
                            "size": len(file_bytes),
                            "language": lang,
                        })

                        # Truncate very long files
                        if len(code_str) > MAX_SINGLE_FILE_CHARS:
                            code_str = code_str[:MAX_SINGLE_FILE_CHARS] + "\n\n... [File content truncated for brevity] ..."

                        if total_chars < MAX_TOTAL_CODE_CHARS:
                            entry = f"### File: {rel_path} ({lang})\n```{ext.replace('.', '')}\n{code_str}\n```\n"
                            aggregated_text.append(entry)
                            total_chars += len(entry)
                except Exception:
                    continue

            return project_name, file_tree_items, "\n".join(aggregated_text), sorted(list(languages))

    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file. Please ensure the uploaded archive is a valid .zip file.")


async def extract_project_from_files(
    files: List[UploadFile],
    project_name_override: str = "Uploaded Project",
    relative_paths: List[str] = None
) -> Tuple[str, List[Dict[str, Any]], str, List[str]]:
    """
    Extracts code from a list of files uploaded via folder upload (webkitdirectory).
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files received from folder upload.")

    aggregated_text = []
    total_chars = 0
    file_tree_items = []
    languages = set()

    for idx, f in enumerate(files):
        rel_path = relative_paths[idx] if (relative_paths and idx < len(relative_paths)) else f.filename
        if not rel_path or not should_process_path(rel_path):
            continue

        try:
            file_bytes = await f.read()
            try:
                code_str = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                code_str = file_bytes.decode("latin-1", errors="ignore")

            ext = os.path.splitext(rel_path)[1]
            lang = detect_language(ext)
            if lang != "Text":
                languages.add(lang)

            file_tree_items.append({
                "path": rel_path,
                "size": len(file_bytes),
                "language": lang,
            })

            if len(code_str) > MAX_SINGLE_FILE_CHARS:
                code_str = code_str[:MAX_SINGLE_FILE_CHARS] + "\n\n... [File content truncated for brevity] ..."

            if total_chars < MAX_TOTAL_CODE_CHARS:
                entry = f"### File: {rel_path} ({lang})\n```{ext.replace('.', '')}\n{code_str}\n```\n"
                aggregated_text.append(entry)
                total_chars += len(entry)
        except Exception:
            continue

    if not file_tree_items:
        raise HTTPException(
            status_code=400,
            detail="No valid source code files found in the uploaded directory."
        )

    # If first relative path had root directory name, infer project name
    inferred_name = project_name_override
    if file_tree_items and "/" in file_tree_items[0]["path"]:
        root_dir = file_tree_items[0]["path"].split("/")[0]
        if root_dir and root_dir != ".":
            inferred_name = root_dir

    return inferred_name, file_tree_items, "\n".join(aggregated_text), sorted(list(languages))
