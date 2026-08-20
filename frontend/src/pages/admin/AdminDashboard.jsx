import React, { useState } from "react";
import AdminControlsHeader from "../../components/Admin-overview/AdminControlsHeader";
import AdminKPICards from "../../components/Admin-overview/AdminKPICards";
import BurndownChartCard from "../../components/Admin-overview/BurndownChartCard";
import TeamOverviewTable from "../../components/Admin-overview/TeamOverviewTable";
import AISprintIntelligencePanel from "../../components/Admin-overview/AISprintIntelligencePanel";
import { toast, Toaster } from "sonner";

const BURNDOWN_DATA = [
    { day: "Mon", ideal: 50, actual: 50 },
    { day: "Tue", ideal: 43, actual: 47 },
    { day: "Wed", ideal: 36, actual: 42 },
    { day: "Thu", ideal: 29, actual: 38 },
    { day: "Fri", ideal: 22, actual: 30 },
    { day: "Mon", ideal: 15, actual: 24 },
    { day: "Tue", ideal: 8, actual: 18 },
    { day: "Today", ideal: 0, actual: 14 },
];

    const TEAM_MEMBERS = [
    {
        id: "1",
        name: "Sarah J.",
        role: "Frontend",
        points: "12/15",
        progress: 80,
        status: "Active",
        statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        barColor: "bg-[#4d8bf8]",
    },
    {
        id: "2",
        name: "David M.",
        role: "Backend",
        points: "8/20",
        progress: 40,
        status: "Blocked",
        statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        barColor: "bg-amber-400",
    },
    ];

    export default function AdminDashboard({ onAddSprint }) {
    const [projects] = useState([
        { id: "1", name: "Project Alpha", color: "#10b981" },
        { id: "2", name: "E-Commerce Platform", color: "#3b82f6" },
    ]);
    const [selectedProject, setSelectedProject] = useState(projects[0]);

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
            sprints={sprints}
            selectedSprint={selectedSprint}
            onSelectSprint={setSelectedSprint}
            onAddSprint={onAddSprint || (() => toast.info("Create Sprint modal opening..."))}
        />

        {/* KPI Cards */}
        <AdminKPICards metrics={{ velocity: 42, completion: 68, stories_done: 18, total_stories: 24, time_remaining: "4d" }} />

        {/* 2-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-6">
            <BurndownChartCard data={BURNDOWN_DATA} />
            <TeamOverviewTable members={TEAM_MEMBERS} />
            </div>
            <div className="lg:col-span-4">
            <AISprintIntelligencePanel onApplyRecommendation={() => toast.success("DEV-442 reassigned to Sarah J.")} />
            </div>
        </div>
        </div>
    );
}