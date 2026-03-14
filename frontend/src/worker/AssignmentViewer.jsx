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
    const [currentLocation, setCurrentLocation] = useState(null);

    /* ==========================
      FETCH ASSIGNMENTS
    ========================== */

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

    /* ==========================
      UTILS
    ========================== */

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

    /* ==========================
      GET LIVE USER LOCATION
    ========================== */

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

    /* ==========================
      CHECK IN / CHECK OUT
    ========================== */

    const handleCheck = async (assignment, type) => {

      if (!currentLocation) {

        alert('Current location not available');
        return;

      }

      const { lat, lng } = currentLocation;

      try {

        let data;

        if (type === "checkIn") {

          data = await apiService.startAttendance(
            assignment._id,
            lat,
            lng
          );

        } else {

          data = await apiService.endAttendance(
            assignment._id,
            lat,
            lng
          );

        }

        alert(data.message || `✅ ${type} successful`);

      } catch (err) {

        console.error("Attendance Error:", err);

        alert(err.response?.data?.error || `${type} failed`);

      }
    };

/* ========================
      DATE FORMAT (12 hrs format)
  =========================*/
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

    /* ==========================
      RENDER
    ========================== */

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
              <small>Check back later for new assignments</small>
            </div>

          ) : (

            <div className="assignments-grid">

              {getCurrentAssignments().map((assignment) => {

                const now = new Date();

                const endTime = new Date(
                  `${assignment.date}T${assignment.timeSlot.end}`
                );

                const overdue = now > endTime;

                const distance = currentLocation
                  ? getDistanceFromLatLonInMeters(
                      currentLocation.lat,
                      currentLocation.lng,
                      assignment.location.lat,
                      assignment.location.lng
                    ).toFixed(0)
                  : null;

                return (

                  <div
                    key={assignment._id}
                    className={`assignment-card ${overdue ? 'overdue' : ''}`}
                  >

                    <div className="assignment-header">

                      <div className="assignment-title">
                        <strong> {assignment.title || 'No Title'} </strong>   
                      </div>

                    </div>

                    <div className="assignment-content">
          
                      <div className="assignment-date">
                        {formatDate(assignment.date)}
                      </div>

                      <div className="assignment-time">
                       🕒{formatTime(assignment.timeSlot.start)} - {formatTime(assignment.timeSlot.end)}
                      </div>

                      <div className="assignment-duration">
                        <span className="duration-badge">
                          {assignment.requiredDurationMinutes} min
                        </span>
                      </div>

                      <div className="assignment-location">

                        <strong>📍 Location:</strong>

                      <p>
                        {assignment.address || "Address not available"}
                      </p>

                        <button
                          className="map-btn"
                          onClick={() =>
                            openInMaps(
                              assignment.location.lat,
                              assignment.location.lng
                            )
                          }
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