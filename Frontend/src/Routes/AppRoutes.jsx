import React, { Suspense } from 'react'
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from "react-router-dom";
import Loading from '../components/Loading';


// ? Pages

const HomeLander = React.lazy(() => import("../pages/HomeLander"))

const SignIn = React.lazy(() => import("../pages/SignIn"))
const SignUp = React.lazy(() => import("../pages/SignUp"))
const ResetPassword = React.lazy(() => import("../pages/ResetPassword"))
const InvitePage = React.lazy(() => import("../pages/InvitePage"))

const CreateWorkspace = React.lazy(() => import("../pages/CreateWorkspace"))

import DashboardContent from "../pages/DashboardContent"

import DashboardLayout from "../../Layout/DashboardLayout"

const Projects = React.lazy(() => import('../pages/Projects'))

const Team = React.lazy(() => import("../pages/Team"))

const Account = React.lazy(() => import("../pages/Account"))
const Settings = React.lazy(() => import("../pages/Settings"))

const Notifications = React.lazy(() => import("../pages/Notifications"))
const Activity = React.lazy(() => import("../pages/Activity"))

const ProjectDetail = React.lazy(() => import("../pages/ProjectDetail"))
const TaskDetail = React.lazy(() => import("../pages/TaskDetail"))

const ProjectSettings = React.lazy(() => import("../pages/ProjectSettings"))

// ? Error Pages

const NotFound = React.lazy(() => import("../pages/NotFound"))
const Forbidden = React.lazy(() => import("../pages/Forbidden"))
const InternalServerError = React.lazy(() => import("../pages/InternalServerError"))
const TooManyRequests = React.lazy(() => import("../pages/TooManyRequests"))
const Offline = React.lazy(() => import("../pages/Offline"))
const ServiceUnavailable = React.lazy(() => import("../pages/ServiceUnavailable"))


// ? Validators

const LoginProtect = React.lazy(() => import("../Validator/LoginProtect"))
const AuthProtect = React.lazy(() => import("../Validator/AuthProtect"))


const AppRoutes = () => {
  const user = useSelector((state) => state.user.userDetails);


  return (
    <Suspense fallback={<Loading />}>
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
        </LoginProtect> : <HomeLander />} 
        >

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
    </Suspense>
  )
}

export default AppRoutes
