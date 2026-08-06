function DbTablesSection({ dbTables }) {
    return (
        <div className="section">
            <h3 className="heading">DB Tables generated</h3>
            {dbTables.map((table, tableIndex) => (
                <div key={tableIndex} className="tableBlock">
                    <h4 className="tableName">{table.name}</h4>
                    <ul className="list">
                        {table.attributes.map((attribute, attrIndex) => (
                            <li key={attrIndex} className="listItem">{attribute}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default DbTablesSection;