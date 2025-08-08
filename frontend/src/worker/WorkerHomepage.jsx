import { useState, useEffect } from 'react';
import apiService from '../services/api';
import AssignmentViewer from './AssignmentViewer';
import './WorkerHomepage.css';

const WorkerHomepage = () => {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Get user session from API service
    const session = apiService.getUserSession();
    if (session) {
      setUser(session.user);
    } else {
      // Redirect to login if no user session
      window.navigateToPage ? window.navigateToPage('login') : window.location.href = '/login';
    }
  }, []);

  const handleLogout = () => {
    apiService.clearUserSession();
    window.navigateToPage ? window.navigateToPage('login') : window.location.href = '/login';
  };

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  if (currentView === 'assignments') {
    return (
      <div className="worker-container">
        <div className="worker-header">
          <div className="header-content">
            <h1 className="worker-title">My Assignments</h1>
            <div className="user-info">
              <button 
                onClick={() => setCurrentView('dashboard')} 
                className="back-btn"
              >
                ← Back to Dashboard
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
        <AssignmentViewer />
      </div>
    );
  }

  return (
    <div className="worker-container">
      <div className="worker-header">
        <div className="header-content">
          <h1 className="worker-title">Worker Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="worker-main">
        <div className="dashboard-grid">
          <div 
            className="dashboard-card"
            onClick={() => setCurrentView('assignments')}
          >
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>My Assignments</h3>
              <p>View and manage assigned tasks</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📍</div>
            <div className="card-content">
              <h3>Check-In</h3>
              <p>Check-in to your current location</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🌍</div>
            <div className="card-content">
              <h3>My Location</h3>
              <p>View and update your location</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Work History</h3>
              <p>View your work history and reports</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⏰</div>
            <div className="card-content">
              <h3>Time Tracking</h3>
              <p>Track your working hours</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👤</div>
            <div className="card-content">
              <h3>Profile</h3>
              <p>Update your profile information</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerHomepage; 