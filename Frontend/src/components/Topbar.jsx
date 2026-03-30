import React from 'react'
import logo from "../assets/Favicon.png"
import { useNavigate } from 'react-router-dom'
import { IoMenu, IoReorderThreeOutline, IoSettingsOutline } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { IoIosNotificationsOutline } from "react-icons/io";
import { LuMoon, LuSun } from "react-icons/lu";
const Topbar = ({ setIsSidebar, isSidebar, setDarkMode, darkMode }) => {
    const navigate = useNavigate()
    const user = useSelector(state => state.user.userDetails)
    const userName = user?.name?.split("")[0].toUpperCase()


    return (
        <div className='topbar-wrapper'>
            <div className='topbar'>
                <div className='topbar-left'>
                    <div className='sidebar-toggle-sc' onClick={() => {
                        console.log(isSidebar)
                        setIsSidebar(!isSidebar)
                    }}>
                        <IoMenu />
                    </div>
                    <img src={logo} alt="Planexa Logo" />
                    <h1 onClick={() => navigate("/")}>Planexa</h1>
                </div>
                <div className='topbar-right'>
                    <div>
                        <IoIosNotificationsOutline />
                    </div>
                    <div onClick={() => setDarkMode(prev => !prev)}>
                        {darkMode ? <LuSun /> : <LuMoon />}
                    </div>
                    <div>
                        <p>
                            {userName}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Topbar
