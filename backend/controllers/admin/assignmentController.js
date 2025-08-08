import Assignment from '../../models/assignmentSchema.js';
import WorkerProfile from '../../models/workerProfile.js';
import User from '../../models/userSchema.js';

// POST /admin/assign - Create assignment for a worker
export const createAssignment = async (req, res) => {
  try {
    const { workerId, date, location, timeSlot, requiredDurationMinutes, description } = req.body;
    const adminUserId = req.user.id; // This is the User ID from JWT

    // Validate required fields
    if (!workerId || !date || !location || !timeSlot) {
      return res.status(400).json({ 
        error: "Missing required fields: workerId, date, location, timeSlot" 
      });
    }

    // Get admin user and their profile
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    // Validate worker exists and is actually a worker
    const workerUser = await User.findById(workerId);
    if (!workerUser || workerUser.role !== 'worker') {
      return res.status(404).json({ error: "Worker not found" });
    }

    // Get worker profile
    const workerProfile = await WorkerProfile.findById(workerUser.profile);
    if (!workerProfile) {
      return res.status(404).json({ error: "Worker profile not found" });
    }

    // Check for duplicate assignment on the same date and time
    const existingAssignment = await Assignment.findOne({
      worker: workerUser.profile,
      date,
      $or: [
        {
          'timeSlot.start': { $lt: timeSlot.end },
          'timeSlot.end': { $gt: timeSlot.start }
        }
      ]
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        error: "Worker already has an assignment during this time slot" 
      });
    }

    // Create assignment
    const assignment = new Assignment({
      worker: workerUser.profile, // Use the worker's profile ID
      assignedBy: adminUser.profile, // Use the admin's profile ID
      date,
      location,
      timeSlot,
      requiredDurationMinutes: requiredDurationMinutes || 0,
      description: description || ''
    });

    await assignment.save();

    // Populate worker details for response
    await assignment.populate('worker', 'name email');

    res.status(201).json({ 
      message: "Assignment created successfully", 
      assignment 
    });
  } catch (err) {
    console.error("Assignment Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

// GET /admin/assignments - Get all assignments created by admin
export const getAllAssignmentsByAdmin = async (req, res) => {
  try {
    const adminUserId = req.user.id;

    // Get admin user and their profile
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    const assignments = await Assignment.find({ assignedBy: adminUser.profile })
      .populate('worker', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Assignments retrieved successfully",
      count: assignments.length,
      assignments
    });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch assignments", details: err.message });
  }
};

// GET /admin/workers - Get all available workers for assignment
export const getAllWorkers = async (req, res) => {
  try {
    const adminUserId = req.user.id;

    // Verify admin role
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    // Get all workers with their profiles
    const workers = await User.find({ role: 'worker' })
      .populate('profile', 'name email assignedLocation')
      .select('email profile');

    console.log('Raw workers data:', JSON.stringify(workers, null, 2));

    const formattedWorkers = workers.map(worker => {
      console.log('Processing worker:', worker._id, 'Profile:', worker.profile);
      
      return {
        id: worker._id,
        email: worker.email,
        name: worker.profile?.name || 'Unknown Worker',
        assignedLocation: worker.profile?.assignedLocation || null,
        createdAt: worker.profile?.createdAt || null
      };
    });

    console.log('Formatted workers:', formattedWorkers);

    res.status(200).json({
      message: "Workers retrieved successfully",
      count: formattedWorkers.length,
      workers: formattedWorkers
    });
  } catch (err) {
    console.error("Workers Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch workers", details: err.message });
  }
};

// GET /admin/assignments/:id - Get specific assignment details
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    // Verify admin role
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    const assignment = await Assignment.findById(id)
      .populate('worker', 'name email assignedLocation')
      .populate('assignedBy', 'name');

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if admin owns this assignment
    if (assignment.assignedBy._id.toString() !== adminUser.profile.toString()) {
      return res.status(403).json({ error: "Access denied. You can only view your own assignments." });
    }

    res.status(200).json({
      message: "Assignment retrieved successfully",
      assignment
    });
  } catch (err) {
    console.error("Assignment Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch assignment", details: err.message });
  }
};

// PUT /admin/assignments/:id - Update assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, location, timeSlot, requiredDurationMinutes, description } = req.body;
    const adminUserId = req.user.id;

    // Verify admin role
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if admin owns this assignment
    if (assignment.assignedBy.toString() !== adminUser.profile.toString()) {
      return res.status(403).json({ error: "Access denied. You can only update your own assignments." });
    }

    // Check for conflicts if updating date/time
    if (date || timeSlot) {
      const newDate = date || assignment.date;
      const newTimeSlot = timeSlot || assignment.timeSlot;

      const existingAssignment = await Assignment.findOne({
        _id: { $ne: id }, // Exclude current assignment
        worker: assignment.worker,
        date: newDate,
        $or: [
          {
            'timeSlot.start': { $lt: newTimeSlot.end },
            'timeSlot.end': { $gt: newTimeSlot.start }
          }
        ]
      });

      if (existingAssignment) {
        return res.status(400).json({ 
          error: "Worker already has an assignment during this time slot" 
        });
      }
    }

    // Update assignment
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      {
        date: date || assignment.date,
        location: location || assignment.location,
        timeSlot: timeSlot || assignment.timeSlot,
        requiredDurationMinutes: requiredDurationMinutes !== undefined ? requiredDurationMinutes : assignment.requiredDurationMinutes,
        description: description !== undefined ? description : assignment.description
      },
      { new: true }
    ).populate('worker', 'name email');

    res.status(200).json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment
    });
  } catch (err) {
    console.error("Assignment Update Error:", err);
    res.status(500).json({ error: "Failed to update assignment", details: err.message });
  }
};

// DELETE /admin/assignments/:id - Delete assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.user.id;

    // Verify admin role
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if admin owns this assignment
    if (assignment.assignedBy.toString() !== adminUser.profile.toString()) {
      return res.status(403).json({ error: "Access denied. You can only delete your own assignments." });
    }

    await Assignment.findByIdAndDelete(id);

    res.status(200).json({
      message: "Assignment deleted successfully"
    });
  } catch (err) {
    console.error("Assignment Delete Error:", err);
    res.status(500).json({ error: "Failed to delete assignment", details: err.message });
  }
};

