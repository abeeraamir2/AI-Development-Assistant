# backend/services/test_service.py
import json
from google.genai import types
from config.gemini_client import client, MODEL_NAME


def normalize_test_suite_result(raw_result, requested_types: list) -> dict:
    """
    Guarantees the test suite result is a clean dictionary keyed by requested test types,
    containing lists of valid test case objects.
    """
    if not raw_result:
        return {t: [] for t in requested_types}

    # If wrapped in a nested dictionary
    if isinstance(raw_result, dict):
        for wrapper in ["test_suite", "tests", "test_suites", "suites", "testCases", "data"]:
            if wrapper in raw_result and isinstance(raw_result[wrapper], dict):
                raw_result = raw_result[wrapper]
                break

    # If Gemini returned a flat array of test cases
    if isinstance(raw_result, list):
        grouped = {t: [] for t in requested_types}
        default_type = requested_types[0] if requested_types else "Functional"
        for idx, item in enumerate(raw_result):
            if isinstance(item, dict):
                category = item.get("category") or item.get("type") or default_type
                # Match to requested types
                matched = next((rt for rt in requested_types if rt.lower() in category.lower()), default_type)
                if "id" not in item or not item["id"]:
                    item["id"] = f"TC-{idx+1:03d}"
                grouped.setdefault(matched, []).append(item)
        return grouped

    # If it's a dict mapping test types -> list of test cases
    normalized = {}
    if isinstance(raw_result, dict):
        for k, v in raw_result.items():
            if not isinstance(v, list):
                continue

            # Match against requested types
            matched_key = None
            for req in requested_types:
                if req.lower() in k.lower() or k.lower() in req.lower():
                    matched_key = req
                    break
            if not matched_key:
                matched_key = k.title()

            cleaned_cases = []
            for idx, tc in enumerate(v):
                if isinstance(tc, dict):
                    if "id" not in tc or not tc["id"]:
                        tc["id"] = f"TC-{idx+1:03d}"
                    cleaned_cases.append(tc)
                elif isinstance(tc, str):
                    cleaned_cases.append({
                        "id": f"TC-{idx+1:03d}",
                        "title": tc,
                        "steps": [tc],
                        "expectedResult": "Test passes as specified",
                        "priority": "Medium",
                    })

            normalized[matched_key] = cleaned_cases

    # Ensure all requested types exist in the dictionary
    for t in requested_types:
        if t not in normalized:
            normalized[t] = []

    return normalized


def build_codebase_test_generation_prompt(project_name: str, code_content: str, strategy_dict: dict, focus_notes: str = ""):
    test_types = strategy_dict.get("selectedTypes", ["Functional", "API", "Negative", "Boundary"])
    coverage = strategy_dict.get("coverage", "Standard")
    target_priority = strategy_dict.get("priority", "All")
    include_edge_cases = strategy_dict.get("includeEdgeCases", True)
    include_negative = strategy_dict.get("includeNegative", True)
    case_count = strategy_dict.get("testCaseCount", "Auto")

    types_list = ", ".join(f'"{t}"' for t in test_types)

    count_instruction = (
        "Generate a balanced set of 3 to 5 realistic, high-impact test cases per requested test type."
        if case_count == "Auto"
        else f"Generate EXACTLY {case_count} test cases for each requested test type."
    )

    priority_instruction = (
        "Assign realistic priorities ('Critical', 'High', 'Medium', 'Low') based on severity and risk."
        if target_priority == "All"
        else f"ONLY generate test cases that strictly have \"priority\": \"{target_priority}\"."
    )

    focus_section = f"\nQA ENGINEER SPECIFIC FOCUS / NOTES:\n{focus_notes}\n" if focus_notes else ""

    return f"""
You are a Principal QA Automation and Software Testing Engineer analyzing a complete software project codebase.

PROJECT NAME: {project_name}
TEST COVERAGE LEVEL: {coverage} (Basic = happy paths only; Standard = comprehensive validation & edge cases; Comprehensive = exhaustive security, boundary, and stress paths)
REQUESTED TEST SUITES: {types_list}
TARGET TEST CASE COUNT: {count_instruction}
PRIORITY CONSTRAINTS: {priority_instruction}
INCLUDE EDGE CASES: {include_edge_cases}
INCLUDE NEGATIVE SCENARIOS: {include_negative}
{focus_section}

INSTRUCTIONS:
1. Deeply analyze the provided source code, API endpoints, data models, error handlers, and business logic.
2. Generate comprehensive, production-grade test cases covering the ACTUAL functions, APIs, models, components, and workflows present in this codebase.
3. Every test case MUST reference real files, endpoints, methods, or models from the code.

OUTPUT FORMAT INSTRUCTIONS:
Return a JSON object where each top-level key is EXACTLY one of the requested test type names: {types_list}.
Each test type key must contain an array of test case objects.
Each test case object MUST follow this schema strictly:
{{
  "id": "TC-001",
  "title": "Short descriptive test case title",
  "targetModule": "file/path.py or endpoint (e.g. POST /api/v1/auth/login)",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "preconditions": "Preconditions required before test execution",
  "steps": [
    "1. Action step 1",
    "2. Action step 2",
    "3. Action step 3"
  ],
  "testData": "Sample payload, parameter values, or environment state",
  "expectedResult": "Clear, verifiable expected outcome (e.g. Returns HTTP 200 with JWT token in body)",
  "automatedSnippet": "// Executable pytest / jest / cypress / curl sample test snippet",
  "tags": ["Tag1", "Tag2"]
}}

Only include keys for the requested test types: {types_list}.
Respond ONLY with the raw valid JSON object. Do not include markdown code block syntax (no ```json).

PROJECT SOURCE CODE & ARTIFACTS:
\"\"\"
{code_content}
\"\"\"
"""


def generate_tests_from_code(project_name: str, code_content: str, strategy_dict: dict, focus_notes: str = ""):
    prompt = build_codebase_test_generation_prompt(project_name, code_content, strategy_dict, focus_notes)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    raw_text = response.text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        if raw_text.startswith("json"):
            raw_text = raw_text[4:].strip()

    try:
        raw_json = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError(f"AI service did not return valid JSON: {raw_text[:200]}")

    requested_types = strategy_dict.get("selectedTypes", ["Functional", "API", "Negative", "Boundary"])
    return normalize_test_suite_result(raw_json, requested_types)


def generate_tests(requirement_text, strategy_dict):
    """
    Fallback for text-based input.
    """
    return generate_tests_from_code("Requirement Document", requirement_text, strategy_dict)