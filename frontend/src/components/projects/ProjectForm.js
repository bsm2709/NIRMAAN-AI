import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, TextField, Button, Box, 
  CircularProgress, MenuItem, Paper, Snackbar, Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import './Projects.css';

const ProjectForm = ({ isEditing = false }) => {
  const { projectId } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    latitude: '',
    longitude: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'planned',
    progress: 0
  });
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [officials, setOfficials] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }

        // If editing, fetch project data
        if (isEditing && projectId) {
          const projectResponse = await axios.get(`http://localhost:5000/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setFormData({
            ...projectResponse.data,
            start_date: projectResponse.data.start_date ? projectResponse.data.start_date.split('T')[0] : '',
            end_date: projectResponse.data.end_date ? projectResponse.data.end_date.split('T')[0] : ''
          });
        }

        // Fetch officials for assignment (admin only)
        if (currentUser?.role === 'admin') {
          const officialsResponse = await axios.get('http://localhost:5000/auth/officials', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setOfficials(officialsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditing, projectId, navigate, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Format data for API
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        progress: formData.progress ? parseInt(formData.progress, 10) : 0,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };
      
      let response;
      
      if (isEditing) {
        // Update existing project
        response = await axios.put(`http://localhost:5000/projects/${projectId}`, 
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new project
        response = await axios.post('http://localhost:5000/projects', 
          projectData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      setSuccess(true);
      setSubmitting(false);
      
      // Redirect after short delay
      setTimeout(() => {
        if (isEditing) {
          navigate(`/projects/${projectId}`);
        } else {
          navigate(`/projects/${response.data.id}`);
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting project:', err);
      setError(err.response?.data?.message || 'Failed to save project. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" className="project-container">
      <Paper elevation={2} className="project-form">
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Edit Project' : 'Create New Project'}
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  type="number"
                  value={formData.latitude}
                  onChange={handleChange}
                  variant="outlined"
                  inputProps={{ step: 'any' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  type="number"
                  value={formData.longitude}
                  onChange={handleChange}
                  variant="outlined"
                  inputProps={{ step: 'any' }}
                />
              </Grid>
            </Grid>
          </div>
          
          <div className="form-section">
            <Typography variant="h6" gutterBottom>
              Timeline & Budget
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Expected Completion Date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Budget (₹)"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  variant="outlined"
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </div>
          
          <div className="form-section">
            <Typography variant="h6" gutterBottom>
              Status & Progress
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  variant="outlined"
                >
                  <MenuItem value="planned">Planned</MenuItem>
                  <MenuItem value="in progress">In Progress</MenuItem>
                  <MenuItem value="delayed">Delayed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Progress (%)"
                  name="progress"
                  type="number"
                  value={formData.progress}
                  onChange={handleChange}
                  variant="outlined"
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              
              {formData.status === 'delayed' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Delay Reason"
                    name="delay_reason"
                    value={formData.delay_reason || ''}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                </Grid>
              )}
              
              {currentUser?.role === 'admin' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Assign Official"
                    name="official_id"
                    value={formData.official_id || ''}
                    onChange={handleChange}
                    variant="outlined"
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {officials.map(official => (
                      <MenuItem key={official.id} value={official.id}>
                        {official.username} ({official.email})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </div>
          
          <div className="form-actions">
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : (isEditing ? 'Update Project' : 'Create Project')}
            </Button>
          </div>
        </form>
      </Paper>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success">
          Project {isEditing ? 'updated' : 'created'} successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectForm;