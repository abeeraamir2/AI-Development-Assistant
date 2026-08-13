import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-flash-latest")

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-flash-latest")


def build_test_generation_prompt(requirement_text, strategy_dict):
    test_types = strategy_dict.get("selectedTypes", ["Functional"])
    coverage = strategy_dict.get("coverage", "Standard")
    target_priority = strategy_dict.get("priority", "All")
    include_edge_cases = strategy_dict.get("includeEdgeCases", True)
    include_negative = strategy_dict.get("includeNegative", True)
    case_count = strategy_dict.get("testCaseCount", "Auto")

    types_list = ", ".join(f'"{t}"' for t in test_types)

    # Calculate requested count guidelines
    count_instruction = (
        "Generate a balanced set of 3 to 5 test cases per type."
        if case_count == "Auto"
        else f"Generate EXACTLY {case_count} test cases for each requested test type."
    )

    # Strict priority enforcement logic
    if target_priority == "All":
        priority_instruction = (
            "Assign realistic priorities ('Critical', 'High', 'Medium', 'Low') based on risk."
        )
    else:
        priority_instruction = (
            f"ONLY generate test cases that strictly have a priority of '{target_priority}'. "
            f"Every single test case object in the output array MUST have \"priority\": \"{target_priority}\"."
        )

    return f"""
You are a senior QA Test Automation Engineer writing a comprehensive test suite.

REQUIREMENTS & STRATEGY CONSTRAINTS:
- Requested Test Types: {types_list}
- Test Coverage Depth: {coverage} (Basic = happy paths only; Standard = core workflows + validation; Comprehensive = exhaustive scenarios)
- Target Test Case Count: {count_instruction}
- Include Edge Cases: {include_edge_cases}
- Include Negative Scenarios: {include_negative}
- Priority Focus: {priority_instruction}

OUTPUT FORMAT INSTRUCTIONS:
Return a JSON object where each key is EXACTLY one of the requested test type names ({types_list}).
Each key must contain an array of test case objects. Each test case object MUST follow this schema:
- "title": a short, specific test case title
- "steps": an array of strings detailing concrete execution steps
- "expectedResult": clear statement of expected outcome
- "priority": MUST be one of "Critical", "High", "Medium", "Low"

Only include the keys for requested test types: {types_list}.
Respond ONLY with the raw valid JSON object. Do not include markdown formatting or code fences.

Requirement text:
\"\"\"
{requirement_text}
\"\"\"
"""


def generate_tests(requirement_text, strategy_dict):
    prompt = build_test_generation_prompt(requirement_text, strategy_dict)

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        ),
    )

    raw_text = response.text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        raw_text = raw_text.replace("json", "", 1).strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini did not return valid JSON: {raw_text}")

    return result

def generate_tests(requirement_text, strategy_dict):
    prompt = build_test_generation_prompt(requirement_text, strategy_dict)

    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(
            response_mime_type="application/json",
        ),
    )

    raw_text = response.text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.strip("`")
        raw_text = raw_text.replace("json", "", 1).strip()

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini did not return valid JSON: {raw_text}")

    return result