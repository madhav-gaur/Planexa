import React, { useState, useEffect } from 'react'
import ErrorPage from '../components/ErrorPage'

const Offline = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    useEffect(() => {
        window.addEventListener('online', () => setIsOnline(true))
        window.addEventListener('offline', () => setIsOnline(false))

        return () => {
            window.removeEventListener('online', () => setIsOnline(true))
            window.removeEventListener('offline', () => setIsOnline(false))
        }
    }, [])

    const handleRetry = () => {
        window.location.reload()
    }

    return (
        <ErrorPage
            statusCode="offline"
            title={isOnline ? "Connection Restored" : "You're Offline"}
            message={isOnline
                ? "Your connection is back. You can continue using Planexa."
                : "It looks like you've lost your internet connection. Please check your connection and try again."}
            icon="📡"
            showHomeButton={isOnline}
            showBackButton={false}
            onRetry={isOnline ? null : handleRetry}
        />
    )
}

export default Offline
