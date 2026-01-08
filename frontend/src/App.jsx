
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import React, { Suspense, lazy } from 'react'
import NavTabs from '../src/components/NavTabs.jsx'
import Chatbot from '../src/components/Chatbot.jsx'
const SignUp = lazy(() => import('../src/pages/SignUp.jsx'))
const Login = lazy(() => import('../src/pages/Login.jsx'))
const Dashboard = lazy(() => import('../src/pages/Dashboard.jsx'))
const CreateTourForm = lazy(() => import('../src/pages/CreateTourForm.jsx'))
const EmergencyHub = lazy(() => import('../src/pages/EmergencyHub.jsx'))
const TravelBlogFeed = lazy(() => import('../src/pages/TravelBlogFeed.jsx'))
const Home = lazy(() => import('../src/pages/Home.jsx'))
const SpotDirectory = lazy(() => import('../src/pages/SpotDirectory.jsx'))
const VisaDocs = lazy(() => import('../src/pages/VisaDocs.jsx'))

function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="p-6 text-slate-700">Loading…</div>}>
                <NavTabs />
                <Chatbot />
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/packages" element={<Dashboard />} />
                    <Route path="/create-tour" element={<CreateTourForm token={localStorage.getItem("token")} />} />
                    <Route path="/emergency" element={<EmergencyHub />} />
                    <Route path="/blogs" element={<TravelBlogFeed />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/spots" element={<SpotDirectory />} />
                    <Route path="/visa-docs" element={<VisaDocs />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
