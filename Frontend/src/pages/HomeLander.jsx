import React from 'react'
import Favicon from "../assets/Favicon.png"
import { HiMiniUserGroup } from "react-icons/hi2";
import { FaRegCalendarCheck } from "react-icons/fa";
import { GiProgression } from "react-icons/gi";
import "../pages/styles/HomeLander.css"
import { useNavigate } from 'react-router-dom';
import LanderPage from "../assets/LanderPage.png"
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
const HomeLander = () => {

    const navigate = useNavigate()

    const { _id, isUserLoaded } = useSelector((state) => state.user);

    useEffect(() => {
        if (isUserLoaded && _id) {
            navigate("/", { replace: true });
        }
    }, [_id, isUserLoaded, navigate]);
    return (
        <div className='home-lander-wrapper'>
            <header>
                <div>
                    <img src={Favicon} alt="Planexa Logo" />
                    <h1 onClick={() => navigate("/")}>Planexa</h1>
                </div>
                <div>
                    <button onClick={() => navigate("/sign-in")}>Sign in</button>
                    <button onClick={() => navigate("/sign-up")} className='primary-button'>Get Started</button>
                </div>
            </header>
            <section className='home-section-1'>
                <div>
                    <div>
                        <h1>Get more done with <b>Planexa</b></h1>
                        <p>The modern task management platform that helps teams organize, track, and complete work efficiently.</p>
                    </div>
                    <div>
                        <button className='primary-button' onClick={() => navigate("/sign-in")}>Try for Free</button>
                        <button ><a href="#features">See Features</a></button>
                    </div>
                </div>
                <div>
                    <img src={LanderPage} alt="" />
                </div>

            </section>
            <section className='home-section-2' id='features'>
                <div className='home-lander-feature-head'>
                    <span>Our Features</span>
                    <h2>Everything you need to manage tasks effectively</h2>
                    <p>Our powerful features help teams stay organized and deliver projects on time</p>
                </div>
                <div className='home-lander-feature-group'>
                    <div>
                        <span><HiMiniUserGroup /></span>
                        <h3>Team Collaboration</h3>
                        <p>Work together seamlessly with your team in shared workspaces with real-time updates.</p>
                    </div>
                    <div>
                        <span> <FaRegCalendarCheck /></span>
                        <h3>Task Management</h3>
                        <p>Organize tasks with priorities, due dates, comments, and track progress visually.</p>
                    </div>
                    <div>
                        <span><GiProgression /></span>
                        <h3>Progress Tracking</h3>
                        <p>Visualize project progress with beautiful charts and get insights into team productivity.</p>
                    </div>
                </div>
            </section>
            <section className='home-section-3'>
                <div>
                    <h2>Ready to boost your team's productivity?</h2>
                    <p>Join thousands of teams that use TaskHub to get more done, together.</p>
                </div>
                <div>
                    <button onClick={() => navigate("/sign-up")} className='primary-button'>Get Started Free</button>
                    <button onClick={() => navigate("/sign-in")} className='primary-button'>Sign in</button>
                </div>
            </section>
        </div>
    )
}

export default HomeLander
