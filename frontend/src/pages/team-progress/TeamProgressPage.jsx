// src/pages/team-progress/TeamProgressPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import TeamProgressHeader from "../../components/Team-progress/TeamProgressHeader";
import TeamProgressKpiCards from "../../components/Team-progress/TeamProgressKpiCards";
import TeamWorkloadCard from "../../components/Team-progress/TeamWorkloadCard";
import ProjectStatusCard from "../../components/Team-progress/ProjectStatusCard";
import WorkByCategoryCard from "../../components/Team-progress/WorkByCategoryCard";
import CompletionTimeCard from "../../components/Team-progress/CompletionTimeCard";
import {
  getWorkItemsApi,
  getWorkItemsSummaryApi,
  getProjectsApi,
  getUsersApi,
} from "../../services/workItemsApi";

export default function TeamProgressPage({ authToken, userRole, userEmail }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const [workItems, setWorkItems] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    categoryDistribution: [],
  });
  const [loading, setLoading] = useState(true);

  // Load projects list
  useEffect(() => {
    async function loadProjects() {
      try {
        const projs = await getProjectsApi();
        if (Array.isArray(projs)) {
          setProjects(projs);
        }
      } catch (err) {
        console.error("Error loading projects:", err);
      }
    }
    loadProjects();
  }, []);

  // Load users list
  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await getUsersApi();
        if (Array.isArray(users)) {
          setUsersList(users);
        }
      } catch (err) {
        console.error("Error loading users:", err);
      }
    }
    loadUsers();
  }, []);

  // Fetch work items & summary metrics whenever selectedProject changes
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const projId =
        selectedProject && selectedProject !== "all" && selectedProject !== "All"
          ? selectedProject.id || selectedProject._id
          : null;

      const [items, summary] = await Promise.all([
        getWorkItemsApi(projId ? { project_id: projId } : {}),
        getWorkItemsSummaryApi(projId),
      ]);

      if (Array.isArray(items)) {
        setWorkItems(items);
      }
      if (summary) {
        setSummaryMetrics(summary);
      }
    } catch (err) {
      console.error("Failed to load team progress data:", err);
      toast.error(err.message || "Failed to load team progress analytics");
    } finally {
      setLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derive Team Workload per user
  const userWorkloadMap = {};

  // First seed all registered users
  usersList.forEach((u) => {
    const uid = u.id || u._id;
    userWorkloadMap[uid] = {
      userId: uid,
      name: u.name || (u.email ? u.email.split("@")[0].title() : "Team Member"),
      email: u.email,
      role: u.role || "Developer",
      initial: (u.name || u.email || "U")[0].toUpperCase(),
      assigned: 0,
      notStarted: 0,
      inProgress: 0,
      done: 0,
    };
  });

  // Aggregate work items into user buckets
  workItems.forEach((item) => {
    const assignee = item.assignedTo || item.assigned_to;
    if (!assignee) return;

    const uid = assignee.userId || assignee.user_id || assignee.email || assignee.name;
    if (!userWorkloadMap[uid]) {
      userWorkloadMap[uid] = {
        userId: uid,
        name: assignee.name || assignee.email || "Team Member",
        email: assignee.email || "",
        role: assignee.role || "Developer",
        initial: assignee.initial || (assignee.name ? assignee.name[0].toUpperCase() : "U"),
        assigned: 0,
        notStarted: 0,
        inProgress: 0,
        done: 0,
      };
    }

    userWorkloadMap[uid].assigned += 1;
    if (item.status === "Completed") {
      userWorkloadMap[uid].done += 1;
    } else if (item.status === "In Progress") {
      userWorkloadMap[uid].inProgress += 1;
    } else {
      userWorkloadMap[uid].notStarted += 1;
    }
  });

  // Convert map to sorted list (prioritizing users with assigned work)
  const workloadList = Object.values(userWorkloadMap).sort((a, b) => b.assigned - a.assigned);

  // Completed items for duration calculations
  const completedItems = workItems.filter((i) => i.status === "Completed");

  // Derive category counts
  const categoryCounts = [
    {
      name: "Backend",
      count: workItems.filter((i) => i.category === "Backend").length,
    },
    {
      name: "Frontend",
      count: workItems.filter((i) => i.category === "Frontend").length,
    },
    {
      name: "Testing",
      count: workItems.filter((i) => i.category === "Testing").length,
    },
    {
      name: "DevOps",
      count: workItems.filter((i) => i.category === "DevOps").length,
    },
  ];

  return (
    <div className="w-full p-6 md:p-8 min-h-full transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* 1. Header with Breadcrumbs and Project Selector */}
      <TeamProgressHeader
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
      />

      {/* 2. Top KPI Metric Cards */}
      <TeamProgressKpiCards
        total={summaryMetrics.total || workItems.length}
        completed={summaryMetrics.completed || completedItems.length}
        inProgress={summaryMetrics.inProgress || workItems.filter((i) => i.status === "In Progress").length}
        notStarted={summaryMetrics.notStarted || workItems.filter((i) => i.status === "Not Started").length}
      />

      {/* 3. Middle Section: Team Workload (Left) & Project Status Donut (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col">
          <TeamWorkloadCard workload={workloadList} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <ProjectStatusCard
            total={summaryMetrics.total || workItems.length}
            completed={summaryMetrics.completed || completedItems.length}
            inProgress={summaryMetrics.inProgress || workItems.filter((i) => i.status === "In Progress").length}
            notStarted={summaryMetrics.notStarted || workItems.filter((i) => i.status === "Not Started").length}
          />
        </div>
      </div>

      {/* 4. Bottom Section: Work by Category (Left) & Completion Time (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkByCategoryCard
          categoryData={summaryMetrics.categoryDistribution?.length ? summaryMetrics.categoryDistribution : categoryCounts}
          totalItems={summaryMetrics.total || workItems.length}
        />
        <CompletionTimeCard completedItems={completedItems} />
      </div>
    </div>
  );
}
