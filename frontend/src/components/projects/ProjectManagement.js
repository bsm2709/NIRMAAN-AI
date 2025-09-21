import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, Button, Box, 
  CircularProgress, TextField, FormControl, InputLabel, Select, 
  MenuItem, Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Chip, Divider
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import './Projects.css';

const ProjectManagement = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state for updating project
  const [updateData, setUpdateData] = useState({
    name: '',
    description: '',
    location: '',
    status: '',
    progress: 0,
    start_date: '',
    end_date: '',
    budget: ''
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`http://localhost:5000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const projectData = response.data;
        setProject(projectData);
        
        // Populate form with current project data
        setUpdateData({
          name: projectData.name || '',
          description: projectData.description || '',
          location: projectData.location || '',
          status: projectData.status || 'planned',
          progress: projectData.progress || 0,
          start_date: projectData.start_date ? projectData.start_date.split('T')[0] : '',
          end_date: projectData.end_date ? projectData.end_date.split('T')[0] : '',
          budget: projectData.budget || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again later.');
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProgressChange = (e) => {
    setUpdateData(prev => ({
      ...prev,
      progress: parseInt(e.target.value)
    }));
  };

  const handleUpdateProject = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`http://localhost:5000/projects/${projectId}/update`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Project updated successfully!');
      setOpenUpdateDialog(false);
      
      // Refresh project data
      const updatedResponse = await axios.get(`http://localhost:5000/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(updatedResponse.data);
      
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleViewMap = () => {
    navigate('/map');
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch(status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in_progress': return 'primary';
      case 'delayed': return 'error';
      case 'planned': return 'info';
      default: return 'default';
    }
  };

  const statusOptions = [
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'delayed', label: 'Delayed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !project) {
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
            Manage Project: {project.name}
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
        <Box className="dashboard-actions">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpenUpdateDialog(true)}
            className="action-btn"
          >
            Update Project
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleViewMap}
            className="action-btn"
          >
            View on Map
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card className="project-details-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Overview
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
              
              <Divider sx={{ my: 2 }} />
              
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
                  color={project.status === 'delayed' ? "error" : "primary"}
                  className="progress-bar"
                />
              </Box>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Project Management Actions
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={() => navigate(`/projects/${projectId}`)}
                >
                  View Public Page
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card className="comments-card">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              
              <Box className="stats-section">
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Status:</Typography>
                  <Chip 
                    label={project.status} 
                    color={getStatusColor(project.status)} 
                    size="small"
                  />
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Progress:</Typography>
                  <Typography variant="body2">{project.progress}%</Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Budget:</Typography>
                  <Typography variant="body2">
                    ₹{project.budget ? project.budget.toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Manager ID:</Typography>
                  <Typography variant="body2">{project.manager_id}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Update Project Dialog */}
      <Dialog 
        open={openUpdateDialog} 
        onClose={() => setOpenUpdateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Project Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={updateData.name}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={updateData.location}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={updateData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={updateData.status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>
                  Progress: {updateData.progress}%
                </Typography>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updateData.progress}
                  onChange={handleProgressChange}
                  style={{ width: '100%' }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Start Date"
                name="start_date"
                type="date"
                value={updateData.start_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="End Date"
                name="end_date"
                type="date"
                value={updateData.end_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Budget (₹)"
                name="budget"
                type="number"
                value={updateData.budget}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 1000 }}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProject} 
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Update Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectManagement;
