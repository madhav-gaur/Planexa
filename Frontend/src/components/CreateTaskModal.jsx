import React from 'react'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import ButtonLoading from './ButtonLoading'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { setIsProjectLoaded } from '../store/project.slice'
import { setIsTaskLoaded } from '../store/task.slice'

const CreateTaskModal = ({ close, currProject }) => {
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const [data, setData] = useState({
        title: "",
        description: "",
        type: "TASK",
        status: "TO_DO",
        priority: "MEDIUM",
        dueDate: undefined,
        assignees: [],
        labels: "",
    })
    // console.log(data)
    const { workspaceMember, currWorkspace } = useSelector(state => state.workspace)
    const autoAssignEnabled = currWorkspace?.settings?.taskAutoAssign
    const handleInput = (e) => {
        const { name, value } = e.target;

        setData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const removeMember = (email) => {
        const lead = workspaceMember.find(m => m._id === (currProject?.projectHeadId ?? currProject?.projectLead));
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
        setLoading(true)
        try {
            const response = await Axios({
                ...apiList.createTask,
                data: {
                    workspaceId: currWorkspace._id,
                    projectId: currProject._id,
                    title: data.title,
                    description: data.description,
                    type: data.type,
                    status: data.status,
                    priority: data.priority,
                    dueDate: data.dueDate,
                    assignees: data.assignees,
                    labels: data.labels.split(',').map(item => item.trim()).filter(Boolean),
                }
            })
            console.log(response)
            if (response.data.success) {
                close()
                toast.success("Task Created !!")
                dispatch(setIsProjectLoaded(false))
                dispatch(setIsTaskLoaded(false))
            }
            console.log(response)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className='app-form-container' onClick={(e) => e.stopPropagation()}>
            <div className='app-form-head'>
                <h2>Create new Task</h2>
                <span onClick={close}><IoClose /></span>
            </div>
            <form className='app-form' onSubmit={handleSubmit} >
                <div className='app-form-item'>
                    <span>Title</span>
                    <div>
                        <input
                            type="text"
                            required
                            placeholder=" "
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
                            <option default value="">Select Assignees</option>
                            {workspaceMember.map((item, idx) => {
                                return <option key={item._id + idx} value={item._id}>{item.email}</option>
                            })}
                        </select>
                    </div>
                </div>
                <div className='app-form-item'>
                    <span>Labels</span>
                    <div>
                        <input
                            type="text"
                            id='labels'
                            name='labels'
                            onChange={handleInput}
                            value={data.labels}
                            placeholder=" "
                        />
                        <label htmlFor='labels'>Comma separated labels</label>
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
                {autoAssignEnabled && data.assignees.length === 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                        No assignees selected. The project lead will be auto-assigned by workspace rules.
                    </p>
                )}
                <div>
                    <button
                        className='primary-button'
                        style={{ width: '100%' }}>
                        {loading ? <>Creating... <ButtonLoading />
                        </> : "Create Task"}</button>
                </div>
            </form>
        </div>
    )
}

export default CreateTaskModal
