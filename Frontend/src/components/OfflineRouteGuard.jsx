import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OfflineRouteGuard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const isOffline = !navigator.onLine;
    const isOfflinePage = location.pathname === "/offline";

    if (isOffline && !isOfflinePage) {
      navigate("/offline", {
        replace: true,
        state: { from: location.pathname }
      });
    }
  }, [location, navigate]);

  return null;
};

export default OfflineRouteGuard;