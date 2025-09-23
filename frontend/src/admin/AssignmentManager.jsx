import { useState, useEffect } from 'react';
import apiService from '../services/api';
import './AssignmentManager.css';

const AssignmentManager = () => {
  const [workers, setWorkers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    workerId: '',
    date: '',
    address: '',
    location: { latitude: '', longitude: '' },
    timeSlot: { start: '', end: '' },
    requiredDurationMinutes: '',
    description: ''
  });
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersData, assignmentsData] = await Promise.all([
        apiService.getWorkers(),
        apiService.getAssignments(),
      ]);

      setWorkers(workersData.workers || []);
      setAssignments(assignmentsData.assignments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch lat/lng from OpenStreetMap Nominatim (unchanged)
  const fetchLatLng = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        latitude: data[0].lat,
        longitude: data[0].lon
      };
    }
    throw new Error("Location not found");
  };

  const handleFetchLocation = async () => {
    if (!formData.address) {
      alert("Please enter an address first.");
      return;
    }
    setFetchingLocation(true);
    try {
      const loc = await fetchLatLng(formData.address);
      setFormData({
        ...formData,
        location: {
          latitude: loc.latitude,
          longitude: loc.longitude
        }
      });
      alert(`Location found: ${loc.latitude}, ${loc.longitude}`);
    } catch (err) {
      alert("Could not fetch location: " + err.message);
    } finally {
      setFetchingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.createAssignment({
        workerId: formData.workerId,
        date: formData.date,
        location: {
          lat: parseFloat(formData.location.latitude),
          lng: parseFloat(formData.location.longitude)
        },
        timeSlot: formData.timeSlot,
        requiredDurationMinutes: parseInt(formData.requiredDurationMinutes),
        description: formData.description,
      });

      setShowCreateForm(false);
      setFormData({
        workerId: '',
        date: '',
        address: '',
        location: { latitude: '', longitude: '' },
        timeSlot: { start: '', end: '' },
        requiredDurationMinutes: '',
        description: ''
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await apiService.deleteAssignment(assignmentId);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete assignment');
    }
  };


  if (loading) {
    return <div className="loading">Loading assignments...</div>;
  }

  return (
    <div className="assignment-manager">
      <div className="header">
        <h2>Assignment Manager</h2>
        <button 
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create Assignment'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', marginBottom: '20px', borderRadius: '8px', color: 'white' }}>
        <strong>Debug Info:</strong> Found {workers.length} workers
        {workers.length > 0 && (
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {workers.map(worker => (
              <li key={worker.id}>
                {worker.name || 'Unknown Worker'} ({worker.email}) - ID: {worker.id}
              </li>
            ))}
          </ul>
        )}
      </div> */}

      {showCreateForm && (
        <div className="create-form">
          <h3>Create New Assignment</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Worker</label>
                <select
                  value={formData.workerId}
                  onChange={(e) => setFormData({...formData, workerId: e.target.value})}
                  required
                >
                  <option value="">Select Worker</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>
                      {worker.name || 'Unknown Worker'} ({worker.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={formData.timeSlot.start}
                  onChange={(e) => setFormData({
                    ...formData, 
                    timeSlot: {...formData.timeSlot, start: e.target.value}
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={formData.timeSlot.end}
                  onChange={(e) => setFormData({
                    ...formData, 
                    timeSlot: {...formData.timeSlot, end: e.target.value}
                  })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group" style={{ flex: 2 }}>
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Enter address (e.g. 1600 Amphitheatre Parkway, Mountain View, CA)"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>&nbsp;</label>
                <button
                  type="button"
                  onClick={handleFetchLocation}
                  disabled={fetchingLocation || !formData.address}
                  style={{ width: '100%' }}
                >
                  {fetchingLocation ? "Fetching..." : "Fetch Location"}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="text"
                  value={formData.location.latitude}
                  readOnly
                  placeholder="Latitude"
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="text"
                  value={formData.location.longitude}
                  readOnly
                  placeholder="Longitude"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.requiredDurationMinutes}
                  onChange={(e) => setFormData({...formData, requiredDurationMinutes: e.target.value})}
                  placeholder="480"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Assignment description"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">Create Assignment</button>
            </div>
          </form>
        </div>
      )}

      <div className="assignments-list">
        <h3>All Assignments ({assignments.length})</h3>
        {assignments.length === 0 ? (
          <p className="no-assignments">No assignments found</p>
        ) : (
          <div className="assignments-grid">
            {assignments.map(assignment => (
              <div key={assignment._id} className="assignment-card">
                <div className="assignment-header">
                  <h4>{assignment.worker?.name || 'Unknown Worker'}</h4>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(assignment._id)}
                  >
                    ×
                  </button>
                </div>
                <div className="assignment-details">
                  <p><strong>Date:</strong> {assignment.date}</p>
                  <p><strong>Time:</strong> {assignment.timeSlot.start} - {assignment.timeSlot.end}</p>
                  <p><strong>Duration:</strong> {assignment.requiredDurationMinutes} minutes</p>
                  <p><strong>Location:</strong> {assignment.location.lat || assignment.location.latitude}, {assignment.location.lng || assignment.location.longitude}</p>
                  {assignment.description && (
                    <p><strong>Description:</strong> {assignment.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManager;