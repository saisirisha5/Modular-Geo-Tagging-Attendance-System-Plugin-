import { Routes, Route, Navigate} from 'react-router-dom';

import Login from './components/Login';
import Signup from './components/Signup';
import AdminHomepage from './admin/AdminHomepage';
import WorkerHomepage from './worker/WorkerHomepage';
import ProtectedRoute from './components/ProtectedRoutes';
import './App.css';

function App() {

  const token=localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

return (
    <div className="App">

      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminHomepage />
              </ProtectedRoute>
            }
          />

        {/* Worker Route */}
        
       <Route
          path="/worker"
          element={
            <ProtectedRoute role="worker">
              <WorkerHomepage />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>

    </div>
  );
}

export default App;