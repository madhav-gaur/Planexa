import React from 'react'
import { useState } from 'react'
import InviteModal from '../components/InviteModal'

const Team = () => {
    const [isInviteModal, setIsInviteModal] = useState(false)
    return (
        <div>
            <div className='dashboard-head'>
                <div>
                    <h2>Team</h2>
                    <p>Manage Team members</p>
                </div>
                <button onClick={() => setIsInviteModal(true)} className='primary-button'>+ Invite Members</button>
            </div>
            {isInviteModal &&
                <div className='create-modal-wrapper' onClick={() => setIsInviteModal(false)}>
                    <InviteModal close={() => {
                        setIsInviteModal(false)
                    }} />
                </div>
            }
        </div>
    )
}

export default Team
