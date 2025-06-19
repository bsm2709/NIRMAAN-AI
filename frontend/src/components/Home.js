import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Nirmaan AI</h1>
      <p className="subtitle">
        Your intelligent companion for image analysis and prediction.
        Experience the power of artificial intelligence in a simple, intuitive interface.
      </p>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Image Prediction</h3>
          <p>
            Upload any image and let our advanced AI model analyze it for you.
            Get instant, accurate predictions with detailed confidence scores.
          </p>
          <Link to="/predict" className="cta-button">Try Prediction</Link>
        </div>

        <div className="feature-card">
          <h3>Learn More</h3>
          <p>
            Discover the technology behind our AI model and explore how it can
            help you make better decisions with image analysis.
          </p>
          <Link to="/about" className="secondary-button">About Us</Link>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to get started?</h2>
        <p>Experience the future of image analysis today.</p>
        <Link to="/predict" className="cta-button">Start Predicting</Link>
        <Link to="/about" className="secondary-button">Learn More</Link>
      </div>
    </div>
  );
}

export default Home;