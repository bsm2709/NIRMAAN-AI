import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { ReactComponent as CraneIcon } from '../assets/crane-icon.svg';

function Navbar() {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-link">Nirmaan.ai</Link>
      </div>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Home
        </Link>
        <Link to="/predict" className={`nav-link ${location.pathname === '/predict' ? 'active' : ''}`}>
          Predict
        </Link>
        <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>
          About
        </Link>
      </div>

      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <CraneIcon className="theme-icon" />
      </button>
    </nav>
  );
}

export default Navbar;