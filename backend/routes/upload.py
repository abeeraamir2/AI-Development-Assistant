import os
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
from docx import Document

router = APIRouter()

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
    contents = await file.read()

    if file.filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(contents)
    elif file.filename.endswith(".docx"):
        extracted_text = extract_text_from_docx(contents)
    elif file.filename.endswith(".txt"):
        extracted_text = contents.decode("utf-8")
    if not file.filename.endswith((".pdf",".docx",".txt")):
        raise HTTPException(status_code=400,detail="Unsupported file type.Please upload pdf,docx or txt file")

    return {
        "summary": extracted_text[:300],
        "criteria": ["Real AI analysis not yet connected — showing raw extracted text"],
        "apis": [],
        "tasks": [],
        "edgeCases": [],
        "dbTables": []
    }