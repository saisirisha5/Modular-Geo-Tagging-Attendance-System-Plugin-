import User from "../../models/userSchema.js";
import WorkerProfile from "../../models/workerProfile.js";
import Assignment from "../../models/assignmentSchema.js";
import haversine from "haversine-distance";

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
    await WorkerProfile.findByIdAndDelete(worker.profile);
    await Assignment.deleteMany({
      worker: worker.profile
    });
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

  /* =====================================================
   GET /admin/workers/nearest
===================================================== */

 export const getNearestWorkers = async (req, res) => {
  try {

    const adminUser = await User.findById(req.user.id);

    if (!adminUser || adminUser.role !== "admin") {
      return res.status(403).json({
        error: "Admin access required"
      });
    }

    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        error: "Latitude and longitude required"
      });
    }

    const workers = await User.find({ role: "worker" })
      .populate({
        path: "profile",
        model: "WorkerProfile"
      });

    const workersWithDistance = workers
      .filter(worker =>
        worker.profile?.residenceLocation?.lat &&
        worker.profile?.residenceLocation?.lng
      )
      .map(worker => {

        const distance = haversine(
          {
            lat: Number(lat),
            lng: Number(lng)
          },
          {
            lat: worker.profile.residenceLocation.lat,
            lng: worker.profile.residenceLocation.lng
          }
        );

        return {
          id: worker._id,
          name: worker.name,
          email: worker.email,
          profilePhoto: worker.profile?.profilePhoto || null,

          distanceMeters: distance,
          distanceKm: (distance / 1000).toFixed(2)
        };
      });

    workersWithDistance.sort(
      (a, b) => a.distanceMeters - b.distanceMeters
    );

    res.status(200).json({
      count: workersWithDistance.length,
      workers: workersWithDistance
    });

  } catch (err) {

    console.error("Nearest Workers Error:", err);

    res.status(500).json({
      error: err.message
    });

  }
};