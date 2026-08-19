import "../css/RecentList.css";

function RecentList({ recentFiles }) {
    return (
        <div className="recentCard">
            <h3 className="recentTitle">Recently Uploaded</h3>
            <ul className="fileList">
                {recentFiles.map((file) => (
                    <li key={file.id} className="fileRow">
                        {file.filename}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default RecentList;