
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from '../pages/SignUp.jsx'
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import EmergencyHub from '../pages/EmergencyHub.jsx'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/emergency" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/emergency" element={<EmergencyHub />} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/emergency" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

