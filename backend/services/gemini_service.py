import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-flash-latest")

def build_analysis_prompt(document_text):
    return f"""
You are analyzing a software requirement document for a development team. Based on the text below, return a JSON object with exactly these six fields:

- "summary": a concise 2-3 sentence summary of what the requirement is asking for
- "criteria": an array of specific, testable acceptance criteria derived directly from the requirement
- "apis": an array of suggested API endpoints needed to implement this, in the format "METHOD /path" (e.g. "POST /api/login")
- "dbTables": an array of objects representing the required database entities, properly normalized. Each object must have exactly two fields:
    - "name": the table/collection name in plural lowercase snake_case (e.g., "users", "login_attempts")
    - "attributes": an array of strings detailing the schema in the format "field_name: type [Constraints]". You MUST include:
        - A primary key (e.g., "id: uuid [PK]")
        - Necessary foreign keys to establish relationships (e.g., "user_id: uuid [FK -> users.id]")
        - Core data fields inferred from the requirement
        - Standard audit timestamps (e.g., "created_at: timestamp", "updated_at: timestamp")
- "tasks":an array of concrete, step-by-step development tasks (Frontend, Backend, and Database) required to build this
- "edgeCases": an array of edge cases, security risks, or missing logical flows in the requirement that need clarification

Respond with ONLY the JSON object, no markdown formatting, no explanation, no code fences.

Document text:
\"\"\"
{document_text}
\"\"\"
"""

def analyze_requirement(document_text):
    prompt = build_analysis_prompt(document_text)
    
    # Tell Gemini to strictly return application/json
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        )
    )

    raw_text = response.text
    
    try:
        # No stripping needed anymore, it is guaranteed to be clean JSON!
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini did not return valid JSON: {raw_text}")

    return result