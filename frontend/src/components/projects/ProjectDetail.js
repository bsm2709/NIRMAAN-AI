import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, Box, 
  CircularProgress, Divider, TextField, Paper, Chip, LinearProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import './Projects.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch project details
        const projectResponse = await axios.get(`http://localhost:5000/projects/${projectId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        // Fetch project comments
        const commentsResponse = await axios.get(`http://localhost:5000/projects/${projectId}/comments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setProject(projectResponse.data);
        setComments(commentsResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setCommentLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { from: `/projects/${projectId}` } });
        return;
      }
      
      console.log('Submitting comment:', newComment);
      const response = await axios.post(`http://localhost:5000/projects/${projectId}/comments`, 
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('Comment response:', response.data);
      
      // Add the new comment to the list
      setComments(prevComments => [...prevComments, response.data]);
      setNewComment('');
      setCommentLoading(false);
      
      console.log('Comments after adding:', [...comments, response.data]);
    } catch (err) {
      console.error('Error submitting comment:', err);
      setCommentLoading(false);
    }
  };

  const handleViewMap = () => {
    navigate('/map');
  };

  const handleGenerateAIPrediction = async () => {
    try {
      setAiLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login', { state: { from: `/projects/${projectId}` } });
        return;
      }
      
      const response = await axios.post(`http://localhost:5000/projects/${projectId}/predict`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update project data with AI predictions
      setProject(prevProject => ({
        ...prevProject,
        predicted_stage: response.data.predicted_stage,
        confidence: response.data.confidence,
        delay_probability: response.data.delay_probability,
        last_prediction_date: new Date().toISOString()
      }));
      
      setAiLoading(false);
    } catch (err) {
      console.error('Error generating AI prediction:', err);
      setError('Failed to generate AI prediction. Please try again.');
      setAiLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
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
      <Container className="project-container">
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!project) {
    return (
      <Container className="project-container">
        <Typography variant="h6" align="center">
          Project not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container className="project-container">
      <Box className="project-header">
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
          <Typography variant="h4" component="h1" gutterBottom>
            {project.name}
          </Typography>
          <Chip 
            label={project.status} 
            color={getStatusColor(project.status)} 
            className="status-chip"
          />
        </Box>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Location:</strong> {project.location}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleViewMap}
          className="view-map-btn"
          size="small"
        >
          View on Map
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className="project-details-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              
              <Box mb={3}>
                <Typography variant="body2" gutterBottom>
                  <strong>Description:</strong> {project.description || 'No description available.'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Start Date:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not specified'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Expected Completion:</strong> {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not specified'}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Budget:</strong> ₹{project.budget ? project.budget.toLocaleString() : 'Not specified'}
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Progress Tracking
              </Typography>
              
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">
                    <strong>Current Progress:</strong>
                  </Typography>
                  <Typography variant="body2">
                    {project.progress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={project.progress || 0} 
                  color={project.delay_status ? "error" : "primary"}
                  className="progress-bar"
                />
              </Box>
              
              {project.delay_status && (
                <Box mb={2} className="delay-info">
                  <Typography variant="body2" color="error">
                    <strong>Delay Status:</strong> {project.delay_status}
                  </Typography>
                  {project.delay_reason && (
                    <Typography variant="body2">
                      <strong>Reason:</strong> {project.delay_reason}
                    </Typography>
                  )}
                </Box>
              )}
              
              <Typography variant="h6" gutterBottom>
                AI Prediction
              </Typography>
              
              <Box className="prediction-box">
                {project.predicted_stage !== null && project.predicted_stage !== undefined ? (
                  <>
                    <Typography variant="body2" gutterBottom>
                      <strong>Predicted Stage:</strong> {project.predicted_stage}/5
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Confidence:</strong> {project.confidence ? `${(project.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Probability of Delay:</strong> {project.delay_probability ? `${(project.delay_probability * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                    {project.last_prediction_date && (
                      <Typography variant="caption" color="textSecondary">
                        Last updated: {new Date(project.last_prediction_date).toLocaleString()}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Box textAlign="center" py={2}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      No AI prediction available yet
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGenerateAIPrediction}
                      disabled={aiLoading}
                      size="small"
                    >
                      {aiLoading ? 'Generating...' : 'Generate AI Prediction'}
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="comments-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comments & Issues
              </Typography>
              
              <Box className="comments-list">
                {comments.length === 0 ? (
                  <Typography variant="body2" align="center" className="no-comments">
                    No comments yet.
                  </Typography>
                ) : (
                  comments.map((comment) => (
                    <Paper key={comment.id} elevation={1} className="comment-item">
                      <Box p={2}>
                        <Typography variant="body2">
                          {comment.content}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" mt={1}>
                          <Typography variant="caption" color="textSecondary">
                            By: {comment.author_name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        {comment.resolved && (
                          <Chip 
                            label="Resolved" 
                            color="success" 
                            size="small" 
                            className="resolved-chip"
                          />
                        )}
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
              
              <Divider className="comment-divider" />
              
              <Box className="comment-form">
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Add a comment or report an issue..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={commentLoading}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || commentLoading}
                  className="submit-comment-btn"
                >
                  {commentLoading ? 'Submitting...' : 'Submit'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectDetail;