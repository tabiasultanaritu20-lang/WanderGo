import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUp from '../src/pages/SignUp.jsx'
import Login from '../src/pages/Login.jsx'
// import Dashboard from './components/Dashboard.jsx' // You seem to be using MainDash instead
import DestinationWheel from "./pages/DestinationWheel";
import CreateTourForm from "../src/pages/CreateTourForm.jsx";
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import MainDash from "./pages/DashboardMain.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";
import BlogDetails from "./pages/BlogDetails.jsx";
import BlogForm from "./pages/BlogForm.jsx";
import SavedBlogs from "./pages/SavedBlogs.jsx"; 

function App() {
    // Check if user is logged in (Simple check)
    // You can also check your Context or Redux state here if you have it
    const isAuthenticated = !!localStorage.getItem("token");

    return (
        <BrowserRouter>
            <Routes>
                {/* --- THE FIX IS HERE --- */}
                {/* If logged in, go to MainDash. If not, go to Login. */}
                <Route 
                    path="/" 
                    element={isAuthenticated ? <MainDash /> : <Login />} 
                />

                <Route path="/wheel" element={<DestinationWheel />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* You can keep this or remove it since '/' now handles it */}
                <Route path="/dashboard" element={<MainDash />} />
                
                <Route path="/EmergencyHub" element={<EmergencyHub />} />
                
                {/* BLOG ROUTES */}
                <Route path="/blog" element={<TravelBlogFeed />} />
                <Route path="/blog/new" element={<BlogForm />} />
                <Route path="/blog/:id" element={<BlogDetails />} />
                <Route path="/blog/:id/edit" element={<BlogForm />} />
                
                {/* SAVED BLOG ROUTES */}
                <Route path="/saved" element={<SavedBlogs />} />
                <Route path="/saved-blogs" element={<SavedBlogs />} />
                
                <Route path="/create-tour" element={<CreateTourForm token={localStorage.getItem("token")} />} />
                
                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App;