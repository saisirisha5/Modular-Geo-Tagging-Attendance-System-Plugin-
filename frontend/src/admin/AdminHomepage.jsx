import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import apiService from '../services/api';
import AssignmentManager from './AssignmentManager';
import ManageWorkers from './ManageWorkers';
import './AdminHomepage.css';

const AdminHomepage = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {

    const session = apiService.getUserSession();

    if (session) {
      setUser(session.user);
    } else {
      navigate("/login");
    }

  }, [navigate]);

  const handleLogout = () => {
    apiService.clearUserSession();
    navigate("/login");
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

              <button
                onClick={handleLogout}
                className="logout-btn"
              >
                Logout
              </button>

            </div>

          </div>
        </div>

        <AssignmentManager />

      </div>
    );
  }

  if (currentView === 'workers') {
      return (
        <div className="admin-container">

          <div className="admin-header">
            <div className="header-content">

              <h1 className="admin-title">Manage Workers</h1>

              <div className="user-info">

                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="back-btn"
                >
                  ← Back to Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Logout
                </button>

              </div>

            </div>
          </div>

          <ManageWorkers />

        </div>
      );
    }

  return (
    <div className="admin-container">

      <div className="admin-header">
        <div className="header-content">

          <h1 className="admin-title">Admin Dashboard</h1>

          <div className="user-info">
            <span className="welcome-text">Welcome, {user.name}</span>

            <button
              onClick={handleLogout}
              className="logout-btn"
            >
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

        <div
            className="dashboard-card"
            onClick={() => setCurrentView('workers')}
          >

            <div className="card-icon">👥</div>

            <div className="card-content">
              <h3>Manage Workers</h3>
              <p>View and manage all registered workers</p>
            </div>

          </div>

          <div className="dashboard-card">

            <div className="card-icon">📊</div>

            <div className="card-content">
              <h3>Reports & Analytics</h3>
              <p>View system analytics and reports</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminHomepage;