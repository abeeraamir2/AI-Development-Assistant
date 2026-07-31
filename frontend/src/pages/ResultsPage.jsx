import ResultsPanel from "../components/ResultsPanel";
import { useNavigate } from "react-router-dom"
function ResultsPage({result,setSelectedFile}){
    const navigate = useNavigate();
    function handleBackClick(){
        setSelectedFile(null)
        navigate("/")
    }
    return(
        <div>
            <button onClick={handleBackClick} className="backButton">
                Back to Upload
            </button>
            <ResultsPanel result = {result}/>
        </div>
    )
}
export default ResultsPage
