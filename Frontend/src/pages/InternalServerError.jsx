import React from 'react'
import ErrorPage from '../components/ErrorPage'

const InternalServerError = () => {
    return (
        <ErrorPage
            statusCode={500}
            title="Server Error"
            message="Something went wrong on our end. Our team has been notified. Please try again later."
            icon="💥"
        />
    )
}

export default InternalServerError
