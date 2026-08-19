from pydantic import BaseModel
from typing import List

class TestGenerationRequest(BaseModel):
    requirement_text: str
    test_types: List[str]