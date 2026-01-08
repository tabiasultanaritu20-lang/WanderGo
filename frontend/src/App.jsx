
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from '../src/pages/SignUp.jsx'
import Login from '../src/pages/Login.jsx'
import Dashboard from '../src/pages/Dashboard.jsx'
// import AgencyRegister from "../pages/AgencyRegister";
import CreateTourForm from "../src/pages/CreateTourForm.jsx";
import EmergencyHub from "../src/pages/EmergencyHub.jsx";
import TravelBlogFeed from "../src/pages/TravelBlogFeed.jsx";
import NavTabs from "../src/components/NavTabs.jsx";
import Home from "../src/pages/Home.jsx";
import SpotDirectory from "../src/pages/SpotDirectory.jsx";
import VisaDocs from "../src/pages/VisaDocs.jsx";
import Chatbot from "../src/components/Chatbot.jsx";

function App() {
    return (
        <BrowserRouter>
            <NavTabs />
            <Chatbot />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/packages" element={<Dashboard />} />
                {/*<Route path="/agency-register" element={<AgencyRegister />} />*/}
                <Route path="/create-tour" element={<CreateTourForm token={localStorage.getItem("token")} />} />
                <Route path="/emergency" element={<EmergencyHub />} />
                <Route path="/blogs" element={<TravelBlogFeed />} />
                <Route path="/home" element={<Home />} />
                <Route path="/spots" element={<SpotDirectory />} />
                <Route path="/visa-docs" element={<VisaDocs />} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
