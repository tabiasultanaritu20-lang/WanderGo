import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");

    // If token exists, render the child routes (Outlet)
    // If not, redirect to Login
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;