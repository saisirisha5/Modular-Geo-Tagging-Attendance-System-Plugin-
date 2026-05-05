import Attendance from "../../models/attendanceSchema.js";
import Assignment from "../../models/assignmentSchema.js";
import User from "../../models/userSchema.js";

export const getAdminAnalytics = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user.id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }


    const totalAssignments = await Assignment.countDocuments({
      assignedBy: adminUser.profile
    });

    const totalAttendance = await Attendance.countDocuments();

    const completed = await Attendance.countDocuments({ status: "completed" });
    const inProgress = await Attendance.countDocuments({ status: "checked-in" });
    const rejected = await Attendance.countDocuments({ status: "rejected" });

    const failures = await Attendance.aggregate([
      { $match: { failureReason: { $ne: null } } },
      {
        $group: {
          _id: "$failureReason.type",
          count: { $sum: 1 }
        }
      }
    ]);


    const trend = await Attendance.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      summary: {
        totalAssignments,
        totalAttendance,
        completed,
        inProgress,
        rejected
      },
      failures,
      trend
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: err.message });
  }
};