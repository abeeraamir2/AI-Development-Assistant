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
  const [isLoading,setIsLoading] = useState(false);
  const [error,setError] = useState(null);

  function handleAnalysisClick(){
    if (!selectedFile){
      setError("Please select a file before analyzing")
      return;
    }
    setIsLoading(true)
    setError(null)
    setAnalysisResult(null);

    setTimeout(()=> {
      const didFail = Math.random() < 0.2;
      if(didFail){
        setError("Analysis failed.Please try again");
        setIsLoading(false);
      }
      else{
        setAnalysisResult(mockAnalysis);
        setIsLoading(false);
      }
    },1500)
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
          isLoading = {isLoading}
        />
        { error && <p className="errorMessage">{error}</p>}
        <RecentList recentFiles={recentFiles}/>
        { analysisResult && <ResultsPanel result = {analysisResult}/>}
      </main>
    </div>
  )
}
export default App