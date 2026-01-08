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

// --- Components ---
import ProtectedRoute from "../routes/ProtectedRoute.jsx";
import UserDashboard from "./pages/userDashboard/UserDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import UserPanel from "./pages/userDashboard/UserDashboard.jsx"; // Import the new component

function App() {
    // Check if user is logged in (Simple check)
    // You can also check your Context or Redux state here if you have it
    const isAuthenticated = !!localStorage.getItem("token");

    return (
        <BrowserRouter>
            <Routes>
                {/* --- Public Routes (Accessible by anyone) --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Optional: Leave Wheel public, or move to protected if needed */}
                <Route path="/wheel" element={<DestinationWheel />} />

                {/* --- Protected Routes (Login required) --- */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<MainDash />} />
                    <Route path="/EmergencyHub" element={<EmergencyHub />} />
                    <Route path="/user-dashboard" element={<UserDashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/userPanel" element={<UserPanel />} />

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
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;