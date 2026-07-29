function CriteriaSection({acceptanceCriteria}){
    return(
        <div>
            <ul>
                {acceptanceCriteria.map((criteria,index) => 
                    <li key="index">
                        {criteria}
                    </li>
                )}
            </ul>
        </div>
    )
}
export default CriteriaSection