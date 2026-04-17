import React, { useState } from 'react'
import '../pages/styles/Sign.css'
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import Axios from '../utils/axios';
import { apiList } from '../common/apiList';
import ButtonLoading from '../components/ButtonLoading';
import { useDispatch } from 'react-redux';
import { setIsUserLoaded } from '../store/user.slice';
import { toast } from 'react-toastify';
import { IoMdHome } from 'react-icons/io';
const SignIn = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  })
  const dispatch = useDispatch()

  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState("Sign in")
  const [sendingReset, setSendingReset] = useState(false)

  const validate = () => {
    if (data.email == "" || data.password == "") {
      return false
    } else return true
  }
  const [isPswd, setIsPswd] = useState(false)
  const handleInput = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }))
  }
  const tempToken = localStorage.getItem("inviteToken");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = data.email.trim().toLowerCase();
    setLoading("Signing you in");

    try {
      const response = await Axios({
        ...apiList.signIn,
        data: {
          email,
          password: data.password,
        },
      });
      if (!response.data.success) {
        setError(response.data.message);
        return;
      }
      if (response.data.success) {

        dispatch(setIsUserLoaded(false))
      }
      toast.success("Sign in Successfull")
      if (tempToken) {
        navigate(`/invite/${tempToken}`);
        return;
      }
      // if (response.data.data.workspaces.length == 0) {
      //   navigate("/create-workspace")
      //   return;
      // }
      setLoading("Sign in successful");
      navigate("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading('Sign in')
    }
  };

  const handleForgotPassword = async () => {
    const email = data.email.trim().toLowerCase();
    if (!email) {
      toast.error('Enter your email first')
      return
    }

    try {
      setSendingReset(true)
      const response = await Axios({
        ...apiList.forgotPassword,
        data: { email },
      })
      if (response.data.success) {
        toast.success(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to send reset link')
    } finally {
      setSendingReset(false)
    }
  }
  return (
    <section className='sign-wrapper'>
      <div className='app-form-container'>
        <div className='app-form-head'>
          <h2>Sign in</h2>
          <p>Enter Following Details to Sign in</p>
          <span onClick={() => navigate('/')}><IoMdHome /></span>
        </div>
        <form className='app-form' onSubmit={handleSubmit}>
          <div className='app-form-item'>
            <span>Email</span>
            <div>
              <input
                type="email"
                required
                placeholder=" "
                id='email'
                name='email'
                onChange={handleInput}
                value={data.email}
              />
              <label htmlFor='email'>Enter Your Email</label>
            </div>

          </div>
          <div className='app-form-item'>
            <span>Password</span>
            <div>
              <input
                type={!isPswd ? "password" : "text"}
                placeholder=" "
                required
                id='password'
                name='password'
                onChange={handleInput}
                value={data.password}
              />
              <label htmlFor='password'>Enter Password</label>
              <i onClick={() => setIsPswd(!isPswd)}>{isPswd ? <IoEyeOffOutline /> : <IoEyeOutline />}</i>
            </div>
            {error != "" && <p>*{error}</p>}
            <button
              type='button'
              className='sign-text-button'
              onClick={handleForgotPassword}
              disabled={sendingReset}
            >
              {sendingReset ? 'Sending reset link...' : 'Forgot password?'}
            </button>

          </div>
          <div>
            <button disabled={!validate()} className='primary-button' style={{ width: '100%' }}>{loading == "Signing you in" && <ButtonLoading />}{loading}</button>
          </div>
        </form>
        <div className='app-form-navigate'>
          <p>Don't have an account? <u onClick={() => navigate('/sign-up')}>Sign up</u></p>
        </div>
      </div>
    </section>
  )
}

export default SignIn
