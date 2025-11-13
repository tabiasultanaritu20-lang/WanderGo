
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from '../pages/SignUp.jsx'
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import AgencyRegister from "../pages/AgencyRegister";
import CreateTourForm from "../pages/CreateTourForm.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agency-register" element={<AgencyRegister />} />
                <Route path="/create-tour" element={<CreateTourForm />} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

