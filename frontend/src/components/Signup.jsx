import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import "./Auth.css";

const Signup = () => {
  const navigate = useNavigate();

 const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "worker",
  mobileNumber: "",
  address: "",
  aadharNumber: "",
  profilePhoto: null,
  aadharFrontImage: null,
  aadharBackImage: null
});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {

    const { name, value, files } = e.target;

    if (files) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.role === "worker") 
    {
      if(!formData.mobileNumber)
      {
        setError("Mobile number is required for worker registration");
        setLoading(false);
        return;
      }
      if(!formData.address)
      {
        setError("Address required for worker registration");
        setLoading(false);
        return;
      }
    }

    try {
     const data = await apiService.signup(formData);

      apiService.setUserSession(data.token, data.user);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/worker");
      }

    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join our platform today</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="worker">Worker</option>
            </select>
          </div>

          {formData.role === "worker" && (
            <>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Enter 10-digit mobile number"
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div className="form-group">
            <label>Aadhaar Number</label>
            <input
              type="text"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              placeholder="Enter 12 digit Aadhaar number"
              pattern="[0-9]{12}"
              required
            />
          </div>

            <div className="form-group">
              <label>Profile Photo</label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Aadhaar Front Image</label>
              <input
                type="file"
                name="aadharFrontImage"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Aadhaar Back Image</label>
              <input
                type="file"
                name="aadharBackImage"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </div>

             <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your residential address"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>

        </form>

        <p className="auth-link">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="link-button"
          >
            Sign in here
          </button>
        </p>

      </div>
    </div>
  );
};

export default Signup;