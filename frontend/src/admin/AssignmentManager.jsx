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
    location: { latitude: '', longitude: '' },
    timeSlot: { start: '', end: '' },
    requiredDurationMinutes: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [workersRes, assignmentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/workers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }),
        fetch('http://localhost:5000/api/admin/assignments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
      ]);

      const workersData = await workersRes.json();
      const assignmentsData = await assignmentsRes.json();

      if (workersRes.ok) {
        console.log('Workers data:', workersData);
        setWorkers(workersData.workers);
      } else {
        console.error('Workers fetch failed:', workersData);
        setError(`Failed to fetch workers: ${workersData.error || 'Unknown error'}`);
      }
      
      if (assignmentsRes.ok) {
        setAssignments(assignmentsData.assignments);
      } else {
        console.error('Assignments fetch failed:', assignmentsData);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting assignment data:', formData);
      
      const response = await fetch('http://localhost:5000/api/admin/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          location: {
            latitude: parseFloat(formData.location.latitude),
            longitude: parseFloat(formData.location.longitude)
          },
          requiredDurationMinutes: parseInt(formData.requiredDurationMinutes)
        })
      });

      const responseData = await response.json();
      console.log('Assignment creation response:', responseData);

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          workerId: '',
          date: '',
          location: { latitude: '', longitude: '' },
          timeSlot: { start: '', end: '' },
          requiredDurationMinutes: '',
          description: ''
        });
        fetchData(); // Refresh data
      } else {
        setError(responseData.error || 'Failed to create assignment');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        setError('Failed to delete assignment');
      }
    } catch (err) {
      setError('Network error');
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

      {/* Debug info - remove this later */}
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', marginBottom: '20px', borderRadius: '8px', color: 'white' }}>
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
      </div>

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
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.latitude}
                  onChange={(e) => setFormData({
                    ...formData, 
                    location: {...formData.location, latitude: e.target.value}
                  })}
                  placeholder="40.7128"
                  required
                />
              </div>
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.location.longitude}
                  onChange={(e) => setFormData({
                    ...formData, 
                    location: {...formData.location, longitude: e.target.value}
                  })}
                  placeholder="-74.0060"
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
                  <p><strong>Location:</strong> {assignment.location.latitude}, {assignment.location.longitude}</p>
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