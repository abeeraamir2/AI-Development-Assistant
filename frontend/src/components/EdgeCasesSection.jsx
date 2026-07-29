function EdgeCasesSection({edgeCases}){
    return(
        <div>
            <ul>
                {edgeCases.map((cases,index) => (
                    <li key="index">
                        {cases}
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default EdgeCasesSection