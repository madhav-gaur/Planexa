import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LuLayoutDashboard } from "react-icons/lu";
import { LuUsers } from "react-icons/lu";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { IoClose, IoMenu, IoSettingsOutline } from "react-icons/io5";
import { IoPulseOutline } from "react-icons/io5";
import { FiCheckSquare } from "react-icons/fi";
import { FaRegFolderOpen } from "react-icons/fa";
import "../components/Styles/Sidebar.css"
import { TbLayoutSidebarLeftCollapseFilled, TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { setCurrWorkspace, setIsWorkspaceMemberLoaded } from '../store/workspace.slice';
import { GoSidebarCollapse } from "react-icons/go";
import { setIsProjectLoaded } from '../store/project.slice';
import { toast } from 'react-toastify';
import { getUserTasks } from '../utils/getUserTasks';
import { apiList } from '../common/apiList';
import Axios from '../utils/axios';
const Sidebar = ({ isSidebar, setIsSidebar, isSidebarCollapsed, setIsSidebarCollapsed, isSidebarHovering, setIsSidebarHovering, }) => {

    const dispatch = useDispatch()
    const navigate = useNavigate();

    const { workspaces, currWorkspace } = useSelector(state => state.workspace)
    const { userDetails } = useSelector(state => state.user)

    const [isTaskList, setIsTaskList] = useState(false)
    const [isCreateModal, setIsCreateModal] = useState(false)
    const [isDropdown, setIsDropdown] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1100);
    const [userTasks, setUserTasks] = useState([])
    const [isTasksLoading, setIsTasksLoading] = useState(false)
    const workLogo = currWorkspace?.name?.split("")[0].toUpperCase()

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1100);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchUserTasks = async () => {
            if (currWorkspace && userDetails) {
                setIsTasksLoading(true)
                const tasks = await getUserTasks({
                    workspaceId: currWorkspace._id,
                    userId: userDetails._id
                })
                setUserTasks(tasks)
                setIsTasksLoading(false)
            }
        }
        fetchUserTasks()
    }, [currWorkspace, userDetails])

    const isExpanded = isMobile
        ? true
        : (!isSidebarCollapsed || isSidebarHovering);

    const changeWorkspace = (item) => {
        localStorage.setItem("currWorkspaceId", item._id)
        setIsDropdown(false)
        dispatch(setCurrWorkspace(item))
        dispatch(setIsProjectLoaded(false))
        dispatch(setIsWorkspaceMemberLoaded(false))
        toast(`Workspace changed to ${item.name.slice(0, 12)}...`)
        navigate("/")
    }

    const toggleTaskCompletion = async (task) => {
        try {
            const newStatus = task.status === 'DONE' ? 'TO_DO' : 'DONE'
            await Axios({
                ...apiList.updateTask,
                data: {
                    taskId: task._id,
                    workspaceId: task.workspaceId,
                    projectId: task.projectId,
                    status: newStatus
                }
            })
            setUserTasks(prevTasks =>
                prevTasks.map(t =>
                    t._id === task._id ? { ...t, status: newStatus } : t
                )
            )
        } catch (error) {
            console.error('Error updating task:', error)
            toast.error('Failed to update task')
        }
    }
    return (
        <div className={`sidebar-wrapper ${isSidebar ? 'isSidebar' : ""}`}
            onMouseEnter={() => setIsSidebarHovering(true)}
            onMouseLeave={() => setIsSidebarHovering(false)}>
            <div
                className='sidebar'
                style={{ width: isExpanded ? "250px" : "60px" }}
            >

                {isSidebar && <div style={{ margin: "21px 1rem 0" }} className='sidebar-toggle-sc' onClick={() => {
                    setIsSidebar(!isSidebar)
                }}>
                    <IoClose />
                </div>}
                <div className='workspace-nav-wrapper' >

                    <div className='workspace-nav'
                        style={{
                            justifyContent: isExpanded ? "space-between" : "center",
                        }}
                        onClick={() => setIsDropdown(!isDropdown)}>
                        <div className='workspace-nav-name'>
                            {currWorkspace?.logo == "" ?
                                <span>{workLogo}</span>
                                : <img src={currWorkspace?.logo} alt="" />}
                            {isExpanded && <div>
                                <p>{currWorkspace?.name?.slice(0, 14)}{currWorkspace?.name?.length > 14 ? "..." : ""}</p>
                                <b>{workspaces.length} Workspace</b>
                            </div>}
                        </div>
                        {isExpanded && <div>
                            {!isDropdown ? <FaChevronDown /> : <IoClose />}
                        </div>}
                    </div>
                    {isDropdown &&
                        <div
                            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                            onClick={() => setIsDropdown(false)}
                        >
                            <div className='workspace-nav-dropdown-wrap'>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <p>Workspaces</p>
                                    <IoClose
                                        onClick={() => setIsDropdown(false)}
                                        style={{ color: "var(--text-normal)", fontSize: "1.2rem", cursor: "pointer" }} />
                                </div>
                                <div className='workspace-nav-dropdown-list'>
                                    {
                                        workspaces.map((item, idx) => {
                                            return <div className='workspace-nav-dropdown' key={item._id + idx}>
                                                <div className='workspace-nav' onClick={() => changeWorkspace(item)}>
                                                    <div className='workspace-nav-name'>
                                                        {item?.logo == "" ?
                                                            <span>{item?.name?.split("")[0].toUpperCase()}</span>
                                                            : <img src={item?.logo} alt="" />}
                                                        <div>
                                                            <p style={{ fontSize: "14px" }}>{item?.name?.slice(0, 16)}{item?.name?.length > 16 ? "..." : ""}</p>
                                                            <b>{item?.members.length} members</b>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {currWorkspace._id == item._id ? <FaCheck /> : ""}
                                                    </div>
                                                </div>

                                            </div>
                                        })
                                    }
                                </div>

                                <div>
                                    <button
                                        style={{ width: "100%" }}
                                        onClick={() => {
                                            setIsDropdown(false)
                                            setIsCreateModal(true)
                                        }}
                                        className='primary-button'>+ Create Workspace
                                    </button>
                                </div>
                            </div>
                        </div>}

                </div>
                <div className='sidebar-nav-wrapper'
                >
                    {isExpanded ? <nav>
                        <div className='active-bg' />
                        <NavLink
                            className={({ isActive }) =>
                                `${isActive ? 'nav-item active' : 'nav-item'
                                }`
                            }
                            to="/">
                            <LuLayoutDashboard />
                            <p>Dashboard</p>
                        </NavLink>
                        <NavLink
                            className={({ isActive }) =>
                                `${isActive ? 'nav-item active' : 'nav-item'
                                }`
                            }
                            to="/projects">
                            <FaRegFolderOpen />
                            <p>Projects</p>
                        </NavLink>
                        <NavLink
                            className={({ isActive }) =>
                                `${isActive ? 'nav-item active' : 'nav-item'
                                }`
                            }
                            to="/team">
                            <LuUsers />
                            <p>Team</p>
                        </NavLink>
                        <NavLink
                            className={({ isActive }) =>
                                `${isActive ? 'nav-item active' : 'nav-item'
                                }`
                            }
                            to="/activity">
                            <IoPulseOutline />
                            <p>Activity</p>
                        </NavLink>
                        <NavLink
                            className={({ isActive }) =>
                                `${isActive ? 'nav-item active' : 'nav-item'
                                }`
                            }
                            to="/settings">
                            <IoSettingsOutline />
                            <p>Settings</p>
                        </NavLink>
                    </nav> :
                        <nav>
                            <div className='active-bg' />
                            <NavLink
                                className={({ isActive }) =>
                                    `${isActive ? 'nav-item active' : 'nav-item'
                                    }`
                                }
                                to="/">
                                <LuLayoutDashboard />
                            </NavLink>
                            <NavLink
                                className={({ isActive }) =>
                                    `${isActive ? 'nav-item active' : 'nav-item'
                                    }`
                                }
                                to="/projects">
                                <FaRegFolderOpen />
                            </NavLink>
                            <NavLink
                                className={({ isActive }) =>
                                    `${isActive ? 'nav-item active' : 'nav-item'
                                    }`
                                }
                                to="/team">
                                <LuUsers />
                            </NavLink>
                            <NavLink
                                className={({ isActive }) =>
                                    `${isActive ? 'nav-item active' : 'nav-item'
                                    }`
                                }
                                to="/activity">
                                <IoPulseOutline />
                            </NavLink>
                            <NavLink
                                className={({ isActive }) =>
                                    `${isActive ? 'nav-item active' : 'nav-item'
                                    }`
                                }
                                to="/settings">
                                <IoSettingsOutline />
                            </NavLink>
                        </nav>}
                    <div className='task-nav'>
                        <div className='task-nav-head' onClick={() => setIsTaskList(!isTaskList)}>
                            {isExpanded ? <><div>
                                <FiCheckSquare />
                                <p>My Tasks</p>
                                <span>{userTasks.filter(task => task.status !== 'DONE').length}</span>
                            </div>
                                <div
                                    style={{ transform: isTaskList ? "rotate(90deg)" : "" }}>
                                    <FaChevronRight />
                                </div> </> :
                                <div>
                                    <FiCheckSquare />

                                </div>
                            }
                        </div>
                        {isTaskList && isExpanded && <div className='task-nav-list'>
                            {isTasksLoading ? (
                                <div style={{ padding: '10px', textAlign: 'center' }}>Loading...</div>
                            ) : userTasks.length === 0 ? (
                                <div style={{ padding: '10px', textAlign: 'center' }}>No tasks assigned</div>
                            ) : (
                                userTasks
                                    .filter(task => isExpanded || task.status !== 'DONE')
                                    .map(task => (
                                        <div key={task._id} className='task-nav-item'
                                            onClick={() => navigate(`/projects/${task.projectId._id}/tasks/${task._id}`)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={task.status === 'DONE'}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        toggleTaskCompletion(task);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{
                                                        textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
                                                        opacity: task.status === 'DONE' ? 0.6 : 1
                                                    }}>
                                                        {task.title}
                                                    </p>
                                                    {isExpanded && (
                                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                            {task.projectId?.name || 'Unknown Project'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            )}
                        </div>}
                    </div>
                </div>
                <nav className='sidebar-collapse-toggle'
                    onClick={() => {
                        setIsSidebarCollapsed((prev) => !prev)
                        setIsSidebarHovering(false)
                    }}>
                    <div className='nav-item'>
                        {isSidebarCollapsed ? <TbLayoutSidebarRightCollapseFilled /> : <TbLayoutSidebarLeftCollapseFilled />}
                    </div>
                </nav>
            </div>
            {
                isCreateModal &&
                <div className='create-modal-wrapper' onClick={() => setIsCreateModal(false)}>
                    <CreateWorkspaceModal close={() => {
                        setIsCreateModal(false)
                        setIsDropdown(false)
                    }} />
                </div>
            }
        </div >
    )
}

export default Sidebar
