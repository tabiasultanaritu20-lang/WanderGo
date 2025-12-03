// src/App.jsx
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./pages/SignUp.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateTourForm from "./pages/CreateTourForm.jsx";

// teammates' pages
import TravelBlogFeed from "./pages/TravelBlogFeed.jsx";
import EmergencyHub from "./pages/EmergencyHub.jsx";
// if you have an AgencyRegister page later:
// import AgencyRegister from "./pages/AgencyRegister.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* main app pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/create-tour"
          element={<CreateTourForm token={localStorage.getItem("token")} />}
        />

        {/* everyone’s features */}
        <Route path="/blog-feed" element={<TravelBlogFeed />} />
        <Route path="/emergency" element={<EmergencyHub />} />
        {/* <Route path="/agency-register" element={<AgencyRegister />} /> */}

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;