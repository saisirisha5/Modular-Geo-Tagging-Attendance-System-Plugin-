import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['admin', 'worker'],
    required: true
  },

  profile: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'role', // Dynamically references either Admin or Worker
    required: true
  }
});

export default mongoose.model('User', userSchema);
