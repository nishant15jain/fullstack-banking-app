import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navigation.css';

const Navigation = ({ title = "Finance App" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/accounts', label: 'Accounts', icon: '🏦' },
    { path: '/transactions', label: 'Transactions', icon: '💸' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navigation-header">
      <div className="nav-container">
        <div className="nav-left">
          <h1 className="nav-title">{title}</h1>
          <nav className="nav-menu">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="nav-right">
          <div className="user-info">
            <span className="user-greeting">Welcome, {user?.firstName || 'User'}!</span>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
