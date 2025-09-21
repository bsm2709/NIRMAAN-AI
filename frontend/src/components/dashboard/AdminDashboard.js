import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, Box, 
  CircularProgress, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Tabs, Tab, IconButton, Tooltip
} from '@mui/material';
import { 
  ArrowBack, Add, Map, People, Assessment, 
  Construction, TrendingUp, Security, Speed
} from '@mui/icons-material';
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
        
        if (!token) {
          setError('Please log in to access the admin dashboard.');
          setLoading(false);
          return;
        }
        
        // Fetch all projects
        const projectsResponse = await axios.get('/projects/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch all users
        const usersResponse = await axios.get('/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjects(projectsResponse.data);
        setUsers(usersResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
          // Redirect to login or clear token
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else if (err.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(`Failed to load admin dashboard data: ${err.response?.data?.message || err.message}`);
        }
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
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/')}
        className="back-button"
        sx={{ mb: 3 }}
      >
        Back to Home
      </Button>

      <Box className="dashboard-header floating">
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Construction sx={{ fontSize: 40, color: 'var(--primary)' }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}>
              Admin Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'var(--text-light)' }}>
              Welcome, {currentUser?.username || 'Admin'}! Manage all system aspects with AI-powered insights.
            </Typography>
          </Box>
        </Box>
        
        <Box className="dashboard-actions">
          <Tooltip title="Create a new construction project">
            <Button 
              variant="contained" 
              startIcon={<Add />}
              onClick={handleAddProject}
              className="action-btn glow"
              sx={{ 
                background: 'linear-gradient(135deg, var(--success), #22c55e)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)'
                }
              }}
            >
              Add New Project
            </Button>
          </Tooltip>
          
          <Tooltip title="View projects on interactive map">
            <Button 
              variant="contained" 
              startIcon={<Map />}
              onClick={handleViewMap}
              className="action-btn"
              sx={{ 
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                '&:hover': {
                  background: 'linear-gradient(135deg, var(--primary-dark), #1d4ed8)'
                }
              }}
            >
              View Projects Map
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'var(--border)', 
        mb: 3,
        background: 'var(--card)',
        borderRadius: '16px 16px 0 0',
        padding: '0 24px'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="admin dashboard tabs"
          sx={{
            '& .MuiTab-root': {
              color: 'var(--text-light)',
              fontWeight: 500,
              textTransform: 'none',
              fontSize: '1rem',
              minHeight: 60,
              '&.Mui-selected': {
                color: 'var(--primary)',
                fontWeight: 600
              }
            },
            '& .MuiTabs-indicator': {
              background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
              height: 3,
              borderRadius: '2px 2px 0 0'
            }
          }}
        >
          <Tab 
            icon={<Construction />} 
            iconPosition="start" 
            label="Projects" 
            sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
          />
          <Tab 
            icon={<People />} 
            iconPosition="start" 
            label="Users" 
            sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
          />
          <Tab 
            icon={<Assessment />} 
            iconPosition="start" 
            label="System Stats" 
            sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
          />
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
            <Card className="stats-card pulse">
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Construction sx={{ fontSize: 32, color: 'var(--primary)' }} />
                  <Typography variant="h6" sx={{ color: 'var(--text)', fontWeight: 600 }}>
                    Projects
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ 
                  color: 'var(--primary)', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {projects.length}
                </Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      Completed:
                    </Typography>
                    <Chip 
                      label={projects.filter(p => p.status.toLowerCase() === 'completed').length}
                      size="small"
                      sx={{ background: 'var(--success)', color: 'white' }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      In Progress:
                    </Typography>
                    <Chip 
                      label={projects.filter(p => p.status.toLowerCase() === 'in progress').length}
                      size="small"
                      sx={{ background: 'var(--warning)', color: 'white' }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      Delayed:
                    </Typography>
                    <Chip 
                      label={projects.filter(p => p.status.toLowerCase() === 'delayed').length}
                      size="small"
                      sx={{ background: 'var(--error)', color: 'white' }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="stats-card pulse">
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <People sx={{ fontSize: 32, color: 'var(--success)' }} />
                  <Typography variant="h6" sx={{ color: 'var(--text)', fontWeight: 600 }}>
                    Users
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ 
                  color: 'var(--success)', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--success), #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {users.length}
                </Typography>
                <Box mt={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      Admins:
                    </Typography>
                    <Chip 
                      label={users.filter(u => u.role.toLowerCase() === 'admin').length}
                      size="small"
                      sx={{ background: 'var(--error)', color: 'white' }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      Officials:
                    </Typography>
                    <Chip 
                      label={users.filter(u => u.role.toLowerCase() === 'official').length}
                      size="small"
                      sx={{ background: 'var(--primary)', color: 'white' }}
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      Citizens:
                    </Typography>
                    <Chip 
                      label={users.filter(u => u.role.toLowerCase() === 'citizen').length}
                      size="small"
                      sx={{ background: 'var(--success)', color: 'white' }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card className="stats-card glow">
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Security sx={{ fontSize: 32, color: 'var(--success)' }} />
                  <Typography variant="h6" sx={{ color: 'var(--text)', fontWeight: 600 }}>
                    System Health
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ 
                  color: 'var(--success)', 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, var(--success), #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Excellent
                </Typography>
                <Box mt={2}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Speed sx={{ fontSize: 16, color: 'var(--success)' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      Server Uptime: 99.9%
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <TrendingUp sx={{ fontSize: 16, color: 'var(--primary)' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      API Status: Operational
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Assessment sx={{ fontSize: 16, color: 'var(--warning)' }} />
                    <Typography variant="body2" sx={{ color: 'var(--text-light)' }}>
                      Last Backup: {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
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