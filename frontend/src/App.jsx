
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from '../src/pages/SignUp.jsx'
import Login from '../src/pages/Login.jsx'
import Dashboard from '../src/pages/Dashboard.jsx'
// import AgencyRegister from "../pages/AgencyRegister";
import CreateTourForm from "../src/pages/CreateTourForm.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/*<Route path="/agency-register" element={<AgencyRegister />} />*/}
                <Route path="/create-tour" element={<CreateTourForm token={localStorage.getItem("token")} />} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

