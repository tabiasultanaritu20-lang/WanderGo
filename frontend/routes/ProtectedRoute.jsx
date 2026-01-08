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

    // 4. Check Personalization
    try {
        let user = {};
        try {
            const storedUser = localStorage.getItem('user');
            user = storedUser ? JSON.parse(storedUser) : {};
        } catch (parseError) {
            console.error("Error parsing user from localStorage", parseError);
            user = {};
        }

        // Normalize path to remove trailing slash for consistent comparison
        // Exception: keep root "/" as "/"
        const currentPath = location.pathname.length > 1 && location.pathname.endsWith('/') 
            ? location.pathname.slice(0, -1) 
            : location.pathname;

        // If NOT personalized and NOT currently on the personalization page, redirect there.
        // using !user.isPersonalized covers 'false' and 'undefined' (legacy localStorage data)
        if (!user.isPersonalized && currentPath !== '/personalization') {
            return <Navigate to="/personalization" replace />;
        }
    } catch (e) {
        console.error("Error in ProtectedRoute logic", e);
    }

    // 5. If token exists, show the protected content
    return <Outlet />;
};

export default ProtectedRoute;