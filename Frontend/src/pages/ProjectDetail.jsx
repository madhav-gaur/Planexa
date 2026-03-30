import React from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import CreateTaskModal from '../components/CreateTaskModal';
import { setIsTaskLoaded, setIsTaskLoading, setTasks } from "../store/task.slice";
import { CiSearch } from "react-icons/ci";
import { useEffect } from 'react';
import { formatDate } from '../utils/formatDate';
import { FaRegSquare } from "react-icons/fa6";
import "./styles/ProjectDetail.css"
import { AiOutlineThunderbolt } from "react-icons/ai";
import { BsLightningCharge } from "react-icons/bs";
import { IoBugOutline, IoClose, IoSettingsOutline } from "react-icons/io5";
import { apiList } from '../common/apiList';
import { FiMessageSquare } from "react-icons/fi";
import { FaBug, FaRegFolderOpen } from "react-icons/fa";
import Axios from '../utils/axios';
import { LuGitCommitHorizontal } from "react-icons/lu";
import { setIsProjectLoaded } from '../store/project.slice';
const ProjectDetail = () => {
    const params = useParams()
    const [isCreateModal, setIsCreateModal] = useState(false)
    const { projects } = useSelector(state => state.project)

    const currProject = projects?.find(item => item._id == params.projectId)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { tasks, isTaskLoaded } = useSelector((state) => state.task);
    const [query, setQuery] = useState("")
    const [status, setStatus] = useState("ALL");
    const [priority, setPriority] = useState("ALL");
    const [type, setType] = useState("ALL");
    const filteredTasks = tasks?.filter((tasks) => {
        const matchesSearch =
            tasks.title?.toLowerCase().includes(query.toLowerCase());

        const matchesStatus =
            status === "ALL" || tasks.status === status;

        const matchesPriority =
            priority === "ALL" || tasks.priority === priority;

        const matchesType =
            type === "ALL" || tasks.type === priority;

        return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
    const isFilter = query != "" || status != "ALL" || priority != "ALL" || type != "ALL"
    const handleClearFilter = () => {
        if (isFilter) {
            setQuery("")
            setStatus("ALL")
            setPriority("ALL")
            setType("ALL")
        }
    }
    console.log(tasks)
    console.log(filteredTasks)
    useEffect(() => {
        dispatch(setIsProjectLoaded(false))
        dispatch(setIsTaskLoaded(false))
    }, [dispatch])
    useEffect(() => {
        if (currProject?._id) {

            const getTasks = async () => {
                try {
                    dispatch(setIsTaskLoading(true))
                    const response = await Axios({
                        ...apiList.getTasks,
                        data: {
                            projectId: currProject?._id
                        }
                    })
                    if (response) {
                        dispatch(setIsTaskLoading(false))
                    }
                    if (response.data.success) {
                        let data = response.data.data
                        dispatch(setTasks(data))
                        dispatch(setIsTaskLoaded(true))
                        if (isTaskLoaded) {
                            dispatch(setIsTaskLoading(false))
                        }
                    }
                } catch (error) {
                    console.error(error)
                } finally {
                    dispatch(setIsTaskLoaded(true))
                    dispatch(setIsTaskLoading(false))
                }
            }
            if (!isTaskLoaded) {
                getTasks()
            }
        }
    }, [isTaskLoaded, dispatch, currProject?._id])
    const [completedCount, setCompletedCount] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);
    useEffect(() => {

        let completed = 0;
        let inProgress = 0;
        const statusCount = () => {
            tasks.forEach(task => {
                if (task.status == "DONE") completed++;
                if (task.status == "IN_PROGRESS") inProgress++;
            });
            setCompletedCount(completed);
            setInProgressCount(inProgress);
        }
        statusCount();
    }, [completedCount, inProgressCount, tasks])
    return (
        <>
            <div className='dashboard-head'>
                <div className='dashboard-head-left' style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FaArrowLeft style={{ cursor: "pointer", color: "var(--text-light)" }} onClick={() => navigate(`/projects`)} />
                    <h3 style={{ marginBottom: "0" }}>{currProject?.name}</h3>
                    <span>{currProject?.status}</span>
                </div>
                <div className='dashboard-head-right'>
                    <button className='primary-button' onClick={() => setIsCreateModal(true)}>+ New Task</button>
                    <div onClick={() => navigate(`/projects/${currProject?._id}/settings`)}>
                        <IoSettingsOutline />
                    </div>
                </div>
            </div>
            {tasks[0] && <>
                <div className='project-basic-details-wrap'>
                    <div className='project-basic-details'>
                        <div className='project-detail-item'>
                            <div>
                                <p>Total Tasks</p>
                                <h1>{currProject?.tasks.length}</h1>
                            </div>
                            <div>
                                <AiOutlineThunderbolt />
                            </div>
                        </div>
                        <div className='project-detail-item'>
                            <div>
                                <p>Completed</p>
                                <h1>{completedCount}</h1>
                            </div>
                            <div>
                                <AiOutlineThunderbolt />
                            </div>
                        </div>
                        <div className='project-detail-item'>
                            <div>
                                <p>In Progress</p>
                                <h1>{inProgressCount}</h1>
                            </div>
                            <div>
                                <AiOutlineThunderbolt />
                            </div>
                        </div>
                        <div className='project-detail-item'>
                            <div>
                                <p>Total Tasks</p>
                                <h1>{currProject?.tasks.length}</h1>
                            </div>
                            <div>
                                <AiOutlineThunderbolt />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='filter-search-container'>
                    <div className='project-searchbox'>
                        <CiSearch />
                        <input type="text" placeholder='Search Tasks...' value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                    <div className='project-filter-wrapper'>
                        <div className='project-filter'>
                            <select name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="ALL">All Status</option>
                                <option value="TO_DO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
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
                        <div className='project-filter'>
                            <select name="type" id="type" value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="ALL">All type</option>
                                <option value="BUG">Bug</option>
                                <option value="FEATURE">Feature</option>
                                <option value="IMPROVEMENT">Improvement</option>
                                <option value="OTHER">Other</option>
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
            </>}
            <div className='task-list-group-wrapper'>
                <div className='task-list-head'>
                    <div className='task-list-head-item'>Title</div>
                    <div className='task-list-head-item'>Type</div>
                    <div className='task-list-head-item'>Priority</div>
                    <div className='task-list-head-item'>Status</div>
                    <div className='task-list-head-item'>Due Date</div>
                </div>

                <div className='task-list-group'>

                    {
                        tasks[0] && !filteredTasks[0] && isTaskLoaded && <div className='empty-model'>
                            <span><FaRegFolderOpen /></span>
                            <h3>No matching Tasks Found</h3>
                            {/* <button className='primary-button' onClick={() => setIsCreateModal(true)}>+ Create Task</button> */}
                        </div>
                    }
                    {
                        filteredTasks.map((item, idx) => {
                            return <div
                                key={item._id + idx}
                                className='task-list-item'
                                onClick={() => navigate(`/projects/${currProject._id}/tasks/${item._id}`)}
                            >
                                <div>{item.title}</div>
                                <div className='task-list-item-type'>
                                    {item.type == "BUG" && <div style={{ color: "red" }}><IoBugOutline /> <span>Bug</span></div>}
                                    {item.type == "FEATURE" && <div style={{ color: "var(--primary-blue)" }}><BsLightningCharge /> <span>Feature</span></div>}
                                    {item.type == "TASK" && <div style={{ color: "rgb(14, 166, 0)" }}><FaRegSquare /> <span>Task</span></div>}
                                    {item.type == "OTHER" && <div style={{ color: "rgb(255, 153, 0)" }}><FiMessageSquare /> <span>Other</span></div>}
                                    {item.type == "IMPROVEMENT" && <div style={{ color: "#a937fa" }}><LuGitCommitHorizontal /> <span>Improvement</span></div>}
                                </div>
                                <div>
                                    <span className={`task-list-item-priority ${item.priority == "LOW" && "low-priority"} 
                                ${item.priority == "HIGH" && "high-priority"}
                                ${item.priority == "MEDIUM" && "medium-priority"}`}>{item.priority}</span>
                                </div>
                                <div>
                                    {item.status == "IN_PROGRESS" && "In Progress"}
                                    {item.status == "TO_DO" && "To Do"}
                                    {item.status == "DONE" && "Done"}
                                </div>
                                <div>{formatDate(item.dueDate).split(",")[0]}</div>
                            </div>
                        })

                    }

                </div>

            </div>
            {
                !tasks[0] && isTaskLoaded && <div className='empty-model'>
                    <span><FaRegFolderOpen /></span>
                    <h3>No Tasks Found</h3>
                    <p>Create your first task to get started</p>
                    <button className='primary-button' onClick={() => setIsCreateModal(true)}>+ Create Task</button>
                </div>
            }

            {
                isCreateModal &&
                <div className='create-modal-wrapper' onClick={() => setIsCreateModal(false)}>
                    <CreateTaskModal close={() => {
                        setIsCreateModal(false)
                    }} currProject={currProject} />
                </div>
            }
        </>
    )
}

export default ProjectDetail
