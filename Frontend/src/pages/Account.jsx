import React, { useState } from 'react'
import '../pages/styles/Accounts.css'
import { useDispatch, useSelector } from 'react-redux';
import Axios from '../utils/axios';
import { apiList } from '../common/apiList';
import { toast } from 'react-toastify';
import { setUserDetails } from '../store/user.slice';

const Account = () => {
    const user = useSelector((state) => state.user.userDetails);
    const { workspaces } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(user?.avatar || null);
    const [name, setName] = useState(user?.name);
    const [email, setEmail] = useState(user?.email);

    const [activeSection, setActiveSection] = useState('profile');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!image) return null;

        const formData = new FormData();
        formData.append('avatar', image);

        try {
            const response = await Axios({
                ...apiList.updateAvatar,
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                const updatedUser = response.data.data;
                dispatch(setUserDetails(updatedUser));
                setImage(null);
                setPreview(updatedUser.avatar || null);
                return updatedUser;
            }

            return null;
        } catch (error) {
            console.error(error);
            return null;
        }
    };


    const handleProfileChanges = async () => {
        try {
            const updatedAvatarUser = await handleAvatarUpload();

            const response = await Axios({
                ...apiList.updateProfile,
                data: { name, email },
            });

            if (response.data.success) {
                const updatedUser = updatedAvatarUser
                    ? { ...updatedAvatarUser, name, email }
                    : { ...user, name, email, avatar: preview || user?.avatar };

                dispatch(setUserDetails(updatedUser));
                toast.success('Profile Updated');
            }
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <>
            <div className='dashboard-head'>
                <div className='dashboard-head-left'>
                    <h2>My Account</h2>
                    <p>Manage Your Planexa Account</p>
                </div>
            </div>

            <div className='account-wrapper'>

                <div className='account-nav'>
                    {['profile', 'security', 'workspaces', 'danger'].map(section => (
                        <div
                            key={section}
                            className={`account-nav-item ${activeSection === section ? 'active' : ''}`}
                            onClick={() => setActiveSection(section)}
                        >
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                        </div>
                    ))}
                </div>
                <div className='account-content'>

                    {activeSection === 'profile' && (
                        <div className='account-section'>
                            <div className='account-section-head'>
                                <h3>Profile</h3>
                                <p>Update your personal information</p>
                            </div>

                            <div className='account-avatar-container'>
                                <div className='account-avatar'>
                                    {preview
                                        ? <img src={preview} alt='preview' />
                                        : image
                                            ? <img src={user.avatar} alt='avatar' />
                                            : <p>{user?.name?.charAt(0).toUpperCase()}</p>
                                    }
                                </div>
                                <div className='account-avatar-actions'>
                                    <input
                                        type="file"
                                        name='image'
                                        id='image'
                                        style={{ display: 'none' }}
                                        accept='image/*'
                                        onChange={handleFileChange} />
                                    <label htmlFor="image" className='secondary-button'>
                                        Upload Photo
                                    </label>
                                    <button
                                        type='button'
                                        className='ghost-button'
                                        onClick={() => {
                                            setImage(null);
                                            setPreview(null);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div className='account-form'>
                                <div className='app-form-item'>
                                    <span>Update Name</span>
                                    <div>
                                        <input
                                            type='text'
                                            className='app-input'
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder=' '
                                        />
                                        <label>Full Name</label>

                                    </div>
                                </div>
                                <div className='app-form-item'>
                                    <span>Update Email Address</span>
                                    <div>
                                        <input
                                            type='email'
                                            className='app-input'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder='Your email'
                                        />
                                        <label>Email</label>
                                    </div>
                                </div>
                                <div>
                                    <button className='primary-button' onClick={handleProfileChanges}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div className='account-section'>
                            <div className='account-section-head'>
                                <h3>Security</h3>
                                <p>Manage your password</p>
                            </div>

                            <div className='account-form'>
                                <div className='app-form-item'>
                                    <span></span>
                                    <div>
                                        <input
                                            type='password'
                                            className='app-input'
                                            placeholder=' '
                                        />
                                        <label>Current Password</label>
                                    </div>

                                </div>
                                <div className='app-form-item'>
                                    <span></span>
                                    <div>
                                        <input
                                            type='password'
                                            className='app-input'
                                            placeholder=' '
                                        />
                                        <label>New Password</label>
                                    </div>

                                </div>
                                <div className='app-form-item'>
                                    <span></span>
                                    <div>
                                        <input
                                            type='password'
                                            className='app-input'
                                            placeholder=' '
                                        />
                                        <label>Confirm New Password</label>
                                    </div>

                                </div>
                                <button className='primary-button'>Update Password</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'workspaces' && (
                        <div className='account-section'>
                            <div className='account-section-head'>
                                <h3>Workspaces</h3>
                                <p>Workspaces you are a part of</p>
                            </div>

                            <div className='account-workspace-list'>
                                {user?.workspaces?.map((ws) => {
                                    let temp = workspaces.find(item => item._id == ws.workspaceId)
                                    return <div key={ws._id} className='account-workspace-item'>
                                        <div className='account-workspace-info'>
                                            <div className='account-workspace-icon'>
                                                {temp.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className='account-workspace-name'>{temp?.name || 'Workspace'}</p>
                                                <span className={`member-tag ${ws.role?.toLowerCase()}`}>{ws.role}</span>
                                            </div>
                                        </div>
                                        {ws.role == 'ADMIN' && (
                                            <button className='primary-button danger-button'>Leave</button>
                                        )}
                                    </div>
                                })}
                            </div>
                        </div>
                    )}
                    {activeSection === 'danger' && (
                        <div className='account-section'>
                            <div className='account-section-head'>
                                <h3>Danger Zone</h3>
                                <p>Irreversible actions — proceed with caution</p>
                            </div>

                            <div className='account-danger-card'>
                                <div>
                                    <p className='account-danger-title'>Delete Account</p>
                                    <p className='account-danger-desc'>
                                        Permanently delete your account and all associated data. This cannot be undone.
                                    </p>
                                </div>
                                <button className='primary-button danger-button'>Delete Account</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

export default Account;