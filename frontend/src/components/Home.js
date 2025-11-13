import React from 'react';
import { Link } from 'react-router-dom';
import { Box as MuiBox, Typography } from '@mui/material';
import { Construction, TrendingUp, Security } from '@mui/icons-material';

function Home() {
  return (
    <div className="home-container home--simple">
      <div className="hero">
        <div className="hero-content">
          <div className="pill">
            <Construction className="pill-icon" />
            <span>AI for Construction Progress</span>
          </div>
          <h1 className="hero-title">Monitor projects with clarity and confidence</h1>
          <p className="hero-subtitle">
            Nirmaan AI analyzes site images and project data to predict stages and delays
            so you can make faster, better decisions.
          </p>
          <div className="hero-actions">
            <Link to="/predict" className="btn btn-primary">Start Tracking</Link>
            <Link to="/map" className="btn btn-outline">View Projects Map</Link>
          </div>
          <div className="hero-stats">
            <div><strong>6</strong><span>Stages Classified</span></div>
            <div><strong>85%</strong><span>Avg. Confidence</span></div>
            <div><strong>1s</strong><span>Prediction Time</span></div>
          </div>
        </div>
        <div className="hero-illustration" aria-hidden="true" />
      </div>

      <MuiBox className="features-grid">
        <MuiBox className="feature-card">
          <div className="feature-icon feature-icon--primary"><TrendingUp /></div>
          <Typography className="feature-title">Track Progress</Typography>
          <Typography className="feature-desc">
            Upload a site photo and instantly get stage, confidence and estimated progress.
          </Typography>
          <Link to="/predict" className="link">Try the predictor →</Link>
        </MuiBox>
        <MuiBox className="feature-card">
          <div className="feature-icon feature-icon--success"><Security /></div>
          <Typography className="feature-title">Account & Roles</Typography>
          <Typography className="feature-desc">
            Citizens, officials and admins get tailored dashboards and permissions.
          </Typography>
          <Link to="/register" className="link">Create an account →</Link>
        </MuiBox>
        <MuiBox className="feature-card">
          <div className="feature-icon"><Construction /></div>
          <Typography className="feature-title">Project Insights</Typography>
          <Typography className="feature-desc">
            View project details, comments, and AI predictions in one place.
          </Typography>
          <Link to="/map" className="link">Browse projects →</Link>
        </MuiBox>
      </MuiBox>
    </div>
  );
}

export default Home;