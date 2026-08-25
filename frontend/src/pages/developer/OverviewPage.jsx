import React, { useState, useEffect } from "react";
import DeveloperKPICards from "../../components/Developer-overview/DeveloperKPICards";
import RequirementActivityChart from "../../components/Developer-overview/RequirementActivityChart";
import AnalysisHealthCard from "../../components/Developer-overview/AnalysisHealthCard";
import RecentAnalysisTable from "../../components/Developer-overview/RecentAnalysisTable";
import ActiveProjectsAndActions from "../../components/Developer-overview/ActiveProjectsAndActions";
import CreateProjectModal from "../../components/modals/CreateProjectModal";
import EditProjectModal from "../../components/modals/EditProjectModal";
import DeleteProjectModal from "../../components/modals/DeleteProjectModal";
import ProjectAccessGate from "../../components/Projects/ProjectAccessGate";
import { useProjectAccess } from "../../context/ProjectAccessContext";
import { toast, Toaster } from "sonner";

export default function OverviewPage({ authToken, userRole, userEmail }) {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const selectedProjId = selectedProject?.id || selectedProject?._id;

  const {
    getProjectAccessStatus,
    checkProjectAccess,
    fetchAllProjectAccessStatuses,
  } = useProjectAccess();

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

  // Batch query access statuses for all projects
  useEffect(() => {
    if (projects && projects.length > 0) {
      fetchAllProjectAccessStatuses(projects);
    }
  }, [projects, fetchAllProjectAccessStatuses]);

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
          throw new Error("Failed to fetch dashboard stats.");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOverviewStats();
  }, [authToken, selectedProjId]);

  const handleProjectCreated = (newProj) => {
    setProjects((prev) => [newProj, ...prev]);
    setSelectedProject(newProj);
    if (newProj?.id) {
      checkProjectAccess(newProj.id);
    }
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

  const accessStatus = getProjectAccessStatus(selectedProject, userEmail, userRole);
  const isAccessApproved = accessStatus === "APPROVED";

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

      {/* Access Gate for Private Projects when Not Approved */}
      {!isAccessApproved ? (
        <div className="space-y-6">
          <ProjectAccessGate
            project={selectedProject}
            userEmail={userEmail}
            userRole={userRole}
            onOpenProject={() => {
              if (selectedProjId) checkProjectAccess(selectedProjId);
            }}
          />

          {/* Also show all projects so Developer can browse or switch */}
          <ActiveProjectsAndActions
            projects={projects}
            statsProjects={data?.active_projects}
            selectedProject={selectedProject}
            onSelectProject={(proj) => setSelectedProject(proj)}
            userEmail={userEmail}
            userRole={userRole}
          />
        </div>
      ) : (
        <>
          {/* Middle Row: Line Chart & Health Donut */}
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            <RequirementActivityChart data={data?.activity_trend} />
            <AnalysisHealthCard metrics={data?.metrics} />
          </div>

          {/* Recent Analyses Table */}
          <RecentAnalysisTable analyses={data?.recent_analyses} />

          {/* Bottom Row: Active Projects Activity & Quick Actions */}
          <ActiveProjectsAndActions
            projects={projects}
            statsProjects={data?.active_projects}
            selectedProject={selectedProject}
            onSelectProject={(proj) => setSelectedProject(proj)}
            userEmail={userEmail}
            userRole={userRole}
          />
        </>
      )}

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setProjectToEdit(null);
        }}
        project={projectToEdit}
        onProjectUpdated={handleProjectUpdated}
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
      />
    </div>
  );
}