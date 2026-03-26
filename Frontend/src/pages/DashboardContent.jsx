import React from 'react'
import { useSelector } from 'react-redux'
import "../pages/styles/DashboardContent.css"
import { FaRegFolderOpen } from "react-icons/fa";
import { IoMdCheckboxOutline } from "react-icons/io";
import { MdChecklist } from "react-icons/md";
import { BsExclamationTriangle } from "react-icons/bs";
import { useState } from 'react';
import CreateProjectModal from '../components/CreateProjectModal';

const DashboardContent = () => {
    const [isCreateModal, setIsCreateModal] = useState(false)
    const user = useSelector(state => state.user.userDetails)
    const { currWorkspace } = useSelector(state => state.workspace)
    return (
        <div className="dashboard-content">
            <div className='dashboard-head'>
                <div className='dashboard-head-left'>
                    <h2>Welcome back, {user?.name.split(" ")[0]}</h2>
                    <p>Here's what's happening with your projects today</p>
                </div>
                <div className='dashboard-head-right'>
                    <button onClick={() => setIsCreateModal(true)} className='primary-button'>+ New Project</button>
                </div>
            </div>
            <div className='dashboard-stats-1'>
                <div className='dashboard-stats-1-item'>
                    <div>
                        <p>Total Projects</p>
                        <h2>{currWorkspace?.projects?.length}</h2>
                        <span>{currWorkspace?.projects?.length} in Progress</span>
                    </div>
                    <div>
                        <FaRegFolderOpen />
                    </div>
                </div>
                <div className='dashboard-stats-1-item'>
                    <div>
                        <p>Completed Projects</p>
                        <h2>{currWorkspace?.projects.length}</h2>
                        <span>{currWorkspace?.projects.length} Completed</span>
                    </div>
                    <div>
                        <IoMdCheckboxOutline />
                    </div>
                </div>
                <div className='dashboard-stats-1-item'>
                    <div>
                        <p>To Do</p>
                        <h2>{currWorkspace?.projects.length}</h2>
                        <span>{currWorkspace?.projects.length} tasks to be done</span>
                    </div>
                    <div>
                        <MdChecklist />
                    </div>
                </div>
                <div className='dashboard-stats-1-item'>
                    <div>
                        <p>Overdue</p>
                        <h2>{currWorkspace?.projects.length}</h2>
                        <span>{currWorkspace?.projects.length} need attention</span>
                    </div>
                    <div>
                        <BsExclamationTriangle />
                    </div>
                </div>
            </div>
            <div className='dashboard-stats-2'>
            </div>
            {isCreateModal &&
                <div className='create-modal-wrapper' onClick={() => setIsCreateModal(false)}>
                    <CreateProjectModal close={() => {
                        setIsCreateModal(false)
                    }} />
                </div>
            }
        </div>
    )
}

export default DashboardContent
