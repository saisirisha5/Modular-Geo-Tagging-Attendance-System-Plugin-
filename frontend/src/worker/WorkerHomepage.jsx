import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import apiService from '../services/api';
import AssignmentViewer from './AssignmentViewer';
import WorkerProfile from './WorkerProfile';
import './WorkerHomepage.css';

const IMAGE_BASE_URL = "http://localhost:5000";

const WorkerHomepage = () => {

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

  if (!user) return <div className="worker-loading">Loading...</div>;

  if (currentView === 'assignments') {
    return (
      <div className="worker-container">

        <div className="worker-header">
          <div className="worker-header-content">

            <h1 className="worker-title">My Assignments</h1>

            <div className="worker-user-info">

              <button
                onClick={() => setCurrentView('dashboard')}
                className="worker-back-btn"
              >
                ← Back to Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="worker-logout-btn"
              >
                Logout
              </button>

            </div>

          </div>
        </div>

        <AssignmentViewer />

      </div>
    );
  }

      if (currentView === 'workhistory') {
        return (
          <div className="worker-container">

            <div className="worker-header">
              <div className="worker-header-content">

                <h1 className="worker-title">Work History</h1>

                <div className="worker-user-info">

                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className="worker-back-btn"
                  >
                    ← Back to Dashboard
                  </button>

                  <button
                    onClick={handleLogout}
                    className="worker-logout-btn"
                  >
                    Logout
                  </button>

                </div>

              </div>
            </div>

            <div className="worker-main">
              <h2>Work analytics and attendance reports will appear here</h2>
            </div>

          </div>
        );
      }

    if (currentView === 'profile') {
      return (
        <div className="worker-container">

          <div className="worker-header">
            <div className="worker-header-content">

              <h1 className="worker-title">Profile</h1>

              <div className="worker-user-info">

                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="worker-back-btn"
                >
                  ← Back to Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="worker-logout-btn"
                >
                  Logout
                </button>

              </div>

            </div>
          </div>

          <div className="worker-main">
            <WorkerProfile/>
          </div>

        </div>
      );
    }

  return (
    <div className="worker-container">

      <div className="worker-header">
        <div className="worker-header-content">

          <h1 className="worker-title">Worker Dashboard</h1>

         <div className="worker-user-info">

            <div className="worker-profile">

              <img
                src={
                  user.profilePhoto
                    ? `${IMAGE_BASE_URL}/${user.profilePhoto}`
                    : "/default-avatar.png"
                }
                alt={user.name}
                className="worker-profile-img"
              />

              <span className="worker-welcome-text">
                Welcome, {user.name}
              </span>

            </div>
            <button
              onClick={handleLogout}
              className="worker-logout-btn"
            >
              Logout
            </button>

          </div>

        </div>
      </div>

      <div className="worker-main">
      <div className="worker-dashboard-grid">

          <div
            className="worker-dashboard-card"
            onClick={() => setCurrentView('assignments')}
          >
            <div className="worker-card-icon">📋</div>

            <div className="worker-card-content">
              <h3>My Assignments</h3>
              <p>View and manage assigned tasks</p>
            </div>
          </div>

          <div
            className="worker-dashboard-card"
            onClick={() => setCurrentView('workhistory')}
          >
            <div className="worker-card-icon">📊</div>

            <div className="worker-card-content">
              <h3>Work History</h3>
              <p>Analytics, attendance and reports</p>
            </div>
          </div>

          <div
            className="worker-dashboard-card"
            onClick={() => setCurrentView('profile')}
          >
            <div className="worker-card-icon">👤</div>

            <div className="worker-card-content">
              <h3>Profile</h3>
              <p>Update personal and location details</p>
            </div>
          </div>

        </div>
        
      </div>

    </div>
  );
};

export default WorkerHomepage;