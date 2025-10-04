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
  const [addressCache, setAddressCache] = useState({});
  const [attendanceStatus, setAttendanceStatus] = useState({});

  // ----------------------------
  // Fetch assignments
  // ----------------------------
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

      // Optionally: fetch previous attendance from backend
      const attendance = await apiService.makeRequest('/worker/attendance/status');
      setAttendanceStatus(attendance || {});
    } catch (err) {
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

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
      setAddressCache((prev) => ({ ...prev, [key]: address }));
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

  // ----------------------------
  // Check-In / Check-Out
  // ----------------------------
  const handleCheckIn = async (assignment) => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { lat, lng } = coords;
      const distance = getDistanceFromLatLonInMeters(
        lat, lng,
        assignment.location.lat,
        assignment.location.lng
      );

      const now = new Date();
      const startTime = new Date(`${assignment.date}T${assignment.timeSlot.start}`);
      const endTime = new Date(`${assignment.date}T${assignment.timeSlot.end}`);

      const valid = distance <= 200 && now >= startTime && now <= endTime;

      try {
        const data = await apiService.makeRequest('/worker/attendance/start', {
          method: 'POST',
          data: { assignmentId: assignment._id, location: { lat, lng }, valid },
        });

        alert(data.message || (valid ? "✅ Check-in valid!" : "❌ Check-in invalid!"));

        setAttendanceStatus((prev) => ({
          ...prev,
          [assignment._id]: { ...prev[assignment._id], checkIn: valid ? 'valid' : 'invalid' },
        }));
      } catch (err) {
        alert("Check-in failed");
      }
    });
  };

  const handleCheckOut = async (assignment) => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { lat, lng } = coords;
      const distance = getDistanceFromLatLonInMeters(
        lat, lng,
        assignment.location.lat,
        assignment.location.lng
      );

      const now = new Date();
      const startTime = new Date(`${assignment.date}T${assignment.timeSlot.start}`);
      const endTime = new Date(`${assignment.date}T${assignment.timeSlot.end}`);

      const valid = distance <= 200 && now >= startTime && now <= endTime;

      try {
        const data = await apiService.makeRequest('/worker/attendance/end', {
          method: 'POST',
          data: { assignmentId: assignment._id, location: { lat, lng }, valid },
        });

        alert(data.message || (valid ? "✅ Check-out valid!" : "❌ Check-out invalid!"));

        setAttendanceStatus((prev) => ({
          ...prev,
          [assignment._id]: { ...prev[assignment._id], checkOut: valid ? 'valid' : 'invalid' },
        }));
      } catch (err) {
        alert("Check-out failed");
      }
    });
  };

  // ----------------------------
  // Render
  // ----------------------------
  if (loading) return <div className="loading">Loading your assignments...</div>;

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
                  <div className="assignment-time">{assignment.timeSlot.start} - {assignment.timeSlot.end}</div>
                </div>
                <div className="assignment-content">
                  <div className="assignment-duration">
                    <span className="duration-badge">{assignment.requiredDurationMinutes} min</span>
                  </div>
                  <div className="assignment-location">
                    <strong>📍 Location:</strong>
                    <p>{addressCache[`${assignment.location.lat},${assignment.location.lng}`] || `${assignment.location.lat}, ${assignment.location.lng}`}</p>
                    <button className="map-btn" onClick={() => openInMaps(assignment.location.lat, assignment.location.lng)}>
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
                </div>

                <div className="assignment-actions">
                  <button
                    className="checkin-btn"
                    onClick={() => handleCheckIn(assignment)}
                    disabled={attendanceStatus[assignment._id]?.checkIn === 'valid'}
                  >
                    ✅ Check In {attendanceStatus[assignment._id]?.checkIn === 'invalid' ? '❌' : ''}
                  </button>

                  <button
                    className="checkout-btn"
                    onClick={() => handleCheckOut(assignment)}
                    disabled={attendanceStatus[assignment._id]?.checkOut === 'valid'}
                  >
                    ⏹️ Check Out {attendanceStatus[assignment._id]?.checkOut === 'invalid' ? '❌' : ''}
                  </button>
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
