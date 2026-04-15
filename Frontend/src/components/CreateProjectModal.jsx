import React from 'react'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import ButtonLoading from './ButtonLoading'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { setIsProjectLoaded } from '../store/project.slice'

const CreateProjectModal = ({ close }) => {
    const { currWorkspace } = useSelector(state => state.workspace)
    const [loading, setLoading] = useState(false)
    const [labels, setLabels] = useState("")
    const temp = labels?.split(",")
        .map(item => item.trim())
        .filter(Boolean);
    const dispatch = useDispatch()
    const [data, setData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        startDate: undefined,
        endDate: undefined,
        labels: temp,
        projectLead: "",
        members: []
    })
    const { workspaceMember } = useSelector(state => state.workspace)
    const projectLimitReached = currWorkspace?.settings && (currWorkspace?.projects?.length || 0) >= currWorkspace.settings.maxProjects
    const handleInput = (e) => {
        const { name, value } = e.target;

        setData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleProjectLead = (e) => {
        const leadId = e.target.value;

        const lead = workspaceMember.find(m => m._id === leadId);
        if (!lead) return;

        setData(prev => ({
            ...prev,
            projectLead: leadId,
            members: prev.members.includes(lead.email)
                ? prev.members
                : [...prev.members, lead._id],
        }));
    };
    const removeMember = (email) => {
        const lead = workspaceMember.find(m => m._id === data.projectLead);
        if (lead?.email === email) return;

        setData(prev => ({
            ...prev,
            members: prev.members.filter(m => m !== email),
        }));
    };


    const addMember = (userId) => {
        setData(prev => ({
            ...prev,
            members: prev.members.includes(userId)
                ? prev.members
                : [...prev.members, userId],
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (projectLimitReached) {
            toast.error(`Project limit reached for this workspace (${currWorkspace.settings.maxProjects})`)
            return
        }
        setLoading(true)
        try {
            const response = await Axios({
                ...apiList.createProject,
                data: {
                    workspaceId: currWorkspace._id,
                    name: data.name,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    labels: temp,
                    projectHeadId: data.projectLead,
                    members: data.members,
                }
            })

            if (response.data.success) {
                close()
                toast.success("Project Created !!")
                dispatch(setIsProjectLoaded(false))
            }

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className='app-form-container' onClick={(e) => e.stopPropagation()}>
            <div className='app-form-head'>
                <h2>Create new Project</h2>
                <p>In workspace <a style={{ color: 'var(--primary-blue)' }}>{currWorkspace?.name}</a> </p>
                <span onClick={close}><IoClose /></span>
            </div>
            {projectLimitReached && (
                <p style={{ color: 'var(--danger-red)', justifyContent: 'center', fontSize: '13px' }}>
                    This workspace has reached its project limit ({currWorkspace.settings.maxProjects}). Contact Admin to Increase the limit in workspace settings to create more projects.
                </p>
            )}
            <form className='app-form' onSubmit={handleSubmit} >
                <div className='app-form-item'>
                    <span>Project Name</span>
                    <div>
                        <input
                            type="text"
                            required
                            placeholder=" "
                            id='name'
                            name='name'
                            onChange={handleInput}
                            value={data.name}
                        />
                        <label htmlFor='name'>Enter Project name</label>
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
                        <label htmlFor='name'>Enter Description</label>
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: "1rem" }}>
                    <div className='app-form-item'>
                        <span>Status</span>
                        <div>
                            <select value={data.status} required onChange={handleInput} name="status" id="status">
                                <option default value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
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

                <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: "1rem" }}>
                    <div className='app-form-item'>
                        <span>Start Date</span>
                        <div>
                            <input
                                name='startDate'
                                id='startDate'
                                onChange={handleInput}
                                type="date"
                                value={data.startDate}
                                required
                            />
                        </div>
                    </div>
                    <div className='app-form-item'>
                        <span>End Date</span>
                        <div>
                            <input
                                onChange={handleInput}
                                type="date"
                                name='endDate'
                                id='endDate'
                                value={data.endDate}
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className='app-form-item'>
                    <span>Enter Labels (optional) </span>
                    <div>
                        <input
                            type="text"
                            placeholder="Enter labels separated by commas (e.g., web, feature, backend)"
                            id='name'
                            name='name'
                            onChange={(e) => setLabels(e.target.value)}
                            value={labels}
                        />
                    </div>
                </div>
                <div className='app-form-item'>
                    <span>Project Lead</span>
                    <div>
                        <select
                            name="projectLead"
                            required
                            value={data.projectLead}
                            onChange={handleProjectLead}
                        >
                            <option value="">Select Project Lead</option>
                            {workspaceMember.map(item => (
                                <option key={item._id} value={item._id}>
                                    {item.email}
                                </option>
                            ))}
                        </select>

                    </div>
                </div>
                <div className='app-form-item'>
                    <span>Team Members</span>
                    <div>
                        <select
                            required
                            name="members"
                            id="members"
                            onChange={(e) => addMember(e.target.value)}
                        >
                            <option default value="">No Members</option>
                            {workspaceMember.map((item, idx) => {
                                return <option key={item._id + idx} value={item._id}>{item.email}</option>
                            })}
                        </select>
                    </div>
                </div>
                <div className="team-member-pill-wrapper">
                    {data.members.map((memberId) => {
                        const member = workspaceMember.find(u => u._id === memberId);
                        if (!member) return null;

                        return (
                            <div key={memberId} className="team-member-pill">
                                <p>{member.email}</p>
                                <span onClick={() => {
                                    removeMember(memberId)
                                }}>
                                    <IoClose />
                                </span>
                            </div>
                        );
                    })}
                </div>



                <div>
                    <button
                        disabled={projectLimitReached || loading}
                        className='primary-button'
                        style={{ width: '100%' }}>
                        {loading ? <>Creating... <ButtonLoading />
                        </> : "Create Project"}</button>
                </div>
            </form>
        </div>
    )
}

export default CreateProjectModal
