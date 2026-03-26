import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const LoginProtect = ({ children }) => {
    const user = useSelector((state) => state.user.userDetails);

    if (!user || !user._id) {
        return (
            <div style={{
                width: "100vw",
                height: "100vh",
                backgroundColor:"var(--surface)"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "absolute",
                    padding: "2rem",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "13px",
                    border: "var(--border)",
                    width: "fit-content",
                    backgroundColor: "#fefefe",
                    // boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                    textAlign: "center"
                }}>
                    <p style={{
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "var(--text-normal2)",
                        marginBottom: "1rem"
                    }}>
                        Please login to access this page.
                    </p>
                    <Link
                        className='primary-button'
                        to="/sign-in"
                    >
                        Login
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default LoginProtect;
