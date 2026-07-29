function RecentList({recentFiles}){
    return(
        <div>
            <h2>Recently Uploaded</h2>
            <ul>
                {recentFiles.map((file => (
                    <li key = {file.id}>
                        {file.label}
                        <span>{file.status}</span>
                    </li>
                )))}
                <li></li>
            </ul>
        </div>
    )
}
export default RecentList