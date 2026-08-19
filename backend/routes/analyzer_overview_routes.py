from datetime import datetime
from fastapi import APIRouter, Depends
from services.auth_service import get_current_user
from database.database import analysis_collection

router = APIRouter()


@router.get("/developer-overview-stats")
async def get_developer_overview_stats(
    current_user: dict = Depends(get_current_user),
):
  user_email = current_user["email"]

  # Query user analysis history
  cursor = analysis_collection.find({"user_email": user_email}).sort(
      "created_at", -1
  )
  analyses = await cursor.to_list(length=100)

  total_reqs = len(analyses)
  completed_count = 0
  review_count = 0

  recent_analyses = []
  project_req_counts = {}

  for idx, item in enumerate(analyses):
    status = item.get("status", "Completed")
    if status == "Needs Review":
      review_count += 1
    else:
      completed_count += 1

    project_name = item.get("project_name", "Project Alpha")
    project_req_counts[project_name] = (
        project_req_counts.get(project_name, 0) + 1
    )

    if len(recent_analyses) < 4:
      recent_analyses.append({
          "id": str(item["_id"]),
          "requirement": item.get("title", item.get("filename", "Requirement")),
          "project": project_name,
          "time": (
              item.get("created_at").strftime("%b %d, %H:%M")
              if item.get("created_at")
              else "Just now"
          ),
          "status": status,
      })

  # Fallback preview data if collection is empty
  if total_reqs == 0:
    total_reqs = 18
    completed_count = 15
    review_count = 3
    recent_analyses = [
        {
            "id": "1",
            "requirement": "Password Reset",
            "project": "Project Alpha",
            "time": "2 min ago",
            "status": "Completed",
        },
        {
            "id": "2",
            "requirement": "Payment Processing",
            "project": "E-Commerce Platform",
            "time": "1 hour ago",
            "status": "Completed",
        },
        {
            "id": "3",
            "requirement": "User Authentication",
            "project": "Project Alpha",
            "time": "3 hours ago",
            "status": "Needs Review",
        },
        {
            "id": "4",
            "requirement": "Profile Management",
            "project": "Task Manager",
            "time": "Yesterday",
            "status": "Completed",
        },
    ]
    project_req_counts = {
        "Project Alpha": 8,
        "E-Commerce Platform": 5,
        "Task Management": 3,
    }

  success_rate = (
      round((completed_count / total_reqs) * 100) if total_reqs > 0 else 92
  )

  # Active projects list with progress widths
  active_projects = []
  colors = ["#a78bfa", "#34d399", "#fb923c"]
  for i, (p_name, count) in enumerate(project_req_counts.items()):
    active_projects.append({
        "name": p_name,
        "reqs": count,
        "color": colors[i % len(colors)],
        "percent": min(100, int((count / total_reqs) * 100)),
    })

  # Activity trend line chart data
  activity_data = [
      {"name": "0", "runs": 2},
      {"name": "1", "runs": 5},
      {"name": "2", "runs": 4},
      {"name": "3", "runs": 7},
      {"name": "4", "runs": 6},
      {"name": "5", "runs": 9},
      {"name": "6", "runs": 11},
      {"name": "7", "runs": 8},
      {"name": "8", "runs": 10},
  ]

  return {
      "metrics": {
          "active_projects": len(project_req_counts) or 4,
          "requirements_analyzed": total_reqs,
          "completed_analyses": completed_count,
          "needs_attention": review_count,
          "success_rate": success_rate,
      },
      "activity_trend": activity_data,
      "recent_analyses": recent_analyses,
      "active_projects": active_projects,
}