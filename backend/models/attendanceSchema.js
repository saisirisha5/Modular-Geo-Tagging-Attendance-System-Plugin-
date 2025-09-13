import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerProfile', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  startTime: { type: Date, required: true },
  startLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  endTime: { type: Date },
  endLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' }
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);