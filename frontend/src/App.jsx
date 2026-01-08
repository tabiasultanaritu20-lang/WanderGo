import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// --- Pages ---
import DestinationWheel from "./pages/DestinationWheel";
import SignUp from '../src/pages/SignUp.jsx'
import Login from '../src/pages/Login.jsx'
import MainDash from "./pages/DashboardMain.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import BlogDetails from "./pages/BlogDetails.jsx";
import BlogForm from "./pages/BlogForm.jsx";
import SavedBlogs from "./pages/SavedBlogs.jsx";
import CreateTourForm from "../src/pages/CreateTourForm.jsx";
import Profile from "./pages/Profile.jsx";

// --- Components ---
import ProtectedRoute from "../routes/ProtectedRoute.jsx";
import UserDashboard from "./pages/userDashboard/UserDashboard.jsx";

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
                    element={isAuthenticated ? <MainDash /> : <Login />} 
                />

                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/wheel" element={<DestinationWheel />} />

                {/* --- Protected Routes (Login required) --- */}
                {/* This uses the Updated ProtectedRoute with <Outlet /> */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<MainDash />} />
                    <Route path="/EmergencyHub" element={<EmergencyHub />} />
                    
                    {/* User Dashboard & Profile */}
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                    <Route path="/userPanel" element={<UserDashboard />} /> {/* Duplicate handled */}
                    <Route path="/profile" element={<Profile />} />

                    {/* Blog Routes */}
                    <Route path="/blog" element={<TravelBlogFeed />} />
                    <Route path="/blog/new" element={<BlogForm />} />
                    <Route path="/blog/:id" element={<BlogDetails />} />
                    <Route path="/blog/:id/edit" element={<BlogForm />} />

                    {/* Saved Blogs */}
                    <Route path="/saved" element={<SavedBlogs />} />
                    <Route path="/saved-blogs" element={<SavedBlogs />} />

                    {/* Tour Creation */}
                    <Route
                        path="/create-tour"
                        element={<CreateTourForm token={localStorage.getItem("token")} />}
                    />
                </Route>

                {/* 404 Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;
