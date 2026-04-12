import React, { useState, useEffect } from 'react'
import logo from "../assets/Favicon.png"
import { useNavigate } from 'react-router-dom'
import { IoClose, IoMenu, IoNotificationsOutline, IoReorderThreeOutline, IoSettingsOutline } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { IoIosNotificationsOutline } from "react-icons/io";
import { LuMoon, LuSun } from "react-icons/lu";
import { CiLogout } from 'react-icons/ci';
import Axios from '../utils/axios';
import { apiList } from '../common/apiList';
const Topbar = ({ setIsSidebar, isSidebar, setDarkMode, darkMode }) => {
    const navigate = useNavigate()
    const user = useSelector(state => state.user.userDetails)
    const userName = user?.name?.split("")[0].toUpperCase()
    const [isUserCard, setIsUserCard] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await Axios({
                    ...apiList.getNotifications,
                    params: { page: 1, limit: 1 },
                })
                if (response.data.success) {
                    const allResponse = await Axios({
                        ...apiList.getNotifications,
                        params: { page: 1, limit: 99 },
                    })
                    if (allResponse.data.success) {
                        const unread = allResponse.data.data.filter(n => !n.isRead).length
                        setUnreadCount(unread)
                    }
                }
            } catch (error) {
                console.error('Fetch unread count error:', error)
            }
        }
        if (user) fetchUnreadCount()
    }, [user])

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
                    <div className='topbar-right-item' onClick={() => navigate('/notifications')}>
                        <div style={{ position: 'relative' }} >
                            <IoIosNotificationsOutline />
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
                                <div style={{ color: 'var(--danger-red)', fontWeight: 600 }}>
                                    <CiLogout />
                                    <span >Sign Out</span>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Topbar
