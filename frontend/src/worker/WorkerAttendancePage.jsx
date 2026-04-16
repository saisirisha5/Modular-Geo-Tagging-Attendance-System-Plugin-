import { useRef, useState, useEffect } from "react";
import apiService from "../services/api";
import "./WorkerAttendancePage.css";

const WorkerAttendancePage = ({ assignment, goBack }) => {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
    } catch (err) {
      alert("Camera access denied");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = 300;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 300, 300);

    const image = canvas.toDataURL("image/png", 0.5);
    setCapturedImage(image);

    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const handleSubmit = async (type) => {
    if (!capturedImage || !location) {
      alert("Capture photo & location first");
      return;
    }

    setLoading(true);

    try {
      let res;

      if (type === "checkIn") {
        res = await apiService.checkIn(
          assignment._id,
          location.lat,
          location.lng,
          capturedImage
        );
      } else {
        res = await apiService.checkOut(
          assignment._id,
          location.lat,
          location.lng,
          capturedImage
        );
      }

      alert(res.message);
      goBack();

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="attendance-container">

      <div className="attendance-card">

        <div className="attendance-header">
          <h2>{assignment.title}</h2>
          <button className="attendance-back-btn" onClick={goBack}>
            ← Back
            </button>
        </div>

       <div className="attendance-info">
        <p><strong>Date:</strong> {assignment.date}</p>
        <p><strong>Duration:</strong> {assignment.requiredDurationMinutes} mins</p>
        </div>

        <div className="camera-container">

          {!capturedImage && (
            <>
              <video ref={videoRef} autoPlay className="camera-video" />

              <button className="start-camera-btn" onClick={startCamera}>
                🎥 Start Camera
                </button>

                <button className="capture-btn" onClick={capturePhoto} disabled={!stream}>
                📸 Capture
                </button>
            </>
          )}

          {capturedImage && (
            <img src={capturedImage} alt="preview" className="camera-preview" />
          )}

        </div>

        <div className="attendance-actions">

          <button
            className="checkin-btn"
            onClick={() => handleSubmit("checkIn")}
            disabled={loading}
            >
            ✅ Check In
            </button>

            <button
            className="checkout-btn"
            onClick={() => handleSubmit("checkOut")}
            disabled={loading}
            >
            ⏹️ Check Out
            </button>

        </div>

        <canvas ref={canvasRef} style={{ display: "none" }} />

      </div>

    </div>
  );
};

export default WorkerAttendancePage;