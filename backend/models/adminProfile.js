import mongoose from 'mongoose';

const adminProfile = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AdminProfile', adminProfile); 
