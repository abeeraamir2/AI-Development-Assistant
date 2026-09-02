from typing import Optional
from datetime import datetime, timedelta, timezone
from bson import ObjectId
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
    user_email = current_user.get("email")
    user_id = current_user.get("id") or current_user.get("user_id")
    now = datetime.now(timezone.utc)

    or_clauses = [{"visibility": "public"}]
    if user_id:
        or_clauses.append({"owner_id": str(user_id)})
    if user_email:
        or_clauses.append({"owner_email": user_email})

    project_cursor = projects_collection.find({"$or": or_clauses})
    all_projects = await project_cursor.to_list(length=200)
    total_projects_count = len(all_projects)

    if project_id and project_id != "undefined" and project_id != "null":
        clauses = [{"project_id": str(project_id)}]
        if ObjectId.is_valid(project_id):
            proj_doc = await projects_collection.find_one({"_id": ObjectId(project_id)})
            if proj_doc and proj_doc.get("name"):
                clauses.append({"project_name": proj_doc["name"]})
        query = {"$or": clauses}
    else:
        user_clauses = []
        if user_id:
            user_clauses.append({"user_id": str(user_id)})
        if user_email:
            user_clauses.append({"user_email": str(user_email).strip().lower()})
        query = {"$or": user_clauses} if user_clauses else {}

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
                "created_at": created.isoformat() if created else None,
                "time": created.isoformat() if created else None,
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

    all_analyses_cursor = analysis_collection.find({})
    all_analyses = await all_analyses_cursor.to_list(length=1000)

    counts_by_project_id = {}
    counts_by_project_name = {}
    for item in all_analyses:
        pid = str(item.get("project_id", ""))
        pname = str(item.get("project_name", "")).strip().lower()
        if pid:
            counts_by_project_id[pid] = counts_by_project_id.get(pid, 0) + 1
        if pname:
            counts_by_project_name[pname] = counts_by_project_name.get(pname, 0) + 1

    palette = ["#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6"]

    your_projects = []
    for i, proj in enumerate(all_projects):
        pid = str(proj["_id"])
        pname = proj.get("name", "")
        pname_key = pname.strip().lower()
        count = counts_by_project_id.get(pid) or counts_by_project_name.get(pname_key, 0)
        your_projects.append({
            "id": pid,
            "name": pname,
            "reqs": count,
            "color": palette[i % len(palette)],
            "percent": 0,
        })

    max_count = max([p["reqs"] for p in your_projects], default=0)
    for p in your_projects:
        p["percent"] = int((p["reqs"] / max_count) * 100) if max_count > 0 else 0

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