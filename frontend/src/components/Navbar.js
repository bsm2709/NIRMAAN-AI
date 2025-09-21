import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { ReactComponent as CraneIcon } from '../assets/crane-icon.svg';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setUserMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <CraneIcon className="brand-icon" />
            <span className="brand-text">Nirmaan.ai</span>
          </Link>
        </div>
        
        <div className={`nav-menu ${isMenuOpen ? 'nav-menu-active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">🏠</span>
            <span>Home</span>
          </Link>
          <Link 
            to="/predict" 
            className={`nav-link ${location.pathname === '/predict' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">📊</span>
            <span>Track Progress</span>
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="nav-icon">👥</span>
            <span>About Us</span>
          </Link>
        </div>

        <div className="nav-actions">
          {currentUser ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-button"
                onClick={toggleUserMenu}
                aria-label="User menu"
              >
                <span className="user-icon">👤</span>
                <span className="user-name">{currentUser.username}</span>
              </button>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <button onClick={handleDashboard} className="dropdown-item">
                    Dashboard
                  </button>
                  <button onClick={handleLogout} className="dropdown-item">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/login" 
                className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className={`nav-link register-link ${location.pathname === '/register' ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
          
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'hamburger-active' : ''}`}></span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;