import React, { useState, useEffect } from "react";
import AdminControlsHeader from "../../components/Admin-overview/AdminControlsHeader";
import AdminKPICards from "../../components/Admin-overview/AdminKPICards";
import BurndownChartCard from "../../components/Admin-overview/BurndownChartCard";
import TeamOverviewTable from "../../components/Admin-overview/TeamOverviewTable";
import AISprintIntelligencePanel from "../../components/Admin-overview/AISprintIntelligencePanel";
import CreateProjectModal from "../../components/modals/CreateProjectModal";
import EditProjectModal from "../../components/modals/EditProjectModal";
import DeleteProjectModal from "../../components/modals/DeleteProjectModal";
import { toast, Toaster } from "sonner";

export default function AdminDashboard({ authToken, userRole, userEmail, onAddSprint }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const handleProjectCreated = (newProj) => {
    setProjects((prev) => [newProj, ...prev]);
    setSelectedProject(newProj);
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

  // Fetch all projects for Admin
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = getToken();
        const res = await fetch("http://localhost:8000/projects", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) return;
        const data = await res.json();
        setProjects(data);
        if (data.length > 0) {
          setSelectedProject((prev) => {
            if (!prev) return data[0];
            const found = data.find((p) => p.id === (prev.id || prev._id) || p.name === prev.name);
            return found || data[0];
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProjects();
  }, [authToken]);

  // Fetch Team Overview for the active project
  const selectedProjId = selectedProject?.id || selectedProject?._id;

  useEffect(() => {
    const fetchTeamOverview = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const url = selectedProjId
          ? `http://localhost:8000/admin/team-overview?project_id=${selectedProjId}`
          : "http://localhost:8000/admin/team-overview";

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Failed to load team overview data.");

        const data = await res.json();
        setTeamData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamOverview();
  }, [authToken, selectedProjId]);

  const [sprints] = useState([
    { id: "24", name: "Sprint 24 (Current)" },
    { id: "23", name: "Sprint 23" },
  ]);
  const [selectedSprint, setSelectedSprint] = useState(sprints[0]);

  return (
    <div className="p-6 md:p-8 min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* Top Header & Controls */}
      <AdminControlsHeader
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        onAddProject={() => setIsCreateProjectOpen(true)}
        onEditProject={(proj) => {
          setProjectToEdit(proj);
          setIsEditModalOpen(true);
        }}
        onDeleteProject={(proj) => {
          setProjectToDelete(proj);
          setIsDeleteModalOpen(true);
        }}
        sprints={sprints}
        selectedSprint={selectedSprint}
        onSelectSprint={setSelectedSprint}
        onAddSprint={onAddSprint || (() => toast.info("Create Sprint modal opening..."))}
      />

      {/* KPI Cards */}
      <AdminKPICards metrics={teamData?.metrics} />

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <BurndownChartCard data={teamData?.burndown_data || []} />
          <TeamOverviewTable
            members={teamData?.team_members || []}
            projectName={teamData?.project_name || selectedProject?.name}
          />
        </div>
        <div className="lg:col-span-4">
          <AISprintIntelligencePanel
            insights={teamData?.ai_insights}
            onApplyRecommendation={() => toast.success("Recommendation applied to project sprint")}
          />
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={handleProjectCreated}
        authToken={authToken}
      />

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