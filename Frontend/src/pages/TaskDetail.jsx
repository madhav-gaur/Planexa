import React from 'react'
import { FaArrowLeft } from 'react-icons/fa6'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

const TaskDetail = () => {
    const navigate = useNavigate()
    const { tasks } = useSelector(state => state.task)
    const params = useParams()
    const currTask = tasks?.find(item => item._id == params.taskId)
    console.log(currTask)
    const { projects } = useSelector(state => state.project)
    const currProject = projects?.find(item => item._id == params.projectId)
    

    return (
        <div>
            <div className='dashboard-head'>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FaArrowLeft style={{ cursor: "pointer", color: "var(--text-light)" }} onClick={() => navigate(`/projects/${currProject._id}`)} />
                    <h3 style={{ marginBottom: "0" }}>{currTask?.title}</h3>
                </div>
            </div>
            <div>
                <div className='task-detail-wrapper'>
                    <div className='task-basic-detail'>
                        <div>
                            <span>{currTask?.priority}</span>
                            <h3>{currTask?.title}</h3>
                            <div>
                                <span>Description</span>
                                <p>{currTask?.description}</p>
                            </div>
                        </div>
                        <div>
                            <select name="status" id="status">
                                <option defaultChecked value={currTask?.status}>{currTask?.status}</option>
                                <option value="TO_DO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                            <div>
                                <button>Delete Task</button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span>Assignees</span>
                        <div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskDetail
