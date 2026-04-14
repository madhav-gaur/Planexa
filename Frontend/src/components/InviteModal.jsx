import React from 'react'
import Axios from '../utils/axios'
import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import ButtonLoading from './ButtonLoading'
import { useSelector } from 'react-redux'
import { apiList } from '../common/apiList'
import { toast } from 'react-toastify'
const InviteModal = ({ close }) => {
    const [link, setLink] = useState("")
    const [copyMsg, setCopyMsg] = useState("Copy Link")
    const { currWorkspace } = useSelector(state => state.workspace)
    const [role, setRole] = useState("CONTRIBUTOR")
    const [loading, setLoading] = useState(false)
    const [emailLoading, setEmailLoading] = useState(false)
    const [email, setEmail] = useState("")
    const user = useSelector(state => state.user.userDetails)
    const temp = user.workspaces.find(item => item.workspaceId == currWorkspace._id)
    const guestAccessDisabled = currWorkspace?.settings && !currWorkspace.settings.allowGuestAccess
    const memberLimitReached = currWorkspace?.settings && (currWorkspace?.members?.length || 0) >= currWorkspace.settings.maxMembers
    const generateLink = async () => {
        if (guestAccessDisabled) {
            toast.error("Guest access is disabled for this workspace")
            return
        }
        if (memberLimitReached) {
            toast.error(`Workspace member limit reached (${currWorkspace.settings.maxMembers})`)
            return
        }
        if (link) {
            navigator.clipboard.writeText(link);
            setCopyMsg("Link Copied !!")
            setTimeout(() => {
                setCopyMsg("Copy Again")
            }, 2000);
        }
        try {
            setLoading(true)
            const response = await Axios({
                ...apiList.getInviteLink,
                data: {
                    workspaceId: currWorkspace?._id,
                    role: role
                }
            })
            if (response.data.success) {
                setLink(response.data.link)
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to generate invite link')
        } finally {
            setLoading(false)
        }
    }

    const sendInviteEmail = async () => {
        if (!email.trim()) {
            toast.error("Please enter an email address")
            return
        }
        if (guestAccessDisabled) {
            toast.error("Guest access is disabled for this workspace")
            return
        }
        if (memberLimitReached) {
            toast.error(`Workspace member limit reached (${currWorkspace.settings.maxMembers})`)
            return
        }
        try {
            setEmailLoading(true)
            const response = await Axios({
                ...apiList.sendInviteEmail,
                data: {
                    workspaceId: currWorkspace?._id,
                    email: email.trim(),
                    role: role
                }
            })
            if (response.data.success) {
                toast.success("Invitation sent successfully!")
                setEmail("")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to send invitation')
        } finally {
            setEmailLoading(false)
        }
    }
    return (
        <div className='app-form-container' onClick={(e) => e.stopPropagation()}>
            <div className='app-form-head'>
                <h2>Invite Members</h2>
                <p> {currWorkspace.name}</p>
                {location.pathname != "/create-workspace" && <span onClick={close}><IoClose /></span>}
            </div>
            <form className='app-form' onSubmit={(e) => e.stopPropagation()}>
                <div className='app-form-item'>
                    <span>Select Role</span>
                    <div>
                        <select name="role" id="role" value={role} onChange={(e) => setRole(e.target.value)}>
                            {temp.role === "ADMIN" && <option value="ADMIN">Admin</option>}
                            <option value="CONTRIBUTOR">Contributor</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>
                </div>
                <div className='app-form-item'>
                    <span>Invite by Email</span>
                    <div>
                        <input
                            type="email"
                            placeholder=" "
                            id='email'
                            name='email'
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            disabled={guestAccessDisabled || memberLimitReached}
                        />
                        <label htmlFor='email'>Enter email address</label>
                    </div>
                </div>
            </form>
            {(guestAccessDisabled || memberLimitReached) && (
                <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>
                    {guestAccessDisabled
                        ? 'Invites are disabled because guest access is turned off in workspace settings.'
                        : `Invites are disabled because the workspace already reached its member limit (${currWorkspace.settings.maxMembers}).`}
                </p>
            )}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <button
                    onClick={() => sendInviteEmail()}
                    disabled={emailLoading || guestAccessDisabled || memberLimitReached || !email.trim()}
                    className='primary-button'
                    style={{ width: '100%' }}
                >
                    {emailLoading && <ButtonLoading />} Send Invite
                </button>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                    <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                </div>
                <button
                    onClick={() => generateLink()}
                    disabled={loading || guestAccessDisabled || memberLimitReached}
                    className='primary-button'
                    style={{ width: '100%', backgroundColor: 'transparent', border: '1px solid var(--primary-blue)', color: 'var(--primary-blue)' }}
                >
                    {loading && <ButtonLoading />} {link ? copyMsg : "Get Shareable Link"}
                </button>
            </div>
            {link && (
                <div style={{ marginTop: '15px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-light)', marginBottom: '8px' }}>Shareable Link:</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <p style={{ wordBreak: "break-all", flex: 1, fontSize: '13px', backgroundColor: 'var(--surface-hover-light)', padding: '8px', borderRadius: '6px', border: '1px solid var(--border)' }}>{link}</p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(link);
                                setCopyMsg("Copied!")
                                setTimeout(() => setCopyMsg("Copy Link"), 2000);
                            }}
                            style={{ padding: '8px 12px', backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                        >
                            {copyMsg}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InviteModal
