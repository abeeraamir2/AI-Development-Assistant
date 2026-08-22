import os
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Body
import google.generativeai as genai
from dotenv import load_dotenv
from database.database import bug_reports_collection
from services.auth_service import require_role

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-flash-latest")

router = APIRouter()


@router.post("/analyze-bug")
@router.post("/bugs")
async def analyze_bug(
    payload: dict = Body(...),
    current_user: dict = Depends(require_role(["Admin", "QA Engineer"])),
):
    user_email = current_user.get("email")
    raw_log = payload.get("raw_log", "").strip()

    if not raw_log:
        raise HTTPException(status_code=400, detail="Log content cannot be empty.")

    prompt = f"""
You are a Principal Software Engineer and QA Automation Lead diagnosing production logs, stack traces, and ticket reports.

Analyze the raw log input provided below and output a strictly structured JSON object matching this schema EXACTLY:

{{
  "title": "A short, precise title describing the core bug",
  "severity": "High / P1",
  "file_location": "FileName.ext:line_number",
  "confidence_score": 95,
  "tags": ["NullPointer", "Auth Failure"],
  "root_cause": "Detailed architectural root cause explaining why the exception occurred and what went wrong.",
  "affected_components": [
    {{"name": "UserService", "sub": "v2.4.1"}},
    {{"name": "AuthController", "sub": "Middleware"}},
    {{"name": "SessionCache", "sub": "Redis"}}
  ],
  "reproduction_steps": [
    "Navigate to user profile page without an active session.",
    "Trigger background data refresh.",
    "Observe log for NullPointerException."
  ],
  "recommended_fix": {{
    "code_diff": "- User user = sessionManager.getCurrentUser();\\n+ if (user == null) {{\\n+     throw new UnauthorizedException(\\"Session invalid\\");\\n+ }}",
    "explanation": "Add a null check for the user object retrieved from the session manager before attempting to access its properties."
  }}
}}

CRITICAL INSTRUCTIONS:
1. Ensure "confidence_score" is an integer between 70 and 100.
2. Provide clean git-style code diff strings for "code_diff" using - for deletions and + for additions.
3. Return ONLY the valid JSON object. No markdown code blocks or additional text.

Raw Log Input:
\"\"\"
{raw_log}
\"\"\"
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json"
            )
        )

        raw_text = response.text.strip()
        if raw_text.startswith("```"):
            raw_text = raw_text.strip("`").replace("json", "", 1).strip()

        analysis_result = json.loads(raw_text)

        # Store bug report analysis record in MongoDB
        db_record = {
            "user_email": user_email,
            "raw_log": raw_log,
            "analysis": analysis_result,
            "created_at": datetime.now(timezone.utc),
        }
        await bug_reports_collection.insert_one(db_record)

        return analysis_result

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail="Gemini failed to generate valid JSON output."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze bug report: {str(e)}"
        )