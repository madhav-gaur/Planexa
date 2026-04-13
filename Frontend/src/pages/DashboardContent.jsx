import React from 'react'
import { useSelector } from 'react-redux'
import "../pages/styles/DashboardContent.css"
import { FaRegFolderOpen } from "react-icons/fa";
import { IoMdCheckboxOutline } from "react-icons/io";
import { MdChecklist } from "react-icons/md";
import { BsExclamationTriangle } from "react-icons/bs";
import { useState } from 'react';
import { useEffect } from 'react';
import CreateProjectModal from '../components/CreateProjectModal';
import Axios from '../utils/axios';
import { apiList } from '../common/apiList';
import { toast } from 'react-toastify';

const DashboardContent = () => {
    const [isCreateModal, setIsCreateModal] = useState(false)
    const user = useSelector(state => state.user.userDetails)
    const { currWorkspace } = useSelector(state => state.workspace)
    const [summary, setSummary] = useState({
        totals: {
            projects: 0,
            completedProjects: 0,
            tasks: 0,
            overdueTasks: 0,
        },
        taskStatus: {
            TO_DO: 0,
            IN_PROGRESS: 0,
            DONE: 0,
        },
        insights: {
            averageProgress: 0,
            completedThisWeek: 0,
        }
    })

    useEffect(() => {
        const fetchSummary = async () => {
            if (!currWorkspace?._id) return
            try {
                const response = await Axios({
                    ...apiList.getWorkspaceSummary,
                    params: { workspaceId: currWorkspace._id }
                })
                if (response.data.success) {
                    setSummary(response.data.data)
                }
            } catch (error) {
                console.error(error)
                toast.error('Failed to load dashboard summary')
            }
        }
        fetchSummary()
    }, [currWorkspace?._id])
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
                        <h2>{summary.totals.projects}</h2>
                        <span>{summary.insights.averageProgress}% avg. progress</span>
                    </div>
                    <div>
                        <FaRegFolderOpen />
                    </div>
                </div>
                <div className='dashboard-stats-1-item'>
                    <div>
                        <p>Completed Projects</p>
                        <h2>{summary.totals.completedProjects}</h2>
                        <span>{summary.insights.completedThisWeek} tasks closed this week</span>
                    </div>
                    <div>
                        <IoMdCheckboxOutline />
                    </div>
                </div>
                <div className='dashboard-stats-1-item'>
                    <div>
                        <p>To Do</p>
                        <h2>{summary.taskStatus.TO_DO}</h2>
                        <span>{summary.taskStatus.IN_PROGRESS} tasks in progress</span>
                    </div>
                    <div>
                        <MdChecklist />
                    </div>
                </div>
                <div className='dashboard-stats-1-item'>
                    <div>
                        <p>Overdue</p>
                        <h2>{summary.totals.overdueTasks}</h2>
                        <span>{summary.totals.tasks} active tasks tracked</span>
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
