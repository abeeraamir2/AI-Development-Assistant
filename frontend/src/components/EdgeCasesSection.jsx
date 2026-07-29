import "../css/EdgeCasesSection.css";   

function EdgeCasesSection({ edgeCases }) {
    return (
        <div className="section">
            <h3 className="heading">⚠ Missing / Edge Cases Detected</h3>
            <ul className="list">
                {edgeCases.map((cases, index) => (
                    <li key={index} className="listItem">
                        {cases}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default EdgeCasesSection;