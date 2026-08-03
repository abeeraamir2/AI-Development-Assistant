import os
from fastapi import APIRouter,UploadFile,File
router = APIRouter()

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(file: UploadFile=File(...)):
    contents = await file.read()
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as f:
        f.write(contents)
    return{
        "filename":file.filename,
        "content_type":file.content_type,
        "file_size":len(contents)
    }

@router.get("/read-text/{filename}")
def read_text_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    return {"filename": filename, "content": content}