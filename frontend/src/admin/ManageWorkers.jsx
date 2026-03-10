import { useState, useEffect } from "react";
import apiService from "../services/api";
import "./ManageWorkers.css";

const ManageWorkers = () => {

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH WORKERS
  ========================= */

  const fetchWorkers = async () => {
    try {

      setLoading(true);

      const data = await apiService.getWorkers();

      setWorkers(data.workers || []);

    } catch (err) {

      setError(err.message || "Failed to load workers");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  /* =========================
     DELETE WORKER
  ========================= */

  const handleDelete = async (workerId) => {

    if (!window.confirm("Remove this worker?")) return;

    try {

      await apiService.deleteWorker(workerId);

      fetchWorkers();

    } catch (err) {

      setError(err.message || "Failed to remove worker");

    }

  };

  if (loading) {
    return <div className="loading">Loading workers...</div>;
  }

  return (
    <div className="workers-manager">

      {error && <div className="error-message">{error}</div>}

      <h3>Registered Workers ({workers.length})</h3>

      {workers.length === 0 ? (
        <p>No workers found</p>
      ) : (
        <div className="workers-grid">

          {workers.map(worker => (

            <div key={worker.id} className="worker-card">

              <div className="worker-header">
                <h4>{worker.name}</h4>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(worker.id)}
                >
                  ×
                </button>

              </div>

              <div className="worker-details">

                <p>
                  <strong>Email:</strong> {worker.email}
                </p>

                <p>
                  <strong>Mobile:</strong> {worker.mobileNumber || "N/A"}
                </p>

                <p>
                  <strong>Address:</strong> {worker.address || "N/A"}
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default ManageWorkers;