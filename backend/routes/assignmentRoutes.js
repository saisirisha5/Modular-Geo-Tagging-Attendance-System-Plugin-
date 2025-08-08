import express from 'express';
import { 
  createAssignment, 
  getAllAssignmentsByAdmin, 
  getAllWorkers,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} from '../controllers/admin/assignmentController.js';
import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Assignment CRUD operations
router.post('/assign', verifyToken, createAssignment);
router.get('/assignments', verifyToken, getAllAssignmentsByAdmin);
router.get('/assignments/:id', verifyToken, getAssignmentById);
router.put('/assignments/:id', verifyToken, updateAssignment);
router.delete('/assignments/:id', verifyToken, deleteAssignment);

// Worker management
router.get('/workers', verifyToken, getAllWorkers);

export default router;
