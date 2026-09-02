from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId

from database.database import (
    projects_collection,
    users_collection,
    work_items_collection,
    analysis_collection,
    test_suites_collection,
    teams_collection,
)
from services.auth_service import require_role

router = APIRouter()


@router.get("/dashboard-stats")
async def get_dashboard_stats(current_user: dict = Depends(require_role(["Admin", "QA"]))):
    user_email = current_user["email"]
    user_id = current_user.get("user_id") or current_user.get("id")
    if not user_id:
        user_doc = await users_collection.find_one({"email": user_email})
        if user_doc:
            user_id = str(user_doc["_id"])

    # 1. Fetch user test suites from MongoDB using foreign key or email fallback
    query = {"$or": [{"user_id": str(user_id)}, {"user_email": user_email}]} if user_id else {"user_email": user_email}
    cursor = test_suites_collection.find(query).sort("created_at", -1)
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
            created_dt = suite.get("created_at")
            recent_runs.append({
                "id": str(suite["_id"]),
                "filename": suite.get("filename", "Requirement Specification"),
                "total_tests": suite_total,
                "types": list(set(suite_types)),
                "status": "Success",
                "created_at": created_dt.strftime("%Y-%m-%d %H:%M") if isinstance(created_dt, datetime) else str(created_dt) if created_dt else "N/A"
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


@router.get("/admin/dashboard-stats")
async def get_admin_dashboard_stats(
    current_user: dict = Depends(require_role(["Admin"])),
):
    """
    Consolidated Admin Dashboard Telemetry Endpoint.
    Aggregates real-time workspace metrics across Projects, Users, Work Items,
    Requirements Analyses, and Test Suites.
    """
    now_utc = datetime.now(timezone.utc)
    today_str = now_utc.strftime("%Y-%m-%d")

    # 1. Projects Telemetry
    raw_projects = await projects_collection.find().to_list(length=200)
    total_projects = len(raw_projects)

    # 2. Users Telemetry & Role Breakdown
    raw_users = await users_collection.find({}, {"name": 1, "email": 1, "role": 1, "created_at": 1}).to_list(length=500)
    total_users = len(raw_users)
    
    devs_count = 0
    qa_count = 0
    admin_count = 0

    for u in raw_users:
        r = (u.get("role") or "").strip().lower()
        if r in ["developer", "dev", "software engineer"]:
            devs_count += 1
        elif r in ["qa", "qa engineer", "tester", "test engineer", "quality assurance"]:
            qa_count += 1
        elif r in ["admin", "administrator", "product manager", "product owner"]:
            admin_count += 1

    # 3. Work Items Telemetry
    raw_work_items = await work_items_collection.find().to_list(length=1500)
    total_work_items = len(raw_work_items)

    status_counts = {"Not Started": 0, "In Progress": 0, "Completed": 0}
    category_counts = {"Frontend": 0, "Backend": 0, "DevOps": 0, "Testing": 0}
    needs_attention = []
    user_wi_map = {str(u["_id"]): {"assigned": 0, "in_progress": 0, "completed": 0} for u in raw_users}
    user_email_wi_map = {u.get("email", "").lower(): {"assigned": 0, "in_progress": 0, "completed": 0} for u in raw_users if u.get("email")}

    for wi in raw_work_items:
        st = wi.get("status") or "Not Started"
        status_counts[st] = status_counts.get(st, 0) + 1

        cat = wi.get("category") or "Backend"
        category_counts[cat] = category_counts.get(cat, 0) + 1

        # Track per-user workload distribution (support assigned_to and assignee dict/id/email)
        assigned_to_val = wi.get("assigned_to")
        assignee_val = wi.get("assignee")

        assignee_id = (
            wi.get("assigned_to_id")
            or wi.get("assignee_id")
            or (assigned_to_val.get("user_id") if isinstance(assigned_to_val, dict) else (str(assigned_to_val) if isinstance(assigned_to_val, (str, ObjectId)) else None))
            or (assignee_val.get("user_id") if isinstance(assignee_val, dict) else (str(assignee_val) if isinstance(assignee_val, (str, ObjectId)) else None))
        )

        assignee_email = (
            wi.get("assigned_to_email")
            or wi.get("assignee_email")
            or (assigned_to_val.get("email") if isinstance(assigned_to_val, dict) else None)
            or (assignee_val.get("email") if isinstance(assignee_val, dict) else None)
            or ""
        ).lower()

        target_tracker = None
        if assignee_id and str(assignee_id) in user_wi_map:
            target_tracker = user_wi_map[str(assignee_id)]
        elif assignee_email and assignee_email in user_email_wi_map:
            target_tracker = user_email_wi_map[assignee_email]

        if target_tracker is not None:
            target_tracker["assigned"] += 1
            if st == "In Progress":
                target_tracker["in_progress"] += 1
            elif st == "Completed":
                target_tracker["completed"] += 1

        # Evaluate items needing attention
        end_date = wi.get("end_date")
        start_date = wi.get("start_date")
        priority = wi.get("priority", "Medium")

        reason = None
        if st != "Completed":
            if end_date:
                try:
                    ed_str = str(end_date).strip()[:10]
                    if ed_str < today_str:
                        reason = f"Overdue (Target was {ed_str})"
                    elif ed_str == today_str:
                        reason = "Due Today"
                except Exception:
                    pass

            if not reason and st == "Not Started" and priority in ["Critical", "High"]:
                reason = f"{priority} Priority — Not Started"

            if not reason and st == "Not Started" and start_date:
                try:
                    sd_str = str(start_date).strip()[:10]
                    if sd_str < today_str:
                        reason = f"Start Date Passed ({sd_str})"
                except Exception:
                    pass

            if reason:
                resolved_assignee_name = (
                    (assigned_to_val.get("name") if isinstance(assigned_to_val, dict) else None)
                    or (assignee_val.get("name") if isinstance(assignee_val, dict) else None)
                    or "Unassigned"
                )
                needs_attention.append({
                    "id": str(wi.get("_id")),
                    "code": wi.get("code", "WI-000"),
                    "title": wi.get("title", "Untitled Work Item"),
                    "project_name": wi.get("project_name") or "General Workspace",
                    "project_id": wi.get("project_id"),
                    "status": st,
                    "category": cat,
                    "priority": priority,
                    "end_date": end_date,
                    "start_date": start_date,
                    "reason": reason,
                    "assignee_name": resolved_assignee_name,
                })

    # 4. Project Health & Work Breakdown Matrix
    projects_overview = []
    for proj in raw_projects:
        pid_str = str(proj["_id"])
        pname = proj.get("name", "Project")

        # Find work items linked to this project
        proj_items = [
            i for i in raw_work_items
            if (i.get("project_id") == pid_str or i.get("project_name") == pname)
        ]

        total_p = len(proj_items)
        done_p = sum(1 for i in proj_items if i.get("status") == "Completed")
        in_prog_p = sum(1 for i in proj_items if i.get("status") == "In Progress")
        not_started_p = sum(1 for i in proj_items if i.get("status") == "Not Started")
        comp_rate = round((done_p / total_p) * 100) if total_p > 0 else 0

        # Team count
        team_count = await teams_collection.count_documents({"project_id": pid_str})

        if total_p == 0:
            health_status = "No Work Items"
        elif done_p == total_p:
            health_status = "Completed"
        elif in_prog_p > 0:
            health_status = "In Progress"
        else:
            health_status = "Queued"

        created_p = proj.get("created_at")
        projects_overview.append({
            "id": pid_str,
            "name": pname,
            "description": proj.get("description", ""),
            "visibility": proj.get("visibility", "public"),
            "owner_email": proj.get("owner_email"),
            "team_members_count": max(team_count, 1),
            "total_work_items": total_p,
            "completed_work_items": done_p,
            "in_progress_work_items": in_prog_p,
            "not_started_work_items": not_started_p,
            "completion_rate": comp_rate,
            "health_status": health_status,
            "created_at": created_p.isoformat() if isinstance(created_p, datetime) else str(created_p) if created_p else None,
        })

    # 5. Team Work Distribution
    team_distribution = []
    for u in raw_users:
        uid_str = str(u["_id"])
        u_email = u.get("email", "").lower()
        tracker = user_wi_map.get(uid_str) or user_email_wi_map.get(u_email) or {"assigned": 0, "in_progress": 0, "completed": 0}

        team_distribution.append({
            "user_id": uid_str,
            "name": u.get("name") or (u_email.split("@")[0].title() if u_email else "Team Member"),
            "email": u.get("email"),
            "role": u.get("role", "Developer"),
            "assigned_count": tracker["assigned"],
            "in_progress_count": tracker["in_progress"],
            "completed_count": tracker["completed"],
        })

    # Sort team members by assigned count descending
    team_distribution.sort(key=lambda x: x["assigned_count"], reverse=True)

    # 6. AI Telemetry & Telemetry Counts
    req_count = await analysis_collection.count_documents({})
    raw_test_suites = await test_suites_collection.find().to_list(length=500)
    suite_count = len(raw_test_suites)
    total_test_cases = 0

    ai_date_activity = {}
    for s in raw_test_suites:
        t_count = s.get("total_cases")
        if t_count is None and isinstance(s.get("test_suite"), dict):
            t_count = sum(len(v) for v in s["test_suite"].values() if isinstance(v, list))
        total_test_cases += (t_count or 0)

        dt = s.get("created_at")
        if dt:
            d_key = dt.strftime("%Y-%m-%d") if isinstance(dt, datetime) else str(dt)[:10]
            ai_date_activity[d_key] = ai_date_activity.get(d_key, {"analyses": 0, "suites": 0, "cases": 0})
            ai_date_activity[d_key]["suites"] += 1
            ai_date_activity[d_key]["cases"] += (t_count or 0)

    # Group analyses by date
    async for a in analysis_collection.find({}, {"created_at": 1}):
        dt = a.get("created_at")
        if dt:
            d_key = dt.strftime("%Y-%m-%d") if isinstance(dt, datetime) else str(dt)[:10]
            ai_date_activity[d_key] = ai_date_activity.get(d_key, {"analyses": 0, "suites": 0, "cases": 0})
            ai_date_activity[d_key]["analyses"] += 1

    # Convert AI telemetry map to sorted list
    ai_trend = [
        {"date": k, "analyses": v["analyses"], "suites": v["suites"], "cases": v["cases"]}
        for k, v in sorted(ai_date_activity.items(), key=lambda x: x[0])
    ]

    # 7. Recent System Activity Timeline
    activity_stream = []

    # Recent Analyses
    async for a in analysis_collection.find().sort("created_at", -1).limit(8):
        dt = a.get("created_at")
        activity_stream.append({
            "id": str(a["_id"]),
            "type": "requirement_analysis",
            "title": a.get("title") or a.get("filename") or "Requirement Analysis",
            "project_name": a.get("project_name") or "General Workspace",
            "user_email": a.get("user_email") or "Developer",
            "timestamp": dt.isoformat() if isinstance(dt, datetime) else str(dt) if dt else None,
            "badge": "Requirement",
            "badge_color": "indigo"
        })

    # Recent Test Suites
    for s in raw_test_suites[:8]:
        dt = s.get("created_at")
        activity_stream.append({
            "id": str(s["_id"]),
            "type": "test_suite_generated",
            "title": s.get("filename") or "AI Test Suite",
            "project_name": s.get("project_name") or "General Workspace",
            "user_email": s.get("user_email") or "QA Engineer",
            "timestamp": dt.isoformat() if isinstance(dt, datetime) else str(dt) if dt else None,
            "badge": "Test Suite",
            "badge_color": "cyan"
        })

    # Recent Work Items
    for wi in raw_work_items[-8:]:
        dt = wi.get("created_at")
        w_assigned = wi.get("assigned_to")
        w_assignee = wi.get("assignee")
        w_creator = wi.get("created_by")

        w_user_email = (
            (w_assigned.get("email") if isinstance(w_assigned, dict) else None)
            or (w_assignee.get("email") if isinstance(w_assignee, dict) else None)
            or (w_creator.get("email") if isinstance(w_creator, dict) else None)
            or wi.get("created_by_email")
            or "Team Member"
        )

        activity_stream.append({
            "id": str(wi["_id"]),
            "type": "work_item_created",
            "title": f"{wi.get('code', 'WI')} — {wi.get('title', 'Work Item')}",
            "project_name": wi.get("project_name") or "General Workspace",
            "user_email": w_user_email,
            "timestamp": dt.isoformat() if isinstance(dt, datetime) else str(dt) if dt else None,
            "badge": "Work Item",
            "badge_color": "emerald"
        })

    # Recent Projects
    for proj in raw_projects[:6]:
        dt = proj.get("created_at")
        activity_stream.append({
            "id": str(proj["_id"]),
            "type": "project_created",
            "title": f"Project: {proj.get('name', 'Project')}",
            "project_name": proj.get("name", "Project"),
            "user_email": proj.get("owner_email") or "Admin",
            "timestamp": dt.isoformat() if isinstance(dt, datetime) else str(dt) if dt else None,
            "badge": "Project",
            "badge_color": "purple"
        })

    # Sort unified activity descending by timestamp
    activity_stream.sort(key=lambda x: x.get("timestamp") or "", reverse=True)

    return {
        "kpi_metrics": {
            "total_projects": total_projects,
            "total_users": total_users,
            "devs_count": devs_count,
            "qa_count": qa_count,
            "admin_count": admin_count,
            "total_work_items": total_work_items,
            "active_work_items": status_counts.get("In Progress", 0),
            "completed_work_items": status_counts.get("Completed", 0),
            "not_started_work_items": status_counts.get("Not Started", 0),
            "requirements_analyzed": req_count,
            "test_suites_generated": suite_count,
            "total_test_cases": total_test_cases,
        },
        "work_item_breakdown": {
            "status": status_counts,
            "category": category_counts,
        },
        "projects_overview": projects_overview,
        "recent_activity": activity_stream[:24],
        "needs_attention": needs_attention[:8],
        "team_distribution": team_distribution,
        "ai_activity": {
            "total_requirements": req_count,
            "total_suites": suite_count,
            "total_test_cases": total_test_cases,
            "trend": ai_trend,
        },
    }