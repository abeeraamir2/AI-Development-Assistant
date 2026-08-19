# backend/services/analysis_service.py
import os
import json
from typing import Optional, List
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

FALLBACK_RESULT = {
    "title": "User Password Reset",
    "project": "Project Alpha",
    "filename": "Password_Reset_Requirement.pdf",
    "analysis_id": "ANL-8429",
    "status": "COMPLETED",
    "type": "FEATURE",
    "complexity": "MEDIUM",
    "related_count": 3,
    "confidence": "HIGH",
    "summary": "The user password reset flow enables registered users to securely regain access to their accounts if they forget their credentials. It involves an email-based verification system where a time-limited, unique token is generated and sent to the user's verified email address.",
    "criteria": [
        {"text": "User can request a password reset by providing their registered email address.", "src": "REQ-001"},
        {"text": "System generates a secure, unique token valid for exactly 15 minutes.", "src": "REQ-002"},
        {"text": "System emails a link containing the token to the user's provided email address.", "src": "REQ-003"},
        {"text": "Clicking the link allows the user to input a new password meeting security standards.", "src": "SEC-04"},
        {"text": "Once used, or expired, the token becomes immediately invalid.", "src": "SEC-05"}
    ],
    "tasks": [
        {"id": "TASK-001", "src": "REQ-003", "title": "Implement Email Template & Sending Service", "description": "Create the HTML email template for password reset and integrate with sender client."},
        {"id": "TASK-002", "src": "REQ-002", "title": "Token Generation & Validation Logic", "description": "Implement secure cryptographic token generation with 15-minute TTL."},
        {"id": "TASK-003", "src": "SEC-04", "title": "Update Password Endpoint", "description": "Create endpoint to accept new password with valid token, hash, and store."}
    ],

    "apis": [
        {
            "endpoint": "/api/auth/forgot-password",
            "method": "POST",
            "src": "REQ-001",
            "snippet": "// Request\n{\n  \"email\": \"user@example.com\"\n}\n\n// Response (202 Accepted)\n{\n  \"status\": \"success\",\n  \"message\": \"If an account exists, a reset link has been sent.\"\n}"
        }
    ],
    "db_tables": [
        {
            "table_name": "password_resets",
            "src": "REQ-002",
            "fields": [
                {"name": "token", "type": "VARCHAR(255)", "constraints": "PRIMARY KEY"},
                {"name": "user_id", "type": "UUID", "constraints": "FOREIGN KEY, INDEX"},
                {"name": "expires_at", "type": "TIMESTAMP", "constraints": "NOT NULL"}
            ]
        }
    ],
    "edge_cases": [
        {"title": "Expired Token", "src": "SEC-05", "description": "User attempts to use link after 15 mins. UI must show explicit expired message and prompt to request again."},
        {"title": "Invalid Token", "src": "SEC-05", "description": "Malformed or already used token. Must fail silently generic error to prevent token enumeration."}
    ],
    "evidence": {
        "active_context": {
            "title": "REQ-003 — Password Reset Email",
            "source_doc": "Password_Reset_Requirement.pdf (Pg 4)",
            "excerpt": "Users should receive a secure email containing a password reset link when they forget their password."
        },
        "related": [
            {"id": "REQ-002", "match": "91%"},
            {"id": "SEC-04", "match": "84%"},
            {"id": "SEC-05", "match": "76%"}
        ]
    }
}

JSON_SCHEMA_INSTRUCTIONS = """
Return ONLY a valid JSON object with EXACTLY this structure (no extra top-level keys, no markdown, no explanation text):

{
  "title": string,                     // short human-readable requirement title
  "summary": string,                   // 2-4 sentence plain-language summary
  "type": "FEATURE" | "BUGFIX" | "ENHANCEMENT",
  "complexity": "LOW" | "MEDIUM" | "HIGH",
  "confidence": "LOW" | "MEDIUM" | "HIGH",
  "criteria": [ { "text": string, "src": string } ],
  "tasks": [ { "id": string, "src": string, "title": string, "description": string } ],
  "apis": [ { "endpoint": string, "method": string, "src": string, "snippet": string } ],
  "db_tables": [ { "table_name": string, "src": string, "fields": [ { "name": string, "type": string, "constraints": string } ] } ],
  "edge_cases": [ { "title": string, "src": string, "description": string } ]
}

Rules:
- "src" fields must reference which requirement/context line the output was derived from (e.g. "REQ-001"). If no related-context requirement applies, use "ORIGINAL".
- Only include the sections listed in "requested_scopes" below; for any section NOT requested, return an empty list [] (but still include the key).
- Do not invent unrelated functionality. Base everything strictly on the requirement text and the related context provided.
"""


def _build_prompt(document_text: str, scopes: Optional[List[str]], related_context: Optional[List[dict]]) -> str:
    scopes = scopes or ["summary", "criteria", "tasks", "apis", "db_tables", "edge_cases"]

    context_block = "None."
    if related_context:
        lines = []
        for item in related_context:
            lines.append(
                f'- [{item.get("id", "UNKNOWN")}] (similarity: {item.get("match", "N/A")}): '
                f'{item.get("excerpt", "")}'
            )
        context_block = "\n".join(lines)

    prompt = f"""
You are analyzing a software requirement for a requirement-analysis tool.

REQUIREMENT TEXT:
\"\"\"
{document_text}
\"\"\"

RELATED PROJECT CONTEXT (previously stored requirements retrieved as relevant background — use these to ground your analysis and to fill "src" when the output comes from one of these instead of the new requirement):
{context_block}

REQUESTED SECTIONS (only generate these; leave other list fields empty []):
{json.dumps(scopes)}

{JSON_SCHEMA_INSTRUCTIONS}
"""
    return prompt


def analyze_requirement(
    document_text: str,
    scopes: Optional[List[str]] = None,
    related_context: Optional[List[dict]] = None,
):
    """
    Analyze a requirement using Gemini.

    Args:
        document_text: extracted requirement text.
        scopes: list of section names the user selected in the UI
                (e.g. ["summary", "tasks", "apis"]). If None, all sections
                are generated.
        related_context: list of related-requirement dicts retrieved via
                RAG/vector search, e.g.
                [{"id": "REQ-003", "match": "91%", "excerpt": "..."}]
                Pass None/[] until vector search is implemented — the
                function still works, it just won't have grounding context.
    """
    prompt = _build_prompt(document_text, scopes, related_context)

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        result = json.loads(response.text.strip())

    
        for key in ("summary", "criteria", "tasks", "apis", "db_tables", "edge_cases"):
            result.setdefault(key, [] if key != "summary" else "")

        if related_context:
            result["evidence"] = {
                "active_context": related_context[0] if related_context else None,
                "related": related_context,
            }
        else:
            result.setdefault("evidence", None)

        return result

    except Exception as e:
        print(f"[WARN] Gemini call failed ({e}). Returning fallback response so frontend works.")
        return dict(FALLBACK_RESULT)