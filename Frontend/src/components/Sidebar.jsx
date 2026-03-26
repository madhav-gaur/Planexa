import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LuLayoutDashboard } from "react-icons/lu";
import { LuUsers } from "react-icons/lu";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { IoClose, IoMenu, IoSettingsOutline } from "react-icons/io5";
import { FiCheckSquare } from "react-icons/fi";
import { FaRegFolderOpen } from "react-icons/fa";
import "../components/Styles/Sidebar.css"
import { FaCheck } from "react-icons/fa";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { setCurrWorkspace } from '../store/workspace.slice';
import { setIsProjectLoaded } from '../store/project.slice';
import { toast } from 'react-toastify';
const Sidebar = ({ isSidebar, setIsSidebar }) => {
    const [isTaskList, setIsTaskList] = useState(false)
    const { workspaces, currWorkspace } = useSelector(state => state.workspace)
    const [isCreateModal, setIsCreateModal] = useState(false)
    const dispatch = useDispatch()
    const [isDropdown, setIsDropdown] = useState(false)
    // console.log(workspaces)
    const navigate = useNavigate();
    const workLogo = currWorkspace?.name?.split("")[0].toUpperCase()
    const changeWorkspace = (item) => {
        setIsDropdown(false)
        dispatch(setCurrWorkspace(item))
        dispatch(setIsProjectLoaded(false))
        toast(`Workspace changed to ${item.name.slice(0, 12)}...`)
        navigate("/")
    }
    return (
        <div className={`sidebar-wrapper ${isSidebar ? 'isSidebar' : ""}`}>
            <div className='sidebar'>
                {isSidebar && <div style={{ margin: "21px 1rem 0" }} className='sidebar-toggle-sc' onClick={() => {
                    console.log(isSidebar)
                    setIsSidebar(!isSidebar)
                }}>
                    <IoClose />
                </div>}
                <div className='workspace-nav-wrapper'>

                    <div className='workspace-nav' onClick={() => setIsDropdown(!isDropdown)}>
                        <div className='workspace-nav-name'>
                            {currWorkspace?.logo == "" ?
                                <span>{workLogo}</span>
                                : <img src={currWorkspace?.logo} alt="" />}
                            <div>
                                <p>{currWorkspace?.name?.slice(0, 14)}{currWorkspace?.name?.length > 14 ? "..." : ""}</p>
                                <b>{workspaces.length} Workspace</b>
                            </div>
                        </div>
                        <div>
                            {!isDropdown ? <FaChevronDown /> : <IoClose />}
                        </div>
                    </div>
                    {isDropdown && <div className='workspace-nav-dropdown-wrap'>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <p>Workspaces</p>
                            <IoClose
                                onClick={() => setIsDropdown(false)}
                                style={{ color: "black", fontSize: "1.2rem", cursor: "pointer" }} />
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
                    </div>}

                </div>
                <div className='sidebar-nav-wrapper'>
                    <nav>
                        <div className='active-bg' />
                        <NavLink
                            className={({ isActive }) =>
                                isActive ? "nav-item active" : "nav-item"
                            }

                            to="/">
                            <LuLayoutDashboard />
                            <p>Dashboard</p>
                        </NavLink>
                        <NavLink
                            className={({ isActive }) =>
                                isActive ? "nav-item active" : "nav-item"
                            }
                            to="/projects">
                            <FaRegFolderOpen />
                            <p>Projects</p>
                        </NavLink>
                        <NavLink
                            className={({ isActive }) =>
                                isActive ? "nav-item active" : "nav-item"
                            }
                            to="/team">
                            <LuUsers />
                            <p>Team</p>
                        </NavLink>
                        <NavLink
                            className={({ isActive }) =>
                                isActive ? "nav-item active" : "nav-item"
                            }
                            to="/settings">
                            <IoSettingsOutline />
                            <p>Settings</p>
                        </NavLink>
                    </nav>
                    <div className='task-nav'>
                        <div className='task-nav-head' onClick={() => setIsTaskList(!isTaskList)}>
                            <div>
                                <FiCheckSquare />
                                <p>My Tasks</p>
                                <span>2</span>
                            </div>
                            <div
                                style={{ transform: isTaskList ? "rotate(90deg)" : "" }}>
                                <FaChevronRight />
                            </div>
                        </div>
                        {isTaskList && <div className='task-nav-list'>
                            <span></span>
                            <div>
                                <p>Project Name</p>
                                <span>Project Status</span>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>

            {isCreateModal &&
                <div className='create-modal-wrapper' onClick={() => setIsCreateModal(false)}>
                    <CreateWorkspaceModal close={() => {
                        setIsCreateModal(false)
                        setIsDropdown(false)
                    }} />
                </div>
            }
        </div>
    )
}

export default Sidebar
