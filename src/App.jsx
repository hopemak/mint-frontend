import { Toaster } from 'react-hot-toast';
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleRoute from './components/RoleRoute.jsx'
import Landing from './pages/Landing/Landing.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import IdeaSubmission from './pages/Dashboard/IdeaSubmission.jsx'
import Profile from './pages/Dashboard/Profile.jsx'
import Startups from './pages/Startups/Startups.jsx'
import CreateStartup from './pages/Startups/CreateStartup.jsx'
import StartupDetail from './pages/Startups/StartupDetail.jsx'
import EditStartup from './pages/Startups/EditStartup.jsx'
import Evaluation from './pages/Evaluation/Evaluation.jsx'
import Workspace from './pages/Workspace/Workspace.jsx'
import PrototypeCenter from './pages/Prototype/PrototypeCenter.jsx'
import Analytics from './pages/Analytics/Analytics.jsx'
import Recommendations from './pages/Recommendations/Recommendations.jsx'
import Mentors from './pages/Recommendations/Mentors.jsx'
import Admin from './pages/Admin/Admin.jsx'
import Chatbot from './pages/Chatbot/Chatbot.jsx'
import Funding from './pages/Funding/Funding.jsx'
import Restricted from './pages/Restricted/Restricted.jsx'

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mentors" element={<Mentors />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/restricted" element={<Restricted />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mentors" element={<Mentors />} />

          <Route element={<RoleRoute allow={['founder', 'mentor', 'investor', 'admin']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<RoleRoute allow={['founder']} />}>
            <Route path="/idea-submission" element={<IdeaSubmission />} />
            <Route path="/startups/create" element={<CreateStartup />} />
            <Route path="/startups/:id/edit" element={<EditStartup />} />
            <Route path="/evaluate" element={<Evaluation />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Route>


          <Route element={<RoleRoute allow={['founder', 'investor']} />}>
            <Route path="/funding" element={<Funding />} />
          </Route>

          <Route element={<RoleRoute allow={['founder', 'admin']} />}>
            <Route path="/startups" element={<Startups />} />
            <Route path="/startups/:id" element={<StartupDetail />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/prototype" element={<PrototypeCenter />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>

          <Route element={<RoleRoute allow={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  )
}
