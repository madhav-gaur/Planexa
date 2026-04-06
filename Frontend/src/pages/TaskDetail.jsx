import React from 'react'
import { FaArrowLeft } from 'react-icons/fa6'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import '../pages/styles/TaskDetail.css'
import { FaRegCommentDots, FaRegEdit } from "react-icons/fa";
import { useState } from 'react'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { toast } from 'react-toastify'
import { setIsTaskLoaded } from '../store/task.slice'
import { IoArrowBack, IoClose } from 'react-icons/io5'
import Comments from '../components/Comments'
import ButtonLoading from '../components/ButtonLoading'
import { useEffect } from 'react'
import { getTasks } from '../utils/getTasks'
import { useRef } from "react";

const TaskDetail = () => {
    const navigate = useNavigate()
    const { tasks, isTaskLoaded } = useSelector(state => state.task)
    const params = useParams()
    const currTask = tasks?.find(item => item._id == params.taskId)
    const { projects } = useSelector(state => state.project)
    const currProject = projects?.find(item => item._id == params.projectId)
    const { workspaceMember, currWorkspace } = useSelector(state => state.workspace)
    const [loading, setLoading] = useState(false)
    const [comment, setComment] = useState('')
    const [subtask, setSubtask] = useState('')
    // const [taskCompleted, setTaskCompleted] = useState(null)


    const toggleTimeout = useRef({});
    const dispatch = useDispatch()
    const transformDate = (date) => {
        if (!date) return "";
        const temp = date.split('-',);
        const finalDate = temp[0] + '-' + temp[1] + '-' + temp[2].split('T')[0];
        return finalDate;
    }
    useEffect(() => {
        dispatch(setIsTaskLoaded(false))
    }, [dispatch])
    const [data, setData] = useState({
        title: currTask.title,
        description: currTask.description,
        type: currTask.type,
        status: currTask.status,
        priority: currTask.priority,
        dueDate: transformDate(currTask.dueDate) || '',
        assignees: currTask.assignees
    })
    const handleInput = (e) => {
        const { name, value } = e.target;

        setData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const removeMember = (email) => {
        const lead = workspaceMember.find(m => m._id === data.projectLead);
        if (lead?.email === email) return;

        setData(prev => ({
            ...prev,
            assignees: prev.assignees.filter(m => m !== email),
        }));
    };


    const addMember = (userId) => {
        setData(prev => ({
            ...prev,
            assignees: prev.assignees.includes(userId)
                ? prev.assignees
                : [...prev.assignees, userId],
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (data === currTask) return;
        setLoading(true)
        try {
            const response = await Axios({
                ...apiList.updateTask,
                data: {
                    taskId: currTask._id,
                    workspaceId: currWorkspace._id,
                    projectId: currProject._id,
                    title: data.title,
                    description: data.description,
                    type: data.type,
                    status: data.status,
                    priority: data.priority,
                    dueDate: data.dueDate,
                    assignees: data.assignees,
                },

            })
            console.log(response)
            if (response.data.success) {
                toast.success("Task Updated !!")
                dispatch(setIsTaskLoaded(false))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }

    }
    const handleComment = async (e) => {
        e.preventDefault()
        if (!comment.trim()) return;
        try {
            const response = await Axios({
                ...apiList.addComment,
                data: {
                    taskId: currTask._id,
                    message: comment
                },

            })
            console.log(response)
            if (response.data.success) {
                toast.success("Comment added !!")
                dispatch(setIsTaskLoaded(false))
                setComment("")
            }
        } catch (error) {
            console.error(error)
        }

    }
    const handleSubtask = async (e) => {
        e.preventDefault()
        if (!subtask.trim()) return;
        try {
            const response = await Axios({
                ...apiList.addSubtask,
                data: {
                    taskId: currTask._id,
                    title: subtask
                },

            })
            console.log(response)
            if (response.data.success) {
                toast.success("Subtask added")
                dispatch(setIsTaskLoaded(false))
                setSubtask("")
            }
        } catch (error) {
            console.error(error)
        }

    }
    const handleToggleSubtask = (subtaskId) => {

        if (toggleTimeout.current[subtaskId]) {
            clearTimeout(toggleTimeout.current[subtaskId]);
        }
        toggleTimeout.current[subtaskId] = setTimeout(async () => {
            try {
                await Axios({
                    ...apiList.toggleSubtask,
                    data: {
                        taskId: currTask._id,
                        subtaskId,
                    },
                });

                // if (response.data.success) {
                // }

            } catch (error) {
                console.error(error);
            }
        }, 2000);
    };
    useEffect(() => {
        if (currProject?._id && !isTaskLoaded) {
            getTasks({ currProject, dispatch });
        }
    }, [currProject, dispatch, isTaskLoaded]);
    return (
        <div className='project-setting-wrapper'>
            <div className='project-setting-container'>
                <div className='app-form-container' onClick={(e) => e.stopPropagation()}>
                    <div className='app-form-setting-head' style={{ position: "relative" }}>
                        <div onClick={() => navigate(`/projects/${currProject._id}`)}>
                            <IoArrowBack />
                            <span>Back</span>
                        </div>
                        <div>
                            <h2>
                                {currTask.title}
                            </h2>
                        </div>
                    </div>
                    <form className='app-form' onSubmit={handleSubmit} >
                        <div className='app-form-item'>
                            <span>Title</span>
                            <div>
                                <input
                                    type="text"
                                    required
                                    placeholder=""
                                    id='title'
                                    name='title'
                                    onChange={handleInput}
                                    value={data.title}
                                />
                                <label htmlFor='title'>Enter task Title</label>
                            </div>
                        </div>
                        <div className='app-form-item'>
                            <span>Description</span>
                            <div>
                                <input
                                    type="text"
                                    id='description'
                                    name='description'
                                    onChange={handleInput}
                                    value={data.description}
                                    placeholder=" "
                                />
                                <label htmlFor='description'>Enter Description</label>
                            </div>
                        </div>
                        <div className='app-form-item'>
                            <span>Type</span>
                            <div>
                                <select value={data.type} required onChange={handleInput} name="type" id="type">
                                    <option default value="BUG">Bug</option>
                                    <option value="FEATURE">Feature</option>
                                    <option value="TASK">Task</option>
                                    <option value="IMPROVEMENT">Improvement</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: "1rem" }}>
                            <div className='app-form-item'>
                                <span>Status</span>
                                <div>
                                    <select
                                        value={data.status}
                                        required onChange={handleInput}
                                        name="status" id="status">
                                        <option default value="TO_DO">To do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className='app-form-item'>
                                <span>Priority</span>
                                <div>
                                    <select value={data.priority} required onChange={handleInput} name="priority" id="priority">
                                        <option default value="MEDIUM">MEDIUM</option>
                                        <option value="LOW">LOW</option>
                                        <option value="HIGH">HIGH</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='app-form-item'>
                            <span>Due Date</span>
                            <div>
                                <input
                                    onChange={handleInput}
                                    type="date"
                                    name='dueDate'
                                    id='dueDate'
                                    value={data.dueDate}
                                    required
                                />
                            </div>
                        </div>
                        <div className='app-form-item'>
                            <span>Assignees</span>
                            <div>
                                <select
                                    name="assignees"
                                    id="assignees"
                                    onChange={(e) => addMember(e.target.value)}
                                >
                                    <option default value="">Add Assignees</option>
                                    {workspaceMember.map((item, idx) => {
                                        return <option key={item._id + idx} value={item._id}>{item.email}</option>
                                    })}
                                </select>
                            </div>
                        </div>
                        <div className="team-member-pill-wrapper">
                            {data?.assignees?.map((memberId) => {
                                const assignees = workspaceMember.find(u => u._id === memberId);
                                if (!assignees) return null;

                                return (
                                    <div key={memberId} className="team-member-pill">
                                        <p>{assignees.email}</p>
                                        <span onClick={() => {
                                            removeMember(memberId)
                                        }}>
                                            <IoClose />
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'end' }}>
                            
                            <div className='task-delete-btn'>
                                <button type='button' className='primary-button danger-button'>Delete Task</button>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <button
                                    className='primary-button'
                                >
                                    {loading ? <>Saving... <ButtonLoading />
                                    </> : "Update Task"}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div className='project-secondary-settings'>
                <div className='app-form-container' style={{ gap: 0, padding: "1rem" }}>
                    <div className='task-comment-wrapper'>
                        <div>
                            <h2>
                                Comments
                            </h2>
                        </div>
                        <Comments comments={currTask.comments} />
                        <div>
                            {
                                currTask.subTasks.length == 0 && <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem 1rem 0', color: 'var(--text-light)' }}>
                                    No Comments Yet
                                </div>
                            }
                            <form onSubmit={handleComment} className='post-comment app-form-item'>
                                <input
                                    type="text"
                                    name='comment'
                                    id='comment'
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder=' ' />
                                <label htmlFor="comment">Comment..</label>
                                <button className='primary-button' style={{ marginRight: '10px' }} type='submit'>Post</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className='app-form-container' style={{ padding: '1rem' }}>
                    <div>
                        <h2>
                            Sub Tasks
                        </h2>
                    </div>
                    <div className='subtask-container'>
                        <form onSubmit={handleSubtask} className='post-comment app-form-item' style={{ marginTop: '5px', position: "sticky", top: '0', zIndex: 100 }}>
                            <input
                                type="text"
                                name='subtask'
                                id='subtask'
                                value={subtask}
                                onChange={(e) => setSubtask(e.target.value)}
                                placeholder=' ' />
                            <label htmlFor="subtask">Add Sub Task</label>
                            <button className='primary-button' style={{ marginRight: '10px' }} type='submit'>Add</button>
                        </form>
                        {
                            currTask.subTasks.length == 0 && <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem', color: 'var(--text-light)' }}>
                                No Subtasks Yet
                            </div>
                        }
                        {currTask.subTasks.map((task, idx) => {
                            console.log(task)
                            return <div className='subtask-item' key={task._id + idx}>
                                <div>{task?.title}</div>
                                <div className="checkbox-wrapper-18">
                                    <div className="round">
                                        <input value={task.isCompleted} onChange={() => handleToggleSubtask(task._id)} type="checkbox" id={"checkbox-18" + idx} />
                                        <label htmlFor={"checkbox-18" + idx}></label>
                                    </div>
                                </div>
                            </div>
                        })}

                    </div>
                </div>
            </div>
            {/* {isAlertBox._id &&
                <AlertDialog
                    title={`Remove ${isAlertBox.name}`}
                    subtitle={`Are you sure you want to remove ${isAlertBox.name}`}
                    close={() => setIsAlertBox("")}
                    action={() => { removeProjectMember(isAlertBox._id, currProject._id) }}
                />}
            {
                isAlertBoxDel == currProject._id && <AlertDialog
                    title={"Delete This Project"}
                    subtitle={`Are you sure you want to delete this project this action can't be undone`}
                    close={() => setIsAlertBoxDel("")}
                    action={() => { deleteProject(currProject._id) }}
                    actionBtnColor="var(--danger-red)"
                />
            } */}
        </div>
    )
}

export default TaskDetail
