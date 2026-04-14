import React from 'react'
import ErrorPage from '../components/ErrorPage'

const Forbidden = () => {
    return (
        <ErrorPage
            statusCode={403}
            title="Access Denied"
            message="You don't have permission to access this resource. Contact your administrator if you believe this is a mistake."
            icon="🔒"
        />
    )
}

export default Forbidden
