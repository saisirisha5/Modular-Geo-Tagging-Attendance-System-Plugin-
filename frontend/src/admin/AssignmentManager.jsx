import { useState, useEffect } from 'react';
import apiService from '../services/api';
import './AssignmentManager.css';
import MapPicker from '../components/MapPicker';

const AssignmentManager = () => {
  const [workers, setWorkers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    workerIds: [],
    date: '',
    address: '',
    timeSlot: { start: '', end: '' },
    requiredDurationMinutes: '',
    title:'',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showCreateForm) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  }, [showCreateForm]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [workersData, assignmentsData] = await Promise.all([
        apiService.getWorkers(),
        apiService.getAssignments()
      ]);

      setWorkers(workersData.workers || []);
      setAssignments(assignmentsData.assignments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.timeSlot.start >= formData.timeSlot.end) {
      setError('End time must be after start time');
      return;
    }

    if (!selectedLocation) {
      setError('Please select location on map');
      return;
    }

    if (!isEditMode && formData.workerIds.length === 0) {
      setError('Please select at least one worker');
      return;
    }

    try {
      const payload = {
        workerIds: formData.workerIds,
        date: formData.date,
        address: formData.address,
        location: selectedLocation,
        timeSlot: formData.timeSlot,
        requiredDurationMinutes: Number(formData.requiredDurationMinutes),
        title: formData.title,
        description: formData.description
      };

      if (isEditMode) {
        await apiService.updateAssignment(editingId, payload);
      } else {
        await apiService.createAssignment(payload);
      }

      setIsEditMode(false);
      setEditingId(null);
      setShowCreateForm(false);
      setSelectedLocation(null);

      setFormData({
        workerIds: [],
        date: '',
        address: '',
        timeSlot: { start: '', end: '' },
        requiredDurationMinutes: '',
        title: '',
        description: ''
      });

      fetchData();

    } catch (err) {
      setError(err.message || 'Failed to save assignment');
    }
  };

  const handleEdit = (assignment) => {
    setIsEditMode(true);
    setEditingId(assignment._id);
    setShowCreateForm(true);

    setFormData({
      workerIds: assignment.worker?._id
        ? [assignment.worker._id]
        : [],
      date: assignment.date,
      address: assignment.address,
      timeSlot: assignment.timeSlot,
      requiredDurationMinutes: assignment.requiredDurationMinutes,
      title: assignment.title,
      description: assignment.description
    });

    setSelectedLocation(assignment.location);
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
        <button
          className="create-btn"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setIsEditMode(false);
            setEditingId(null);
            setSelectedLocation(null);
          }}
        >
          {showCreateForm ? 'Cancel' : 'Create Assignment'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showCreateForm && (
        <div className="create-form">
          <h3>
            {isEditMode ? 'Update Assignment' : 'Create New Assignment'}
          </h3>

          <form onSubmit={handleSubmit}>

            {/* WORKERS */}
            <div className="form-group">
            <label>Workers</label>

            {isEditMode ? (
              <input
                type="text"
                value={
                  workers.find(w => w.id === formData.workerIds[0])?.name || ''
                }
                disabled
              />
            ) : (
              <div className="worker-checkbox-list">
                {workers.map(worker => (
                  <label key={worker.id} className="worker-checkbox-item">
                    <input
                      type="checkbox"
                      value={worker.id}
                      checked={formData.workerIds.includes(worker.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            workerIds: [...formData.workerIds, worker.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            workerIds: formData.workerIds.filter(id => id !== worker.id)
                          });
                        }
                      }}
                    />
                    {worker.name} ({worker.email})
                  </label>
                ))}
              </div>
            )}

            {!isEditMode && formData.workerIds.length === 0 && (
              <small style={{ color: '#666' }}>
                Select at least one worker
              </small>
            )}
          </div>

            {/* DATE */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            {/* TIME */}
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={formData.timeSlot.start}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeSlot: { ...formData.timeSlot, start: e.target.value }
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={formData.timeSlot.end}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeSlot: { ...formData.timeSlot, end: e.target.value }
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            {/* MAP */}
            <div style={{ marginTop: '20px' }}>
              <MapPicker
                onLocationSelect={setSelectedLocation}
                initialLocation={selectedLocation}
              />
            </div>

            {/* DURATION */}
            <div className="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                value={formData.requiredDurationMinutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requiredDurationMinutes: e.target.value
                  })
                }
                required
              />
            </div>

            {/* TITLE */}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {isEditMode ? 'Update Assignment' : 'Create Assignment'}
              </button>
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
                    onClick={() => handleEdit(assignment)}
                    style={{
                      marginRight: '10px',
                      background: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(assignment._id)}
                  >
                    ×
                  </button>
                </div>

                <div className="assignment-details">
                  <p><strong>Date:</strong> {assignment.date}</p>
                  <p><strong>Time:</strong> {assignment.timeSlot.start} – {assignment.timeSlot.end}</p>
                  <p><strong>Duration:</strong> {assignment.requiredDurationMinutes} minutes</p>
                  <p><strong>Address:</strong> {assignment.address}</p>
                  <p><strong>Title:</strong>{assignment.title}</p>
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