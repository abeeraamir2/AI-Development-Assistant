from fastapi import FastAPI
from routes.upload import router as upload_router
app = FastAPI()

@app.get("/")
def root():
    return{"message" : "AI Requirement analyzer backend is running"}

@app.get("/hello")
def hello():
    return {"message":"Hello from FastApi"}

app.include_router(upload_router)