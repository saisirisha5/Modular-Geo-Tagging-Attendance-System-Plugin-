import mongoose from 'mongoose';

const workerProfile = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  mobileNumber :{
     type : String,
     required : true,
     trim: true,
     match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  address :{
    type :String,
    required : true,
    trim : true
  },
  residenceLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('WorkerProfile', workerProfile); 
