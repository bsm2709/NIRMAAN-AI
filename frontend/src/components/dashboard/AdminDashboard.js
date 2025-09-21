import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, Box, 
  CircularProgress, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch all projects
        const projectsResponse = await axios.get('http://localhost:5000/projects/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch all users
        const usersResponse = await axios.get('http://localhost:5000/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load admin dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}/manage`);
  };

  const handleAddProject = () => {
    navigate('/projects/new');
  };

  const handleViewMap = () => {
    navigate('/map');
  };

  const handleManageUser = (userId) => {
    navigate(`/users/${userId}/manage`);
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'primary';
      case 'delayed': return 'error';
      case 'planned': return 'info';
      default: return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch(role.toLowerCase()) {
      case 'admin': return 'error';
      case 'official': return 'primary';
      case 'citizen': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container className="dashboard-container">
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container className="dashboard-container">
      <Box className="dashboard-header">
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome, {currentUser?.username || 'Admin'}! Manage all system aspects.
        </Typography>
        <Box className="dashboard-actions">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleAddProject}
            className="action-btn"
          >
            Add New Project
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleViewMap}
            className="action-btn"
          >
            View Projects Map
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="admin dashboard tabs">
          <Tab label="Projects" />
          <Tab label="Users" />
          <Tab label="System Stats" />
        </Tabs>
      </Box>

      {/* Projects Tab */}
      {activeTab === 0 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom className="section-title">
            All Projects
          </Typography>
          
          {projects.length === 0 ? (
            <Typography variant="body1" align="center" className="no-projects">
              No projects in the system yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} className="projects-table">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Assigned Official</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{project.location}</TableCell>
                      <TableCell>
                        <Chip 
                          label={project.status} 
                          color={getStatusColor(project.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{project.progress}%</TableCell>
                      <TableCell>{project.official_name || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small"
                          onClick={() => handleViewProject(project.id)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === 1 && (
        <>
          <Typography variant="h5" component="h2" gutterBottom className="section-title">
            System Users
          </Typography>
          
          {users.length === 0 ? (
            <Typography variant="body1" align="center">
              No users in the system yet.
            </Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={getRoleColor(user.role)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small"
                          onClick={() => handleManageUser(user.id)}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* System Stats Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card className="stats-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>Projects</Typography>
                <Typography variant="h3" color="primary">{projects.length}</Typography>
                <Box mt={2}>
                  <Typography variant="body2">
                    <strong>Completed:</strong> {projects.filter(p => p.status.toLowerCase() === 'completed').length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>In Progress:</strong> {projects.filter(p => p.status.toLowerCase() === 'in progress').length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Delayed:</strong> {projects.filter(p => p.status.toLowerCase() === 'delayed').length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="stats-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>Users</Typography>
                <Typography variant="h3" color="primary">{users.length}</Typography>
                <Box mt={2}>
                  <Typography variant="body2">
                    <strong>Admins:</strong> {users.filter(u => u.role.toLowerCase() === 'admin').length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Officials:</strong> {users.filter(u => u.role.toLowerCase() === 'official').length}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Citizens:</strong> {users.filter(u => u.role.toLowerCase() === 'citizen').length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="stats-card">
              <CardContent>
                <Typography variant="h6" gutterBottom>System Health</Typography>
                <Typography variant="h3" color="success">Good</Typography>
                <Box mt={2}>
                  <Typography variant="body2">
                    <strong>Last Backup:</strong> {new Date().toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Server Uptime:</strong> 99.9%
                  </Typography>
                  <Typography variant="body2">
                    <strong>API Status:</strong> Operational
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AdminDashboard;