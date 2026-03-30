import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import CreateProjectModal from '../components/CreateProjectModal'
import { useState } from 'react'
import { formatDate } from '../utils/formatDate'
import "./styles/Projects.css"
import { CiCalendarDate } from "react-icons/ci";
import { useNavigate } from 'react-router-dom'
import { IoClose, IoSettingsOutline } from 'react-icons/io5'
import { FaRegFolderOpen } from "react-icons/fa";
import Loading from '../components/Loading'
import { CiSearch } from "react-icons/ci";
import { setIsProjectLoaded } from '../store/project.slice'
const Projects = () => {
    const [isCreateModal, setIsCreateModal] = useState(false)
    const { projects, isProjectLoading } = useSelector(state => state.project)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    useEffect(() => {
        dispatch(setIsProjectLoaded(false))
    }, [dispatch])
    const [query, setQuery] = useState("")
    const [status, setStatus] = useState("ALL");
    const [priority, setPriority] = useState("ALL");
    const filteredProjects = projects?.filter((project) => {
        const matchesSearch =
            project.name?.toLowerCase().includes(query.toLowerCase());

        const matchesStatus =
            status === "ALL" || project.status === status;

        const matchesPriority =
            priority === "ALL" || project.priority === priority;

        return matchesSearch && matchesStatus && matchesPriority;
    });
    const isFilter = query != "" || status != "ALL" || priority != "ALL"
    const handleClearFilter = () => {
        if (isFilter) {
            setQuery("")
            setStatus("ALL")
            setPriority("ALL")
        }
    }
    return (
        <>
            <div className='dashboard-head'>
                <div className='dashboard-head-left'>
                    <h2>Projects</h2>
                    <p>Manage and track your Projects</p>
                </div>
                <div className='dashboard-head-right'>
                    <button className='primary-button' onClick={() => setIsCreateModal(true)}>+ New Project</button>
                </div>
            </div>
            <div className='filter-search-container'>
                <div className='project-searchbox'>
                    <CiSearch />
                    <input type="text" placeholder='Search Projects...' value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                    <div className='project-filter-wrapper'>

                <div className='project-filter'>
                    <select name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PLANNING">Planning</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className='project-filter'>
                    <select name="priority" id="priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="ALL">All Priority</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                    </select>
                </div>
                <div className='project-filter-clear-btn'>
                    {isFilter && <button onClick={handleClearFilter} style={{
                        backgroundColor: "var(--surface)",
                        border: "var(--border)",
                        color: "var(--text-normal)"
                    }} className='primary-button'><IoClose /> Clear Filters</button>}
                </div>
                </div>
            </div>
            <div className='project-container-wrapper'>
                <div className='project-container'>
                    {
                        filteredProjects.map((item, idx) => {
                            return <div key={item._id + idx} className='project-card' onClick={() => navigate(`/projects/${item._id}`)}>
                                <div className='project-card-head'>
                                    <div>
                                        <h3>{item.name}</h3>
                                        <p>{item.description.length > 15 ? <>{item?.description?.slice(0, 15)}...</> : item.description}</p>
                                    </div>
                                    <div>
                                        <span
                                            className=
                                            {`${(item.status == "ACTIVE" || item.status == "COMPLETED") && "project-card-active"} 
                                        ${item.status == "PLANNING" && "project-card-planning"} 
                                        ${item.status == "COMPLETED" && "project-card-completed"}
                                        ${(item.status == "ON_HOLD" || item.status == "CANCELLED") && "project-card-cancelled"}
                                            }`}>{item.status.replaceAll("_", " ")}</span>
                                        <p>{item.priority} priority</p>
                                    </div>
                                </div>
                                <div className='project-card-progress-details'>
                                    <div>
                                        <p>Progress</p>
                                        <p>{item.progress}%</p>
                                    </div>
                                    <div>
                                        <p></p>
                                        <span style={{ width: `${item.progress}%` }}></span>
                                    </div>
                                </div>
                                <div className='project-card-date'>
                                    <p>{item.tasks.length} Tasks</p>
                                    <span><CiCalendarDate /> Due date {formatDate(item.endDate)?.split(',')[0]}</span>
                                </div>
                            </div>
                        })
                    }
                </div>
            </div>
            {
                !projects[0] && !isProjectLoading && <div className='empty-model'>
                    <span><FaRegFolderOpen /></span>
                    <h3>No Projects Found</h3>
                    <p>Create your first project to get started</p>
                    <button className='primary-button' onClick={() => setIsCreateModal(true)}>+ Create Project</button>
                </div>
            }
            {
                projects[0] && !filteredProjects[0] && !isProjectLoading && <div className='empty-model'>
                    <span><FaRegFolderOpen /></span>
                    <h3>No matching Projects found</h3>
                </div>
            }
            {
                isCreateModal &&
                <div className='create-modal-wrapper' onClick={() => setIsCreateModal(false)}>
                    <CreateProjectModal close={() => {
                        setIsCreateModal(false)
                    }} />
                </div>
            }
        </ >
    )
}

export default Projects
