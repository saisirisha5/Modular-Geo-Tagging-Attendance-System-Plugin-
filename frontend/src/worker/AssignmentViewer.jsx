import { useState, useEffect } from 'react';
import './AssignmentViewer.css';
import apiService from '../services/api';
import { getDistanceFromLatLonInMeters } from '../utils/distance';

const AssignmentViewer = ({ setCurrentView, setSelectedAssignment }) => {

  const [assignments, setAssignments] = useState([]);
  const [todayAssignments, setTodayAssignments] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        const allData = await apiService.getAssignmentsForWorker();
        const todayData = await apiService.getTodayAssignments();
        const upcomingData = await apiService.getUpcomingAssignments();

        setAssignments(allData.assignments || []);
        setTodayAssignments(todayData.assignments || []);
        setUpcomingAssignments(upcomingData.assignments || []);

      } catch (err) {
        setError('Failed to fetch assignments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setCurrentLocation({
          lat: coords.latitude,
          lng: coords.longitude
        }),
      err => console.warn('Geo error', err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);


  const openInMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank'
    );
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

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getCurrentAssignments = () => {
    if (activeTab === 'today') return todayAssignments;
    if (activeTab === 'upcoming') return upcomingAssignments;
    return assignments;
  };

  const getTabTitle = () => {
    if (activeTab === 'today') {
      return `Today's Assignments (${todayAssignments.length})`;
    }
    if (activeTab === 'upcoming') {
      return `Upcoming Assignments (${upcomingAssignments.length})`;
    }
    return `All Assignments (${assignments.length})`;
  };


  if (loading) {
    return <div className="assignment-loading">Loading your assignments...</div>;
  }

  return (
    <div className="assignment-viewer">

      <div className="assignment-tabs-header">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({assignments.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            Today ({todayAssignments.length})
          </button>

          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
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
          </div>
        ) : (

          <div className="assignments-grid">

            {getCurrentAssignments().map((assignment) => {

              const now = new Date();
              const startTime = new Date(`${assignment.date}T${assignment.timeSlot.start}`);
              const endTime = new Date(`${assignment.date}T${assignment.timeSlot.end}`);

              let status = "pending";

              if (assignment.attendanceStatus === "completed") {
                status = "completed";
              }
              else if (assignment.attendanceStatus === "checked-in") {
                status = "in-progress";
              }
              else if (now > endTime) {
                status = "missed";
              }
              else if (now < startTime) {
                status = "pending";
              }

              return (

                <div
                  key={assignment._id}
                  className="assignment-card"
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setCurrentView('attendance');
                  }}
                  style={{ cursor: 'pointer' }}
                >

                  <div className="assignment-header">

                    <div className="assignment-title">
                      <strong>{assignment.title || 'No Title'}</strong>
                    </div>

                     <span className="arrow">➜</span>

                  </div>

                  <div className="assignment-content">

                    <div className="assignment-date">
                      {formatDate(assignment.date)}
                    </div>

                    <div className="assignment-time">
                      🕒 {formatTime(assignment.timeSlot.start)} - {formatTime(assignment.timeSlot.end)}
                    </div>

                    <div className="assignment-duration">
                      <span className="duration-badge">
                        {assignment.requiredDurationMinutes} min
                      </span>
                    </div>

                    <div className="assignment-location">
                      <strong>📍 Location:</strong>

                      <p>{assignment.address || "Address not available"}</p>

                      <button
                        className="map-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInMaps(
                            assignment.location.lat,
                            assignment.location.lng
                          );
                        }}
                      >
                        🌍 Open in Google Maps
                      </button>
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

                    <div className="assignment-footer">

                      <div className={`status-badge ${status}`}>
                        {status === "completed" && "✔ Attendance Marked"}
                        {status === "in-progress" && "⏳ In Progress"}
                        {status === "pending" && "🕒 Pending"}
                        {status === "missed" && "✖ Marked Invalid"}
                      </div>
                    </div>
                    
                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentViewer;