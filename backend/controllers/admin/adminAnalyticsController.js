import Attendance from "../../models/attendanceSchema.js";
import Assignment from "../../models/assignmentSchema.js";
import User from "../../models/userSchema.js";

export const getAdminAnalytics = async (req, res) => {
  try {

    const adminUser = await User.findById(req.user.id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required"
      });
    }

    const { filter = "today" } = req.query;

    let dateQuery = {};

    const now = new Date();

    if (filter === "today") {

      const start = new Date();
      start.setHours(0, 0, 0, 0);

      dateQuery = {
        createdAt: { $gte: start }
      };
    }

    else if (filter === "month") {

      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      dateQuery = {
        createdAt: { $gte: start }
      };
    }

    else if (filter === "year") {

      const start = new Date(
        now.getFullYear(),
        0,
        1
      );

      dateQuery = {
        createdAt: { $gte: start }
      };
    }


    const totalAssignments = await Assignment.countDocuments({
      assignedBy: adminUser.profile
    });

    const totalAttendance = await Attendance.countDocuments(dateQuery);

    const completed = await Attendance.countDocuments({
      ...dateQuery,
      status: "completed"
    });

    const inProgress = await Attendance.countDocuments({
      ...dateQuery,
      status: "checked-in"
    });

    const rejected = await Attendance.countDocuments({
      ...dateQuery,
      status: "rejected"
    });


    const failures = await Attendance.aggregate([
      {
        $match: {
          ...dateQuery,
          failureReason: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$failureReason.type",
          count: { $sum: 1 }
        }
      }
    ]);


    const trend = await Attendance.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const recentAttendancePhotos = await Attendance.find(dateQuery)
      .populate({
        path: "worker",
        select: "name"
      })
      .populate({
        path: "assignment",
        select: "title date"
      })
      .sort({ createdAt: -1 })
      .limit(20);


    res.status(200).json({

      summary: {
        totalAssignments,
        totalAttendance,
        completed,
        inProgress,
        rejected
      },

      failures,
      trend,
      recentAttendancePhotos

    });

  } catch (err) {

    console.error("Analytics Error:", err);

    res.status(500).json({
      error: err.message
    });

  }
};