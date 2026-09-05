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
import TestHistoryPage from "./pages/test-engineer/TestHistoryPage";
import TestSuiteDetailsPage from "./pages/test-engineer/TestSuiteDetailsPage";
import BugSummarizerPage from "./pages/test-engineer/BugSummarizerPage";
import AnalysisHistoryPage from "./pages/developer/AnalysisHistoryPage";
import ResultsPage from "./pages/developer/ResultsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagementPage from "./pages/admin/UserManagementPage";
import RolesPermissionsPage from "./pages/admin/RolesPermissionPage";
import TeamProgressPage from "./pages/team-progress/TeamProgressPage";
import WorkItemsPage from "./pages/work-items/WorkItemsPage";
import CreateWorkItemPage from "./pages/work-items/CreateWorkItemPage";
import WorkItemDetailsPage from "./pages/work-items/WorkItemDetailsPage";
import EditWorkItemPage from "./pages/work-items/EditWorkItemPage";
import SettingsPage from "./pages/settings/SettingsPage";
import { ProjectAccessProvider } from "./context/ProjectAccessContext";
import "./App.css";
import { normalizeRole, isAdminRole, isQARole } from "./utils/roleUtils";

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [projects, setProjects] = useState(() => {
    try {
      const cached = localStorage.getItem("cached_projects");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [activeProjectId, setActiveProjectId] = useState(
    () => localStorage.getItem("active_project_id") || null
  );
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

  // Determine the default overview page according to the user's role
  const renderRoleDashboard = () => {
    const role = normalizeRole(userRole);
    if (role === "Admin" || role === "Product Manager") {
      return <AdminDashboard authToken={authToken} theme={theme} />;
    }
    if (role === "QA") {
      return <Dashboard theme={theme} />;
    }
    return (
      <OverviewPage
        authToken={authToken}
        userRole={userRole}
        userEmail={userEmail}
      />
    );
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

      <Route
        path="/register"
        element={
          <RegisterPage
            setAuthToken={setAuthToken}
            setUserRole={setUserRole}
            setUserEmail={setUserEmail}
          />
        }
      />

      {authToken ? (
        <Route
          path="/*"
          element={
            <ProjectAccessProvider>
              <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)]">
                <Sidebar
                  userEmail={userEmail}
                  userRole={userRole}
                  onLogout={handleLogout}
                  isOpen={isMobileSidebarOpen}
                  onClose={() => setIsMobileSidebarOpen(false)}
                />

                <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                  <TopHeader
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
                  />

                  <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">
                    <Routes>
                      {/* Role-based root view */}
                      <Route path="/" element={renderRoleDashboard()} />

                      {/* Shared Work Items Routes */}
                      <Route
                        path="/work-items"
                        element={
                          <WorkItemsPage
                            authToken={authToken}
                            userRole={userRole}
                            userEmail={userEmail}
                          />
                        }
                      />
                      <Route
                        path="/work-items/create"
                        element={
                          <CreateWorkItemPage
                            authToken={authToken}
                            userRole={userRole}
                            userEmail={userEmail}
                          />
                        }
                      />
                      <Route
                        path="/work-items/:id/edit"
                        element={
                          <EditWorkItemPage
                            authToken={authToken}
                            userRole={userRole}
                            userEmail={userEmail}
                          />
                        }
                      />
                      <Route
                        path="/work-items/:id"
                        element={
                          <WorkItemDetailsPage
                            authToken={authToken}
                            userRole={userRole}
                            userEmail={userEmail}
                          />
                        }
                      />

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
                        element={
                          isQARole(userRole) || isAdminRole(userRole) ? (
                            <TestGeneratorPage authToken={authToken} />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/test-history"
                        element={
                          isQARole(userRole) || isAdminRole(userRole) ? (
                            <TestHistoryPage
                              authToken={authToken}
                              userRole={userRole}
                              userEmail={userEmail}
                            />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/test-history/:id"
                        element={
                          isQARole(userRole) || isAdminRole(userRole) ? (
                            <TestSuiteDetailsPage
                              authToken={authToken}
                              userRole={userRole}
                              userEmail={userEmail}
                            />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />
                      <Route
                        path="/bug-summarizer"
                        element={
                          isQARole(userRole) || isAdminRole(userRole) ? (
                            <BugSummarizerPage />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />

                      {/* Admin Routes */}
                      <Route
                        path="/team-progress"
                        element={
                          isAdminRole(userRole) ? (
                            <TeamProgressPage
                              authToken={authToken}
                              userRole={userRole}
                              userEmail={userEmail}
                            />
                          ) : (
                            <Navigate to="/" replace />
                          )
                        }
                      />

                      <Route
                        path="/admin/team-progress"
                        element={<Navigate to="/team-progress" replace />}
                      />

                      <Route
                        path="/admin/users"
                        element={<UserManagementPage />}
                      />

                      <Route
                        path="/admin/roles"
                        element={<RolesPermissionsPage />}
                      />

                      {/* Shared Settings Route */}
                      <Route
                        path="/settings"
                        element={
                          <SettingsPage
                            authToken={authToken}
                            userRole={userRole}
                            userEmail={userEmail}
                            theme={theme}
                            setTheme={setTheme}
                            onLogout={handleLogout}
                          />
                        }
                      />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProjectAccessProvider>
          }
        />
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App;