// worker/AssignmentViewer.jsx
import { useState, useEffect } from 'react';
import './AssignmentViewer.css';
import apiService from '../services/api';

const AssignmentViewer = () => {
  const [assignments, setAssignments] = useState([]);
  const [todayAssignments, setTodayAssignments] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const [allData, todayData, upcomingData] = await Promise.all([
        apiService.makeRequest('/worker/assignments'),
        apiService.makeRequest('/worker/assignments/today'),
        apiService.makeRequest('/worker/assignments/upcoming'),
      ]);

      setAssignments(allData.assignments || []);
      setTodayAssignments(todayData.assignments || []);
      setUpcomingAssignments(upcomingData.assignments || []);
    } catch (err) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCurrentAssignments = () => {
    switch (activeTab) {
      case 'today': return todayAssignments;
      case 'upcoming': return upcomingAssignments;
      default: return assignments;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'today': return `Today's Assignments (${todayAssignments.length})`;
      case 'upcoming': return `Upcoming Assignments (${upcomingAssignments.length})`;
      default: return `All Assignments (${assignments.length})`;
    }
  };

  // -------------------------
  // Check-In / Check-Out
  // -------------------------
  const handleCheckIn = async (assignmentId) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await apiService.makeRequest('/worker/attendance/start', {
            method: 'POST',
            data: { assignmentId, location: { lat: coords.latitude, lng: coords.longitude } },
          });
          alert(data.message || "Check-in successful!");
        } catch (err) {
          alert("Check-in failed: " + err.message);
        }
      },
      (err) => alert("Location error: " + err.message)
    );
  };

  const handleCheckOut = async (assignmentId) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await apiService.makeRequest('/worker/attendance/end', {
            method: 'POST',
            data: { assignmentId, location: { lat: coords.latitude, lng: coords.longitude } },
          });
          alert(data.message || "Check-out successful!");
        } catch (err) {
          alert("Check-out failed: " + err.message);
        }
      },
      (err) => alert("Location error: " + err.message)
    );
  };

  if (loading) {
    return <div className="loading">Loading your assignments...</div>;
  }

  return (
    <div className="assignment-viewer">
      <div className="header">
        <h2>My Assignments</h2>
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All ({assignments.length})
          </button>
          <button className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>
            Today ({todayAssignments.length})
          </button>
          <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
            Upcoming ({upcomingAssignments.length})
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="assignments-container">
        <h3>{getTabTitle()}</h3>
        {getCurrentAssignments().length === 0 ? (
          <div className="no-assignments">
            <div className="no-assignments-icon">📋</div>
            <p>No assignments found</p>
            <small>Check back later for new assignments</small>
          </div>
        ) : (
          <div className="assignments-grid">
            {getCurrentAssignments().map((assignment) => (
              <div key={assignment._id} className="assignment-card">
                <div className="assignment-header">
                  <div className="assignment-date">{formatDate(assignment.date)}</div>
                  <div className="assignment-time">
                    {assignment.timeSlot.start} - {assignment.timeSlot.end}
                  </div>
                </div>
                <div className="assignment-content">
                  <div className="assignment-duration">
                    <span className="duration-badge">{assignment.requiredDurationMinutes} min</span>
                  </div>
                  <div className="assignment-location">
                    <strong>📍 Location:</strong>
                    <p>{assignment.location.lat}, {assignment.location.lng}</p>
                  </div>
                  {assignment.description && (
                    <div className="assignment-description">
                      <strong>📝 Description:</strong>
                      <p>{assignment.description}</p>
                    </div>
                  )}
                  <div className="assignment-admin">
                    <strong>👤 Assigned by:</strong>
                    <p>{assignment.assignedBy?.name || 'Admin'}</p>
                  </div>
                </div>
                <div className="assignment-actions">
                  <button onClick={() => handleCheckIn(assignment._id)}>Check In</button>
                  <button onClick={() => handleCheckOut(assignment._id)}>Check Out</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentViewer;
