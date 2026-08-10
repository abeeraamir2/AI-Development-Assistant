import { useState,useEffect } from "react";
import { Routes,Route,useNavigate,Navigate } from "react-router-dom"
import ResultsPage from "./pages/ResultsPage"
import UploadPage from "./pages/UploadPage"
import Sidebar from "./components/Sidebar";
import Header from "./components/Header"
import RecentList from "./components/RecentList"
import UploadFileBox from "./components/UploadFileBox"
import ResultsPanel from "./components/ResultsPanel"
import mockAnalysis from "./data/mockAnalysis.json"
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import "./App.css"

function App(){
  const navItems = [
    {id: 1, label:"Requirement Analyzer", active:true},
    {id: 2, label:"My Analysis", active:false},
    {id: 3, label:"Settings", active:false}
  ]

  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading,setIsLoading] = useState(false);
  const [error,setError] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [authToken,setAuthToken] = useState(null);
  const [userRole,setUserRole] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (authToken) {
      fetchHistory();
    }
  }, [authToken]);

  async function fetchHistory() {
      try {
          const response = await fetch("http://localhost:8000/history");

          if (!response.ok) {
              throw new Error("Failed to fetch history");
          }

          const data = await response.json();

          setRecentFiles(data);

      } catch (error) {
          console.log(error);
      }
  }
  async function handleAnalysisClick(){
    if (!selectedFile){
      setError("Please select a file before analyzing")
      setSelectedFile(null)
      return;
    }
    setIsLoading(true)
    setError(null)
    setAnalysisResult(null);

    try{
      const formData = new FormData()
      formData.append("file",selectedFile)
      
      const response = await fetch("http://localhost:8000/upload",{
        method:"POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body:formData
      })

      if(!response.ok){
        const errorData = await response.json();
        console.log(errorData);
        throw new Error("Server responded with an error");
      }
      const data = await response.json()    
      setAnalysisResult(data)
      await fetchHistory();
      navigate("/results")
    }catch(error){
      setError(error.message);
      
    }finally{
      setIsLoading(false)
    }
    
  }
  return(
    <div className="appLayout">
      <Sidebar navItems={navItems}/>
      <main className="mainContent">
        <Routes>
          
          <Route
            path="/"
            element={
                authToken ? (
                    <UploadPage
                        selectedFile={selectedFile}
                        setSelectedFile={setSelectedFile}
                        onAnalyze={handleAnalysisClick}
                        isLoading={isLoading}
                        error={error}
                        recentFiles={recentFiles}
                    />
                ) : (
                    <Navigate to="/login" />
                )
            }
          />
          <Route
            path = "/results"
            element={<ResultsPage 
                      result = {analysisResult} 
                      setSelectedFile = {setSelectedFile}/>}
          />
          <Route 
            path="/login" 
            element={<LoginPage 
                      setAuthToken={setAuthToken}
                      setUserRole={setUserRole} />} />
        </Routes>
      </main>
    </div>
  )
}
export default App