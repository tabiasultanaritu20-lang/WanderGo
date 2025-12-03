import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateTourForm from "./pages/CreateTourForm.jsx";
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";

import NavTabs from "./components/NavTabs.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* Navbar always visible */}
      <NavTabs />

      <Routes>
        {/* Default link from vite */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Main Features */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-tour" element={<CreateTourForm />} />
        <Route path="/blog-feed" element={<TravelBlogFeed />} />
        <Route path="/emergency" element={<EmergencyHub />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
