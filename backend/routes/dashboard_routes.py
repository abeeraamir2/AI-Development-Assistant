from fastapi import APIRouter, Depends
from database.database import test_suites_collection
from services.auth_service import get_current_user

router = APIRouter()


@router.get("/dashboard-stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]

    # 1. Fetch user test suites from MongoDB
    cursor = test_suites_collection.find({"user_email": user_email}).sort("created_at", -1)
    suites = await cursor.to_list(length=100)

    total_tests = 0
    functional_count = 0
    api_count = 0
    security_count = 0
    boundary_count = 0

    recent_runs = []

    for suite in suites:
        test_suite_data = suite.get("test_suite", {})
        suite_total = 0
        suite_types = []

        # Iterate over test categories (Functional, API, Security, etc.)
        for category, test_cases in test_suite_data.items():
            if isinstance(test_cases, list):
                count = len(test_cases)
                total_tests += count
                suite_total += count

                cat_lower = category.lower()
                if "functional" in cat_lower:
                    functional_count += count
                    suite_types.append("Functional")
                elif "api" in cat_lower:
                    api_count += count
                    suite_types.append("API")
                elif "security" in cat_lower:
                    security_count += count
                    suite_types.append("Security")
                elif "boundary" in cat_lower:
                    boundary_count += count
                    suite_types.append("Boundary")
                else:
                    suite_types.append(category)

        # Build recent runs record (Limit to top 5)
        if len(recent_runs) < 5:
            recent_runs.append({
                "id": str(suite["_id"]),
                "filename": suite.get("filename", "Requirement Specification"),
                "total_tests": suite_total,
                "types": list(set(suite_types)),
                "status": "Success",
                "created_at": suite.get("created_at").strftime("%Y-%m-%d %H:%M") if suite.get("created_at") else "N/A"
            })

    pass_rate = "100%" if total_tests > 0 else "0%"

    return {
        "metrics": {
            "total_tests": total_tests,
            "functional": functional_count,
            "api": api_count,
            "security": security_count,
            "pass_rate": pass_rate
        },
        "recent_runs": recent_runs
    }