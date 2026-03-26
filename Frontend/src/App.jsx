import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import { setIsUserLoaded, setIsUserLoading, setUserDetails } from "./store/user.slice";

import Home from "./pages/Home";
import HomeLander from "./pages/HomeLander";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import CreateWorkspace from "./pages/CreateWorkspace";
import Loading from "./components/Loading";
import DashboardContent from "./pages/DashboardContent";
import DashboardLayout from "../Layout/DashboardLayout";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import Settings from "./pages/Settings";
import Axios from "./utils/axios";
import { apiList } from "./common/apiList";
import { setCurrWorkspace, setIsWorkspaceLoaded, setIsWorkspaceLoading, setWorkspaceMember, setWorkspaces } from "./store/workspace.slice";
import InvitePage from "./pages/InvitePage";
import LoginProtect from "./pages/LoginProtect";
// import { useState } from "react";
import { ToastContainer, Zoom } from "react-toastify";
import { setIsProjectLoaded, setIsProjectLoading, setProjects } from "./store/project.slice";
import ProjectDetail from "./pages/ProjectDetail";
import TaskDetail from "./pages/TaskDetail";
import ProjectSettings from "./pages/ProjectSettings";


const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.userDetails);
  const { currWorkspace } = useSelector(state => state.workspace)
  const { isUserLoaded, } = useSelector((state) => state.user);
  const { isWorkspaceLoaded } = useSelector((state) => state.workspace);
  const { isProjectLoaded } = useSelector((state) => state.project);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch(setIsUserLoading(true))
        const response = await Axios({
          ...apiList.getUser,
        })
        if (response) {
          dispatch(setIsUserLoading(false))
        }
        if (response.data.success) {
          let data = response.data.data
          dispatch(setUserDetails(data))
          dispatch(setIsWorkspaceLoaded(true))
        }
      } catch (error) {
        console.error(error)
      } finally {
        dispatch(setIsUserLoaded(true))
        dispatch(setIsUserLoading(false))
      }
    }
    if (!isUserLoaded) {
      fetchUser()
    }
  }, [isUserLoaded, dispatch])

  useEffect(() => {
    const getWorkspaces = async () => {
      try {
        dispatch(setIsWorkspaceLoading(true))
        const response = await Axios({
          ...apiList.getWorkspaces,
        })
        if (response) {
          dispatch(setIsWorkspaceLoading(false))
        }
        if (response.data.success) {
          let data = response.data.data
          dispatch(setWorkspaces(data))
          dispatch(setCurrWorkspace(data[0]))
          dispatch(setIsWorkspaceLoaded(true))
          if (isWorkspaceLoaded) {
            dispatch(setIsWorkspaceLoading(false))
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        dispatch(setIsWorkspaceLoaded(true))
        dispatch(setIsWorkspaceLoading(false))
      }
    }
    if (!isWorkspaceLoaded) {
      getWorkspaces()
    }
  }, [isWorkspaceLoaded, dispatch])


  useEffect(() => {
    const getWorkspaceMembers = async () => {
      try {
        const response = await Axios({
          ...apiList.getWorkspaceMembers,
          data: {
            workspaceId: currWorkspace?._id
          }
        })
        if (response.data.success) {
          dispatch(setWorkspaceMember(response.data.data))
        }
      } catch (error) {
        console.error(error)
      }
    }
    getWorkspaceMembers()
  }, [currWorkspace?._id, dispatch])

  useEffect(() => {
    if (!currWorkspace._id) return
    const getProjects = async () => {
      try {
        dispatch(setIsProjectLoading(true))
        const response = await Axios({
          ...apiList.getProjects,
          data: {
            workspaceId: currWorkspace?._id
          }
        })
        console.log(response)
        if (response.data.success) {
          dispatch(setProjects(response.data.data))
        }
      } catch (error) {
        console.error(error)
      } finally {
        dispatch(setIsProjectLoading(false))
        dispatch(setIsProjectLoaded(true))
      }
    }
    if (!isProjectLoaded) {
      getProjects()
    }


  }, [currWorkspace?._id, dispatch, isProjectLoaded])




  // if (isUserLoading) return  <Loading />
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
        theme="dark"
        transition={Zoom} />

      <Routes>
        {/*  <Route path="/" element={user?._id ?  <DashboardLayout /> :  <HomeLander />} /> */}
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route
          path="/create-workspace"
          element={
            <LoginProtect>
              <CreateWorkspace />
            </LoginProtect>
          } />

        <Route path="/invite/:inviteToken" element={<InvitePage />} />


        <Route path="/" element={user?._id ? <LoginProtect>
          <DashboardLayout />
        </LoginProtect> : <HomeLander />} >

          <Route index element={<DashboardContent />} />
        </Route>
        <Route path="/projects" element={<DashboardLayout />}>
          <Route index element={<LoginProtect> <Projects /> </LoginProtect>} />
        </Route>
        <Route path="/projects/:projectId" element={<DashboardLayout />}>
          <Route index element={<LoginProtect> <ProjectDetail />  </LoginProtect>} />
        </Route>
        <Route path="/projects/:projectId/settings" element={<DashboardLayout />}>
          <Route index element={<LoginProtect> <ProjectSettings /> </LoginProtect>} />
        </Route>
        <Route path="/projects/:projectId/tasks/:taskId" element={<DashboardLayout />}>
          <Route index element={<LoginProtect> <TaskDetail /> </LoginProtect>} />
        </Route>

        <Route path="/team" element={<DashboardLayout />}>
          <Route index element={<LoginProtect> <Team /> </LoginProtect>} />
        </Route>

        <Route path="/settings" element={<DashboardLayout />}>
          <Route index element={<LoginProtect> <Settings /> </LoginProtect>} />
        </Route>
      </Routes >
      {/*  </ToastContainer> */}

    </>
  );

};

export default App;
