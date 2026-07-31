function ApiSection({apis}){
    return(
        <div className="section">
            <h3 className="heading">APIs</h3>
            <ul className="list">
                {
                    apis.map((api,index) => (
                        <li key={index} className="listItem">{api}</li>
                    ))
                }
            </ul>
        </div>
    )
}
export default ApiSection