import React, { useState } from 'react'
import logo from "../assets/Favicon.png"
import { useNavigate } from 'react-router-dom'
import { IoClose, IoMenu, IoSettingsOutline } from "react-icons/io5";
import { useSelector, useDispatch } from 'react-redux';
// import { IoIosNotificationsOutline } from "react-icons/io";
import { LuMoon, LuSun } from "react-icons/lu";
import { CiLogout } from 'react-icons/ci';
import { apiList } from '../common/apiList';
import Axios from '../utils/axios';
import { toast } from 'react-toastify';
import { setUserDetails, setIsUserLoaded } from '../store/user.slice';
import { IoMdNotificationsOutline } from "react-icons/io"
import { useNotification } from "../hooks/useNotification";
;
const Topbar = ({ setIsSidebar, isSidebar, setDarkMode, darkMode }) => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector(state => state.user.userDetails)
    const userName = user?.name?.split("")[0].toUpperCase()
    const [isUserCard, setIsUserCard] = useState(false)
    const [isNotifyCard, setIsNotifyCard] = useState(false)

    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const unreadCount = notifications.filter(item => !item.isRead).length

      useNotification({ pageNum: 1, setLoading, setHasMore: () => { }, setNotifications })
    

    const handleSignOut = async () => {
        try {
            await Axios({
                ...apiList.signOut,
            })
            dispatch(setUserDetails(null))
            dispatch(setIsUserLoaded(false))
            localStorage.clear()
            navigate('/sign-in')
            toast.success('Signed out successfully')
        } catch (error) {
            console.error('Signout error:', error)
            toast.error('Failed to sign out')
        }
    }

    return (
        <div className='topbar-wrapper'>
            <div className='topbar'>
                <div className='topbar-left'>
                    <div className='sidebar-toggle-sc' onClick={() => {
                        setIsSidebar(!isSidebar)
                    }}>
                        <IoMenu />
                    </div>
                    <img src={logo} alt="Planexa Logo" />
                    <h1 onClick={() => navigate("/")}>Planexa</h1>
                </div>
                <div className='topbar-right'>
                    <div className='topbar-right-item' onClick={() => setIsNotifyCard(prev => !prev)}>
                        <div style={{ position: 'relative', marginTop:'2px' }} >
                            <IoMdNotificationsOutline />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            )}
                        </div>

                    </div>
                    <div onClick={() => setDarkMode(prev => !prev)} className='topbar-right-item'>
                        {darkMode ? <LuSun /> : <LuMoon />}
                    </div>
                    <div onClick={() => setIsUserCard(prev => !prev)} className='topbar-right-item'>
                        {isUserCard
                            ? <IoClose size={20} />
                            : user?.avatar
                                ? <img src={user.avatar} alt="avatar" className='topbar-avatar' />
                                : <p>{userName}</p>
                        }
                    </div>
                    {
                        isUserCard &&
                        <div
                            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                            onClick={() => setIsUserCard(false)}
                        >
                            <div className='user-pop-over-card' onClick={(e) => e.stopPropagation()}>
                                <div>
                                    <h2>{user.name}</h2>
                                    <p>{user.email}</p>
                                </div>
                                <div onClick={() => {
                                    navigate('/account')
                                    setIsUserCard(false)
                                }}>
                                    <IoSettingsOutline />
                                    <span>Manage Account</span>
                                </div>
                                <div style={{ color: 'var(--danger-red)', fontWeight: 600 }} onClick={() => {
                                    setIsUserCard(false)
                                    handleSignOut()
                                }}>
                                    <CiLogout />
                                    <span >Sign Out</span>
                                </div>
                            </div>
                        </div>
                    }
                    {
                        isNotifyCard &&
                        <div
                            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
                            onClick={() => setIsNotifyCard(false)}
                        >
                            <div className='user-pop-over-card' onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'none' }}></div>
                                <div style={{ padding: '1rem', fontSize: '14px', cursor: 'pointer' }} onClick={() => {
                                    setIsNotifyCard(false)
                                    navigate("/notifications")
                                }}>
                                    <span>View All Notifications</span>
                                </div>
                                {loading ? (
                                    <div style={{ padding: '1rem', fontSize: '14px', color: 'var(--text-light)' }}>
                                        Loading notifications...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div style={{ padding: '1rem', fontSize: '14px', color: 'var(--text-light)' }}>
                                        No notifications yet.
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map((item) => (
                                        <div key={item._id} style={{ padding: '10px', fontSize: '14px', flexDirection: 'column', alignItems: 'start', gap: '0px' }}>
                                            <span>{item.title}</span>
                                            <p style={{ color: 'var(--text-light)', fontSize: '12px' }}>
                                                {item.message.length > 30 ? item.message.slice(0, 30) + '...' : item.message}
                                            </p>
                                        </div>
                                    ))
                                )}

                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Topbar
