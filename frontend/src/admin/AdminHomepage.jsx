import { useState, useEffect } from 'react';
import apiService from '../services/api';
import AssignmentManager from './AssignmentManager';
import './AdminHomepage.css';

const AdminHomepage = () => {
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
      <div className="admin-container">
        <div className="admin-header">
          <div className="header-content">
            <h1 className="admin-title">Assignment Manager</h1>
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
        <AssignmentManager />
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="admin-main">
        <div className="dashboard-grid">
          <div 
            className="dashboard-card"
            onClick={() => setCurrentView('assignments')}
          >
            <div className="card-icon">📝</div>
            <div className="card-content">
              <h3>Manage Assignments</h3>
              <p>Create and manage worker assignments</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <h3>Manage Workers</h3>
              <p>View and manage all registered workers</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Analytics</h3>
              <p>View system analytics and reports</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <div className="card-content">
              <h3>Settings</h3>
              <p>Configure system settings and preferences</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🌍</div>
            <div className="card-content">
              <h3>Geo-Location</h3>
              <p>Track worker locations and routes</p>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Reports</h3>
              <p>Generate and view detailed reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomepage; 