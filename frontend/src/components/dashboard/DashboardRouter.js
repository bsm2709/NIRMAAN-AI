import React, { lazy, Suspense, useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

// Use lazy loading to avoid circular dependencies
const CitizenDashboard = lazy(() => import('./CitizenDashboard'));
const OfficialDashboard = lazy(() => import('./OfficialDashboard'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

const DashboardRouter = () => {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  
  useEffect(() => {
    if (currentUser) {
      setRole(currentUser.role);
    }
  }, [currentUser]);

  // Loading state
  if (!role) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render the appropriate dashboard based on user role
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    }>
      {role === 'admin' && <AdminDashboard />}
      {role === 'official' && <OfficialDashboard />}
      {role === 'citizen' && <CitizenDashboard />}
    </Suspense>
  );
};

export default DashboardRouter;