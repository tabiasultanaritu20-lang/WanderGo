import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// all pages are inside src/pages
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import AgencyRegister from "./pages/AgencyRegister.jsx";
import CreateTourForm from "./pages/CreateTourForm.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default route – send to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* emergency hub */}
        <Route path="/emergency" element={<EmergencyHub />} />

        {/* travel blog feed */}
        <Route path="/blogs" element={<TravelBlogFeed />} />

        {/* agency & tour routes */}
        <Route path="/agency-register" element={<AgencyRegister />} />
        <Route path="/create-tour" element={<CreateTourForm />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/emergency" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;