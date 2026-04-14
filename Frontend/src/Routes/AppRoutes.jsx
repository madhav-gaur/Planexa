import React from 'react'
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from "react-router-dom";


// ? Pages

import HomeLander from "../pages/HomeLander";

import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import ResetPassword from "../pages/ResetPassword";
import InvitePage from "../pages/InvitePage";

import CreateWorkspace from "../pages/CreateWorkspace";
import DashboardContent from "../pages/DashboardContent";
import DashboardLayout from "../../Layout/DashboardLayout";

import Projects from "../pages/Projects";
import Team from "../pages/Team";

import Account from "../pages/Account";
import Settings from "../pages/Settings";

import Notifications from "../pages/Notifications";
import Activity from "../pages/Activity";

import ProjectDetail from "../pages/ProjectDetail";
import TaskDetail from "../pages/TaskDetail";

import ProjectSettings from "../pages/ProjectSettings";

// ? Error Pages

import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";
import InternalServerError from "../pages/InternalServerError";
import TooManyRequests from "../pages/TooManyRequests";
import Offline from "../pages/Offline";
import ServiceUnavailable from "../pages/ServiceUnavailable";


// ? Validators

import LoginProtect from "../Validator/LoginProtect";
import AuthProtect from "../Validator/AuthProtect";


const AppRoutes = () => {
  const user = useSelector((state) => state.user.userDetails);


  return (

    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/create-workspace" element={
        <AuthProtect>
          <CreateWorkspace />
        </AuthProtect>
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
      <Route path="/notifications" element={<DashboardLayout />}>
        <Route index element={<LoginProtect> <Notifications /> </LoginProtect>} />
      </Route>
      <Route path="/activity" element={<DashboardLayout />}>
        <Route index element={<LoginProtect> <Activity /> </LoginProtect>} />
      </Route>
      <Route path="/account" element={<DashboardLayout />}>
        <Route index element={<LoginProtect> <Account /> </LoginProtect>} />
      </Route>
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="/error" element={<InternalServerError />} />
      <Route path="/too-many-requests" element={<TooManyRequests />} />
      <Route path="/offline" element={<Offline />} />
      <Route path="/maintenance" element={<ServiceUnavailable />} />
      <Route path="*" element={<NotFound />} />

      {/* unknown routes */}
      <Route path="*" element={<NotFound />} />
    </Routes >

  )
}

export default AppRoutes
