import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
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
    refPath: 'role', // Dynamic reference to Admin or Worker
    required: true
  }
});

export default mongoose.model('User', userSchema);
