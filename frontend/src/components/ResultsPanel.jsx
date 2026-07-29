import Header from "./Header"
import SummarySection from "./SummarySection"
import CriteriaSection from "./CriteriaSection"
import EdgeCasesSection from "./EdgeCasesSection"
import "../css/ResultsPanel.css";

function ResultsPanel({result}){
    return(
        <div>
            <Header 
                title = "Analysis - Login_UserStory.docx" 
                subtitle = "Powered by Gemini Flash" 
            />
            <SummarySection summary = {result.summary}/>
            <CriteriaSection acceptanceCriteria = {result.criteria}/>
            <EdgeCasesSection edgeCases = {result.edgeCases}/>
        </div>
    )
}
export default ResultsPanel