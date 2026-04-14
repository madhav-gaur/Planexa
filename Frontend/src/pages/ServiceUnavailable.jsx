import React from 'react'
import ErrorPage from '../components/ErrorPage'

const ServiceUnavailable = () => {
    return (
        <ErrorPage
            statusCode={503}
            title="Service Unavailable"
            message="We're currently performing maintenance. We'll be back online shortly. Thank you for your patience!"
            icon="🔧"
            showBackButton={false}
        />
    )
}

export default ServiceUnavailable
