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
import { formatDistanceToNow } from 'date-fns';
import { useProject } from '../hooks/useProject';
import { useWorkspace } from '../hooks/useWorkspace';

const calcTotal = (obj = {}) => Object.values(obj).reduce((sum, val) => sum + val, 0)
const percentage = (value, total) => total ? Math.round((value / total) * 100) : 0
const MetricList = ({ items, total, tone = 'blue' }) => {

    return (
        <div className="dashboard-metric-list">
            {items.map((item) => (
                <div key={item.label} className="dashboard-metric-row">
                    <div className="dashboard-metric-label">
                        <span className={`dashboard-dot ${tone}`}></span>
                        <p>{item.label}</p>
                    </div>
                    <div className="dashboard-metric-values">
                        <strong>{item.value}</strong>
                        <span>{percentage(item.value, total)}%</span>
                    </div>
                    <div className="dashboard-metric-bar">
                        <span style={{ width: `${percentage(item.value, total)}%` }}></span>
                    </div>
                </div>
            ))}
        </div>
    )
}

const DashboardContent = () => {
    useWorkspace()
    useProject()
    const [isCreateModal, setIsCreateModal] = useState(false)
    const user = useSelector(state => state.user.userDetails)
    const { currWorkspace } = useSelector(state => state.workspace)
    const [summary, setSummary] = useState({
        totals: {
            projects: 0,
            completedProjects: 0,
            tasks: 0,
            activeTasks: 0,
            overdueTasks: 0,
        },
        projectStatus: {
            PLANNING: 0,
            ACTIVE: 0,
            COMPLETED: 0,
            ON_HOLD: 0,
            CANCELLED: 0,
        },
        taskStatus: {
            TO_DO: 0,
            IN_PROGRESS: 0,
            DONE: 0,
        },
        taskPriority: {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
        },
        insights: {
            averageProgress: 0,
            completedThisWeek: 0,
            dueTodayTasks: 0,
            dueThisWeekTasks: 0,
        }
    })
    const [activities, setActivities] = useState([])

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

    useEffect(() => {
        const fetchRecentActivity = async () => {
            if (!currWorkspace?._id) return
            try {
                const response = await Axios({
                    ...apiList.getActivities,
                    params: {
                        workspaceId: currWorkspace._id,
                        page: 1,
                        limit: 5,
                    }
                })
                if (response.data.success) {
                    setActivities(response.data.data)
                }
            } catch (error) {
                console.error(error)
                toast.error('Failed to load recent activity')
            }
        }
        fetchRecentActivity()
    }, [currWorkspace?._id])

    const projectStatusItems = [
        { label: 'Planning', value: summary.projectStatus.PLANNING },
        { label: 'Active', value: summary.projectStatus.ACTIVE },
        { label: 'Completed', value: summary.projectStatus.COMPLETED },
        { label: 'On hold', value: summary.projectStatus.ON_HOLD },
        { label: 'Cancelled', value: summary.projectStatus.CANCELLED },
    ]
    const taskStatusItems = [
        { label: 'To do', value: summary.taskStatus.TO_DO },
        { label: 'In progress', value: summary.taskStatus.IN_PROGRESS },
        { label: 'Done', value: summary.taskStatus.DONE },
    ]
    const taskPriorityItems = [
        { label: 'Low', value: summary.taskPriority.LOW },
        { label: 'Medium', value: summary.taskPriority.MEDIUM },
        { label: 'High', value: summary.taskPriority.HIGH },
    ]

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
                        <p>Active Tasks</p>
                        <h2>{summary.totals.activeTasks}</h2>
                        <span>{summary.taskStatus.DONE} tasks done</span>
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
                <div className='dashboard-panel'>
                    <div className='dashboard-panel-head'>
                        <h3>Project Status</h3>
                        <p>{summary.totals.projects} projects tracked</p>
                    </div>
                    <MetricList
                        items={projectStatusItems}
                        total={calcTotal(summary.projectStatus)}
                        tone='blue'
                    />
                </div>
                <div className='dashboard-panel'>
                    <div className='dashboard-panel-head'>
                        <h3>Task Status</h3>
                        <p>{summary.totals.tasks} active tasks</p>
                    </div>
                    <MetricList
                        items={taskStatusItems}
                        total={calcTotal(summary.taskStatus)}
                        tone='green'
                    />
                </div>
                <div className='dashboard-panel'>
                    <div className='dashboard-panel-head'>
                        <h3>Priority Mix</h3>
                        <p>See how urgent the workload is</p>
                    </div>
                    <MetricList
                        items={taskPriorityItems}
                        total={calcTotal(summary.taskPriority)}
                        tone='orange'
                    />
                </div>
                <div className='dashboard-panel'>
                    <div className='dashboard-panel-head'>
                        <h3>Deadlines</h3>
                        <p>What needs attention next</p>
                    </div>
                    <div className='dashboard-deadline-grid'>
                        <div className='dashboard-deadline-item'>
                            <span>Due today</span>
                            <strong>{summary.insights.dueTodayTasks}</strong>
                        </div>
                        <div className='dashboard-deadline-item'>
                            <span>Due this week</span>
                            <strong>{summary.insights.dueThisWeekTasks}</strong>
                        </div>
                        <div className='dashboard-deadline-item warning'>
                            <span>Overdue</span>
                            <strong>{summary.totals.overdueTasks}</strong>
                        </div>
                        <div className='dashboard-deadline-item success'>
                            <span>Done this week</span>
                            <strong>{summary.insights.completedThisWeek}</strong>
                        </div>
                    </div>
                </div>
                <div className='dashboard-panel dashboard-panel-wide'>
                    <div className='dashboard-panel-head'>
                        <h3>Recent Activity</h3>
                        <p>Latest updates across the workspace</p>
                    </div>
                    <div className='dashboard-activity-list'>
                        {activities.length === 0 ? (
                            <div className='dashboard-empty-state'>No recent activity yet</div>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity._id} className='dashboard-activity-item'>
                                    <div>
                                        <strong>{activity.action.replaceAll('_', ' ')}</strong>
                                        <p>{activity.actorId?.name || 'Someone'} updated a {activity.entityType.toLowerCase()}</p>
                                    </div>
                                    <span>{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
