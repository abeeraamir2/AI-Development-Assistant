# backend/routes/analyzer_routes.py

from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from services.auth_service import get_current_user
from services.analysis_service import FALLBACK_RESULT, analyze_requirement
from services.file_service import extract_text_from_upload
from services.embedding_service import embed_text

from database.database import (
    save_analysis,
    find_related_requirements,
    save_requirement_embeddings,
)

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: Optional[UploadFile] = File(None),
    text_input: Optional[str] = Form(None),
    scopes: Optional[str] = Form(None),
    project: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
):

    user_email = current_user.get("email") or current_user.get("user_email")

    resolved_project_name = project or "Project Alpha"
    resolved_project_id = project_id or "proj_01"

    try:
        filename = "requirement_doc.txt"
        extracted_text = ""

        if file:
            filename = file.filename
            extracted_text = await extract_text_from_upload(file)

        elif text_input and text_input.strip():
            extracted_text = text_input.strip()

        if not extracted_text:
            raise HTTPException(
                status_code=400,
                detail="Requirement text or file is required."
            )

        scopes_list = None

        if scopes:
            scopes_list = [
                s.strip()
                for s in scopes.split(",")
                if s.strip()
            ]

        query_embedding = embed_text(extracted_text)

        related_context = await find_related_requirements(
            resolved_project_id,
            query_embedding
        )

        analysis_result = analyze_requirement(
            extracted_text,
            scopes=scopes_list,
            related_context=related_context,
        )

        if not isinstance(analysis_result, dict):
            analysis_result = dict(FALLBACK_RESULT)

        analysis_result["project"] = resolved_project_name
        analysis_result["project_id"] = resolved_project_id
        analysis_result["filename"] = filename

        try:
            saved_id = await save_analysis(
                project_id=resolved_project_id,
                project_name=resolved_project_name,
                filename=filename,
                extracted_text=extracted_text,
                analysis_result=analysis_result,
                user_email=user_email,
            )

            analysis_result["analysis_id"] = saved_id

            await save_requirement_embeddings(
                resolved_project_id,
                saved_id,
                analysis_result.get("criteria", [])
            )

        except Exception as db_error:
            print(
                f"[WARN] Failed to save analysis to database: {db_error}"
            )

        return analysis_result

    except HTTPException:
        raise

    except Exception as e:
        print(f"[ERROR] Unexpected error in /upload: {e}")

        fallback = dict(FALLBACK_RESULT)
        fallback["project"] = resolved_project_name
        fallback["project_id"] = resolved_project_id

        return fallback