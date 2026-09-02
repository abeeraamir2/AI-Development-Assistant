from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.analyzer_overview_routes import router as analyzer_overview_router
from routes.project_routes import router as project_router
from routes.analyzer_routes import router as upload_router
from routes.auth_routes import router as auth_router
from routes.test_generator_routes import router as test_router
from routes.dashboard_routes import router as dashboard_router
from routes.bug_summarizer_routes import router as bug_router
from routes.user_routes import router as user_router
from routes.role_routes import router as role_router
from routes.work_item_routes import router as work_item_router
from routes.project_access_routes import router as project_access_router
from routes.notification_routes import router as notification_router
from database.database import (
    init_project_access_indexes,
)
from services.work_item_service import init_work_items_indexes_and_counter

app = FastAPI()

@app.on_event("startup")
async def on_startup():
    await init_work_items_indexes_and_counter()
    await init_project_access_indexes()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:5174","http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "AI Requirement analyzer backend is running"}


@app.get("/hello")
def hello():
    return {"message": "Hello from FastApi"}


app.include_router(analyzer_overview_router)
app.include_router(project_router)
app.include_router(project_access_router)
app.include_router(notification_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(test_router)
app.include_router(dashboard_router)
app.include_router(bug_router)
app.include_router(user_router)
app.include_router(role_router)
app.include_router(work_item_router)