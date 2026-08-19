import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import ResultsPage from "./pages/developer/ResultsPage";
import UploadPage from "./pages/developer/UploadPage";
import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OverviewPage from "./pages/developer/OverviewPage";
import Dashboard from "./pages/test-engineer/Dashboard";
import TestGeneratorPage from "./pages/test-engineer/TestGeneratorPage";
import "./App.css";

function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recentFiles, setRecentFiles] = useState([]);
    const [authToken, setAuthToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userEmail, setUserEmail] = useState(null);
    const [theme, setTheme] = useState("light");

    const navigate = useNavigate();

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    }

    useEffect(() => {
        if (authToken) {
            fetchHistory();
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

    async function handleAnalysisClick() {
        if (!selectedFile) {
            setError("Please select a file before analyzing");
            setSelectedFile(null);
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const response = await fetch("http://localhost:8000/upload", {
                method: "POST",
                headers: { Authorization: `Bearer ${authToken}` },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log(errorData);
                throw new Error("Server responded with an error");
            }
            const data = await response.json();
            setAnalysisResult(data);
            await fetchHistory();
            navigate("/results");
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

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

            <Route
                path="/*"
                element={
                    authToken ? (
                        <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)]">

                            <Sidebar userEmail={userEmail} userRole={userRole} />

                            <div className="flex flex-1 flex-col overflow-hidden">

                                <TopHeader
                                    theme={theme}
                                    toggleTheme={toggleTheme}
                                />

                                <main className="flex-1 overflow-y-auto">
                                    <Routes>

                                        <Route
                                            path="/"
                                            element={
                                                userRole === "QA" ? (
                                                    <Dashboard theme={theme} />
                                                ) : (
                                                    <OverviewPage authToken={authToken} userRole={userRole} />
                                                )
                                            }
                                        />

                                        <Route
                                            path="/test-generator"
                                            element={<TestGeneratorPage />}
                                        />

                                        <Route
                                            path="/analyzer"
                                            element={
                                                <UploadPage
                                                    selectedFile={selectedFile}
                                                    setSelectedFile={setSelectedFile}
                                                    onAnalyze={handleAnalysisClick}
                                                    isLoading={isLoading}
                                                    error={error}
                                                    recentFiles={recentFiles}
                                                />
                                            }
                                        />

                                        <Route
                                            path="/results"
                                            element={
                                                <ResultsPage
                                                    result={analysisResult}
                                                    setSelectedFile={setSelectedFile}
                                                />
                                            }
                                        />

                                        <Route path="*" element={<Navigate to="/" replace />} />

                                    </Routes>
                                </main>

                            </div>

                        </div>
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
        </Routes>
    );
}

export default App;