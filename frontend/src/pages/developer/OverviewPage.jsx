// src/pages/developer/OverviewPage.jsx
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";

import DeveloperKPICards from "../../components/developer-overview/DeveloperKPICards";
import RequirementActivityChart from "../../components/developer-overview/RequirementActivityChart";
import AnalysisHealthCard from "../../components/developer-overview/AnalysisHealthCard";
import RecentAnalysisTable from "../../components/developer-overview/RecentAnalysisTable";
import ActiveProjectsAndActions from "../../components/developer-overview/ActiveProjectsAndActions";

export default function OverviewPage({ authToken }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const token = getToken();

        const response = await fetch(
          "http://localhost:8000/developer-overview-stats",
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load developer overview stats.");
        }

        const resData = await response.json();
        setData(resData);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const token = getToken();

        const response = await fetch("http://localhost:8000/projects", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          throw new Error("Failed to load projects.");
        }

        const projectList = await response.json();
        setProjects(projectList);
        if (projectList.length) {
          setSelectedProject((prev) => prev || projectList[0]);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchOverviewStats();
    fetchProjects();
  }, [authToken]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-2">
        <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        <p className="text-xs font-semibold text-[var(--text-muted)]">
          Loading developer workspace...
        </p>
      </div>
    );
  }

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setSelectedProject(newProject);
  };

  return (
    <div className="p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Top Greeting & KPI Cards */}
      <DeveloperKPICards
        metrics={data?.metrics}
        projects={projects}
        selectedProject={selectedProject?.id || selectedProject?.name}
        onSelectProject={(proj) => setSelectedProject(proj)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Middle Row: Line Chart & Health Donut */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        <RequirementActivityChart data={data?.activity_trend} />
        <AnalysisHealthCard metrics={data?.metrics} />
      </div>

      {/* Recent Analyses Table */}
      <RecentAnalysisTable analyses={data?.recent_analyses} />

      {/* Bottom Row: Active Projects Activity & Quick Actions */}
      <ActiveProjectsAndActions projects={data?.active_projects} />
    </div>
  );
}