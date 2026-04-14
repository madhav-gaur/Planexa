import React from 'react'
import ErrorPage from '../components/ErrorPage'

const TooManyRequests = () => {
    return (
        <ErrorPage
            statusCode={429}
            title="Too Many Requests"
            message="You've made too many requests. Please wait a moment and try again."
            icon="⏱️"
            showBackButton={true}
        />
    )
}

export default TooManyRequests
