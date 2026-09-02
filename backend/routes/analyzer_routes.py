from typing import Optional
from datetime import datetime, timezone
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from models.analyzer_models import (
    SimilarityCheckRequest,
    AnalysisStatusUpdateRequest,
)
from services.auth_service import require_role
from services.analysis_service import FALLBACK_RESULT, analyze_requirement
from services.file_service import extract_text_from_upload
from services.embedding_service import embed_text
from database.database import (
    save_analysis,
    get_recent_analyses,
    get_analysis_by_id,
    find_related_requirements,
    save_requirement_embeddings,
    delete_analysis,
    update_analysis_status,
)

router = APIRouter()


@router.post("/upload")
@router.post("/analyze")
async def upload_file(
    file: Optional[UploadFile] = File(None),
    text_input: Optional[str] = Form(None),
    scopes: Optional[str] = Form(None),
    project: Optional[str] = Form(None),
    project_id: Optional[str] = Form(None),
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id") or current_user.get("_id")

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
            query_embedding,
            query_text=extracted_text,
        )

        analysis_result = analyze_requirement(
            extracted_text,
            scopes=scopes_list,
            related_context=related_context,
        )

        if not isinstance(analysis_result, dict):
            analysis_result = dict(FALLBACK_RESULT)

        now_utc = datetime.now(timezone.utc)
        analysis_result["project"] = resolved_project_name
        analysis_result["project_id"] = resolved_project_id
        analysis_result["filename"] = filename
        analysis_result["created_at"] = now_utc.isoformat()

        # Dynamic related count
        rel_list = related_context or (analysis_result.get("evidence") or {}).get("related") or []
        analysis_result["related_count"] = len(rel_list)

        try:
            saved_id = await save_analysis(
                project_id=resolved_project_id,
                project_name=resolved_project_name,
                filename=filename,
                extracted_text=extracted_text,
                analysis_result=analysis_result,
                user_id=user_id,
                user_email=user_email,
            )

            analysis_result["id"] = saved_id
            analysis_result["_id"] = saved_id
            analysis_result["analysis_id"] = f"ANL-{saved_id[-6:].upper()}"

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


@router.get("/projects/{project_id}/related-requirements")
async def get_related_requirements_endpoint(
    project_id: str,
    text: Optional[str] = None,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    """
    Fetches real related requirements from DB for a given project.
    If 'text' is provided, computes real semantic embedding similarity.
    """
    query_emb = []
    clean_text = text.strip() if text else ""
    if clean_text:
        try:
            query_emb = embed_text(clean_text)
        except Exception as e:
            print(f"[WARN] Failed to embed query text: {e}")
    return await find_related_requirements(project_id, query_embedding=query_emb, query_text=clean_text, limit=5)


@router.post("/check-similarity")
async def check_similarity_endpoint(
    req: SimilarityCheckRequest,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    """
    Checks if a typed or uploaded requirement is similar to existing requirements in DB for this project.
    """
    search_text = (req.input_text or req.text or "").strip()
    if not req.project_id or not search_text:
        return {"similar_detected": False, "matches": []}

    try:
        query_emb = embed_text(search_text.strip())
        matches = await find_related_requirements(
            req.project_id,
            query_emb,
            query_text=search_text.strip(),
            limit=3,
        )
        top_match = matches[0] if matches else None
        if top_match and top_match.get("matchPercent", 0) >= 70:
            return {
                "similar_detected": True,
                "similar_req": {
                    "id": top_match.get("id"),
                    "title": top_match.get("title"),
                    "matchPercent": top_match.get("matchPercent"),
                    "timeAgo": top_match.get("timeAgo", "recently"),
                },
                "matches": matches,
            }
        return {"similar_detected": False, "matches": matches}
    except Exception as e:
        print(f"[WARN] Error during similarity check: {e}")
        return {"similar_detected": False, "matches": []}


@router.get("/history")
async def history(
    limit: int = 50,
    project_id: Optional[str] = None,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    """Summary rows for the History list (title, project, status, date)."""
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id") or current_user.get("_id")
    return await get_recent_analyses(user_id=user_id, user_email=user_email, limit=limit, project_id=project_id)


@router.get("/history/{analysis_id}")
async def history_detail(
    analysis_id: str,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    """
    Full analysis document for one history row.
    """
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id") or current_user.get("_id")
    user_role = current_user.get("role", "")
    doc = await get_analysis_by_id(analysis_id, user_id=user_id, user_email=user_email, user_role=user_role)

    if not doc:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return doc


@router.delete("/history/{analysis_id}")
@router.delete("/analyses/{analysis_id}")
async def delete_analysis_endpoint(
    analysis_id: str,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    """
    Deletes an analysis document and cleans up associated vector embeddings.
    """
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id") or current_user.get("_id")
    user_role = current_user.get("role", "")

    success, error = await delete_analysis(analysis_id, user_id=user_id, user_email=user_email, user_role=user_role)
    if not success:
        status_code = (
            status.HTTP_404_NOT_FOUND
            if error == "Analysis not found"
            else status.HTTP_403_FORBIDDEN
        )
        raise HTTPException(status_code=status_code, detail=error)

    return {"message": "Analysis deleted successfully", "id": analysis_id}


@router.patch("/history/{analysis_id}/status")
@router.patch("/analyses/{analysis_id}/status")
@router.put("/history/{analysis_id}/status")
async def update_analysis_status_endpoint(
    analysis_id: str,
    payload: AnalysisStatusUpdateRequest,
    current_user: dict = Depends(require_role(["Admin", "Developer", "QA"])),
):
    """
    Updates the review/workflow status of an analysis document.
    """
    user_email = current_user.get("email") or current_user.get("user_email")
    user_id = current_user.get("id") or current_user.get("user_id") or current_user.get("_id")
    user_role = current_user.get("role", "")

    success, result_or_err = await update_analysis_status(
        analysis_id=analysis_id,
        new_status=payload.status,
        user_id=user_id,
        user_email=user_email,
        user_role=user_role,
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result_or_err
        )

    return {"success": True, "status": result_or_err, "id": analysis_id}
