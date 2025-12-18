<<<<<<< Updated upstream

import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from '../src/pages/SignUp.jsx'
import Login from '../src/pages/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
// import AgencyRegister from "../pages/AgencyRegister";
import CreateTourForm from "../src/pages/CreateTourForm.jsx";
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import MainDash from "./pages/DashboardMain.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<MainDash />} />
                <Route path="/EmergencyHub" element={<EmergencyHub />} />
                <Route path="/blog" element={<TravelBlogFeed />} />
                <Route path="/create-tour" element={<CreateTourForm token={localStorage.getItem("token")} />} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

=======
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// all pages are inside src/pages
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Dashboard from './pages/Dashboard.jsx'
import TravelBlogFeed from './pages/TravelBlogFeed.jsx'
import AgencyRegister from './pages/AgencyRegister.jsx'
import CreateTourForm from './pages/CreateTourForm.jsx'
import SignUp from '../pages/SignUp.jsx'
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import EmergencyHub from '../pages/EmergencyHub.jsx'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* default route – still sends to login */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* auth routes */}
                <Route path="/" element={<Navigate to="/emergency" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                {/* dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* travel blog feed */}
                <Route path="/blogs" element={<TravelBlogFeed />} />

                {/* agency & tour routes */}
                <Route path="/agency-register" element={<AgencyRegister />} />
                <Route path="/create-tour" element={<CreateTourForm />} />

                <Route path="/emergency" element={<EmergencyHub />} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/emergency" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
>>>>>>> Stashed changes
