from fastapi import APIRouter, UploadFile, File, Depends
from database.database import save_analysis, get_recent_analyses
from services.gemini_service import analyze_requirement
from services.auth_service import require_role, get_current_user
from services.file_service import extract_text_from_upload

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role(["Developer", "Admin"]))
):
    extracted_text = await extract_text_from_upload(file)

    # Gemini analysis
    analysis_result = analyze_requirement(extracted_text)
    
    # Save to MongoDB
    await save_analysis(file.filename, extracted_text, analysis_result, current_user["email"])
    
    return analysis_result

@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    return await get_recent_analyses(current_user["email"])