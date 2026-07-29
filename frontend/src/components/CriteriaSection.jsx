import "../css/CriteriaSection.css";

function CriteriaSection({ acceptanceCriteria }) {
    return (
        <div className="section">
            <h3 className="heading">Acceptance Criteria</h3>
            <ul className="list">
                {acceptanceCriteria.map((criteria, index) => (
                    <li key={index} className="listItem">
                        {criteria}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default CriteriaSection;