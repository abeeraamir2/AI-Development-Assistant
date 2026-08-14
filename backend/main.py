from fastapi import FastAPI
from routes.analyzer_routes import router as upload_router
from routes.auth_routes import router as auth_router
from routes.test_generator_routes import router as test_router
from routes.dashboard_routes import router as dashboard_router
from routes.bug_summarizer_routes import router as bug_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return{"message" : "AI Requirement analyzer backend is running"}

@app.get("/hello")
def hello():
    return {"message":"Hello from FastApi"}

app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(test_router)
app.include_router(dashboard_router)
app.include_router(bug_router)