import Assignment from '../../models/assignmentSchema.js';
import User from '../../models/userSchema.js';

// GET /worker/assignments - Get all assignments for the logged-in worker
export const getWorkerAssignments = async (req, res) => {
  try {
    const workerUserId = req.user.id;

    // Verify worker role
    const workerUser = await User.findById(workerUserId);
    if (!workerUser || workerUser.role !== 'worker') {
      return res.status(403).json({ error: "Access denied. Worker role required." });
    }

    const assignments = await Assignment.find({ worker: workerUser.profile })
      .populate('assignedBy', 'name')
      .sort({ date: 1, 'timeSlot.start': 1 });

    res.status(200).json({
      message: "Assignments retrieved successfully",
      count: assignments.length,
      assignments
    });
  } catch (err) {
    console.error("Worker Assignments Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch assignments", details: err.message });
  }
};

// GET /worker/assignments/:id - Get specific assignment details for worker
export const getWorkerAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const workerUserId = req.user.id;

    // Verify worker role
    const workerUser = await User.findById(workerUserId);
    if (!workerUser || workerUser.role !== 'worker') {
      return res.status(403).json({ error: "Access denied. Worker role required." });
    }

    const assignment = await Assignment.findById(id)
      .populate('assignedBy', 'name');

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if assignment belongs to this worker
    if (assignment.worker.toString() !== workerUser.profile.toString()) {
      return res.status(403).json({ error: "Access denied. You can only view your own assignments." });
    }

    res.status(200).json({
      message: "Assignment retrieved successfully",
      assignment
    });
  } catch (err) {
    console.error("Worker Assignment Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch assignment", details: err.message });
  }
};

// GET /worker/assignments/today - Get today's assignments for worker
export const getTodayAssignments = async (req, res) => {
  try {
    const workerUserId = req.user.id;

    // Verify worker role
    const workerUser = await User.findById(workerUserId);
    if (!workerUser || workerUser.role !== 'worker') {
      return res.status(403).json({ error: "Access denied. Worker role required." });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const assignments = await Assignment.find({ 
      worker: workerUser.profile,
      date: today
    })
      .populate('assignedBy', 'name')
      .sort({ 'timeSlot.start': 1 });

    res.status(200).json({
      message: "Today's assignments retrieved successfully",
      count: assignments.length,
      date: today,
      assignments
    });
  } catch (err) {
    console.error("Today's Assignments Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch today's assignments", details: err.message });
  }
};

// GET /worker/assignments/upcoming - Get upcoming assignments for worker
export const getUpcomingAssignments = async (req, res) => {
  try {
    const workerUserId = req.user.id;

    // Verify worker role
    const workerUser = await User.findById(workerUserId);
    if (!workerUser || workerUser.role !== 'worker') {
      return res.status(403).json({ error: "Access denied. Worker role required." });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const assignments = await Assignment.find({ 
      worker: workerUser.profile,
      date: { $gte: today }
    })
      .populate('assignedBy', 'name')
      .sort({ date: 1, 'timeSlot.start': 1 })
      .limit(10); // Limit to next 10 assignments

    res.status(200).json({
      message: "Upcoming assignments retrieved successfully",
      count: assignments.length,
      assignments
    });
  } catch (err) {
    console.error("Upcoming Assignments Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch upcoming assignments", details: err.message });
  }
}; 