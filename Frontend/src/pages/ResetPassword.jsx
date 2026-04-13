import React, { useState } from 'react'
import './styles/Sign.css'
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";
import { useNavigate, useParams } from 'react-router-dom';
import Axios from '../utils/axios';
import { apiList } from '../common/apiList';
import ButtonLoading from '../components/ButtonLoading';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const navigate = useNavigate()
    const { token } = useParams()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [data, setData] = useState({
        password: '',
        confirmPassword: '',
    })

    const handleInput = (e) => {
        const { name, value } = e.target
        setData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await Axios({
                ...apiList.resetPassword,
                data: {
                    token,
                    password: data.password,
                    confirmPassword: data.confirmPassword,
                },
            })
            if (response.data.success) {
                toast.success(response.data.message)
                navigate('/sign-in')
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='sign-wrapper'>
            <div className='app-form-container'>
                <div className='app-form-head'>
                    <h2>Reset Password</h2>
                    <p>Choose a new password for your account</p>
                </div>
                <form className='app-form' onSubmit={handleSubmit}>
                    <div className='app-form-item'>
                        <span>New Password</span>
                        <div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder=' '
                                id='new-password'
                                name='password'
                                value={data.password}
                                onChange={handleInput}
                            />
                            <label htmlFor='new-password'>Enter new password</label>
                            <i onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                            </i>
                        </div>
                    </div>
                    <div className='app-form-item'>
                        <span>Confirm Password</span>
                        <div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                placeholder=' '
                                id='confirm-new-password'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleInput}
                            />
                            <label htmlFor='confirm-new-password'>Confirm new password</label>
                            <i onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                            </i>
                        </div>
                        {data.password && data.confirmPassword && data.password !== data.confirmPassword && (
                            <p>*Passwords must match</p>
                        )}
                    </div>
                    <div>
                        <button
                            className='primary-button'
                            style={{ width: '100%' }}
                            disabled={loading || !data.password || data.password !== data.confirmPassword}
                        >
                            {loading && <ButtonLoading />} {loading ? 'Resetting password' : 'Reset Password'}
                        </button>
                    </div>
                </form>
                <div className='app-form-navigate'>
                    <p>Remembered it? <u onClick={() => navigate('/sign-in')}>Back to sign in</u></p>
                </div>
            </div>
        </section>
    )
}

export default ResetPassword
