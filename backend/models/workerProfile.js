import mongoose, { trusted } from 'mongoose';

const workerProfile = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  assignedLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('WorkerProfile', workerProfile); 
