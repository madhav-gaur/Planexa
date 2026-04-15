import React, { useState, useEffect } from "react";
import ErrorPage from "../components/ErrorPage";
import { useLocation, useNavigate } from "react-router-dom";

const Offline = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        if (isOnline) navigate(-1);
    }, [isOnline, navigate])
    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    const handleRetry = () => {
        if (navigator.onLine) {
            const backTo = location.state?.from || "/";
            navigate(backTo, { replace: true });
        } else {
            window.location.reload();
        }
    };

    const handleGoHome = () => {
        navigate("/", { replace: true });
    };

    return (
        <ErrorPage
            statusCode="offline"
            title={isOnline ? "Connection Restored" : "You're Offline"}
            message={
                isOnline
                    ? "Your connection is back. Click below to continue."
                    : "It looks like you've lost your internet connection. Please check your connection and try again."
            }
            icon="📡"
            showHomeButton={isOnline}
            showBackButton={false}
            onRetry={handleRetry}
            onHome={handleGoHome}
        />
    );
};

export default Offline;