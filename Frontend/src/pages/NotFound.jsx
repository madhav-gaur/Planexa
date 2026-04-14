import React from 'react'
import ErrorPage from '../components/ErrorPage'

const NotFound = () => {
    return (
        <ErrorPage
            statusCode={404}
            title="Page Not Found"
            message="Sorry, the page you're looking for doesn't exist or has been moved."
        />
    )
}

export default NotFound
