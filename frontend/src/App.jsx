import { useState } from "react";
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

  const [selectedFile, setSelectedFile] = useState("");

  const [analysisResult, setAnalysisResult] = useState("");

  function handleAnalysisClick(){
    setAnalysisResult(mockAnalysis)
  }
  return(
    <div className="appLayout">
      <Sidebar navItems={navItems}/>
      <main className="mainContent">
        <Header 
            title = "Analyze a Requirement"
            subtitle = "Upload a user story as PDF,Word or plain text"
        />
        <UploadFileBox 
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onAnalyze = {handleAnalysisClick}
          />
        <RecentList recentFiles={recentFiles}/>
        { analysisResult && <ResultsPanel result = {analysisResult}/>}
      </main>
    </div>
  )
}
export default App