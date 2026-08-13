import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends

from database.database import save_test_suite
from services.test_service import generate_tests
from services.auth_service import require_role, get_current_user
from services.file_service import extract_text_from_upload

router = APIRouter()


@router.post("/generate-tests")
async def generate_tests_endpoint(
    input_text: Optional[str] = Form(None),
    strategy: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: dict = Depends(require_role(["QA", "Admin", "Developer"]))
):
    extracted_text = ""

    if file:
        extracted_text = await extract_text_from_upload(file)

    full_requirement_text = ""
    if input_text and input_text.strip():
        full_requirement_text += input_text.strip() + "\n\n"
    if extracted_text:
        full_requirement_text += extracted_text

    if not full_requirement_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide requirement text or upload a specification document."
        )

    try:
        strategy_dict = json.loads(strategy)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid strategy configuration format.")

    test_types = strategy_dict.get("selectedTypes", [])
    if not test_types:
        raise HTTPException(status_code=400, detail="Select at least one test type.")

    # 4. Invoke Gemini with full strategy object
    try:
        result = generate_tests(full_requirement_text, strategy_dict)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # 5. Save to MongoDB
    document_name = file.filename if file else "Manual Requirement Input"
    await save_test_suite(document_name, full_requirement_text, result, current_user["email"])

    return result