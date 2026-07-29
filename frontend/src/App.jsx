import Sidebar from "./components/Sidebar";
import Header from "./components/Header"
import RecentList from "./components/RecentList"
import UploadFileBox from "./components/UploadFileBox"
import ResultsPanel from "./components/ResultsPanel"

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

  const analysisResult = {
    summary:"User wants to login with email and password",
    criteria:[
      "User can enter email and password",
      "System validates email format",
      "System shows error on incorrect credentials",
      "User is redirected to dashboard on success"
    ],
    edgeCases:[
      "Password complexity rules not specified",
      "Behaviour on expired reset link undefined"
    ]
  }
  return(
    <div>
      <Sidebar navItems={navItems}/>
      <main>
        <Header 
            title = "Analyze a Requirement"
            subtitle = "Upload a user story as PDF,Word or plain text"
        />
        <UploadFileBox/>
        <RecentList recentFiles={recentFiles}/>
        <ResultsPanel result = {analysisResult}/>
      </main>
    </div>
  )
}
export default App