import React, { useEffect, useState } from 'react'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'
import { formatDistanceToNow } from 'date-fns'
import './styles/Notifications.css'
import { fetchNotifications } from '../utils/fetchNotifications'

const Notifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        fetchNotifications({ pageNum: 1, setLoading, setHasMore, setNotifications })
    }, [])

    const markAsRead = async (notificationId) => {
        try {
            const response = await Axios({
                ...apiList.markNotificationRead,
                url: apiList.markNotificationRead.url.replace(':notificationId', notificationId),
            })
            if (response.data.success) {
                setNotifications(prev =>
                    prev.map(notif =>
                        notif._id === notificationId ? { ...notif, isRead: true } : notif
                    )
                )

            }
        } catch (error) {
            console.error('Mark read error:', error)
            toast.error('Failed to mark as read')
        }
    }

    const markAllAsRead = async () => {
        try {
            const response = await Axios({
                ...apiList.markNotificationRead,
                url: apiList.markNotificationRead.url.replace(':notificationId', 'all'),
            })
            if (response.data.success) {
                setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
                toast.success('All notifications marked as read')
            }
        } catch (error) {
            console.error('Mark all read error:', error)
            toast.error('Failed to mark all as read')
        }
    }

    const loadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchNotifications({ pageNum: nextPage, setLoading, setHasMore, setNotifications })
    }

    if (loading) return <Loading />

    return (<>
        <div className="dashboard-head">
            <div className="dashboard-head-left">
                <h2>Notifications</h2>
                <p>Stay updated with your workspace activities</p>
            </div>
            {notifications.length > 0 && (
                <button
                    className="ghost-button"
                    onClick={markAllAsRead}
                    style={{ alignSelf: 'flex-start' }}
                >
                    Mark all as read
                </button>
            )}
        </div>

        <div className="notifications-container">
            {notifications.length === 0 ? (
                <div className="no-notifications">
                    <p>No notifications yet</p>
                </div>
            ) : (
                <>
                    {notifications.map(notification => (
                        <div
                            key={notification._id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={() => !notification.isRead && markAsRead(notification._id)}
                        >
                            <div className="notification-content">
                                <h4>{notification.title}</h4>
                                <p>{notification.message}</p>
                                <span className="notification-time">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            {!notification.isRead && <div className="unread-dot"></div>}
                        </div>
                    ))}
                    {hasMore && (
                        <button className="primary-button" onClick={loadMore} style={{ width: 'fit-content', margin: '1rem auto' }}>
                            Load more
                        </button>
                    )}
                </>
            )}
        </div>
    </>
    )
}

export default Notifications
