import React, { useEffect, useState } from "react";
import "../components/Styles/OfflineBar.css";

const OfflineBar = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBar, setShowBar] = useState(!navigator.onLine);

    useEffect(() => {
        let timer;

        const handleOnline = () => {
            setIsOnline(true);
            setShowBar(true);

            timer = setTimeout(() => {
                setShowBar(false);
            }, 3000);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBar(true);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!showBar) return null;

    return (
        <div className="offline-bar-wrapper">
            <div className={`offline-bar ${isOnline && "success"}`}>
                <p>
                    {isOnline ? "Back Online" : "You are currently offline"}
                </p>
            </div>
        </div>
    );
};

export default OfflineBar;