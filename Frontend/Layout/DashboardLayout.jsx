import { Outlet, NavLink, } from "react-router-dom";
import Topbar from "../src/components/Topbar";
import Sidebar from "../src/components/Sidebar";
import './DashboardLayout.css'
import { useSelector } from "react-redux";
import Loading from "../src/components/Loading";
import { useEffect, useState } from "react";
const DashboardLayout = () => {
    const { isWorkspaceLoading, } = useSelector(state => state.workspace)
    const [isSidebar, setIsSidebar] = useState(false);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        return localStorage.getItem("sidebar") === "true";
    });
    const [isSidebarHovering, setIsSidebarHovering] = useState(false);
    useEffect(() => {
        localStorage.setItem("sidebar", isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    const [darkMode, setDarkMode] = useState(() => {
        const theme = localStorage.getItem("theme");
        return theme ? theme === "dark" : false;
    });

    useEffect(() => {
        if (darkMode) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    return (
        <div className={`dashboard-wrapper ${darkMode? "dark": ""}`}>
            <Sidebar
                isSidebar={isSidebar}
                setIsSidebar={setIsSidebar}
                isSidebarCollapsed={isSidebarCollapsed}
                setIsSidebarCollapsed={setIsSidebarCollapsed}
                isSidebarHovering={isSidebarHovering}
                setIsSidebarHovering={setIsSidebarHovering}
            />

            <div className="dashboard-main">
                <Topbar setIsSidebar={setIsSidebar} isSidebar={isSidebar} darkMode={darkMode} setDarkMode={setDarkMode} />

                <div className="dashboard-content-wrapper"
                    onClick={() => setIsSidebar(false)}
                    style={{ backdropFilter: `${isSidebar ? "blur(4px)" : ""}` }}>
                    {isWorkspaceLoading ? <Loading /> : <Outlet />}
                </div>
                {isSidebar && (
                    <div
                        className="sidebar-overlay"
                        onClick={() => setIsSidebar(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
