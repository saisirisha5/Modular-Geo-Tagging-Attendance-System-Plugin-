import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  worker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'WorkerProfile', 
    required: true 
  },

  assignment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment', 
    required: true 
  },

  checkInTime: { type: Date },
  checkInLocation: {
    lat: Number,
    lng: Number
  },
  checkInPhoto: { type: String }, 

  checkOutTime: { type: Date },
  checkOutLocation: {
    lat: Number,
    lng: Number
  },
  checkOutPhoto: { type: String },

  durationMinutes: { type: Number },
  locationDeviationMeters: { type: Number },

  status: {
    type: String,
    enum: ['pending', 'checked-in', 'completed', 'rejected'],
    default: 'pending'
  },

  failureReason: {
    type: {
      type: String,
      enum: ['TIME', 'LOCATION', 'PHOTO', 'DURATION']
    },
    message: String
  }

}, { timestamps: true });

attendanceSchema.index({ worker: 1, assignment: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);