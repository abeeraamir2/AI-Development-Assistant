import React, { useState, useEffect, useCallback } from "react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import WorkItemsHeader from "../../components/Work-items/WorkItemsHeader";
import WorkItemsSummaryCards from "../../components/Work-items/WorkItemsSummaryCards";
import CategoryOverviewCard from "../../components/Work-items/CategoryOverviewCard";
import MyWorkItemsCard from "../../components/Work-items/MyWorkItemsCard";
import AllWorkItemsSection from "../../components/Work-items/AllWorkItemsSection";

import {
  getWorkItemsApi,
  getWorkItemsSummaryApi,
  getProjectsApi,
  deleteWorkItemApi,
} from "../../services/workItemsApi";

export default function WorkItemsPage({ authToken, userRole, userEmail }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all"); // "all" or project object
  const [workItems, setWorkItems] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch live projects
  useEffect(() => {
    async function loadProjects() {
      try {
        const projs = await getProjectsApi();
        setProjects(Array.isArray(projs) ? projs : []);
      } catch (err) {
        console.error("Failed to load projects for work items:", err);
      }
    }
    loadProjects();
  }, [authToken]);

  // 2. Fetch work items and summary metrics based on selected project
  const selectedProjId =
    selectedProject && selectedProject !== "all"
      ? selectedProject.id || selectedProject._id
      : null;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filters = selectedProjId ? { project_id: selectedProjId } : {};
      const [itemsData, summaryData] = await Promise.all([
        getWorkItemsApi(filters),
        getWorkItemsSummaryApi(selectedProjId),
      ]);

      setWorkItems(itemsData || []);
      if (summaryData) {
        setMetrics({
          total: summaryData.total || 0,
          notStarted: summaryData.notStarted || 0,
          inProgress: summaryData.inProgress || 0,
          completed: summaryData.completed || 0,
        });
        setCategories(summaryData.categoryDistribution || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load work items from server.");
    } finally {
      setLoading(false);
    }
  }, [selectedProjId]);

  useEffect(() => {
    loadData();
  }, [loadData, authToken]);

  // Filter items assigned to the current user
  const myItems = workItems.filter(
    (item) => item.isMyItem || (userEmail && item.assignedTo?.email === userEmail)
  );

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    if (project === "all" || !project) {
      toast.info("Viewing work items across all projects.");
    } else {
      toast.info(`Filtered work items by project: ${project.name}`);
    }
  };

  const handleNewWorkItem = () => {
    if (selectedProjId && selectedProject && selectedProject !== "all") {
      navigate(`/work-items/create?projectId=${selectedProjId}`, {
        state: { defaultProject: selectedProject },
      });
    } else {
      navigate("/work-items/create");
    }
  };

  const handleViewDetails = (item) => {
    const targetId = item?.id ? item.id.replace(/^#/, "") : item;
    navigate(`/work-items/${targetId}`);
  };

  const handleEdit = (item) => {
    const targetId = item?.id ? item.id.replace(/^#/, "") : item;
    navigate(`/work-items/${targetId}/edit`);
  };

  const handleDelete = async (item) => {
    try {
      await deleteWorkItemApi(item.id);
      toast.success(`Work item ${item.id} deleted successfully.`);
      await loadData();
    } catch (err) {
      toast.error(err.message || "Failed to delete work item.");
    }
  };

  const handleViewAllMyItems = () => {
    toast.info(`Showing ${myItems.length} work items assigned to you.`);
  };

  return (
    <div className="w-full p-6 md:p-8 min-h-full transition-colors duration-200 bg-[var(--bg-primary)] text-[var(--text-primary)] space-y-6">
      <Toaster position="top-right" richColors />

      {/* 1. Top Header with Select Project Dropdown */}
      <WorkItemsHeader
        projects={projects}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
        onNewWorkItem={handleNewWorkItem}
        totalItemsCount={metrics.total}
      />

      {/* 2. Top Summary KPI Cards */}
      <WorkItemsSummaryCards metrics={metrics} />

      {/* 3. Middle 2-Column Grid: Category Distribution & My Work Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <CategoryOverviewCard categories={categories} />
        <MyWorkItemsCard
          items={myItems}
          onViewAll={handleViewAllMyItems}
          onNewWorkItem={handleNewWorkItem}
        />
      </div>

      {/* 4. Bottom Table: All Work Items */}
      <AllWorkItemsSection
        items={workItems}
        selectedProject={selectedProject}
        onClearProjectFilter={() => handleSelectProject("all")}
        onNewWorkItem={handleNewWorkItem}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
