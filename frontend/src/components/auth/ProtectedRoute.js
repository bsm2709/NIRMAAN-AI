import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * ProtectedRoute component for handling authentication and role-based access control
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array} props.allowedRoles - Optional array of roles allowed to access this route
 * @returns {React.ReactNode} - The protected component or redirect
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect to dashboard if authenticated but not authorized
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and authorized, render the protected component
  return children;
};

export default ProtectedRoute;