import { Outlet, NavLink, } from "react-router-dom";
import Topbar from "../src/components/Topbar";
import Sidebar from "../src/components/Sidebar";
import './DashboardLayout.css'
import { useSelector } from "react-redux";
import Loading from "../src/components/Loading";
import { useState } from "react";
const DashboardLayout = () => {
    const { isWorkspaceLoading, } = useSelector(state => state.workspace)
    const [isSidebar, setIsSidebar] = useState(false);
    return (
        <div className="dashboard-wrapper">
            <Sidebar isSidebar={isSidebar} setIsSidebar={setIsSidebar} />

            <div className="dashboard-main">
                <Topbar setIsSidebar={setIsSidebar} isSidebar={isSidebar} />

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
