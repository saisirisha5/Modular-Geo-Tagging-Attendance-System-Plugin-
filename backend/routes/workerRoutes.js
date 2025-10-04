import express from 'express';
import { 
  getWorkerAssignments,
  getWorkerAssignmentById,
  getTodayAssignments,
  getUpcomingAssignments
} from '../controllers/worker/workerAssignmentController.js';
import {startAttendance,endAttendance} from '../controllers/worker/attendanceController.js'
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();
// localhost:5000/api/worker/
//Worker geolocation check-in/out
router.post('/attendance/start',verifyToken,startAttendance);
router.post('/attendance/end',verifyToken,endAttendance);

// Worker assignment routes
router.get('/assignments', verifyToken, getWorkerAssignments);
router.get('/assignments/today', verifyToken, getTodayAssignments);
router.get('/assignments/upcoming', verifyToken, getUpcomingAssignments);
router.get('/assignments/:id', verifyToken, getWorkerAssignmentById);

export default router; 