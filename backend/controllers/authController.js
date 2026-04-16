import User from '../models/userSchema.js';
import Admin from '../models/adminProfile.js';
import Worker from '../models/workerProfile.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

/* =====================================================
   SIGNUP
===================================================== */
export const signup = async (req, res) => {
  const { name, email, password, role, mobileNumber, address, aadharNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }
    let profile;

    /* ---------- ADMIN SIGNUP ---------- */
    if (role === "admin") {

      profile = await Admin.create({
        name
      });

    }

    /* ---------- WORKER SIGNUP ---------- */
    else if (role === "worker") {

      if (!mobileNumber) {
        return res.status(400).json({
          message: "Mobile number is required for worker"
        });
      }

      if (!address) {
        return res.status(400).json({
          message: "Address is required for worker"
        });
      }

      const files = req.files || {};

       const profilePhoto = files.profilePhoto?.[0]?.path;
       const aadharFrontImage = files.aadharFrontImage?.[0]?.path;
       const aadharBackImage = files.aadharBackImage?.[0]?.path;

        if (!profilePhoto || !aadharFrontImage || !aadharBackImage) {
          return res.status(400).json({
            message: "Profile photo and Aadhaar images are required"
          });
        }

        /* ---------- CREATE WORKER PROFILE ---------- */

        profile = await Worker.create({
          name,
          mobileNumber,
          address,
          aadharNumber,
          profilePhoto,
          aadharFrontImage,
          aadharBackImage
        });
    }
    else {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    /* ---------- CREATE USER ---------- */
    const user = new User({
      name,
      email,
      password,
      role,
      profile: profile._id
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        profile: user.profile
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      message: "Signup failed",
      error: err.message
    });
  }
};


/* =====================================================
   LOGIN
===================================================== */
export const login = async (req, res) => {

  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email }).populate({
      path: "profile",
      model: "WorkerProfile"
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        profile: user.profile
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profile?.profilePhoto || null
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
};