import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { setIsProjectLoaded } from '../store/project.slice'
import { TiDeleteOutline } from "react-icons/ti";
import { apiList } from '../common/apiList'
import Axios from '../utils/axios'
import { IoClose } from 'react-icons/io5'
import { useNavigate, useParams } from 'react-router-dom'
import { IoArrowBack } from "react-icons/io5";
import ButtonLoading from '../components/ButtonLoading'
import "../pages/styles/ProjectSetting.css"
import { CiCircleRemove } from 'react-icons/ci'
import AlertDialog from '../components/AlertDialog';
import Loading from '../components/Loading';

const ProjectSettings = () => {
    const { currWorkspace } = useSelector(state => state.workspace)
    const [loading, setLoading] = useState(false)
    const [isAlertBox, setIsAlertBox] = useState({});
    const [isAlertBoxDel, setIsAlertBoxDel] = useState("");

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const params = useParams()
    const { projects } = useSelector(state => state.project)
    const user = useSelector(state => state.user.userDetails)

    useEffect(() => {
        dispatch(setIsProjectLoaded(false))
    }, [dispatch])

    const currProject = projects?.find(item => item._id == params.projectId)
    const transformDate = (date) => {
        if (!date) return "";
        const temp = date.split('-',);
        const finalDate = temp[0] + '-' + temp[1] + '-' + temp[2].split('T')[0];
        return finalDate;
    }
    const transformLabel = (label) => {
        let strLabel = '';
        for (let i = 0; i < label.length; i++) {
            strLabel += label[i] + ', ';
        }
        return strLabel;
    }
    const [labels, setLabels] = useState(null)
    useEffect(() => {
        if (!currProject) return;
        setLabels(transformLabel(currProject.labels || []));
    }, [currProject]);


    const currentUserRole = user?.workspaces?.find(
        w => w.workspaceId.toString() === currWorkspace._id.toString()
    )?.role;



    const [data, setData] = useState(null)
    useEffect(() => {
        if (!currProject?._id) return;
        setData(
            {
                name: currProject.name,
                description: currProject.description,
                status: currProject.status,
                priority: currProject.priority,
                startDate: transformDate(currProject?.startDate) || "",
                endDate: transformDate(currProject?.endDate) || "",
                labels: labels,
                projectLead: currProject.projectHeadId ?? currProject.projectLead,
                members: currProject.members
            }
        )
    }, [currProject, labels])
    const handleInput = (e) => {
        const { name, value } = e.target;

        setData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const removeMember = (memberId) => {
        if (memberId === data.projectLead) return;

        setData(prev => ({
            ...prev,
            members: prev.members.filter(m => m !== memberId),
        }));
    };


    const addMember = (userId) => {
        setData(prev => ({
            ...prev,
            members: prev.members.includes(userId)
                ? prev.members
                : [...prev.members, userId],
        }));
    };
    const labelDB = labels?.split(",")
        .map(item => item.trim())
        .filter(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await Axios({
                ...apiList.updateProject,
                url: `${apiList.updateProject.url}/${params.projectId}`,
                data: {
                    ...data,
                    labels: labelDB
                }
            })
            if (response.data.success) {
                close()
                toast.success("Details Updates")
                dispatch(setIsProjectLoaded(false))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    const removeProjectMember = async (memberId, projectId) => {
        try {
            const response = await Axios({
                ...apiList.removeMember,
                data: {
                    memberId, projectId
                }
            })
            if (response.data.success) {
                close()
                toast.success("Member Removed")
                dispatch(setIsProjectLoaded(false))
                setIsAlertBox("");
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    const deleteProject = async (projectId) => {
        try {
            const response = await Axios({
                ...apiList.deleteProject,
                data: {
                    projectId
                }
            })
            if (response.data.success) {
                close()
                toast.success("Project Deleted")
                dispatch(setIsProjectLoaded(false))
                setIsAlertBox("");
                navigate("/projects")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    const { workspaceMember } = useSelector(state => state.workspace)
    if (!currProject || !data) return <Loading />;
    return (
        (
            <div className='project-setting-wrapper'>
                <div className='project-setting-container'>
                    <div className='app-form-container'>
                        <div className='app-form-setting-head' onClick={() => navigate(`/projects/${currProject._id}`)}>
                            <div>
                                <IoArrowBack />
                                <span>Back</span>
                            </div>
                            <div>
                                <h2>
                                    Project Setting
                                </h2>
                            </div>
                        </div>
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
                                    <textarea
                                        type="text"
                                        id='description'
                                        name='description'
                                        onChange={handleInput}
                                        value={data.description}
                                        placeholder="Enter Description"
                                    />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: "1rem" }}>
                                <div className='app-form-item'>
                                    <span>Status</span>
                                    <div>
                                        <select value={data.status} required onChange={handleInput} name="status" id="status">
                                            <option value="PLANNING">Planning</option>
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
                                        id='label'
                                        name='label'
                                        onChange={(e) => setLabels(e.target.value)}
                                        value={labels}
                                    />
                                </div>
                            </div>
                            <div className='app-form-item'>
                                <span>Team Members</span>
                                <div>
                                    <select
                                        name="members"
                                        id="members"
                                        onChange={(e) => addMember(e.target.value)}
                                    >
                                        <option default value="">Add Members</option>
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
                            <div style={{ display: 'flex', justifyContent: 'end' }}>
                                <button className='primary-button'>
                                    {loading ? <>Updating... <ButtonLoading />
                                    </> : "Update"}</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='project-secondary-settings'>
                    <div className='app-form-container'>
                        <div>
                            <h2>
                                Project Members
                            </h2>
                            <p style={{ color: "var(--text-light)" }}>Manage members in this project</p>
                        </div>
                        <div className='project-member-list'>
                            {
                                currProject.members.map((memberId) => {
                                    const member = workspaceMember?.find(u => u._id === memberId);
                                    const currWorkspaceDetails = member.workspaces.find(item => item.workspaceId == currWorkspace._id) || {};
                                    const role = currWorkspaceDetails.role

                                    return <div key={member._id} className='project-member-list-item'>
                                        <div>
                                            <h3>{member.name}</h3>
                                            <span>{role}</span>
                                        </div>
                                        <div onClick={() => {
                                            if (currProject.members.length == 1) {
                                                toast.warn("Project requires at least one member")
                                                return;
                                            };
                                            if (currentUserRole == "VIEWER") {
                                                toast.error("Permission denied")
                                                return;
                                            }
                                            if (currentUserRole !== "ADMIN") {
                                                toast.error("Only admin can remove members");
                                                return;
                                            }
                                            if (user._id == member._id) {
                                                toast.error("You can't remove yourself");
                                                return;
                                            }
                                            setIsAlertBox(member)
                                        }}>
                                            <TiDeleteOutline />
                                        </div>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    <div className='app-form-container'>
                        <div className='delete-project-container'>
                            <div>
                                <h2>
                                    Danger Zone
                                </h2>
                                <p>Irreversible action for your Project</p>
                            </div>
                            <div>
                                <button onClick={() => {
                                    if (currentUserRole == "MEMBER" || currentUserRole == "CONTRIBUTOR" || currentUserRole == "VIEWER") {
                                        toast.info("Permission Denied")
                                        return;
                                    }
                                    setIsAlertBoxDel(currProject._id);
                                }}
                                    className='primary-button danger-button'>Delete Project</button>
                            </div>
                        </div>
                    </div>
                </div>
                {isAlertBox._id &&
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
                }
            </div>
        )
    )
}

export default ProjectSettings
