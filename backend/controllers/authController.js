import User from '../models/userSchema.js';
import Admin from '../models/adminProfile.js';
import Worker from '../models/workerProfile.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// ========== SIGNUP ==========
export const signup = async (req, res) => {
  const { name, email, password, role, mobileNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let profile;

    if (role === 'admin') {
      profile = await Admin.create({ name });

    } else if (role === 'worker') {

      if (!mobileNumber) {
        return res.status(400).json({ message: 'Mobile number is required for worker' });
      }

      profile = await Worker.create({
        name,
        mobileNumber
      });

    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      profile: profile._id
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, profile: user.profile },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// ========== LOGIN ==========
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, profile: user.profile },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};