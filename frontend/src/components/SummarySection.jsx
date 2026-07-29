import "../css/SummarySection.css";

function SummarySection({ summary }) {
    return (
        <div className="section">
            <div className="headingRow">
                <h3 className="heading">AI Summary</h3>
                <span className="geminiTag">Gemini</span>
            </div>
            <p className="summaryText">{summary}</p>
        </div>
    );
}
export default SummarySection;