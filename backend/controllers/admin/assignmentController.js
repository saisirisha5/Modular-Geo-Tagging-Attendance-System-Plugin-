import Assignment from '../../models/assignmentSchema.js';
import WorkerProfile from '../../models/workerProfile.js';
import User from '../../models/userSchema.js';

/* =====================================================
   POST /admin/assign
   Create assignment(s) (ADMIN ONLY)
   Supports MULTIPLE workers
===================================================== */
export const createAssignment = async (req, res) => {
  try {
    const {
      workerIds, // ARRAY of worker user IDs
      date,
      address,
      location,
      timeSlot,
      requiredDurationMinutes,
      description
    } = req.body;

    const adminUserId = req.user.id;

    /* ------------------ BASIC VALIDATION ------------------ */
    if (
      !workerIds ||
      !Array.isArray(workerIds) ||
      workerIds.length === 0 ||
      !date ||
      !address ||
      !location?.lat ||
      !location?.lng ||
      !timeSlot?.start ||
      !timeSlot?.end
    ) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    /* ------------------ ADMIN CHECK ------------------ */
    const adminUser = await User.findById(adminUserId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!adminUser.profile) {
      return res.status(400).json({ error: 'Admin profile not found' });
    }

    const createdAssignments = [];

    /* ------------------ LOOP THROUGH WORKERS ------------------ */
    for (const workerId of workerIds) {

      const workerUser = await User.findById(workerId);
      if (!workerUser || workerUser.role !== 'worker') {
        return res.status(404).json({
          error: `Worker not found: ${workerId}`
        });
      }

      const workerProfile = await WorkerProfile.findById(workerUser.profile);
      if (!workerProfile) {
        return res.status(404).json({
          error: `Worker profile missing for ${workerUser.name}`
        });
      }

      /* ---------- TIME CONFLICT CHECK ---------- */
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
        message: `Time conflict: Worker ${workerUser.name} already has an assignment during this time slot`
      });
      }

      /* ---------- CREATE ASSIGNMENT ---------- */
      const assignment = new Assignment({
        worker: workerUser.profile,
        assignedBy: adminUser.profile,
        date,
        address,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        timeSlot,
        requiredDurationMinutes: requiredDurationMinutes || 0,
        description: description || ''
      });

      await assignment.save();
      await assignment.populate('worker', 'name');

      createdAssignments.push(assignment);
    }

    res.status(201).json({
      message: 'Assignments created successfully',
      assignments: createdAssignments
    });

  } catch (err) {
    console.error('Assignment Create Error:', err);
    res.status(500).json({
      error: 'Server error',
      details: err.message
    });
  }
};


/* =====================================================
   GET /admin/assignments
===================================================== */
export const getAllAssignmentsByAdmin = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const assignments = await Assignment.find({
      assignedBy: adminUser.profile
    })
      .populate('worker', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: assignments.length,
      assignments
    });

  } catch (err) {
    console.error('Fetch Assignments Error:', err);
    res.status(500).json({ error: err.message });
  }
};


/* =====================================================
   GET /admin/workers
===================================================== */
export const getAllWorkers = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const workers = await User.find({ role: 'worker' })
      .populate('profile')
      .select('email name');

    const formatted = workers.map(w => ({
      id: w._id,
      email: w.email,
      name: w.name || 'No name'
    }));

    res.status(200).json({ workers: formatted });

  } catch (err) {
    console.error('Fetch Workers Error:', err);
    res.status(500).json({ error: err.message });
  }
};


/* =====================================================
   GET /admin/assignments/:id
===================================================== */
export const getAssignmentById = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const assignment = await Assignment.findById(req.params.id)
      .populate('worker', 'name')
      .populate('assignedBy', 'name');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.assignedBy.toString() !== adminUser.profile.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.status(200).json({ assignment });

  } catch (err) {
    console.error('Fetch Assignment Error:', err);
    res.status(500).json({ error: err.message });
  }
};


/* =====================================================
   PUT /admin/assignments/:id
===================================================== */
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      address,
      location,
      timeSlot,
      requiredDurationMinutes,
      description
    } = req.body;

    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.assignedBy.toString() !== adminUser.profile.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    /* ---------- TIME CONFLICT CHECK ---------- */
    if (date || timeSlot) {
      const newDate = date || assignment.date;
      const newSlot = timeSlot || assignment.timeSlot;

      const conflict = await Assignment.findOne({
        _id: { $ne: id },
        worker: assignment.worker,
        date: newDate,
        $or: [
          {
            'timeSlot.start': { $lt: newSlot.end },
            'timeSlot.end': { $gt: newSlot.start }
          }
        ]
      });

      if (conflict) {
        return res.status(400).json({
          message: 'Time conflict: Worker already has another assignment during this time slot'
        });
      }
    }

    if (address) assignment.address = address;

    if (location?.lat && location?.lng) {
      assignment.location = {
        lat: location.lat,
        lng: location.lng
      };
    }

    assignment.date = date || assignment.date;
    assignment.timeSlot = timeSlot || assignment.timeSlot;
    assignment.requiredDurationMinutes =
      requiredDurationMinutes ?? assignment.requiredDurationMinutes;
    assignment.description =
      description ?? assignment.description;

    await assignment.save();
    await assignment.populate('worker', 'name');

    res.status(200).json({
      message: 'Assignment updated successfully',
      assignment
    });

  } catch (err) {
    console.error('Update Assignment Error:', err);
    res.status(500).json({ error: err.message });
  }
};


/* =====================================================
   DELETE /admin/assignments/:id
===================================================== */
export const deleteAssignment = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (assignment.assignedBy.toString() !== adminUser.profile.toString()) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    await assignment.deleteOne();

    res.status(200).json({
      message: 'Assignment deleted successfully'
    });

  } catch (err) {
    console.error('Delete Assignment Error:', err);
    res.status(500).json({ error: err.message });
  }
};