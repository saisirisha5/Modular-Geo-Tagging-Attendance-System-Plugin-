import { useState, useEffect } from "react";
import apiService from "../services/api";
import "./WorkerProfile.css";

const IMAGE_BASE_URL = "http://localhost:5000";

const WorkerProfile = () => {

  const [user, setUser] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);

 useEffect(() => {

  const fetchProfile = async () => {

    try {

      const res = await apiService.getWorkerProfile();

      setUser({
        ...res.profile,
        name: res.user.name,
        email: res.user.email
      });

    } catch (err) {

      alert(err.message);

    }

  };

  fetchProfile();

}, []);

  if (!user) return <div>Loading profile...</div>;

const getResidenceLocation = () => {

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(

    async (pos) => {

      try {

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const res = await apiService.updateResidenceLocation(lat, lng);

      setUser({
        ...user,
        residenceLocation: {
          lat,
          lng
        }
      });

        alert(res.message);

      } catch (err) {

        alert(err.message);

      }

    },

    () => alert("Unable to retrieve your location"),

    { enableHighAccuracy: true }

  );

};

  const handleUpdate = async () => {

    try {

      const formData = new FormData();
      formData.append("mobileNumber", user.mobileNumber);
      formData.append("address", user.address);
      formData.append("aadharNumber", user.aadharNumber);

    if (user.residenceLocation?.lat)
      formData.append("residenceLat", user.residenceLocation.lat);

    if (user.residenceLocation?.lng)
      formData.append("residenceLng", user.residenceLocation.lng);

      if (newPhoto) {
        formData.append("profilePhoto", newPhoto);
      }

    const res = await apiService.updateWorkerProfile(formData);
    alert(res.message);

    } catch (err) {

      alert(err.message);

    }
  };

 const locationStatus =
  user.residenceLocation?.lat && user.residenceLocation?.lng
    ? "Location Set"
    : "Location Not Set";

  return (
    <div className="profile-container">

      <div className="profile-section">

        <h2>Profile Details</h2>

        <div className="profile-photo-wrapper">
            <img
                src={
                user.profilePhoto
                    ? `${IMAGE_BASE_URL}/${user.profilePhoto}`
                    : "/default-avatar.png"
                }
                alt="profile"
                className="profile-img"
            />

            <label className="photo-overlay">
                ✏️Edit
                <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewPhoto(e.target.files[0])}
                hidden
                />
            </label>

            </div>
            

        <div className="profile-fields">

          <label>Name</label>
          <input value={user.name || ""} disabled />

          <label>Email</label>
          <input value={user.email || ""} disabled />

          <label>Mobile Number</label>
          <input
            value={user.mobileNumber || ""}
            onChange={(e) =>
              setUser({ ...user, mobileNumber: e.target.value })
            }
          />

          <label>Address</label>
          <input
            value={user.address || ""}
            onChange={(e) =>
              setUser({ ...user, address: e.target.value })
            }
          />

          <label>Aadhar Number</label>
          <input
            value={user.aadharNumber || ""}
            onChange={(e) =>
              setUser({ ...user, aadharNumber: e.target.value })
            }
          />

        </div>

        <button
          className="btn-primary"
          onClick={handleUpdate}
        >
          Update Profile
        </button>

      </div>

      <div className="profile-section">

        <div className="location-header">

          <h2>Residence Location</h2>

          <span className="info-icon">
            ⓘ
            <span className="info-tooltip">
              Your residence location helps us assign work closer to you.
              This reduces travel time and helps us find the nearest worker
              for an assignment. This location is only used for job allocation.
            </span>
          </span>

        </div>

        <p className="location-status">
          {locationStatus}
        </p>

        <p className="location-helper">
          Update this only if your residence location has changed.
        </p>

        <button
          className="btn-secondary"
          onClick={getResidenceLocation}
        >
          📍 Update Residence Location
        </button>

      </div>

    </div>
  );
};

export default WorkerProfile;