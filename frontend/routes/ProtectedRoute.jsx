import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
    // 1. Check if token exists
    const token = localStorage.getItem("token");
    
    // 2. Get the current location (URL) the user is trying to visit
    const location = useLocation();

    // 3. If no token, redirect to Login but SAVE the location in state
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 4. If token exists, show the protected content
    return <Outlet />;
};

export default ProtectedRoute;