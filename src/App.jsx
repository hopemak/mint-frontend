import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Landing from './pages/Landing/Landing.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import IdeaSubmission from './pages/Dashboard/IdeaSubmission.jsx'
import Profile from './pages/Dashboard/Profile.jsx'
import Startups from './pages/Startups/Startups.jsx'
import CreateStartup from './pages/Startups/CreateStartup.jsx'
import Evaluation from './pages/Evaluation/Evaluation.jsx'
import Workspace from './pages/Workspace/Workspace.jsx'
import PrototypeCenter from './pages/Prototype/PrototypeCenter.jsx'
import Analytics from './pages/Analytics/Analytics.jsx'
import Recommendations from './pages/Recommendations/Recommendations.jsx'
import Mentors from './pages/Recommendations/Mentors.jsx'
import Admin from './pages/Admin/Admin.jsx'
import Chatbot from './pages/Chatbot/Chatbot.jsx'
import Funding from './pages/Funding/Funding.jsx'
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/idea-submission" element={<IdeaSubmission />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/startups" element={<Startups />} />
          <Route path="/startups/create" element={<CreateStartup />} />
          <Route path="/evaluate" element={<Evaluation />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/prototype" element={<PrototypeCenter />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/mentors" element={<Mentors />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/funding" element={<Funding />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  )
}
