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

  aadharNumber: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9]{12}$/, "Please enter a valid 12 digit Aadhaar number"]
  },
  
  profilePhoto: {
    type: String,
    required: true
  },
  
  aadharFrontImage: {
    type: String, // will store image path or cloud URL
    required: true
  },

  aadharBackImage: {
    type: String, // will store image path or cloud URL
    required: true
  },

  residenceLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },

 approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('WorkerProfile', workerProfile); 
