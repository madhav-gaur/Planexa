import React from 'react'

const ButtonLoading = () => {
    return (<>
        < div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid var(--primary-blue)',
            borderRadius: '50%',
            width: '1.5rem',
            height: '1.5rem',
            animation: 'spin 0.9s linear infinite'
        }}>
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
        </div >
    </>
    )
}

export default ButtonLoading
