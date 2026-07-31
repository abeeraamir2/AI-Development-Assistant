function DbTablesSection({dbTables}){
    return(
        <div className="section">
            <h3 className="heading">DB Tables generated</h3>
            <ul className="list">
                {
                    dbTables.map((tables,index)=>(
                        <li key={index} className="listItem">{tables}</li>
                    ))
                }
            </ul>
        </div>
    )
}
export default DbTablesSection