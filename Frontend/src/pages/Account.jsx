import React, { useEffect, useState } from 'react'
import '../pages/styles/Accounts.css'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Axios from '../utils/axios';
import { apiList } from '../common/apiList';
import { toast } from 'react-toastify';
import { setUserDetails } from '../store/user.slice';
import { removeWorkspace } from '../store/workspace.slice';
import { setIsProjectLoaded } from '../store/project.slice';
import { setIsTaskLoaded } from '../store/task.slice';
import AlertDialog from '../components/AlertDialog';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import ButtonLoading from '../components/ButtonLoading';

const Account = () => {
    const user = useSelector((state) => state.user.userDetails);
    const { workspaces } = useSelector((state) => state.workspace);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(user?.avatar || null);
    const [name, setName] = useState(user?.name);
    const [email, setEmail] = useState(user?.email);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pendingLeaveWorkspace, setPendingLeaveWorkspace] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [pswdUpdateLoading, setPswdUpdateLoading] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const [pswdError, setPswdError] = useState('');
    const [isCrtPswd, setIsCrtPswd] = useState(false)
    const [isPswd, setIsPswd] = useState(false)
    const [isCPswd, setIsCPswd] = useState(false)
    useEffect(() => {
        if (currentPassword.length > 0 && newPassword === currentPassword) {
            setPswdError("Current password and new password should not match.");
        } else if (newPassword !== confirmPassword) {
            setPswdError("New Password and Confirm Password should match");
        } else {
            setPswdError('');
        }
    }, [newPassword, confirmPassword, currentPassword]);

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
                    ? { ...response.data.data, avatar: updatedAvatarUser.avatar }
                    : response.data.data;

                dispatch(setUserDetails(updatedUser));
                toast.success('Profile Updated');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };
    const isButtonDisabled = () =>
        !pswdError &&
            confirmPassword &&
            currentPassword &&
            newPassword
            ? false
            : true;
    const handlePasswordUpdate = async () => {
        try {
            if (isButtonDisabled()) return;
            setPswdUpdateLoading(true)
            const response = await Axios({
                ...apiList.updatePassword,
                data: {
                    currentPassword,
                    newPassword,
                    confirmPassword,
                },
            });
            ;

            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/sign-in');
            }
        } catch (error) {
            console.error(error);
            // toast.error(response.error.message 'Failed to update password');
        } finally {
            setPswdUpdateLoading(false)
        }
    };

    const handleLeaveWorkspace = async () => {
        if (!pendingLeaveWorkspace) return;
        try {
            const response = await Axios({
                ...apiList.leaveWorkspace,
                data: { workspaceId: pendingLeaveWorkspace._id },
            });
            if (response.data.success) {
                dispatch(setUserDetails(response.data.data));
                dispatch(removeWorkspace(pendingLeaveWorkspace._id));
                dispatch(setIsProjectLoaded(false));
                dispatch(setIsTaskLoaded(false));
                toast.success(response.data.message);
                setPendingLeaveWorkspace(null);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to leave workspace');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await Axios({
                ...apiList.deleteAccount,
            });
            if (response.data.success) {
                toast.success(response.data.message);
                setIsDeleteDialogOpen(false);
                navigate('/sign-in');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to delete account');
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
                                        ? <img src={preview} alt='preview' loading='lazy' />
                                        : image
                                            ? <img src={user.avatar} alt='avatar' loading='lazy' />
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
                                            type={isCrtPswd ? 'text' : 'password'}
                                            className='app-input'
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder=' '
                                        />
                                        <label>Current Password</label>
                                        <i onClick={() => setIsCrtPswd(!isCrtPswd)}>{isCrtPswd ? <IoEyeOffOutline /> : <IoEyeOutline />}</i>
                                    </div>

                                </div>
                                <div className='app-form-item'>
                                    <span></span>
                                    <div>
                                        <input
                                            type={isPswd ? 'text' : 'password'}
                                            className='app-input'
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder=' '
                                        />
                                        <label>New Password</label>
                                        <i onClick={() => setIsPswd(!isPswd)}>{isPswd ? <IoEyeOffOutline /> : <IoEyeOutline />}</i>
                                    </div>

                                </div>
                                <div className='app-form-item'>
                                    <span></span>
                                    <div>
                                        <input
                                            type={isCPswd ? 'text' : 'password'}
                                            className='app-input'
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder=' '
                                        />
                                        <label>Confirm New Password</label>
                                        <i onClick={() => setIsCPswd(!isCPswd)}>{isCPswd ? <IoEyeOffOutline /> : <IoEyeOutline />}</i>
                                    </div>
                                    <span style={{ color: 'var(--danger-red)', }}>{pswdError}</span>
                                </div>
                                <button
                                    className='primary-button'
                                    onClick={handlePasswordUpdate}>
                                    {pswdUpdateLoading ? <><ButtonLoading /> Updating...
                                    </> : "Update Password"}</button>
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
                                                <span className={`member-tag ${ws.role?.toLowerCase()}`}>{ws.role.toLowerCase()}</span>
                                            </div>
                                        </div>
                                        {ws.role !== 'ADMIN' ? (
                                            <button
                                                className='primary-button danger-button'
                                                onClick={() => setPendingLeaveWorkspace(temp)}
                                            >
                                                Leave
                                            </button>
                                        ) : (
                                            <button className='ghost-button' type='button' disabled>
                                                Admin owner
                                            </button>
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
                                <button className='primary-button danger-button' onClick={() => setIsDeleteDialogOpen(true)}>Delete Account</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            {pendingLeaveWorkspace && (
                <AlertDialog
                    title={`Leave ${pendingLeaveWorkspace.name}`}
                    subtitle={`Are you sure you want to leave "${pendingLeaveWorkspace.name}"? You will lose access to its projects and tasks.`}
                    close={() => setPendingLeaveWorkspace(null)}
                    action={handleLeaveWorkspace}
                    actionBtnColor="var(--danger-red)"
                />
            )}
            {isDeleteDialogOpen && (
                <AlertDialog
                    title="Delete account"
                    subtitle="This will permanently delete your account. If you still own any workspace, the action will be blocked until ownership is resolved."
                    close={() => setIsDeleteDialogOpen(false)}
                    action={handleDeleteAccount}
                    actionBtnColor="var(--danger-red)"
                />
            )}
        </>
    )
}

export default Account;
