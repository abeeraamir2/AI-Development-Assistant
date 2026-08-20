import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import AnalyzerPage from "./pages/developer/AnalyzerPage";
import Sidebar from "./components/Shared/Sidebar";
import TopHeader from "./components/Shared/TopHeader";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OverviewPage from "./pages/developer/OverviewPage";
import Dashboard from "./pages/test-engineer/Dashboard";
import TestGeneratorPage from "./pages/test-engineer/TestGeneratorPage";
import BugSummarizerPage from "./pages/test-engineer/BugSummarizerPage";
import AnalysisHistoryPage from "./pages/developer/AnalysisHistoryPage";
import ResultsPage from "./pages/developer/ResultsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import "./App.css";

function App() {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [recentFiles, setRecentFiles] = useState([]);
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [authToken, setAuthToken] = useState(
        () => localStorage.getItem("token") || localStorage.getItem("authToken") || null
    );
    const [userRole, setUserRole] = useState(
        () => localStorage.getItem("userRole") || null
    );
    const [userEmail, setUserEmail] = useState(
        () => localStorage.getItem("userEmail") || null
    );
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "light"
    );

    const navigate = useNavigate();

    const handleLogout = () => {
        setAuthToken(null);
        setUserRole(null);
        setUserEmail(null);
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        window.location.href = "/login";
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "dark") {
        document.documentElement.classList.add("dark");
        } else {
        document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => {
        const nextTheme = prev === "light" ? "dark" : "light";
        localStorage.setItem("theme", nextTheme);
        return nextTheme;
        });
    }

    useEffect(() => {
        if (authToken) {
        fetchHistory();
        fetchProjects();
        }
    }, [authToken]);

    async function fetchHistory() {
        try {
        const response = await fetch("http://localhost:8000/history", {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) throw new Error("Failed to fetch history");
        const data = await response.json();
        setRecentFiles(data);
        } catch (error) {
        console.log(error);
        }
    }

    async function fetchProjects() {
        try {
        const response = await fetch("http://localhost:8000/projects", {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setProjects(data);
        if (data.length > 0 && !activeProjectId) {
            setActiveProjectId(data[0].id);
        }
        } catch (err) {
        console.log(err);
        }
    }

    // Determine the default overview page according to the user's role
    const renderRoleDashboard = () => {
        if (userRole === "Admin" || userRole === "Product Manager") {
        return <AdminDashboard authToken={authToken} theme={theme} />;
        }
        if (userRole === "QA") {
        return <Dashboard theme={theme} />;
        }
        return (
        <OverviewPage
            authToken={authToken}
            userRole={userRole}
        />
        );
    };

    return (
        <Routes>
        <Route
            path="/login"
            element={
            <LoginPage
                setAuthToken={setAuthToken}
                setUserRole={setUserRole}
                setUserEmail={setUserEmail}
            />
            }
        />

        <Route path="/register" element={<RegisterPage />} />

        {authToken ? (
            <Route
            path="/*"
            element={
                <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)]">
                <Sidebar
                    userEmail={userEmail}
                    userRole={userRole}
                    onLogout={handleLogout}
                />

                <div className="flex flex-1 flex-col overflow-hidden">
                    <TopHeader
                    theme={theme}
                    toggleTheme={toggleTheme}
                    />

                    <main className="flex-1 overflow-y-auto">
                    <Routes>
                        {/* Role-based root view */}
                        <Route path="/" element={renderRoleDashboard()} />

                        {/* Developer Routes */}
                        <Route
                        path="/analyzer"
                        element={
                            <AnalyzerPage
                            authToken={authToken}
                            selectedProject={(() => {
                                const proj = projects.find((p) => p.id === activeProjectId);
                                return proj
                                ? { _id: proj.id, name: proj.name }
                                : { _id: null, name: "Project Alpha" };
                            })()}
                            />
                        }
                        />
                        <Route path="/results" element={<ResultsPage />} />
                        <Route
                        path="/history"
                        element={<AnalysisHistoryPage authToken={authToken} />}
                        />

                        {/* QA Routes */}
                        <Route
                        path="/test-generator"
                        element={<TestGeneratorPage authToken={authToken} />}
                        />
                        <Route
                        path="/bug-summarizer"
                        element={<BugSummarizerPage />}
                        />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    </main>
                </div>
                </div>
            }
            />
        ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
        )}
        </Routes>
    );
    }

export default App;