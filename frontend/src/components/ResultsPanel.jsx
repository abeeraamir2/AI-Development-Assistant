import Header from "./Header"
import SummarySection from "./SummarySection"
import CriteriaSection from "./CriteriaSection"
import EdgeCasesSection from "./EdgeCasesSection"
import ApiSection from "./ApiSection"
import DbTablesSection from "./DbTablesSection"
import TasksSection from "./TasksSection"
import "../css/ResultsPanel.css";
import { useState } from "react";

function ResultsPanel({result}){
    const tabs = [
        {id:"summary",label:"Summary"},
        {id:"criteria",label:"Acceptance Criteria"},
        {id:"apis",label:"APIs"},
        {id:"dbTables",label:"DB Tables"},
        {id:"tasks",label:"Tasks"},
        {id:"edgeCases",label:"Edge Cases"}
    ]
    const [activeTab,setActiveTab] = useState("summary");
    return(
        <div>
            <Header 
                title = "Analysis - Login_UserStory.docx" 
                subtitle = "Powered by Gemini Flash" 
            />
            <div className="row-tab">
                {
                    tabs.map((tab,index) => (
                        <button 
                        key={index}
                        onClick={()=>setActiveTab(tab.id)}
                        className={activeTab === tab.id ? "tabActive" : "tab"}
                        >
                            {tab.label}
                        </button>
                    ))
                }
            </div>
            {activeTab == "summary" && <SummarySection summary = {result.summary}/> }
            {activeTab == "criteria" && <CriteriaSection acceptanceCriteria = {result.criteria}/>}
            {activeTab == "apis" && <ApiSection apis = {result.apis}/>}
            {activeTab == "dbTables" && <DbTablesSection dbTables = {result.dbTables}/>}
            {activeTab == "tasks" && <TasksSection tasks = {result.tasks}/>}
            {activeTab == "edgeCases" && <EdgeCasesSection edgeCases = {result.edgeCases}/>}
        </div>
    )
}
export default ResultsPanel