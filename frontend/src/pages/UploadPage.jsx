import UploadFileBox from "../components/UploadFileBox";
import Header from "../components/Header";
import RecentList from "../components/RecentList";

function UploadPage({selectedFile,setSelectedFile,onAnalyze,isLoading,error,recentFiles}){
    return(
        <div>
            <Header 
                title = "Analyze a Requirement"
                subtitle = "Upload a user story as PDF,Word or plain text"
            />
            <UploadFileBox 
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                onAnalyze = {onAnalyze}
                isLoading = {isLoading}
            />

            { error && <p className="errorMessage">{error}</p>}
            <RecentList recentFiles={recentFiles}/>
        </div>
    )
}
export default UploadPage