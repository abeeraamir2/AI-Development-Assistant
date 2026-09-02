import React, { useState, useEffect, useRef } from "react";
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

// Module-level in-memory cache to make tab switching instant (0 ms wait)
const _dashboardStatsCache = new Map();

export default function OverviewPage({ authToken, userRole, userEmail }) {
  const getInitialProjects = () => {
    try {
      const cached = localStorage.getItem("cached_projects");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  };

  const initialProjects = getInitialProjects();
  const savedActiveId = localStorage.getItem("active_project_id");
  const initialActive =
    (savedActiveId && initialProjects.find((p) => (p.id || p._id) === savedActiveId)) ||
    (initialProjects.length > 0 ? initialProjects[0] : null);

  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(initialActive);

  const selectedProjId = selectedProject?.id || selectedProject?._id;
  const cacheKey = selectedProjId || "all";

  // Initialize with cached stats if available for instant display
  const [data, setData] = useState(() => _dashboardStatsCache.get(cacheKey) || null);
  const [loading, setLoading] = useState(() => !_dashboardStatsCache.has(cacheKey));

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const getToken = () =>
    authToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");

  const handleSelectProject = (proj) => {
    setSelectedProject(proj);
    const pid = proj?.id || proj?._id;
    if (pid) {
      localStorage.setItem("active_project_id", pid);
    }
    const newKey = pid || "all";
    if (_dashboardStatsCache.has(newKey)) {
      setData(_dashboardStatsCache.get(newKey));
    }
  };

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
        try {
          localStorage.setItem("cached_projects", JSON.stringify(projectList));
        } catch {
          // ignore quota
        }
        if (projectList.length > 0) {
          setSelectedProject((prev) => {
            const activeId = localStorage.getItem("active_project_id");
            if (activeId) {
              const matched = projectList.find((p) => (p.id || p._id) === activeId);
              if (matched) return matched;
            }
            if (prev) {
              const exists = projectList.find(
                (p) => (p.id || p._id) === (prev.id || prev._id) || p.name === prev.name
              );
              if (exists) return exists;
            }
            return projectList[0];
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

  // Batch query access statuses for all projects (only once per unique project list)
  const prevAccessProjectIdsRef = useRef(null);
  useEffect(() => {
    if (projects && projects.length > 0) {
      const projectIdsKey = projects.map((p) => p.id || p._id).sort().join(",");
      if (prevAccessProjectIdsRef.current !== projectIdsKey) {
        prevAccessProjectIdsRef.current = projectIdsKey;
        fetchAllProjectAccessStatuses(projects);
      }
    }
  }, [projects, fetchAllProjectAccessStatuses]);

  // Fetch stats for the active project (silent background revalidation)
  useEffect(() => {
    let isCurrent = true;
    const currentKey = selectedProjId || "all";

    // If cached in memory, immediately populate to prevent any UI delay
    if (_dashboardStatsCache.has(currentKey)) {
      setData(_dashboardStatsCache.get(currentKey));
    } else {
      setLoading(true);
    }

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
        _dashboardStatsCache.set(currentKey, result);
        if (isCurrent) {
          setData(result);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    fetchOverviewStats();
    return () => {
      isCurrent = false;
    };
  }, [authToken, selectedProjId]);

  const handleProjectCreated = (newProj) => {
    setProjects((prev) => [newProj, ...prev]);
    handleSelectProject(newProj);
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
        const next = remaining.length > 0 ? remaining[0] : null;
        handleSelectProject(next);
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
        onSelectProject={handleSelectProject}
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
            onSelectProject={handleSelectProject}
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
            onSelectProject={handleSelectProject}
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