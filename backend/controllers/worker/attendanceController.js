// controllers/worker/attendanceController.js
import Assignment from '../../models/assignmentSchema.js';
import Attendance from '../../models/attendanceSchema.js';
import User from '../../models/userSchema.js';
import haversine from 'haversine-distance'; // npm install haversine-distance

// CONFIG: allowed location error margin in meters
const LOCATION_RADIUS_METERS = 100000;// added area only due to api issues and increased the area to 100000 m

// POST /worker/attendance/start
export const startAttendance = async (req, res) => {
  try {
    const workerUserId = req.user.id;
    const { assignmentId, location } = req.body; // location = { lat, lng }

    if (!assignmentId || !location?.lat || !location?.lng) {
      return res.status(400).json({ error: "Missing assignmentId or location" });
    }

    // Validate worker
    const worker = await User.findById(workerUserId);
    if (!worker || worker.role !== 'worker') {
      return res.status(403).json({ error: "Access denied. Worker role required." });
    }

    // Get assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.worker.toString() !== worker.profile.toString()) {
      return res.status(404).json({ error: "Assignment not found or not yours" });
    }

    // Check time slot start validity
    const now = new Date();
    const slotStart = new Date(`${assignment.date}T${assignment.timeSlot.start}`);
    const slotEnd = new Date(`${assignment.date}T${assignment.timeSlot.end}`);

    if (now < slotStart || now > slotEnd) {
      return res.status(400).json({ error: "Attendance can only be started within the assigned time slot" });
    }

    // Check location radius
    const assignmentLoc = {
      lat: assignment.location.lat,
      lng: assignment.location.lng
    };
    const distance = haversine(assignmentLoc, location);

    if (distance > LOCATION_RADIUS_METERS) {
      return res.status(400).json({ error: "You are not at the assigned location" });
    }

    // Save attendance record
    const attendance = new Attendance({
      worker: worker.profile,
      assignment: assignmentId,
      startTime: now,
      startLocation: location,
      status: 'in-progress'
    });

    await attendance.save();

    res.status(201).json({ message: "Attendance started", attendance });
  } catch (err) {
    console.error("Start Attendance Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// POST /worker/attendance/end
export const endAttendance = async (req, res) => {
  try {
    const workerUserId = req.user.id;
    const { assignmentId, location } = req.body;

    if (!assignmentId || !location?.lat || !location?.lng) {
      return res.status(400).json({ error: "Missing assignmentId or location" });
    }

    const worker = await User.findById(workerUserId);
    if (!worker || worker.role !== 'worker') {
      return res.status(403).json({ error: "Access denied. Worker role required." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.worker.toString() !== worker.profile.toString()) {
      return res.status(404).json({ error: "Assignment not found or not yours" });
    }

    // Find ongoing attendance
    const attendance = await Attendance.findOne({
      worker: worker.profile,
      assignment: assignmentId,
      status: 'in-progress'
    });

    if (!attendance) {
      return res.status(400).json({ error: "No in-progress attendance found" });
    }

    const now = new Date();
    const assignmentLoc = {
      lat: assignment.location.lat,
      lng: assignment.location.lng
    };
    const distance = haversine(assignmentLoc, location);

    if (distance > LOCATION_RADIUS_METERS) {
      return res.status(400).json({ error: "You are not at the assigned location" });
    }

    // Duration check
    const durationMinutes = (now - attendance.startTime) / (1000 * 60);
    if (durationMinutes < assignment.requiredDurationMinutes) {
      return res.status(400).json({ error: `Required duration not completed. You have worked ${Math.floor(durationMinutes)} mins.` });
    }

    attendance.endTime = now;
    attendance.endLocation = location;
    attendance.status = 'completed';
    await attendance.save();

    res.status(200).json({ message: "Attendance completed", attendance });
  } catch (err) {
    console.error("End Attendance Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};
