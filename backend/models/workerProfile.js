import mongoose from 'mongoose';

const workerProfile = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  assignedLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
   mobileNumber :{
      type : String,
      required : true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
   },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('WorkerProfile', workerProfile); 
