import React from 'react'
import { FaArrowLeft } from 'react-icons/fa6'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import '../pages/styles/TaskDetail.css'
import { formatDate } from '../utils/formatDate'

const TaskDetail = () => {
    const navigate = useNavigate()
    const { tasks } = useSelector(state => state.task)
    const params = useParams()
    const currTask = tasks?.find(item => item._id == params.taskId)
    console.log(currTask)
    const { projects } = useSelector(state => state.project)
    const currProject = projects?.find(item => item._id == params.projectId)
    const { workspaceMember } = useSelector(state => state.workspace)
    const assignees = currTask?.assignees?.map((id) =>
        workspaceMember?.find(
            (member) => member._id.toString() === id.toString()
        )
    );
    console.log(assignees)
    return (

        <div className="task-detail-page">

            {/* Header */}
            <div className="dashboard-head" style={{ marginBottom: "1rem" }}>
                <div className="task-header-left">
                    <FaArrowLeft onClick={() => navigate(`/projects/${currProject._id}`)} />
                    <h2>{currTask?.title}</h2>
                </div>
            </div>

            <div className="task-body">

                <div className="task-detail-left">
                    <div className="task-card">
                        <div className='task-main-details'>
                            <div>
                                <span className="priority-badge">{currTask?.priority}</span>

                                <h3>{currTask?.title}</h3>
                                <p className="task-time">Created on {formatDate(currTask.createdAt)}</p>

                                <div className="task-section">
                                    <span>Description</span>
                                    <p>{currTask?.description}</p>
                                    <FaRegEdit />
                                </div>
                            </div>
                            <div className='task-deletion-area'>
                                <div className="task-status-update">
                                    <select defaultValue={currTask?.status}>
                                        <option value="TO_DO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                </div>
                                <button className="primary-button delete-btn">Delete Task</button>

                            </div>
                        </div>
                        <div className='task-detail-item'>
                            <div className="task-status-update">
                                <span>Status</span>
                                <select defaultValue={currTask?.status}>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>
                        <div className='task-detail-item'>

                            <div className="task-status-update">
                                <span>Assignees</span>
                                <div className="task-assignee-box">
                                    {currTask?.assignees?.length
                                        ? assignees.map((a, i) => (
                                            <div key={i} className="task-assignee-item">
                                                {a.name.split(" ")[0]}
                                            </div>
                                        ))
                                        : "No assignees"}
                                </div>
                            </div>
                        </div>
                        <div className='task-detail-item'>
                            <div className="task-status-update">
                                <span>Subtasks</span>
                                <div className="subtask-input">
                                    <input placeholder="Add a subtask..." />
                                    <button className="primary-button">Add</button>
                                </div>
                            </div>
                        </div>


                    </div>

                </div>

                <div className="task-right">

                    <div className="task-card">
                        <h4>Activity</h4>
                        <span>{"<STATIC DATA>"}</span>
                        <div className="activity-item">
                            <p><b>You</b> created task</p>
                            <span>1 min ago</span>
                        </div>

                        <div className="activity-item">
                            <p>Status changed</p>
                            <span>1 min ago</span>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    )
}

export default TaskDetail
