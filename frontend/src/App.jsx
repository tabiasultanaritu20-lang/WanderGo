
import './App.css'
import DestinationWheel from "./pages/DestinationWheel";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from '../src/pages/SignUp.jsx'
import Login from '../src/pages/Login.jsx'
import Dashboard from './components/Dashboard.jsx'
// import AgencyRegister from "../pages/AgencyRegister";
import CreateTourForm from "../src/pages/CreateTourForm.jsx";
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import MainDash from "./pages/DashboardMain.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";
import BlogDetails from "./pages/BlogDetails.jsx";  
import BlogForm from "./pages/BlogForm.jsx";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/wheel" element={<DestinationWheel />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<MainDash />} />
                <Route path="/EmergencyHub" element={<EmergencyHub />} />

                {/* BLOG ROUTES */}
                <Route path="/blog" element={<TravelBlogFeed />} />
                <Route path="/blog/new" element={<BlogForm />} />
                <Route path="/blog/:id" element={<BlogDetails />} />
                <Route path="/blog/:id/edit" element={<BlogForm />} />

                <Route path="/create-tour" element={<CreateTourForm token={localStorage.getItem("token")} />} />
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App

