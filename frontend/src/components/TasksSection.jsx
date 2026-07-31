function TasksSection({tasks}){
    return(
        <div className="section">
            <h3 className="heading">Tasks generated</h3>
            <ul className="list">
                {
                    tasks.map((task,index)=>(
                        <li key={index} className="listItem">{task}</li>
                    ))
                }
            </ul>
        </div>
    )
}
export default TasksSection