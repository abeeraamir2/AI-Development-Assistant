from typing import Optional
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from services.auth_service import require_role
from database.database import analysis_collection, projects_collection

router = APIRouter()


def to_aware_utc(dt):
    """Mongo returns naive datetimes (assumed UTC). Normalize to aware
    so they can be safely compared with timezone-aware datetimes."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


@router.get("/developer-overview-stats")
async def get_developer_overview_stats(
    project_id: Optional[str] = None,
    current_user: dict = Depends(require_role(["Admin", "Developer"])),
):
    user_email = current_user["email"]
    now = datetime.now(timezone.utc)

    project_cursor = projects_collection.find({
        "$or": [
            {"owner_email": user_email},
            {"visibility": "public"},
        ]
    })
    all_projects = await project_cursor.to_list(length=200)
    total_projects_count = len(all_projects)


    query = {"user_email": user_email}
    if project_id:
        query["project_id"] = project_id

    cursor = analysis_collection.find(query).sort("created_at", -1)
    analyses = await cursor.to_list(length=300)

    total_reqs = len(analyses)
    completed_count = 0
    review_count = 0
    recent_analyses = []
    complexity_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}
    this_week_count = 0
    prev_week_count = 0

    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    for item in analyses:
        status = item.get("status", "COMPLETED")
        if status in ("Needs Review", "NEEDS_REVIEW"):
            review_count += 1
        else:
            completed_count += 1

        complexity = item.get("complexity", "MEDIUM")
        if complexity in complexity_counts:
            complexity_counts[complexity] += 1

        created = to_aware_utc(item.get("created_at"))
        if created:
            if created >= week_ago:
                this_week_count += 1
            elif created >= two_weeks_ago:
                prev_week_count += 1

        if len(recent_analyses) < 4:
            recent_analyses.append({
                "id": str(item["_id"]),
                "requirement": item.get("title", item.get("filename", "Requirement")),
                "project": item.get("project_name", "Unknown Project"),
                "time": (
                    item.get("created_at").strftime("%b %d, %H:%M")
                    if item.get("created_at")
                    else "Just now"
                ),
                "status": status,
            })


    success_rate = (
        round((completed_count / total_reqs) * 100) if total_reqs > 0 else 0
    )

    if prev_week_count > 0:
        this_week_change_pct = round(
            ((this_week_count - prev_week_count) / prev_week_count) * 100
        )
    elif this_week_count > 0:
        this_week_change_pct = None  
    else:
        this_week_change_pct = 0


    complexity_breakdown = [
        {"name": "Low", "value": complexity_counts["LOW"], "color": "#34d399"},
        {"name": "Medium", "value": complexity_counts["MEDIUM"], "color": "#fbbf24"},
        {"name": "High", "value": complexity_counts["HIGH"], "color": "#fb7185"},
    ]

    activity_map = {}
    for item in analyses:
        created = item.get("created_at")
        if not created:
            continue
        day_key = created.strftime("%b %d")
        activity_map[day_key] = activity_map.get(day_key, 0) + 1

    activity_data = [
        {"name": day, "runs": count}
        for day, count in activity_map.items()
    ]

    all_analyses_cursor = analysis_collection.find({"user_email": user_email})
    all_analyses = await all_analyses_cursor.to_list(length=1000)

    counts_by_project_id = {}
    for item in all_analyses:
        pid = item.get("project_id")
        counts_by_project_id[pid] = counts_by_project_id.get(pid, 0) + 1

    palette = ["#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6"]
    max_count = max(counts_by_project_id.values(), default=0)

    your_projects = []
    for i, proj in enumerate(all_projects):
        pid = str(proj["_id"])
        count = counts_by_project_id.get(pid, 0)
        your_projects.append({
            "name": proj["name"],
            "reqs": count,
            "color": palette[i % len(palette)],
            "percent": int((count / max_count) * 100) if max_count else 0,
        })

    return {
        "metrics": {
            "active_projects": total_projects_count,
            "requirements_analyzed": total_reqs,
            "completed_analyses": completed_count,
            "needs_attention": review_count,  
            "success_rate": success_rate,
            "this_week_count": this_week_count,
            "this_week_change_pct": this_week_change_pct,
            "complexity_breakdown": complexity_breakdown,
        },
        "activity_trend": activity_data,
        "recent_analyses": recent_analyses,
        "active_projects": your_projects,
    }