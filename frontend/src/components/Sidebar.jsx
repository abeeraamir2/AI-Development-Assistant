import "../css/Sidebar.css";
function Sidebar({navItems}){
    return(
        <aside className="side-bar">
            <div className="side-bar-logo">
                <span>⚙</span>DevAssist
            </div>
            <nav>
                <ul>
                    {navItems.map((item)=>(
                        <li
                            key = {item.id}
                            className={item.active ? "nav-item-active":"nav-item"}
                        >{item.label}</li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}
export default Sidebar