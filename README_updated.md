# Nirmaan AI - Construction Progress Monitoring System

## Overview

Nirmaan AI is an integrated system for monitoring construction projects using AI-powered image analysis. The platform includes user authentication, interactive maps, role-based dashboards, and construction progress prediction.

## Features

- **User Authentication**: Secure login and registration with role-based access control (Citizen, Official, Admin)
- **Interactive Maps**: Visualize construction projects on a map with React Leaflet
- **Role-based Dashboards**: Customized views for citizens, government officials, and administrators
- **AI-powered Progress Tracking**: Analyze construction site images to predict progress stage and potential delays
- **Project Management**: Create, update, and monitor construction projects
- **Community Feedback**: Allow citizens to comment on projects and report issues

## System Architecture

### Frontend
- React.js with Material-UI for the user interface
- React Router for navigation
- React Leaflet for interactive maps
- JWT for authentication
- Context API for state management

### Backend
- Flask for the REST API
- SQLAlchemy for database operations
- Flask-JWT-Extended for token-based authentication
- TensorFlow/Keras for AI models

## Installation

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- pip
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements_updated.txt
   ```

5. Set up environment variables (create a .env file):
   ```
   FLASK_APP=app_updated.py
   FLASK_ENV=development
   DATABASE_URI=sqlite:///nirmaan.db
   JWT_SECRET_KEY=your_secret_key_here
   ```

6. Initialize the database:
   ```
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

7. Run the backend server:
   ```
   flask run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```
   
   Or if you're using the updated package.json:
   ```
   cp package_updated.json package.json
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. Navigate through the application using the navbar

### User Roles

- **Citizen**: View projects, track progress, submit comments/issues
- **Official**: Manage assigned projects, update progress, respond to citizen feedback
- **Admin**: Manage all projects and users, assign officials to projects, view system statistics

## AI Model Integration

The system uses a hybrid AI model to analyze construction site images and predict:

- Current construction stage
- Progress percentage
- Potential delays
- Confidence level of predictions

To use this feature, upload an image of a construction site along with timeline and budget information through the Predict page.

## Map Integration

The interactive map displays all construction projects with their locations. Users can:

- View project markers on the map
- Click markers to see project details
- Navigate to detailed project views

## Development

### File Structure

```
nirmaan-ai/
├── backend/
│   ├── app.py                 # Original Flask application
│   ├── app_updated.py         # Updated Flask application with auth and projects
│   ├── models/                # Database models
│   │   └── user.py            # User model
│   ├── routes/                # API routes
│   │   ├── auth.py            # Authentication routes
│   │   └── projects.py        # Project management routes
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/        # React components
│       │   ├── auth/          # Authentication components
│       │   ├── dashboard/     # Dashboard components
│       │   ├── map/           # Map components
│       │   └── projects/      # Project components
│       ├── context/           # React context providers
│       ├── hooks/             # Custom React hooks
│       ├── App.js             # Main application component
│       └── index.js           # Entry point
└── README.md                  # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.