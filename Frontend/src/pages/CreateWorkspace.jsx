import React from 'react'
import CreateWorkspaceModal from '../components/CreateWorkspaceModal'
import { useNavigate } from 'react-router-dom'
const CreateWorkspace = () => {
    const tempToken = localStorage.getItem("inviteToken")
    const navigate = useNavigate()
    if (tempToken) {
        navigate(`/invite/${tempToken}`)
        return
    }
    return (
        <section className='sign-wrapper'>
            <CreateWorkspaceModal />
        </section>
    )
}

export default CreateWorkspace
