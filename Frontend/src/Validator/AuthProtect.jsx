import { useSelector } from "react-redux";

const AuthProtect = ({ children }) => {
    const user = useSelector((state) => state.user.userDetails);
    if (!user || !user._id) return <Navigate to="/sign-in" />;
    return children;
};
export default AuthProtect;