# NIRMAAN-AI: Construction Progress Monitoring System

NIRMAAN-AI is an intelligent system that monitors and predicts construction project progress using machine learning and computer vision. The system analyzes construction site images along with timeline and budget data to predict potential delays and estimate completion stages.

## Features

- Construction stage classification from site images
- Progress percentage estimation
- Delay prediction using hybrid model (image + timeline + budget data)
- Interactive web interface
- Real-time predictions

## Project Structure

```
├── backend/           # Flask backend server
├── frontend/          # React frontend application
├── data/              # Training and test data
│   ├── images/        # Construction site images
│   └── stage_data/    # Stage-wise data
└── requirements.txt   # Python dependencies
```

## Setup Instructions

### Backend Setup

1. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   cd backend
   python app.py
   ```
   The server will start at `http://localhost:5000`

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000`

## Models

### Progress Stage Classification Model
- Input: Construction site images
- Output: Construction stage (0-5) and confidence score
- Location: `backend/progress_model.py`

### Hybrid Delay Prediction Model
- Inputs:
  - Processed site images
  - Timeline progress (days)
  - Budget utilization (%)
  - Current progress stage (%)
- Output: Delay probability (0-1)
- Location: `backend/hybrid_model.py`

### POST /predict
Predicts construction progress and potential delays

Parameters:
- `image`: Construction site image file
- `timeline_days`: Number of days since project start
- `budget_utilized_percent`: Percentage of budget utilized

Response:
```json
{
    "predicted_stage": 3,
    "confidence": 0.92,
    "estimated_progress_percent": 60,
    "delayed": 0,
    "probability": 0.15
}
```

## Technologies Used

### Backend
- Flask
- TensorFlow
- OpenCV
- NumPy
- Scikit-learn

### Frontend
- React
- Material-UI
- Chart.js
- Axios

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.