import os
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
from docx import Document

router = APIRouter()

ALLOWED_EXTENSIONS = (".pdf",".docx",".txt")
MAX_FILE_SIZE_MB = 10

def extract_text_from_pdf(file_bytes):
    reader = PdfReader(BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file_bytes):
    doc = Document(BytesIO(file_bytes))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    if not file.filename.endswith(ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Please upload one of: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    contents = await file.read()

    size_mb = len(contents)/(1024*1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f}MB). Max size is {MAX_FILE_SIZE_MB}MB."
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        if file.filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(contents)
        elif file.filename.endswith(".docx"):
            extracted_text = extract_text_from_docx(contents)
        else:
            extracted_text = contents.decode("utf-8")
    except Exception:
        raise HTTPException(
            status_code=422,
            detail="Could not parse this file. It may be corrupted or in an unsupported format."
        )

    if not extracted_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in this file (it may be a scanned/image-only document)."
        )

    return {
        "summary": extracted_text[:300],
        "criteria": ["Real AI analysis not yet connected — showing raw extracted text"],
        "apis": [],
        "tasks": [],
        "edgeCases": [],
        "dbTables": []
    }