import json
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from bson import ObjectId

from database.database import (
    save_test_suite,
    get_test_suites_list,
    get_test_suite_by_id,
    delete_test_suite_by_id,
    projects_collection,
    users_collection,
)
from services.test_service import generate_tests_from_code, generate_tests
from services.auth_service import require_role
from services.file_service import extract_text_from_upload
from services.project_code_service import (
    extract_project_from_zip,
    extract_project_from_files,
)

router = APIRouter()


@router.get("/test-suites")
async def get_test_suites_endpoint(
    search: Optional[str] = None,
    project_id: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(require_role(["Admin", "QA Engineer", "QA", "Tester", "Quality Assurance"])),
):
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id")
    user_role = current_user.get("role", "QA")

    return await get_test_suites_list(
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
        project_id=project_id,
        search=search,
        limit=limit,
    )


@router.get("/test-suites/{suite_id}")
async def get_test_suite_details_endpoint(
    suite_id: str,
    current_user: dict = Depends(require_role(["Admin", "QA Engineer", "QA", "Tester", "Quality Assurance"])),
):
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id")
    user_role = current_user.get("role", "QA")

    suite = await get_test_suite_by_id(
        suite_id=suite_id,
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
    )
    if not suite:
        raise HTTPException(status_code=404, detail="Test suite not found or access denied.")
    return suite


@router.delete("/test-suites/{suite_id}")
async def delete_test_suite_endpoint(
    suite_id: str,
    current_user: dict = Depends(require_role(["Admin", "QA Engineer", "QA", "Tester", "Quality Assurance"])),
):
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id")
    user_role = current_user.get("role", "QA")

    success = await delete_test_suite_by_id(
        suite_id=suite_id,
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
    )
    if not success:
        raise HTTPException(status_code=404, detail="Test suite could not be deleted or access denied.")
    return {"message": "Test suite deleted successfully."}


@router.post("/generate-tests")
@router.post("/test-suites")
async def generate_tests_endpoint(
    strategy: str = Form(...),
    project_id: Optional[str] = Form(None),
    project_name: Optional[str] = Form(None),
    focus_notes: Optional[str] = Form(None),
    input_text: Optional[str] = Form(None),
    relative_paths: Optional[str] = Form(None),  # JSON array string of relative paths
    zip_file: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),  # Single requirement file or zip
    files: Optional[List[UploadFile]] = File(None),  # Multiple folder files
    current_user: dict = Depends(require_role(["Admin", "QA Engineer", "QA"])),
):
    try:
        strategy_dict = json.loads(strategy)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid strategy configuration format.")

    test_types = strategy_dict.get("selectedTypes", [])
    if not test_types:
        raise HTTPException(status_code=400, detail="Please select at least one test type.")

    code_content = ""
    file_tree = []
    languages = []
    inferred_project_name = project_name or "Uploaded Project"

    # Verify and retrieve project if project_id is provided
    if project_id:
        try:
            proj_doc = await projects_collection.find_one({"_id": ObjectId(project_id)})
            if proj_doc:
                inferred_project_name = proj_doc.get("name", inferred_project_name)
        except Exception:
            pass

    # 1. Check if a ZIP project archive was uploaded
    archive_file = zip_file or (file if file and file.filename and file.filename.endswith(".zip") else None)

    if archive_file:
        extracted_name, file_tree, code_content, languages = await extract_project_from_zip(archive_file)
        if not project_id:
            inferred_project_name = extracted_name

    # 2. Check if a folder (multiple files) was uploaded
    elif files and len(files) > 0:
        parsed_rel_paths = []
        if relative_paths:
            try:
                parsed_rel_paths = json.loads(relative_paths)
            except Exception:
                parsed_rel_paths = []
        extracted_name, file_tree, code_content, languages = await extract_project_from_files(
            files,
            project_name_override=inferred_project_name,
            relative_paths=parsed_rel_paths,
        )
        if not project_id:
            inferred_project_name = extracted_name

    # 3. Check if single document (PDF/DOCX/TXT) or manual text was uploaded
    elif file or (input_text and input_text.strip()):
        extracted_doc_text = ""
        if file:
            extracted_doc_text = await extract_text_from_upload(file)
            if not project_id:
                inferred_project_name = file.filename

        combined_text = (input_text or "") + "\n\n" + extracted_doc_text
        code_content = combined_text.strip()
        file_tree = [{"path": file.filename if file else "Manual Input", "size": len(code_content), "language": "Text"}]
        languages = ["Requirement Specification"]

    # 4. Fallback if only project metadata exists
    elif project_id:
        try:
            proj_doc = await projects_collection.find_one({"_id": ObjectId(project_id)})
            if proj_doc:
                code_content = f"Project Name: {inferred_project_name}\nDescription: {proj_doc.get('description', '')}\nVisibility: {proj_doc.get('visibility', 'private')}"
                file_tree = [{"path": "project_metadata.json", "size": len(code_content), "language": "JSON"}]
                languages = ["Metadata"]
        except Exception:
            pass

    if not code_content.strip():
        raise HTTPException(
            status_code=400,
            detail="Please upload your project codebase folder or ZIP archive to generate test cases."
        )

    # Generate Test Suite via Gemini AI
    try:
        result = generate_tests_from_code(
            project_name=inferred_project_name,
            code_content=code_content,
            strategy_dict=strategy_dict,
            focus_notes=focus_notes or "",
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Test generation failed: {str(e)}")

    # Resolve user_id for foreign key
    user_id = current_user.get("user_id") or current_user.get("id")
    if not user_id:
        user_doc = await users_collection.find_one({"email": current_user["email"]})
        if user_doc:
            user_id = str(user_doc["_id"])

    # Save to MongoDB with foreign keys
    suite_id = await save_test_suite(
        filename=inferred_project_name,
        requirement_text=code_content,
        test_suite_result=result,
        project_id=project_id,
        user_id=user_id,
        user_email=current_user["email"],
        languages=languages,
        files_count=len(file_tree),
    )

    return {
        "suite_id": suite_id,
        "project_id": project_id,
        "project_name": inferred_project_name,
        "files_analyzed": len(file_tree),
        "languages": languages,
        "file_tree": file_tree[:50],
        "test_suite": result,
    }