import { useDispatch, useSelector } from "react-redux";
import { ToastContainer, Zoom } from "react-toastify";


// ? Hooks

import { useUser } from "./hooks/useUser";
import { useAllWorkspaceTasks } from "./hooks/useAllWorkspaceTasks";
import { useProject } from "./hooks/useProject";
import { useWorkspace } from "./hooks/useWorkspace"
import { useWorkspaceMember } from "./hooks/useWorkspaceMember";
import AppRoutes from "./Routes/AppRoutes";


const App = () => {
  const dispatch = useDispatch();
  const { currWorkspace } = useSelector(state => state.workspace)

  useUser();
  useWorkspace();
  useProject();
  useAllWorkspaceTasks()
  useWorkspaceMember({ currWorkspace, dispatch })

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
