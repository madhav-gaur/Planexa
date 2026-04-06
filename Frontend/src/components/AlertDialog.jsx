import React from 'react'
import "../components/Styles/AlertDialog.css"
import { IoClose } from 'react-icons/io5'
const AlertDialog = ({ title, subtitle, close, action, actionBtnColor, children }) => {
    return (
        <div className='alert-dialog-wrapper' onClick={close}>
            <div className='alert-dialog-container' onClick={(e) => e.stopPropagation()}>
                <div onClick={close} className='alert-box-close'>
                    <IoClose />
                </div>
                <div>
                    <h2>
                        {title}
                    </h2>
                </div>
                <div>
                    <p style={{ whiteSpace: 'pre-line' }}>
                        {subtitle}
                    </p>
                </div>

                <div style={{width:'100%'}}>
                    {children}
                </div>
                <div className='alert-box-btn-group'>
                    <button className='secondary-button' onClick={close}>Cancel</button>
                    <button style={{ backgroundColor: actionBtnColor }} className='primary-button' onClick={action}>Confirm</button>
                </div>
            </div>
        </div>
    )
}

export default AlertDialog
