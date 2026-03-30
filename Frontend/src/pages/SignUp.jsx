import React, { useState } from 'react'
import './styles/Sign.css'
import { IoEyeOutline } from "react-icons/io5";
import { IoEyeOffOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import ButtonLoading from '../components/ButtonLoading';
import Axios from '../utils/axios';
import { apiList } from '../common/apiList';
import { useDispatch } from 'react-redux';
import { setIsUserLoaded } from '../store/user.slice';
import { toast } from 'react-toastify';
const SignUp = () => {
  const [loading, setLoading] = useState("Create Account")
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const validate = () => {
    if (data.name == "" || data.email == "" || data.password == "" || data.confirmPassword == "" || data.password != data.confirmPassword) {
      return false
    } else return true
  }
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isPswd, setIsPswd] = useState(false)
  const [isCPswd, setIsCPswd] = useState(false)


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

    try {
      const name = data.name.trim();
      const email = data.email.trim().toLowerCase();

      setLoading("Creating an account for you...");

      const response = await Axios({
        ...apiList.signUp,
        data: {
          name,
          email,
          password: data.password,
        },
      });

      if (!response.data.success) return;

      setLoading("Account created. Signing you in...");
      toast.success("Account Created Successfully")
      const response2 = await Axios({
        ...apiList.signIn,
        data: {
          email,
          password: data.password,
        },
      });
      dispatch(setIsUserLoaded(false))
      if (!response2.data.success) return;

      if (tempToken) {
        navigate(`/invite/${tempToken}`);
        return;
      }

      if (!response2.data.data.workspaces?.length) {
        navigate("/create-workspace");
        return;
      }
      dispatch(setIsUserLoaded(false))
      navigate("/");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className='sign-wrapper'>
      <div className='app-form-container'>
        <div className='app-form-head'>
          <h2>Create an Account</h2>
          <p>Enter Following Details to Create Account</p>
        </div>
        <form className='app-form'>
          <div className='app-form-item'>
            <span>Full Name</span>
            <div>
              <input
                type="text"
                required
                placeholder=" "
                id='name'
                name='name'
                onChange={handleInput}
                value={data.name}
              />
              <label htmlFor='name'>Enter Your Name</label>
            </div>

          </div>
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

          </div>
          <div className='app-form-item'>
            <span>Confirm Password</span>
            <div>
              <input
                type={!isCPswd ? "password" : "text"}
                placeholder=" "
                required
                id='confirm-password'
                name='confirmPassword'
                onChange={handleInput}
                value={data.confirmPassword}
              />
              <label htmlFor='confirm-password'>Confirm Password</label>
              <i onClick={() => setIsCPswd(!isCPswd)}>{isCPswd ? <IoEyeOffOutline /> : <IoEyeOutline />}</i>
            </div>
            {data.password !== data.confirmPassword && <p>*Password and Confirm Password must match</p>}
          </div>
        </form>
        <div>
          <button onClick={(e) => handleSubmit(e)} disabled={!validate()} className='primary-button' style={{ width: '100%' }}>{loading != "Create Account" && <ButtonLoading />} {loading}</button>
        </div>
        <div className='app-form-navigate'>
          <p>Already have an account? <u onClick={() => navigate('/sign-in')}>Sign in</u></p>
        </div>
      </div>
    </section>
  )
}

export default SignUp
