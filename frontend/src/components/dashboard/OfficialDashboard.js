import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, Box, 
  CircularProgress, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const OfficialDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch all projects (officials can see all projects)
        const projectsResponse = await axios.get('http://localhost:5000/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch unresolved comments/issues (handle error gracefully)
        try {
          const commentsResponse = await axios.get('http://localhost:5000/projects/comments/unresolved', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setComments(commentsResponse.data);
        } catch (commentErr) {
          console.log('No comments endpoint available, setting empty array');
          setComments([]);
        }
        
        setProjects(projectsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}/manage`);
  };

  const handleAddProject = () => {
    navigate('/projects/new');
  };

  const handleViewMap = () => {
    navigate('/map');
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
          Official Dashboard
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Welcome, {currentUser?.username || 'Official'}! Manage and monitor construction projects.
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h5" component="h2" gutterBottom className="section-title">
            All Projects
          </Typography>
          
          {projects.length === 0 ? (
            <Typography variant="body1" align="center" className="no-projects">
              No projects available at the moment.
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
                    <TableCell>Assigned To</TableCell>
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
                      <TableCell>
                        {project.manager_id === currentUser?.id ? (
                          <Chip 
                            label="You" 
                            color="primary" 
                            size="small" 
                          />
                        ) : (
                          <Chip 
                            label="Other Official" 
                            color="default" 
                            size="small" 
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outlined" 
                          color="primary" 
                          size="small"
                          onClick={() => handleViewProject(project.id)}
                        >
                          {project.manager_id === currentUser?.id ? 'Manage' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="h5" component="h2" gutterBottom className="section-title">
            Unresolved Issues
          </Typography>
          
          {comments.length === 0 ? (
            <Card className="comments-card">
              <CardContent>
                <Typography variant="body1" align="center">
                  No unresolved issues at the moment.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card className="comments-card">
              <CardContent>
                {comments.map((comment) => (
                  <Box key={comment.id} className="comment-item">
                    <Typography variant="subtitle2">
                      Re: {comment.project_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {comment.content}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                      <Typography variant="caption" color="textSecondary">
                        By: {comment.author_name || 'Unknown User'} • {new Date(comment.created_at).toLocaleDateString()}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        size="small"
                        onClick={() => handleViewProject(comment.project_id)}
                      >
                        Resolve
                      </Button>
                    </Box>
                    <Box mt={2} mb={2} borderBottom={1} borderColor="divider" />
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default OfficialDashboard;