import express from 'express';
import { 
  getWorkerAssignments,
  getWorkerAssignmentById,
  getTodayAssignments,
  getUpcomingAssignments
} from '../controllers/worker/workerAssignmentController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Worker assignment routes
router.get('/assignments', verifyToken, getWorkerAssignments);
router.get('/assignments/today', verifyToken, getTodayAssignments);
router.get('/assignments/upcoming', verifyToken, getUpcomingAssignments);
router.get('/assignments/:id', verifyToken, getWorkerAssignmentById);

export default router; 