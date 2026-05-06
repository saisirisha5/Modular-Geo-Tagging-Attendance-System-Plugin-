import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-wrapper">
          <div className="hero-left">
            <h1>
              Modular Geo-Tagging <br />
              Attendance System 
            </h1>
            <p>          
            </p>

            <div className="hero-buttons">
              <Link
                to="/login"
                className="hero-btn primary-btn"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="hero-btn secondary-btn"
              >
                Signup
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <h2 className="section-title">
         The Why ?
        </h2>
        <p className="section-subtitle">
            Know why and for whom we built this system
        </p> 

        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="workflow-step">1</div>
            <h3>NGO Field Operations</h3>
            <p>
             NGOs managing field volunteers often face
            difficulties in tracking whether volunteers
            actually visit assigned locations and complete tasks.
            </p>
          </div>

          <div className="workflow-card">
            <div className="workflow-step">2</div>
             <h3>Accountability</h3>
                <p>
                Organizations require a reliable way
                to ensure volunteers complete assigned
                tasks within expected time periods.
                </p>
          </div>

          <div className="workflow-card">
            <div className="workflow-step">3</div>
            <h3>Better Coordination</h3>
            <p>
             Managing field workers manually becomes
            difficult as the number of assignments,
            volunteers and locations increases.
            </p>
          </div>

          <div className="workflow-card">
            <div className="workflow-step">4</div>
            <h3>Record Management</h3>
            <p>
              Managing attendance and volunteer reports
            using paper records or spreadsheets becomes
            inefficient, time-consuming and difficult
            to track at scale.
            </p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">
          Core Features
        </h2>
        <p className="section-subtitle">
          Built with geo-location intelligence,
          worker monitoring and attendance analytics.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Geo Tagging</h3>
            <p>
              Validate attendance using volunteer location.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">⌚</div>
            <h3>Time Tracking</h3>
            <p>
              Tracking work hours of the volunteers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Photo Verification</h3>
            <p>
              Volunteers capture check-in and check-out photos for additional verification.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Reports & Analytics</h3>
            <p>
              Powerful admin and volunteer analytics dashboards.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Role Based Access</h3>
            <p>
              A secure role-based access for admin & volunteers.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Nearest Worker Suggestions</h3>
            <p>
              Automatically suggest nearest workers for tasks.
            </p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <h3>
          Modular Geo-Tagging Attendance System
        </h3>
        <p>
          © 2026 Prabhala Sai Sirisha Devi.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;