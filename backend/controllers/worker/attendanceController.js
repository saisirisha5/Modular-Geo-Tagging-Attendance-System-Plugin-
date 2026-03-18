import Assignment from '../../models/assignmentSchema.js';
import Attendance from '../../models/attendanceSchema.js';
import User from '../../models/userSchema.js';
import haversine from 'haversine-distance';

// LOCATION LIMIT (100 meters)
const LOCATION_RADIUS_METERS = 100;

/* =====================================================
   CHECK-IN
   POST /worker/attendance/check-in
===================================================== */
export const checkIn = async (req, res) => {
  try {
    const workerUserId = req.user.id;
    const { assignmentId, location, photoUrl } = req.body;

    if (!assignmentId || !location?.lat || !location?.lng || !photoUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Worker validation
    const worker = await User.findById(workerUserId);
    if (!worker || worker.role !== 'worker') {
      return res.status(403).json({ error: "Access denied" });
    }

    // Assignment validation
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.worker.toString() !== worker.profile.toString()) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const now = new Date();

    const slotStart = new Date(`${assignment.date}T${assignment.timeSlot.start}`);
    const slotEnd = new Date(`${assignment.date}T${assignment.timeSlot.end}`);

    // TIME VALIDATION
    if (now < slotStart || now > slotEnd) {
      return res.status(422).json({
        error: "Invalid time",
        failureReason: { type: "TIME", message: "Outside time slot" }
      });
    }

    // LOCATION VALIDATION
    const distance = haversine(
      { lat: assignment.location.lat, lng: assignment.location.lng },
      location
    );

    if (distance > LOCATION_RADIUS_METERS) {
      return res.status(400).json({
        error: "Invalid location",
        failureReason: { type: "LOCATION", message: "Too far from assignment location" }
      });
    }

    // Prevent multiple check-ins
    const existing = await Attendance.findOne({
      worker: worker.profile,
      assignment: assignmentId
    });

    if (existing?.status !== 'checked-in') {
      return res.status(409).json({ error: "Already checked-in" });
    }
    if (existing?.status === 'completed') {
      return res.status(409).json({ error: "Attendance already completed" });
    }

    // CREATE / UPDATE attendance
    const attendance = await Attendance.findOneAndUpdate(
      { worker: worker.profile, assignment: assignmentId },
      {
        worker: worker.profile,
        assignment: assignmentId,
        checkInTime: now,
        checkInLocation: location,
        checkInPhoto: photoUrl,
        status: 'checked-in',
        failureReason: null
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Check-in successful",
      attendance
    });

  } catch (err) {
    console.error("Check-in Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


/* =====================================================
   CHECK-OUT
   POST /worker/attendance/check-out
===================================================== */
export const checkOut = async (req, res) => {
  try {
    const workerUserId = req.user.id;
    const { assignmentId, location, photoUrl } = req.body;

    if (!assignmentId || !location?.lat || !location?.lng || !photoUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const worker = await User.findById(workerUserId);
    if (!worker || worker.role !== 'worker') {
      return res.status(403).json({ error: "Access denied" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || assignment.worker.toString() !== worker.profile.toString()) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Find existing attendance
    const attendance = await Attendance.findOne({
      worker: worker.profile,
      assignment: assignmentId,
      status: 'checked-in'
    });

    if (!attendance) {
      return res.status(409).json({ error: "Check-in not found" });
    }

    const now = new Date();

    // LOCATION VALIDATION
    const distance = haversine(
      { lat: assignment.location.lat, lng: assignment.location.lng },
      location
    );

    if (distance > LOCATION_RADIUS_METERS) {
      return res.status(422).json({
        error: "Invalid location",
        failureReason: { type: "LOCATION", message: "Too far from assignment location" }
      });
    }

    // DURATION VALIDATION
    const durationMinutes = (now - attendance.checkInTime) / (1000 * 60);

    if (durationMinutes < assignment.requiredDurationMinutes) {
      return res.status(422).json({
        error: `Worked only ${Math.floor(durationMinutes)} mins`,
        failureReason: {
          type: "DURATION",
          message: "Required duration not met"
        }
      });
    }

    // UPDATE attendance
    attendance.checkOutTime = now;
    attendance.checkOutLocation = location;
    attendance.checkOutPhoto = photoUrl;
    attendance.durationMinutes = durationMinutes;
    attendance.locationDeviationMeters = distance;
    attendance.status = 'completed';
    attendance.failureReason = null;

    await attendance.save();

    res.status(200).json({
      message: "Check-out successful",
      attendance
    });

  } catch (err) {
    console.error("Check-out Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};