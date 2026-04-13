import React, { useEffect } from 'react'
import { useState } from 'react'
import InviteModal from '../components/InviteModal'
import { useDispatch, useSelector } from 'react-redux'
import '../pages/styles/Team.css'
import { CiSearch } from 'react-icons/ci'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { IoClose } from 'react-icons/io5'
import AlertDialog from '../components/AlertDialog'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { toast } from 'react-toastify'
import { setIsWorkspaceMemberLoaded } from '../store/workspace.slice'
import { getWorkspaceMembers } from '../utils/getWorkspaceMember'

const Team = () => {
    const [isInviteModal, setIsInviteModal] = useState(false)
    const { workspaceMember } = useSelector(state => state.workspace)
    const { currWorkspace } = useSelector(state => state.workspace)
    const user = useSelector(state => state.user.userDetails)
    const [isDeleteMember, setIsDeleteMember] = useState(null);
    const [isUpdateRole, setIsUpdateRole] = useState('');
    const [memberMenu, setMemberMenu] = useState(null)

    const [selectedRole, setSelectedRole] = useState('');

    const [view, setView] = useState('LIST')
    const [query, setQuery] = useState("")
    const dispatch = useDispatch()

    const filteredMembers = workspaceMember?.filter((member) => {
        const matchesSearch =
            member.name?.toLowerCase().includes(query.toLowerCase()) || member.email?.toLowerCase().includes(query.toLowerCase());
        return matchesSearch;
    });

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 700) {
                setView("GRID");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const currentUserRole = user?.workspaces?.find(
        w => w.workspaceId.toString() === currWorkspace._id.toString()
    )?.role;
    const guestAccessDisabled = currWorkspace?.settings && !currWorkspace.settings.allowGuestAccess
    const memberLimitReached = currWorkspace?.settings && (currWorkspace?.members?.length || 0) >= currWorkspace.settings.maxMembers


    const removeWorkspaceMember = async (memberId) => {


        try {
            const response = await Axios({
                ...apiList.removeWorkspaceMember,
                data: {
                    memberId, workspaceId: currWorkspace._id
                }
            })
            console.log(response)
            if (response.data.success) {
                toast.success("Member Removed")
                dispatch(setIsWorkspaceMemberLoaded(false))
                setIsDeleteMember(null);
                setMemberMenu(null)
            }
            console.log(response)
        } catch (error) {
            console.error(error)
        }
    }
    const updateRole = async (memberId) => {
        if (!memberId || !selectedRole) return
        try {
            const response = await Axios({
                ...apiList.updateMemberRole,
                data: {
                    memberId,
                    newRole: selectedRole,
                    workspaceId: currWorkspace._id
                }
            })
            console.log(response)
            if (response.data.success) {
                toast.success("Role Updated")
                getWorkspaceMembers({ dispatch, currWorkspace })
                dispatch(setIsWorkspaceMemberLoaded(false))
                setIsUpdateRole('')
                setMemberMenu(null)
                setSelectedRole('')
            }
            console.log(response)
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <div className='dashboard-head'>
                <div className='dashboard-head-left'>
                    <h2>Team</h2>
                    <p>Manage Team members</p>
                </div>
                <div className='dashboard-head-right'>
                    <button
                        onClick={() => setIsInviteModal(true)}
                        disabled={guestAccessDisabled || memberLimitReached}
                        className='primary-button'
                    >
                        + Invite Members
                    </button>
                </div>

            </div>
            {(guestAccessDisabled || memberLimitReached) && (
                <p style={{ color: 'var(--text-light)', fontSize: '13px', marginTop: '0.5rem' }}>
                    {guestAccessDisabled
                        ? 'Invites are disabled because guest access is turned off in workspace settings.'
                        : `Invites are disabled because this workspace has reached its member limit (${currWorkspace.settings.maxMembers}).`}
                </p>
            )}
            {isInviteModal &&
                <div className='create-modal-wrapper' onClick={() => setIsInviteModal(false)}>
                    <InviteModal close={() => {
                        setIsInviteModal(false)
                    }} />
                </div>
            }

            <div className='member-search' style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className='view-toggle-btn-group'>
                    <button
                        onClick={() => setView('LIST')}
                        style={view === 'LIST' ? { backgroundColor: 'var(--surface)', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' } : {}}>
                        List
                    </button>

                    <button
                        onClick={() => setView('GRID')}
                        style={view === 'GRID'
                            ? { backgroundColor: 'var(--surface)', boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px' } : {}}>
                        Grid
                    </button>
                </div>
                <div className='project-searchbox' style={{ width: '100%' }}>
                    <CiSearch />
                    <input type="text" style={{ width: "100%" }} placeholder='Search Members...' value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
            </div>
            <div className='member-wrapper'>

                <div className={`member-container ${view == 'GRID' && 'grid'}`}>
                    <div className='app-form-container-head'>
                        <h2>Members</h2>
                        <p>{filteredMembers.length > 0 && filteredMembers.length + ' Members found'}</p>
                    </div>
                    <div className='member-item-wrapper'>
                        {
                            filteredMembers.map((item, idx) => {
                                const logo = item.name.split(" ")
                                const role = item.workspaces.find((el) => el.workspaceId == currWorkspace._id).role
                                return <div className='member-item-container' key={item._id + idx} value={item._id}>
                                    <div className='member-item-left'>
                                        <span>{logo[0][0]}</span>
                                        <div>
                                            <h3>{item.name}</h3>
                                            <p>{item.email}</p>
                                        </div>
                                    </div>
                                    <div className='member-item-right'>
                                        <span className={`${role == 'ADMIN' && 'admin-member-tag'} member-tag`}>
                                            {role == 'ADMIN' && 'Admin'}
                                            {(role == 'MEMBER' || role == 'CONTRIBUTOR') && 'Contributor'}
                                            {role == 'VIEWER' && 'Viewer'}
                                        </span>
                                        <div style={{ position: 'relative' }} className={view == 'GRID' ? 'member-item-menu-wrapper' : ''}>

                                            {currentUserRole == 'ADMIN' && role != 'ADMIN' && <button className='secondary-button'
                                                onClick={() => {
                                                    if (memberMenu == null) setMemberMenu(item._id)
                                                    else setMemberMenu(null)
                                                }}>
                                                {memberMenu == item._id ? <IoClose /> : <BsThreeDotsVertical />}
                                            </button>}
                                            {
                                                memberMenu == item._id &&
                                                <div className='member-menu-container'>
                                                    <div onClick={() => setIsDeleteMember(item)}>Remove Member</div>
                                                    <div onClick={() => setIsUpdateRole(`${item._id}~${item.name}~${role}`)}>Update Role</div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                    {isDeleteMember?._id == item._id &&
                                        <AlertDialog
                                            title={`Remove ${isDeleteMember.name}`}
                                            subtitle={`Are you sure you want to remove ${isDeleteMember.name}\n From ${currWorkspace.name} Workspace`}
                                            close={() => {
                                                setMemberMenu(null)
                                                setIsDeleteMember(null)
                                            }}
                                            actionBtnColor='var(--danger-red)'
                                            action={() => {
                                                removeWorkspaceMember(isDeleteMember._id)

                                            }
                                            }
                                        />}
                                    {isUpdateRole && isUpdateRole.split('~')[0] == item._id &&
                                        <AlertDialog
                                            title={`Update ${isUpdateRole.split('~')[1]}'s role`}
                                            subtitle={`Update ${isUpdateRole.split('~')[1]}'s role from ${isUpdateRole.split('~')[2]} to ${selectedRole == null ? '' : selectedRole}`}
                                            close={() => {
                                                setIsUpdateRole('')
                                                setMemberMenu(null)
                                                setSelectedRole('')
                                            }}
                                            action={() => {
                                                updateRole(isUpdateRole.split('~')[0])
                                            }
                                            }
                                        >  <select value={selectedRole} className='secondary-button' style={{ width: '100%' }} onChange={(e) => setSelectedRole(e.target.value)}>
                                                <option defaultValue value="">Select Role</option>
                                                {isUpdateRole.split('~')[2] != 'ADMIN' && <option value="ADMIN">Admin</option>}
                                                {isUpdateRole.split('~')[2] != 'MEMBER' && isUpdateRole.split('~')[2] != 'CONTRIBUTOR' && <option value="CONTRIBUTOR">Member</option>}
                                                {isUpdateRole.split('~')[2] != 'VIEWER' && <option value="VIEWER">Viewer</option>}
                                            </select></AlertDialog>}
                                </div>
                            })
                        }
                        {!filteredMembers[0] && <div style={{ display: "flex", justifyContent: "center", color: "var(--text-light)" }}>No members found</div>}
                    </div>
                </div>

            </div >
        </>
    )
}

export default Team
