import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Styles/ErrorPage.css'

const ErrorPage = ({
    statusCode = 404,
    title = 'Page Not Found',
    message = "Sorry, the page you're looking for doesn't exist.",
    showHomeButton = true,
    showBackButton = true,
    onRetry = null,
    icon = null
}) => {
    const navigate = useNavigate()

    const getDefaultIcon = (code) => {
        const icons = {
            400: '⚠️',
            403: '🔒',
            404: '❌',
            429: '⏱️',
            500: '💥',
            503: '🔧',
            offline: '📡'
        }
        return icons[code] || icons[404]
    }

    return (
        <div className="error-page-container">
            <div className="error-page-content">
                <div className="error-page-icon">
                    {icon || getDefaultIcon(statusCode)}
                </div>
                <div className="error-page-code">{statusCode}</div>
                <h1>{title}</h1>
                <p>{message}</p>
                <div className="error-page-actions">
                    {showHomeButton && (
                        <button className="primary-button" onClick={() => navigate('/')}>
                            Go to Home
                        </button>
                    )}
                    {showBackButton && (
                        <button className="primary-button ghost-button" onClick={() => navigate(-1)}>
                            Go Back
                        </button>
                    )}
                    {onRetry && (
                        <button className="primary-button" onClick={onRetry}>
                            Retry
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ErrorPage
