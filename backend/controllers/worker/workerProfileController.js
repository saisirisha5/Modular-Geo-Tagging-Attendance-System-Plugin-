import User from "../../models/userSchema.js";
import WorkerProfile from "../../models/workerProfile.js";

/*
PUT /api/worker/profile
Update worker profile
*/
export const updateWorkerProfile = async (req, res) => {
  try {

    const userId = req.user.id;

    const {
      mobileNumber,
      address,
      aadharNumber,
      residenceLat,
      residenceLng
    } = req.body;

    const user = await User.findById(userId);

    if (!user || user.role !== "worker") {
      return res.status(403).json({
        error: "Access denied. Worker role required."
      });
    }
    const workerProfileId = user.profile;
    const updateData = {};
    if (mobileNumber) updateData.mobileNumber = mobileNumber;
    if (address) updateData.address = address;
    if (aadharNumber) updateData.aadharNumber = aadharNumber;
    if (residenceLat) updateData.residenceLat = residenceLat;
    if (residenceLng) updateData.residenceLng = residenceLng;
    if (req.file) {
      updateData.profilePhoto = req.file.path;
    }

    await WorkerProfile.findByIdAndUpdate(
      workerProfileId,
      { $set: updateData },
      { new: true }
    );

   res.status(200).json({
      message: req.file
        ? "Profile updated successfully. Please login again to view the new profile photo."
        : "Profile updated successfully"
    });

  } catch (err) {

    console.error("Worker Profile Update Error:", err);

    res.status(500).json({
      error: "Failed to update profile",
      details: err.message
    });

  }
};

export const getWorkerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== "worker") {
      return res.status(403).json({
        error: "Access denied. Worker role required."
      });
    }
    const workerProfile = await WorkerProfile.findById(user.profile);
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email
      },
      profile: workerProfile
    });
  } catch (err) {

    console.error("Fetch Worker Profile Error:", err);
    res.status(500).json({
      error: "Failed to fetch worker profile"
    });
  }
};

/*
PUT /api/worker/residence-location
Update worker residence coordinates
*/

export const updateResidenceLocation = async (req, res) => {

  try {
    const userId = req.user.id;
    const { residenceLat, residenceLng } = req.body;
    if (!residenceLat || !residenceLng) {
      return res.status(400).json({
        error: "Latitude and longitude are required"
      });
    }
    const user = await User.findById(userId);
    if (!user || user.role !== "worker") {
      return res.status(403).json({
        error: "Access denied. Worker role required."
      });
    }
    const workerProfileId = user.profile;
    await WorkerProfile.findByIdAndUpdate(
      workerProfileId,
      {
        $set: {
          "residenceLocation.lat": Number(residenceLat),
          "residenceLocation.lng": Number(residenceLng)
        }
      },
      { new: true }
    );
    res.status(200).json({
      message: "Residence location updated successfully"
    });
  } catch (err) {
    console.error("Residence Location Update Error:", err);
    res.status(500).json({
      error: "Failed to update residence location",
      details: err.message
    });
  }
};