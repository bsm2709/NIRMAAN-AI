import React, { useState, useCallback } from 'react';
import { TextField, Button, Card, CardContent, Typography, CircularProgress, Alert, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { debounce } from 'lodash';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// TypeScript interfaces
interface PredictionResult {
  predicted_stage: string;
  estimated_progress_percent: number;
  confidence: number;
  delayed: boolean;
  probability: number;
}

interface FormData {
  timeline_days: string;
  budget_utilized_percent: string;
  image: File | null;
}

interface FormErrors {
  timeline_days?: string;
  budget_utilized_percent?: string;
  image?: string;
}

const Predict: React.FC = () => {
  // State management with TypeScript
  const [formData, setFormData] = useState<FormData>({
    timeline_days: '',
    budget_utilized_percent: '',
    image: null
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string>('');

  // Validation function
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'timeline_days':
        return !value ? 'Timeline is required' :
               isNaN(Number(value)) ? 'Timeline must be a number' :
               Number(value) <= 0 ? 'Timeline must be positive' : '';
      case 'budget_utilized_percent':
        return !value ? 'Budget is required' :
               isNaN(Number(value)) ? 'Budget must be a number' :
               Number(value) < 0 || Number(value) > 100 ? 'Budget must be between 0 and 100' : '';
      default:
        return '';
    }
  };

  // Debounced validation
  const debouncedValidation = useCallback(
    debounce((name: string, value: string) => {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }, 500),
    []
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    debouncedValidation(name, value);
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, image: file }));
        setPreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, image: '' }));
      } else {
        setErrors(prev => ({ ...prev, image: 'Please upload an image file' }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: FormErrors = {
      timeline_days: validateField('timeline_days', formData.timeline_days),
      budget_utilized_percent: validateField('budget_utilized_percent', formData.budget_utilized_percent),
      image: !formData.image ? 'Please upload an image' : ''
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('timeline_days', formData.timeline_days);
      formDataToSend.append('budget_utilized_percent', formData.budget_utilized_percent);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/predict', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during prediction');
    } finally {
      setLoading(false);
    }
  };

  // Chart configuration
  const chartData = result ? {
    labels: ['0%', '25%', '50%', '75%', '100%'],
    datasets: [
      {
        label: 'Estimated Progress',
        data: [0, result.estimated_progress_percent/4, result.estimated_progress_percent/2, result.estimated_progress_percent*0.75, result.estimated_progress_percent],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3
      }
    ]
  } : null;

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Construction Progress Prediction
      </Typography>

      <form onSubmit={handleSubmit}>
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <TextField
              fullWidth
              label="Project Timeline (days)"
              name="timeline_days"
              value={formData.timeline_days}
              onChange={handleInputChange}
              error={!!errors.timeline_days}
              helperText={errors.timeline_days}
              type="number"
              margin="normal"
            />

            <TextField
              fullWidth
              label="Budget Utilized (%)"
              name="budget_utilized_percent"
              value={formData.budget_utilized_percent}
              onChange={handleInputChange}
              error={!!errors.budget_utilized_percent}
              helperText={errors.budget_utilized_percent}
              type="number"
              margin="normal"
            />

            <Box sx={{ marginTop: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="image-upload">
                <Button variant="contained" component="span">
                  Upload Construction Site Image
                </Button>
              </label>
              {errors.image && (
                <Typography color="error" variant="caption" display="block">
                  {errors.image}
                </Typography>
              )}
            </Box>

            {preview && (
              <Box sx={{ marginTop: 2, textAlign: 'center' }}>
                <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300 }} />
              </Box>
            )}
          </CardContent>
        </Card>

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading || Object.values(errors).some(error => error)}
        >
          {loading ? <CircularProgress size={24} /> : 'Analyze Progress'}
        </Button>
      </form>

      {error && (
        <Alert severity="error" sx={{ marginTop: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            
            <Typography variant="body1">
              Construction Stage: {result.predicted_stage}
            </Typography>
            
            <Typography variant="body1">
              Confidence: {(result.confidence * 100).toFixed(2)}%
            </Typography>

            {chartData && (
              <Box sx={{ marginTop: 2 }}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'top' },
                      title: { display: true, text: 'Progress Chart' }
                    },
                    scales: {
                      y: { beginAtZero: true, max: 100 }
                    }
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
              <Box sx={{
                flex: 1,
                padding: 2,
                borderRadius: 1,
                backgroundColor: result.delayed ? '#ffebee' : '#e8f5e9',
                border: 1,
                borderColor: result.delayed ? '#ef5350' : '#66bb6a'
              }}>
                <Typography variant="h6" sx={{ color: result.delayed ? '#c62828' : '#2e7d32', marginBottom: 1 }}>
                  Delay Status
                </Typography>
                <Typography variant="body1" sx={{ color: result.delayed ? '#d32f2f' : '#388e3c' }}>
                  {result.delayed ? 'Delayed' : 'On Track'}
                </Typography>
              </Box>

              <Box sx={{
                flex: 1,
                padding: 2,
                borderRadius: 1,
                backgroundColor: result.probability > 0.5 ? '#ffebee' : '#e8f5e9',
                border: 1,
                borderColor: result.probability > 0.5 ? '#ef5350' : '#66bb6a'
              }}>
                <Typography variant="h6" sx={{ color: result.probability > 0.5 ? '#c62828' : '#2e7d32', marginBottom: 1 }}>
                  Delay Probability
                </Typography>
                <Typography variant="body1" sx={{ color: result.probability > 0.5 ? '#d32f2f' : '#388e3c' }}>
                  {(result.probability * 100).toFixed(2)}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ marginTop: 2, textAlign: 'center' }}>
        <Button href="/" sx={{ marginRight: 1 }}>
          Back to Home
        </Button>
        <Button href="/about">
          Learn More
        </Button>
      </Box>
    </Box>
  );
};

export default Predict;