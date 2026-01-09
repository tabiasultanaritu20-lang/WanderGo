import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// --- Pages ---
import DestinationWheel from "./pages/DestinationWheel";
import SignUp from './pages/SignUp.jsx'
import Login from './pages/Login.jsx'
import MainDash from "./pages/DashboardMain.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import BlogDetails from "./pages/BlogDetails.jsx";
import BlogForm from "./pages/BlogForm.jsx";
import SavedBlogs from "./pages/SavedBlogs.jsx";
import CreateTourForm from "./pages/CreateTourForm.jsx";
import SpotDirectory from "./pages/SpotDirectory.jsx";
import VisaDocs from "./pages/VisaDocs.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Cart from "./pages/Cart.jsx";
import Personalization from "./pages/Personalization.jsx";

// --- Components ---
import ProtectedRoute from "../routes/ProtectedRoute.jsx";
import UserDashboard from "./pages/userDashboard/UserDashboard.jsx";
import Nav from "./components/Nav.jsx";
import Chatbot from "./components/Chatbot.jsx";

function App() {
    // Check if user is logged in
    const isAuthenticated = !!localStorage.getItem("token");

    return (
        <BrowserRouter>
            <Routes>
                {/* --- Public Routes --- */}

                {/* FIX: Smart Home Route.
                    If logged in -> Go to Dashboard.
                    If not -> Go to Login.
                    This stops the "Wheel redirect loop".
                */}
                <Route 
                    path="/" 
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
                />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/wheel" element={<DestinationWheel />} />

                {/* --- Protected Routes (Login required) --- */}
                {/* This uses the Updated ProtectedRoute with <Outlet /> */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<><Nav /><Chatbot /><MainDash /></>} />
                    <Route path="/EmergencyHub" element={<><Nav /><Chatbot /><EmergencyHub /></>} />
                    <Route path="/packages" element={<><Nav /><Chatbot /><Dashboard /></>} />
                    <Route path="/spots" element={<><Nav /><Chatbot /><SpotDirectory /></>} />
                    <Route path="/visa-docs" element={<><Nav /><Chatbot /><VisaDocs /></>} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/personalization" element={<Personalization />} />
                    
                    {/* User Dashboard & Profile */}
                    <Route path="/user-dashboard" element={<><Nav /><Chatbot /><UserDashboard /></>} />
                    <Route path="/userPanel" element={<><Nav /><Chatbot /><UserDashboard /></>} /> {/* Duplicate handled */}
                    <Route path="/profile" element={<><Nav /><Chatbot /><Profile /></>} />
                    
                    {/* Blog Routes */}
                    <Route path="/blog" element={<><Nav /><Chatbot /><TravelBlogFeed /></>} />
                    <Route path="/blog/new" element={<><Nav /><Chatbot /><BlogForm /></>} />
                    <Route path="/blog/:id" element={<><Nav /><Chatbot /><BlogDetails /></>} />
                    <Route path="/blog/:id/edit" element={<><Nav /><Chatbot /><BlogForm /></>} />
                    
                    {/* Saved Blogs */}
                    <Route path="/saved" element={<><Nav /><Chatbot /><SavedBlogs /></>} />
                    <Route path="/saved-blogs" element={<><Nav /><Chatbot /><SavedBlogs /></>} />
                    
                    {/* Tour Creation */}
                    <Route
                        path="/create-tour"
                        element={<><Nav /><Chatbot /><CreateTourForm token={localStorage.getItem("token")} /></>}
                    />

                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
