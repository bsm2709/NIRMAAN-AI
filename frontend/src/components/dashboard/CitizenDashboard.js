import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Button, Box, CircularProgress } from '@mui/material';
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
        const response = await axios.get('http://localhost:5000/projects');
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
      <Box className="dashboard-header">
        <Typography variant="h4" component="h1" gutterBottom>
          Citizen Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome, {currentUser?.username || 'Citizen'}! Track construction projects in your area.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleViewMap}
          className="view-map-btn"
        >
          View Projects Map
        </Button>
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
                  <Typography variant="h6" component="h3" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Location:</strong> {project.location}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Status:</strong> {project.status}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    <strong>Progress:</strong> {project.progress}%
                  </Typography>
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