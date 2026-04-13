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
    const [role, setRole] = useState("")
    const [loading, setLoading] = useState(false)
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
                        <select name="role" id="role" onChange={(e) => setRole(e.target.value)}>
                            {temp.role === "ADMIN" && <option value="ADMIN">Admin</option>}
                            <option value="CONTRIBUTOR">Contributor</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
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
            <div>
                <button
                    onClick={() => generateLink()}
                    disabled={loading || guestAccessDisabled || memberLimitReached}
                    className='primary-button'
                    style={{ width: '100%' }}
                >
                    {loading && <ButtonLoading />} {link ? copyMsg : "Get Link"}
                </button>
            </div>
            <p style={{ wordBreak: "break-all" }}>{link}</p>
        </div>
    )
}

export default InviteModal
