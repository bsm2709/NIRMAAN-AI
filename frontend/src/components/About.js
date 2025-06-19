import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="about-container">
      <h1>About Nirmaan AI</h1>
      <p className="subtitle">
        We combine cutting-edge artificial intelligence with intuitive design to
        bring you powerful image analysis capabilities.
      </p>

      <div className="tech-grid">
        <div className="tech-card">
          <h3>Computer Vision</h3>
          <p>
            Our advanced computer vision algorithms can analyze and understand complex
            visual patterns in your images with high accuracy.
          </p>
          <ul className="features-list">
            <li>Deep learning models</li>
            <li>Real-time processing</li>
            <li>High accuracy rates</li>
          </ul>
        </div>

        <div className="tech-card">
          <h3>Machine Learning</h3>
          <p>
            Powered by state-of-the-art machine learning models trained on diverse
            datasets to ensure reliable predictions.
          </p>
          <ul className="features-list">
            <li>Advanced neural networks</li>
            <li>Continuous learning</li>
            <li>Adaptive algorithms</li>
          </ul>
        </div>

        <div className="tech-card">
          <h3>Modern Web Stack</h3>
          <p>
            Built with the latest web technologies to provide you with a fast,
            responsive, and user-friendly experience.
          </p>
          <ul className="features-list">
            <li>React.js frontend</li>
            <li>Flask backend</li>
            <li>RESTful API design</li>
          </ul>
        </div>
      </div>

      <div className="cta-section">
        <h2>Experience the Power of AI</h2>
        <p>Ready to see what our technology can do for you?</p>
        <Link to="/predict" className="cta-button">Try It Now</Link>
        <Link to="/" className="secondary-button">Back to Home</Link>
      </div>
    </div>
  );
}

export default About;