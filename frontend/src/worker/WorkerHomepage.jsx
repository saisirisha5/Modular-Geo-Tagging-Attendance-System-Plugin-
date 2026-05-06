import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import apiService from '../services/api';
import AssignmentViewer from "./AssignmentViewer";
import WorkerProfile from './WorkerProfile';
import WorkerAttendancePage from "./WorkerAttendancePage";
import WorkerAnalytics from './WorkerAnalytics';
import './WorkerHomepage.css';

const IMAGE_BASE_URL = "http://localhost:5000";

const WorkerHomepage = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showResidencePrompt, setShowResidencePrompt] = useState(false);
 
    useEffect(() => {

      const loadUser = async () => {

        const session = apiService.getUserSession();

        if (!session) {
          navigate("/login");
          return;
        }

        setUser(session.user);

        try {

          const profileData =
            await apiService.getWorkerProfile();

          const location =
            profileData?.profile?.residenceLocation;

          if (!location?.lat || !location?.lng) {
            setShowResidencePrompt(true);
          }

        } catch (err) {
          console.error(err);
        }
      };

      loadUser();

    }, [navigate]);

  const handleLogout = () => {
    apiService.clearUserSession();
    navigate("/");
  };

  if (!user) return <div className="worker-loading">Loading...</div>;

  if (currentView === 'attendance') {
    return (
      <WorkerAttendancePage
        assignment={selectedAssignment}
        goBack={() => setCurrentView('assignments')}
      />
    );
  }

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

        <AssignmentViewer
          setCurrentView={setCurrentView}
          setSelectedAssignment={setSelectedAssignment}
        />

      </div>
    );
  }


  if (currentView === 'workhistory') {
  return <WorkerAnalytics goBack={() => setCurrentView('dashboard')} />;
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
          {showResidencePrompt && (
          <div className="residence-alert">
            <div className="residence-alert-content">
              <div>
                <h3>📍 Add Residence Location</h3>
                <p>
                  Please update your residence location
                  for better attendance tracking.
                </p>
              </div>

              <button
                className="update-location-btn"
                onClick={() => {
                  setCurrentView("profile");
                  setShowResidencePrompt(false);
                }}
              >
                Update Now
              </button>

            </div>

          </div>

        )}
          <WorkerProfile />
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