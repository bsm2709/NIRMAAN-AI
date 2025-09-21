import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Predict from './components/Predict';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Project components
import ProjectManagement from './components/projects/ProjectManagement';
import ProjectForm from './components/projects/ProjectForm';
import ProjectDetail from './components/projects/ProjectDetail';
import ProjectMap from './components/map/ProjectMap';

// Import ProtectedRoute
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/predict" element={<Predict />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/map" element={<ProjectMap />} />
                <Route path="/projects/:projectId" element={<ProjectDetail />} />
                
                {/* Protected routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardRouter />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/projects/:projectId/manage" 
                  element={
                    <ProtectedRoute>
                      <ProjectManagement />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/projects/new" 
                  element={
                    <ProtectedRoute>
                      <ProjectForm />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

// Dynamic dashboard router based on user role
const DashboardRouter = () => {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role;
  
  // Import dashboard components dynamically to avoid circular dependencies
  const CitizenDashboard = React.lazy(() => import('./components/dashboard/CitizenDashboard'));
  const OfficialDashboard = React.lazy(() => import('./components/dashboard/OfficialDashboard'));
  const AdminDashboard = React.lazy(() => import('./components/dashboard/AdminDashboard'));
  
  // Show loading state while components are being loaded
  const fallback = (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Loading dashboard...</p>
    </div>
  );
  
  // Return the appropriate dashboard based on user role
  return (
    <React.Suspense fallback={fallback}>
      {userRole === 'admin' ? (
        <AdminDashboard />
      ) : userRole === 'official' ? (
        <OfficialDashboard />
      ) : (
        <CitizenDashboard />
      )}
    </React.Suspense>
  );
};

export default App;
