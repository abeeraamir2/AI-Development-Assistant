# backend/models/analyzer_models.py
from typing import Optional
from pydantic import BaseModel


class SimilarityCheckRequest(BaseModel):
    project_id: Optional[str] = None
    input_text: Optional[str] = None
    text: Optional[str] = None


class AnalysisStatusUpdateRequest(BaseModel):
    status: str
