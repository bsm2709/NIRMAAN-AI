import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress, Tooltip } from '@mui/material';
import { ArrowBack, Map, Construction, TrendingUp, Speed, Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const CitizenDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch public projects
        const response = await axios.get('/projects');
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleViewMap = () => {
    navigate('/map');
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
              Citizen Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ color: 'var(--text-light)' }}>
              Welcome, {currentUser?.username || 'Citizen'}! Track construction projects in your area with real-time updates.
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="View projects on interactive map">
          <Button 
            variant="contained" 
            startIcon={<Map />}
            onClick={handleViewMap}
            className="view-map-btn glow"
            sx={{ 
              background: 'linear-gradient(135deg, var(--success), #22c55e)',
              '&:hover': {
                background: 'linear-gradient(135deg, #22c55e, #16a34a)'
              }
            }}
          >
            View Projects Map
          </Button>
        </Tooltip>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom className="section-title">
        Nearby Construction Projects
      </Typography>

      {projects.length === 0 ? (
        <Typography variant="body1" align="center" className="no-projects">
          No projects available at the moment.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card className="project-card">
                <CardContent>
                  <Box className="card-title-row" mb={1}>
                    <Typography variant="h6" component="h3">
                      {project.name}
                    </Typography>
                    <span className={`status-badge ${
                      project.status === 'delayed' ? 'status-badge--delayed' :
                      project.status === 'completed' ? 'status-badge--completed' :
                      project.status === 'planned' ? 'status-badge--planned' :
                      'status-badge--inprogress'
                    }`}>
                      {project.status.replace('_',' ')}
                    </span>
                  </Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Location:</strong> {project.location}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Progress:</strong> {project.progress}%
                  </Typography>
                  <Box className="progress-bar-modern" mt={1}>
                    <Box sx={{ width: `${project.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))' }} />
                  </Box>
                  {project.delay_status && (
                    <Typography variant="body2" color="error" gutterBottom>
                      <strong>Delay:</strong> {project.delay_status}
                    </Typography>
                  )}
                  <Box mt={2}>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      size="small"
                      onClick={() => handleViewProject(project.id)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box className="dashboard-footer" mt={4}>
        <Typography variant="body2" color="textSecondary" align="center">
          Have concerns about a project? Report issues directly from the project details page.
        </Typography>
      </Box>
    </Container>
  );
};

export default CitizenDashboard;