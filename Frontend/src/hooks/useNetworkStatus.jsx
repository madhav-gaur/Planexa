import { useEffect } from "react";import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const useNetworkStatus = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const handleOnline = () => {
            toast.success('Connection restored');
        };

        const handleOffline = () => {
            navigate('/offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [navigate]);
}
