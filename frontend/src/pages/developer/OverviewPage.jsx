// src/pages/developer/OverviewPage.jsx
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { Loader2 } from "lucide-react";

import DeveloperKPICards from "../../components/Developer-overview/DeveloperKPICards";
import RequirementActivityChart from "../../components/Developer-overview/RequirementActivityChart";
import AnalysisHealthCard from "../../components/Developer-overview/AnalysisHealthCard";
import RecentAnalysisTable from "../../components/Developer-overview/RecentAnalysisTable";
import ActiveProjectsAndActions from "../../components/Developer-overview/ActiveProjectsAndActions";
import EditProjectModal from "../../components/modals/EditProjectModal";
import DeleteProjectModal from "../../components/modals/DeleteProjectModal";

export default function OverviewPage({ authToken, userRole, userEmail }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const selectedProjId = selectedProject?.id || selectedProject?._id;

  // Fetch project list
  useEffect(() => {
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
        if (projectList.length > 0) {
          setSelectedProject((prev) => {
            if (!prev) return projectList[0];
            const exists = projectList.find(
              (p) => p.id === (prev.id || prev._id) || p.name === prev.name
            );
            return exists || projectList[0];
          });
        } else {
          setSelectedProject(null);
        }
      } catch (err) {
        toast.error(err.message);
      }
    };

    fetchProjects();
  }, [authToken]);

  // Fetch stats for the active project
  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const token = getToken();
        const url = selectedProjId
          ? `http://localhost:8000/developer-overview-stats?project_id=${selectedProjId}`
          : "http://localhost:8000/developer-overview-stats";

        const response = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

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

    fetchOverviewStats();
  }, [authToken, selectedProjId]);

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

  const handleProjectUpdated = (updatedProj) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === updatedProj.id ? updatedProj : p))
    );
    if ((selectedProject?.id || selectedProject?._id) === updatedProj.id) {
      setSelectedProject(updatedProj);
    }
  };

  const handleProjectDeleted = (deletedId) => {
    setProjects((prev) => {
      const remaining = prev.filter((p) => (p.id || p._id) !== deletedId);
      if ((selectedProject?.id || selectedProject?._id) === deletedId) {
        setSelectedProject(remaining.length > 0 ? remaining[0] : null);
      }
      return remaining;
    });
  };

  return (
    <div className="p-6 md:p-8 min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Top Greeting & KPI Cards */}
      <DeveloperKPICards
        authToken={authToken}
        userRole={userRole}
        userEmail={userEmail}
        metrics={data?.metrics}
        projects={projects}
        selectedProject={selectedProject?.id || selectedProject?.name}
        onSelectProject={(proj) => setSelectedProject(proj)}
        onProjectCreated={handleProjectCreated}
        onEditProject={(proj) => {
          setProjectToEdit(proj);
          setIsEditModalOpen(true);
        }}
        onDeleteProject={(proj) => {
          setProjectToDelete(proj);
          setIsDeleteModalOpen(true);
        }}
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

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        project={projectToEdit}
        onProjectUpdated={handleProjectUpdated}
        authToken={authToken}
      />

      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        project={projectToDelete}
        onProjectDeleted={handleProjectDeleted}
        authToken={authToken}
      />
    </div>
  );
}