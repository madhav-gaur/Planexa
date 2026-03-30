import React from 'react'
import Axios from '../utils/axios'
import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import ButtonLoading from './ButtonLoading'
import { useSelector } from 'react-redux'
import { apiList } from '../common/apiList'
const InviteModal = ({ close }) => {
    const [link, setLink] = useState("")
    const [copyMsg, setCopyMsg] = useState("Copy Link")
    const { currWorkspace } = useSelector(state => state.workspace)
    const [role, setRole] = useState("")
    const user = useSelector(state => state.user.userDetails)
    const temp = user.workspaces.find(item => item.workspaceId == currWorkspace._id)
    const generateLink = async () => {
        if (link) {
            navigator.clipboard.writeText(link);
            setCopyMsg("Link Copied !!")
            setTimeout(() => {
                setCopyMsg("Copy Again")
            }, 2000);
        }
        try {
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
            console.log(response)

        } catch (error) {
            console.error(error)
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
                            <option value="MEMBER">Member</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                    </div>
                </div>
            </form>
            <div>
                <button onClick={() => generateLink()} className='primary-button' style={{ width: '100%' }}>{link ? copyMsg : "Get Link"}</button>
            </div>
            <p style={{ wordBreak: "break-all" }}>{link}</p>
        </div>
    )
}

export default InviteModal
