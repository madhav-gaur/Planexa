import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import '../pages/styles/TaskDetail.css'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { toast } from 'react-toastify'
import { setIsTaskLoaded } from '../store/task.slice'
import { IoArrowBack, IoClose } from 'react-icons/io5'
import Comments from '../components/Comments'
import ButtonLoading from '../components/ButtonLoading'
import Loading from '../components/Loading'
import { setIsProjectLoaded } from '../store/project.slice'
import { FaRegFolderOpen } from 'react-icons/fa'
import { MdOutlineEventAvailable } from 'react-icons/md'
import { useTasks } from '../hooks/useTasks'
import { useProject } from '../hooks/useProject'
import '../pages/styles/Projects.css'
import { TbFoldersOff } from 'react-icons/tb'

const emptyForm = () => ({
    title: '',
    description: '',
    type: 'TASK',
    status: 'TO_DO',
    priority: 'MEDIUM',
    dueDate: '',
    assignees: [],
    labels: '',
})

const getAttachmentUrl = (attachment = {}) => {
    const originalUrl = attachment.fileUrl || ''
    const fileName = attachment.fileName || ''
    const lowerFile = fileName.toLowerCase()
    const isImage = /\.(png|jpe?g|webp|gif|bmp|svg)$/.test(lowerFile)

    if (!originalUrl.includes('res.cloudinary.com') || isImage) return originalUrl

    if (originalUrl.includes('/image/upload/')) {
        return originalUrl.replace('/image/upload/', '/raw/upload/')
    }

    return originalUrl
}

const shouldOpenInline = (fileName = '') => {
    const lowerFile = fileName.toLowerCase()
    return /\.(png|jpe?g|webp|gif|bmp|svg|pdf)$/.test(lowerFile)
}

const TaskDetail = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const params = useParams()
    const { tasks, isTaskLoaded } = useSelector(state => state.task)
    const { projects } = useSelector(state => state.project)
    const { workspaceMember, currWorkspace } = useSelector(state => state.workspace)
    const currTask = tasks?.find(item => item._id == params.taskId)
    const currProject = projects?.find(item => item._id == params.projectId)
    console.log(projects)
    console.log(currProject)
    const [loading, setLoading] = useState(false)
    const [uploadingAttachment, setUploadingAttachment] = useState(false)
    const [attachmentFile, setAttachmentFile] = useState(null)
    const [comment, setComment] = useState('')
    const [subtask, setSubtask] = useState('')
    const [data, setData] = useState(emptyForm)
    const toggleTimeout = useRef({})

    const commentsEnabled = currWorkspace?.settings?.allowComments !== false
    const subtasksEnabled = currWorkspace?.settings?.allowSubtasks !== false
    const fileUploadsEnabled = currWorkspace?.settings?.allowFileUploads !== false

    const transformDate = (date) => {
        if (!date) return ''
        const temp = date.split('-')
        return `${temp[0]}-${temp[1]}-${temp[2].split('T')[0]}`
    }
    useProject()
    useTasks({ currProject, dispatch, isTaskLoaded })

    useEffect(() => {
        if (!currTask) return
        setData({
            title: currTask.title ?? '',
            description: currTask.description ?? '',
            type: currTask.type ?? 'TASK',
            status: currTask.status ?? 'TO_DO',
            priority: currTask.priority ?? 'MEDIUM',
            dueDate: transformDate(currTask.dueDate) || '',
            assignees: currTask.assignees ?? [],
            labels: (currTask.labels ?? []).join(', '),
        })
    }, [currTask])

    const handleInput = (e) => {
        const { name, value } = e.target
        setData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const removeMember = (memberId) => {
        const lead = workspaceMember.find(m => m._id === (currProject?.projectHeadId ?? currProject?.projectLead))
        if (lead?._id === memberId) return

        setData(prev => ({
            ...prev,
            assignees: prev.assignees.filter(m => m !== memberId),
        }))
    }

    const addMember = (userId) => {
        if (!userId) return
        setData(prev => ({
            ...prev,
            assignees: prev.assignees.includes(userId)
                ? prev.assignees
                : [...prev.assignees, userId],
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
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
                    labels: data.labels.split(',').map(item => item.trim()).filter(Boolean),
                },
            })
            if (response.data.success) {
                toast.success('Task updated')
                dispatch(setIsTaskLoaded(false))
                dispatch(setIsProjectLoaded(false))
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to update task')
        } finally {
            setLoading(false)
        }
    }

    const handleComment = async (e) => {
        e.preventDefault()
        if (!comment.trim()) return
        try {
            const response = await Axios({
                ...apiList.addComment,
                data: {
                    taskId: currTask._id,
                    message: comment,
                },
            })
            if (response.data.success) {
                toast.success('Comment added')
                dispatch(setIsTaskLoaded(false))
                setComment('')
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to add comment')
        }
    }

    const handleSubtask = async (e) => {
        e.preventDefault()
        if (!subtask.trim()) return
        try {
            const response = await Axios({
                ...apiList.addSubtask,
                data: {
                    taskId: currTask._id,
                    title: subtask,
                },
            })
            if (response.data.success) {
                toast.success('Subtask added')
                dispatch(setIsTaskLoaded(false))
                setSubtask('')
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to add subtask')
        }
    }

    const handleToggleSubtask = (subtaskId) => {
        if (toggleTimeout.current[subtaskId]) {
            clearTimeout(toggleTimeout.current[subtaskId])
        }
        toggleTimeout.current[subtaskId] = setTimeout(async () => {
            try {
                await Axios({
                    ...apiList.toggleSubtask,
                    data: {
                        taskId: currTask._id,
                        subtaskId,
                    },
                })
                dispatch(setIsTaskLoaded(false))
            } catch (error) {
                console.error(error)
            }
        }, 500)
    }

    const handleArchiveTask = async () => {
        try {
            const response = await Axios({
                ...apiList.archiveTask,
                url: apiList.archiveTask.url.replace(':taskId', currTask._id),
            })
            if (response.data.success) {
                toast.success('Task archived')
                dispatch(setIsTaskLoaded(false))
                dispatch(setIsProjectLoaded(false))
                navigate(`/projects/${params.projectId}`)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to archive task')
        }
    }

    const handleAttachmentUpload = async () => {
        if (!attachmentFile) return
        try {
            setUploadingAttachment(true)
            const formData = new FormData()
            formData.append('attachment', attachmentFile)
            const response = await Axios({
                ...apiList.uploadTaskAttachment,
                url: apiList.uploadTaskAttachment.url.replace(':taskId', currTask._id),
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            if (response.data.success) {
                toast.success('Attachment uploaded')
                setAttachmentFile(null)
                dispatch(setIsTaskLoaded(false))
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to upload attachment')
        } finally {
            setUploadingAttachment(false)
        }
    }

    // if (!isProjectLoaded) {
    //     return <Loading />
    // }

    if (!currProject) {
        return (
            <div className='empty-model' style={{ top: '50%' }}>
                <span><TbFoldersOff /></span>
                <h3>Project not found.</h3>
                <p>Couldn't find this Project</p>
                <button type="button" className="primary-button" onClick={() => navigate('/projects')}>Back to projects</button>
            </div>
        )
    }

    // const waitingForTask = !currTask && (!isTaskLoaded || isTaskLoading)
    // if (waitingForTask) {
    //     return <Loading />
    // }

    if (!currTask) {
        return (
            <div className='empty-model' style={{ marginTop: 0, top: '50%' }}>
                <span><MdOutlineEventAvailable /></span>
                <h3>Task not found</h3>
                <button type="button" className="primary-button" style={{ marginLeft: '0rem' }} onClick={() => navigate(`/projects/${params.projectId}`)}>Back to project</button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <div className='project-setting-wrapper'>
                <div className='project-setting-container'>
                    <div className='app-form-container' onClick={(e) => e.stopPropagation()}>
                        <div className='app-form-setting-head' style={{ position: "relative" }}>
                            <div onClick={() => navigate(`/projects/${currProject?._id}`)}>
                                <IoArrowBack />
                                <span>Back</span>
                            </div>
                            <div>
                                <h2>{currTask?.title}</h2>
                            </div>
                        </div>
                        <form className='app-form' onSubmit={handleSubmit}>
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
                                        <option value="BUG">Bug</option>
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
                                        <select value={data.status} required onChange={handleInput} name="status" id="status">
                                            <option value="TO_DO">To do</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="DONE">Done</option>
                                        </select>
                                    </div>
                                </div>
                                <div className='app-form-item'>
                                    <span>Priority</span>
                                    <div>
                                        <select value={data.priority} required onChange={handleInput} name="priority" id="priority">
                                            <option value="MEDIUM">MEDIUM</option>
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
                                    <select name="assignees" id="assignees" onChange={(e) => addMember(e.target.value)}>
                                        <option value="">Add Assignees</option>
                                        {workspaceMember.map((item, idx) => (
                                            <option key={item._id + idx} value={item._id}>{item.email}</option>
                                        ))}
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
                                    const assignee = workspaceMember.find(u => u._id === memberId)
                                    if (!assignee) return null

                                    return (
                                        <div key={memberId} className="team-member-pill">
                                            <p>{assignee.email}</p>
                                            <span onClick={() => removeMember(memberId)}>
                                                <IoClose />
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                            {(currTask?.labels ?? []).length > 0 && (
                                <div className="team-member-pill-wrapper">
                                    {currTask.labels.map((label, idx) => (
                                        <div key={`${label}-${idx}`} className="team-member-pill">
                                            <p>{label}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'end' }}>
                                <div className='task-delete-btn'>
                                    <button type='button' onClick={handleArchiveTask} className='primary-button danger-button'>Archive Task</button>
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <button className='primary-button'>
                                        {loading ? <>Saving... <ButtonLoading /></> : "Update Task"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='project-secondary-settings'>
                    <div className='app-form-container' style={{ padding: '1rem', maxHeight: '24rem' }}>
                        <div>
                            <h2>Attachments</h2>
                        </div>
                        <div className='task-attachments'>
                            {fileUploadsEnabled ? (
                                <>
                                    <div className='task-attachment-upload'>
                                        <input
                                            type="file"
                                            onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                                        />
                                        <button type='button' className='primary-button' onClick={handleAttachmentUpload} disabled={!attachmentFile || uploadingAttachment}>
                                            {uploadingAttachment ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                    <div style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                                        You can upload images, PDFs, docs, spreadsheets, and other common attachments up to 15MB.
                                    </div>
                                </>
                            ) : (
                                <div className='task-setting-note'>
                                    File uploads are disabled for this workspace.
                                </div>
                            )}
                            {(currTask?.attachments ?? []).length === 0 && (
                                <div style={{ color: 'var(--text-light)', fontSize: '14px' }}>No attachments yet</div>
                            )}
                            {(currTask?.attachments ?? []).map((item, idx) => (
                                <a
                                    key={`${item.fileUrl}-${idx}`}
                                    href={getAttachmentUrl(item)}
                                    target={shouldOpenInline(item.fileName) ? "_blank" : undefined}
                                    rel={shouldOpenInline(item.fileName) ? "noreferrer" : undefined}
                                    download={shouldOpenInline(item.fileName) ? undefined : item.fileName}
                                    className='task-attachment-item'
                                >
                                    {item.fileName || `Attachment ${idx + 1}`}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className='app-form-container' style={{ padding: '1rem' }}>
                        <div>
                            <h2>Sub Tasks</h2>
                        </div>
                        <div className='subtask-container'>
                            {subtasksEnabled ? (
                                <form onSubmit={handleSubtask} className='post-comment app-form-item' style={{ marginTop: '5px', position: "sticky", top: '0', zIndex: 100 }}>
                                    <input
                                        type="text"
                                        name='subtask'
                                        id='subtask'
                                        value={subtask}
                                        onChange={(e) => setSubtask(e.target.value)}
                                        placeholder=' '
                                    />
                                    <label htmlFor="subtask">Add Sub Task</label>
                                    <button className='primary-button' style={{ marginRight: '10px' }} type='submit'>Add</button>
                                </form>
                            ) : (
                                <div className='task-setting-note'>
                                    Subtasks are disabled for this workspace.
                                </div>
                            )}
                            {(currTask?.subTasks?.length ?? 0) === 0 && (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem', color: 'var(--text-light)' }}>
                                    No Subtasks Yet
                                </div>
                            )}
                            {(currTask?.subTasks ?? []).map((task, idx) => (
                                <div className='subtask-item' key={task._id + idx}>
                                    <div>{task?.title}</div>
                                    <div className="checkbox-wrapper-18">
                                        <div className="round">
                                            <input
                                                checked={!!task.isCompleted}
                                                disabled={!subtasksEnabled}
                                                onChange={() => handleToggleSubtask(task._id)}
                                                type="checkbox"
                                                id={`checkbox-18${idx}`}
                                            />
                                            <label htmlFor={`checkbox-18${idx}`}></label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
            <div className='app-form-container' style={{ gap: 0, padding: "1rem", maxWidth: '1005px' }}>
                <div className='task-comment-wrapper'>
                    <div>
                        <h2>Comments</h2>
                    </div>
                    <Comments comments={currTask?.comments} />
                    <div>
                        {(currTask?.comments?.length ?? 0) === 0 && (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 1rem 1rem 0', color: 'var(--text-light)' }}>
                                No Comments Yet
                            </div>
                        )}
                        {commentsEnabled ? (
                            <form onSubmit={handleComment} className='post-comment app-form-item'>
                                <input
                                    type="text"
                                    name='comment'
                                    id='comment'
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder=' '
                                />
                                <label htmlFor="comment">Comment..</label>
                                <button className='primary-button' style={{ marginRight: '10px' }} type='submit'>Post</button>
                            </form>
                        ) : (
                            <div className='task-setting-note'>
                                Comments are disabled for this workspace.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TaskDetail
