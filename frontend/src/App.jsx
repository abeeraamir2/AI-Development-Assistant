import { useState } from "react";
import { Routes,Route, useNavigate } from "react-router-dom"
import ResultsPage from "./pages/ResultsPage"
import UploadPage from "./pages/UploadPage"
import Sidebar from "./components/Sidebar";
import Header from "./components/Header"
import RecentList from "./components/RecentList"
import UploadFileBox from "./components/UploadFileBox"
import ResultsPanel from "./components/ResultsPanel"
import mockAnalysis from "./data/mockAnalysis.json"
import "./App.css"

function App(){
  const navItems = [
    {id: 1, label:"Requirement Analyzer", active:true},
    {id: 2, label:"My Analysis", active:false},
    {id: 3, label:"Settings", active:false}
  ]

  const recentFiles = [
    {id:1,label:"Login_UserStory.docx",status:"analyzed"},
    {id:2,label:"Checkout_Flow.pdf",status:"analyzed"}
  ]

  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading,setIsLoading] = useState(false);
  const [error,setError] = useState(null);

  const navigate = useNavigate();

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
        body:formData
      })

      if(!response.ok){
        const errorData = await response.json();
        console.log(errorData);
        throw new Error("Server responded with an error");
      }
      const data = await response.json()    
      setAnalysisResult(data)
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
            element={<UploadPage
                      selectedFile={selectedFile}
                      setSelectedFile={setSelectedFile}
                      onAnalyze = {handleAnalysisClick}
                      isLoading = {isLoading}
                      error = {error}
                      recentFiles = {recentFiles}
                    />}
          />
          <Route
            path = "/results"
            element={<ResultsPage 
                      result = {analysisResult} 
                      setSelectedFile = {setSelectedFile}/>}
          />
        </Routes>
      </main>
    </div>
  )
}
export default App