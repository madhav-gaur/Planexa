import React from 'react'
import Axios from '../utils/axios'
import { apiList } from '../common/apiList'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IoClose } from 'react-icons/io5'
import ButtonLoading from './ButtonLoading'
import { useDispatch } from 'react-redux'
import { setIsWorkspaceLoaded } from '../store/workspace.slice'
import { toast } from 'react-toastify'

const CreateWorkspaceModal = ({ close }) => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        name: "",
        description: "",
        logo: ""
    })
    const handleInput = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await Axios({
                ...apiList.createWorkspace,
                data: {
                    name: data.name,
                    description: data.description,
                    logo: data.logo
                }
            })
            if (response.data.success) {
                toast.success("Workspace Created !!")
                setLoading(false)
                dispatch(setIsWorkspaceLoaded(false))

                if (location.pathname != "/create-workspace") {
                    close()
                }
                setTimeout(() => {
                    navigate("/")
                }, 100)
            }
            console.log(response)
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <div className='app-form-container' onClick={(e) => e.stopPropagation()}>
            <div className='app-form-head'>
                <h2>Create Workspace</h2>
                <p>Enter Following Details to Create Workspace</p>
                {location.pathname != "/create-workspace" && <span onClick={close}><IoClose /></span>}
            </div>
            <form className='app-form' onSubmit={handleSubmit} >
                <div className='app-form-item'>
                    <span>Workspace</span>
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
                        <label htmlFor='name'>Enter Workspace name</label>
                    </div>

                </div>
                <div className='app-form-item'>
                    <span>Description</span>
                    <div>
                        <input
                            type="text"
                            placeholder=" "
                            id='description'
                            name='description'
                            onChange={handleInput}
                            value={data.description}
                        />
                        <label htmlFor='name'>Enter Description</label>
                    </div>

                </div>
                <div className='app-form-item'>
                    <span>Workspace Logo</span>
                    <div>
                        <input
                            type="file"
                            placeholder=" "
                            id='logo'
                            name='logo'
                        />
                        <label htmlFor='name'>Choose logo for Workspace (optional)</label>
                    </div>

                </div>
                <div>
                    <button className='primary-button' style={{ width: '100%' }}> {loading ? <>Creating... <ButtonLoading /></> : "Create Workspace"}</button>
                </div>
            </form>
        </div>
    )
}

export default CreateWorkspaceModal
