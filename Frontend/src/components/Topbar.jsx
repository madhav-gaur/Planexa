import React, { useState } from 'react'
import logo from "../assets/Favicon.png"
import { useNavigate } from 'react-router-dom'
import { IoClose, IoMenu, IoReorderThreeOutline, IoSettingsOutline } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { IoIosNotificationsOutline } from "react-icons/io";
import { LuMoon, LuSun } from "react-icons/lu";
import { CiLogout } from 'react-icons/ci';
const Topbar = ({ setIsSidebar, isSidebar, setDarkMode, darkMode }) => {
    const navigate = useNavigate()
    const user = useSelector(state => state.user.userDetails)
    const userName = user?.name?.split("")[0].toUpperCase()
    const [isUserCard, setIsUserCard] = useState(false)

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
                    <div className='topbar-right-item'>
                        <IoIosNotificationsOutline />
                    </div>
                    <div onClick={() => setDarkMode(prev => !prev)} className='topbar-right-item'>
                        {darkMode ? <LuSun /> : <LuMoon />}
                    </div>
                    <div onClick={() => setIsUserCard(prev => !prev)} className='topbar-right-item'>
                        {/* <p>
                            {isUserCard ? <IoClose size={20} /> : userName}
                        </p> */}
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
                                <div onClick={() => navigate('/account')}>
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
