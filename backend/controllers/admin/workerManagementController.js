import User from "../../models/userSchema.js";
import WorkerProfile from "../../models/workerProfile.js";
import Assignment from "../../models/assignmentSchema.js";

/* =====================================================
   GET /admin/workers
   View all workers
===================================================== */

export const getAllWorkers = async (req, res) => {
  try {

    const adminUser = await User.findById(req.user.id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required"
      });
    }

    const workers = await User.find({ role: "worker" })
      .populate({
        path: "profile",
        model: "WorkerProfile"
     })
      .select("name email");

   const formattedWorkers = workers.map(worker => ({
      id: worker._id,
      name: worker.name,
      email: worker.email,
      mobileNumber: worker.profile?.mobileNumber || null,
      address: worker.profile?.address || null,
      profilePhoto: worker.profile?.profilePhoto || null
    }));

    res.status(200).json({
      count: formattedWorkers.length,
      workers: formattedWorkers
    });

  } catch (err) {

    console.error("Fetch Workers Error:", err);

    res.status(500).json({
      error: err.message
    });

  }
};


/* =====================================================
   GET /admin/workers/:id
   View single worker profile
===================================================== */

export const getWorkerById = async (req, res) => {
  try {

    const adminUser = await User.findById(req.user.id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required"
      });
    }

    const worker = await User.findById(req.params.id)
       .populate({
        path: "profile",
        model: "WorkerProfile"
      });

    if (!worker || worker.role !== "worker") {
      return res.status(404).json({
        error: "Worker not found"
      });
    }

    res.status(200).json({
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        mobileNumber: worker.profile.mobileNumber,
        address: worker.profile.address,
        profilePhoto: worker.profile.profilePhoto,
        aadharFrontImage: worker.profile.aadharFrontImage,
        aadharBackImage: worker.profile.aadharBackImage
      }
    });

  } catch (err) {

    console.error("Fetch Worker Error:", err);

    res.status(500).json({
      error: err.message
    });

  }
};


/* =====================================================
   DELETE /admin/workers/:id
   Remove worker
===================================================== */

export const deleteWorker = async (req, res) => {
  try {

    const adminUser = await User.findById(req.user.id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required"
      });
    }

    const worker = await User.findById(req.params.id);

    if (!worker || worker.role !== "worker") {
      return res.status(404).json({
        error: "Worker not found"
      });
    }

    /* Delete worker profile */

    await WorkerProfile.findByIdAndDelete(worker.profile);

    /* Delete worker assignments */

    await Assignment.deleteMany({
      worker: worker.profile
    });

    /* Delete user */

    await worker.deleteOne();

    res.status(200).json({
      message: "Worker removed successfully"
    });

  } catch (err) {

    console.error("Delete Worker Error:", err);

    res.status(500).json({
      error: err.message
    });

  }
};