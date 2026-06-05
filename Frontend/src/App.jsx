import { ToastContainer, Zoom } from "react-toastify";
import { useEffect, useState } from "react";
// ? Hooks

import { useUser } from "./hooks/useUser";
import { useWorkspace } from "./hooks/useWorkspace"
import AppRoutes from "./Routes/AppRoutes";
// import { useSelector } from "react-redux";

const getToastTheme = (theme = localStorage.getItem("theme")) => {
  return theme === "light" ? "dark" : "light"
}

const App = () => {
  const [toastTheme, setToastTheme] = useState(() => getToastTheme())

  useUser();
  useWorkspace();

  useEffect(() => {
    const handleThemeChange = (event) => {
      setToastTheme(getToastTheme(event.detail?.theme))
    }

    window.addEventListener("themechange", handleThemeChange)

    return () => {
      window.removeEventListener("themechange", handleThemeChange)
    }
  }, [])

  return (
    <>
      <ToastContainer
        key={toastTheme}
        position="bottom-left"
        autoClose={7000}
        hideProgressBar={true}
        newestOnTop={true}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        closeOnClick={false}
        closeButton={false}
        theme={toastTheme}
        transition={Zoom}
        toastClassName="custom-toast"
      />
      <AppRoutes />
    </>
  );

};

export default App;
