import { ToastContainer, Zoom } from "react-toastify";
// ? Hooks

import { useUser } from "./hooks/useUser";
import { useWorkspace } from "./hooks/useWorkspace"
import AppRoutes from "./Routes/AppRoutes";
// import { useSelector } from "react-redux";


const App = () => {
  // const user = useSelector((state) => state.user.userDetails);
  // if (user) {

    useUser();
    useWorkspace();

  // }
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={localStorage.getItem('theme') == 'light' ? 'dark' : 'light'}
        transition={Zoom} />
      <AppRoutes />
    </>
  );

};

export default App;
