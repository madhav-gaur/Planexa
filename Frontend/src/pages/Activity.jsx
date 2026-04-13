import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { formatDistanceToNow } from 'date-fns'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import Loading from '../components/Loading'
import { toast } from 'react-toastify'
import './styles/Activity.css'
import './styles/Notifications.css'

const Activity = () => {
    const { currWorkspace } = useSelector(state => state.workspace)
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [entityType, setEntityType] = useState('ALL')

    useEffect(() => {
        const fetchActivities = async () => {
            if (!currWorkspace?._id) return
            try {
                setLoading(true)
                const response = await Axios({
                    ...apiList.getActivities,
                    params: {
                        workspaceId: currWorkspace._id,
                        page: 1,
                        limit: 20,
                        ...(entityType !== 'ALL' ? { entityType } : {})
                    }
                })
                if (response.data.success) {
                    const nextItems = response.data.data
                    setHasMore(nextItems.length === 20)
                    setActivities(nextItems)
                }
            } catch (error) {
                console.error(error)
                toast.error('Failed to load activity')
            } finally {
                setLoading(false)
            }
        }
        setPage(1)
        fetchActivities()
    }, [currWorkspace?._id, entityType])

    if (loading && page === 1) return <Loading />

    return (
        <>
            <div className="dashboard-head">
                <div className="dashboard-head-left">
                    <h2>Activity</h2>
                    <p>Track workspace actions as they happen</p>
                </div>
                <div className="dashboard-head-right">
                    <div style={{
                        width: '100%',
                    }}>
                        <select
                            value={entityType}
                            onChange={(e) => setEntityType(e.target.value)}
                            style={{
                                border: 'var(--border)',
                                padding: '10px 1rem',
                                width: '100%',
                                borderRadius: '7px',
                                cursor: 'pointer',
                                outline: 'none',
                                background: 'var(--surface)',
                                color: 'var(--text-normal)'
                            }}>
                            <option value="ALL">All activity</option>
                            <option value="WORKSPACE">Workspace</option>
                            <option value="PROJECT">Project</option>
                            <option value="TASK">Task</option>
                            <option value="USER">User</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="activity-container">
                {activities.length === 0 ? (
                    <div className="no-notifications">
                        <p>No activity yet</p>
                    </div>
                ) : (
                    <>
                        {activities.map((activity) => (
                            <div key={activity._id} className="notification-item activity-item">
                                <div className="notification-content">
                                    <h4>{activity.action.replaceAll('_', ' ')}</h4>
                                    <p>
                                        {activity.actorId?.name || 'Someone'} updated a {activity.entityType.toLowerCase()}
                                    </p>
                                    <span className="notification-time">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {hasMore && (
                            <button
                                className="primary-button"
                                onClick={() => {
                                    const nextPage = page + 1
                                    const loadMore = async () => {
                                        try {
                                            setLoading(true)
                                            const response = await Axios({
                                                ...apiList.getActivities,
                                                params: {
                                                    workspaceId: currWorkspace._id,
                                                    page: nextPage,
                                                    limit: 20,
                                                    ...(entityType !== 'ALL' ? { entityType } : {})
                                                }
                                            })
                                            if (response.data.success) {
                                                const nextItems = response.data.data
                                                setPage(nextPage)
                                                setHasMore(nextItems.length === 20)
                                                setActivities(prev => [...prev, ...nextItems])
                                            }
                                        } catch (error) {
                                            console.error(error)
                                            toast.error('Failed to load activity')
                                        } finally {
                                            setLoading(false)
                                        }
                                    }
                                    loadMore()
                                }}
                                style={{ width: 'fit-content', margin: '1rem auto' }}
                            >
                                Load more
                            </button>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

export default Activity
