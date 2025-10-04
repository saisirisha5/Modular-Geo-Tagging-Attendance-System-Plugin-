// worker/AssignmentViewer.jsx
import { useState, useEffect } from 'react';
import './AssignmentViewer.css';
import apiService from '../services/api';
import { getDistanceFromLatLonInMeters } from '../utils/distance';

const AssignmentViewer = () => {
  const [assignments, setAssignments] = useState([]);
  const [todayAssignments, setTodayAssignments] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [addressCache, setAddressCache] = useState({});
  const [currentLocation, setCurrentLocation] = useState(null);

  // ----------------------------
  // Fetch assignments
  // ----------------------------
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        const allData = await apiService.makeRequest('/worker/assignments');
        const todayData = await apiService.makeRequest('/worker/assignments/today');
        const upcomingData = await apiService.makeRequest('/worker/assignments/upcoming');

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

  // ----------------------------
  // Reverse geocode
  // ----------------------------
  const fetchAddress = async (lat, lng) => {
    const key = `${lat},${lng}`;
    if (addressCache[key]) return addressCache[key];

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      const address = data.display_name || `${lat}, ${lng}`;
      setAddressCache(prev => ({ ...prev, [key]: address }));
      return address;
    } catch {
      return `${lat}, ${lng}`;
    }
  };

  useEffect(() => {
    const fetchAllAddresses = async () => {
      const all = [...assignments, ...todayAssignments, ...upcomingAssignments];
      for (const a of all) {
        const key = `${a.location.lat},${a.location.lng}`;
        if (!addressCache[key]) await fetchAddress(a.location.lat, a.location.lng);
      }
    };
    if (assignments.length > 0) fetchAllAddresses();
  }, [assignments, todayAssignments, upcomingAssignments]);

  // ----------------------------
  // Utils
  // ----------------------------
  const openInMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
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
    if (activeTab === 'today') return todayAssignments;
    if (activeTab === 'upcoming') return upcomingAssignments;
    return assignments;
  };

  const getTabTitle = () => {
    if (activeTab === 'today') return `Today's Assignments (${todayAssignments.length})`;
    if (activeTab === 'upcoming') return `Upcoming Assignments (${upcomingAssignments.length})`;
    return `All Assignments (${assignments.length})`;
  };

  // ----------------------------
  // Get live user location
  // ----------------------------
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => setCurrentLocation({ lat: coords.latitude, lng: coords.longitude }),
      err => console.warn('Geo error', err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // ----------------------------
  // Check-In / Check-Out
  // ----------------------------
  const handleCheck = async (assignment, type) => {
    if (!currentLocation) {
      alert('Current location not available');
      return;
    }

    const { lat, lng } = currentLocation;

    try {
      const endpoint = type === 'checkIn' ? '/worker/attendance/start' : '/worker/attendance/end';
      const data = await apiService.makeRequest(endpoint, {
        method: 'POST',
        data: { assignmentId: assignment._id, location: { lat, lng } },
      });

      alert(data.message || `✅ ${type} successful`);
    } catch (err) {
      console.error("Attendance Error:", err.response?.data || err.message);
      alert(err.response?.data?.error || `${type} failed`);
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  if (loading) return <div className="loading">Loading your assignments...</div>;

  return (
    <div className="assignment-viewer">
      <div className="header">
        {/* <h2>My Assignments</h2> */}
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All ({assignments.length})</button>
          <button className={`tab-btn ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>Today ({todayAssignments.length})</button>
          <button className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>Upcoming ({upcomingAssignments.length})</button>
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
            {getCurrentAssignments().map((assignment) => {
              const now = new Date();
              const endTime = new Date(`${assignment.date}T${assignment.timeSlot.end}`);
              const overdue = now > endTime;

              const distance = currentLocation
                ? getDistanceFromLatLonInMeters(
                    currentLocation.lat, currentLocation.lng,
                    assignment.location.lat, assignment.location.lng
                  ).toFixed(0)
                : null;

              return (
                <div key={assignment._id} className={`assignment-card ${overdue ? 'overdue' : ''}`}>
                  <div className="assignment-header">
                    <div className="assignment-date">{formatDate(assignment.date)}</div>
                    <div className="assignment-time">{assignment.timeSlot.start} - {assignment.timeSlot.end}</div>
                  </div>
                  <div className="assignment-content">
                    <div className="assignment-duration">
                      <span className="duration-badge">{assignment.requiredDurationMinutes} min</span>
                    </div>
                    <div className="assignment-location">
                      <strong>📍 Location:</strong>
                      <p>{addressCache[`${assignment.location.lat},${assignment.location.lng}`] || `${assignment.location.lat}, ${assignment.location.lng}`}</p>
                      {distance && <small>Distance: {distance} m</small>}
                      <button className="map-btn" onClick={() => openInMaps(assignment.location.lat, assignment.location.lng)}>🌍 Open in Google Maps</button>
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
                    <button
                      className="checkin-btn"
                      onClick={() => handleCheck(assignment, 'checkIn')}
                    >
                      ✅ Check In
                    </button>
                    <button
                      className="checkout-btn"
                      onClick={() => handleCheck(assignment, 'checkOut')}
                    >
                      ⏹️ Check Out
                    </button>
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
