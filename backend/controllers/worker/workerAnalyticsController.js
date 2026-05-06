import Attendance from "../../models/attendanceSchema.js";
import User from "../../models/userSchema.js";

/* =====================================================
   GET /worker/analytics
===================================================== */
export const getWorkerAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const worker = await User.findById(userId);
    if (!worker || worker.role !== "worker") {
      return res.status(403).json({ error: "Access denied" });
    }

    const workerId = worker.profile;

    const { filter = "day" } = req.query;

    let groupFormat;

    if (filter === "day") groupFormat = "%Y-%m-%d";
    else if (filter === "month") groupFormat = "%Y-%m";
    else if (filter === "year") groupFormat = "%Y";
    else groupFormat = "%Y-%m-%d";

    const total = await Attendance.countDocuments({ worker: workerId });

    const completed = await Attendance.countDocuments({
      worker: workerId,
      status: "completed"
    });

    const inProgress = await Attendance.countDocuments({
      worker: workerId,
      status: "checked-in"
    });

    const rejected = await Attendance.countDocuments({
      worker: workerId,
      status: "rejected"
    });

    const trend = await Attendance.aggregate([
      { $match: { worker: workerId } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const failures = await Attendance.aggregate([
      { $match: { worker: workerId, status: "rejected" } },
      {
        $group: {
          _id: "$failureReason.type",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      summary: {
        total,
        completed,
        inProgress,
        rejected
      },
      trend,
      failures
    });

  } catch (err) {
    console.error("Worker Analytics Error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};