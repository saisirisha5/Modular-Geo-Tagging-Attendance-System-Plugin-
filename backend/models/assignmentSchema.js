import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkerProfile',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminProfile',
    required: true
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  timeSlot: {
    start: { type: String, required: true }, // "HH:MM"
    end: { type: String, required: true }     // "HH:MM"
  },
  requiredDurationMinutes: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
