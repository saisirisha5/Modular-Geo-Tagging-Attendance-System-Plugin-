import express from 'express';
import { 
  getWorkerAssignments,
  getWorkerAssignmentById,
  getTodayAssignments,
  getUpcomingAssignments
} from '../controllers/worker/workerAssignmentController.js';
import { checkIn, checkOut } from '../controllers/worker/attendanceController.js'
import { updateWorkerProfile, updateResidenceLocation, getWorkerProfile } from "../controllers/worker/workerProfileController.js";

import { upload } from "../middlewares/multerMiddleware.js";
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();
// localhost:5000/api/worker/
//Worker geolocation check-in/out
router.post('/attendance/check-in', verifyToken, checkIn);
router.post('/attendance/check-out', verifyToken, checkOut);

// Worker assignment routes
router.get('/assignments', verifyToken, getWorkerAssignments);
router.get('/assignments/today', verifyToken, getTodayAssignments);
router.get('/assignments/upcoming', verifyToken, getUpcomingAssignments);
router.get('/assignments/:id', verifyToken, getWorkerAssignmentById);

//Update worker profile routes (using multer)
router.put(
  "/profile",
  verifyToken,
  upload.single("profilePhoto"),
  updateWorkerProfile
);
router.put("/residence-location", verifyToken, updateResidenceLocation);
router.get("/profile", verifyToken, getWorkerProfile);

export default router; 