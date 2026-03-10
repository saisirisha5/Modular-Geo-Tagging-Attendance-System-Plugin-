//Admin routes  
// localhost:5000/api/admin/
import express from 'express';

//Assignment Controllers (Admin handled)
import { 
  createAssignment, 
  getAllAssignmentsByAdmin, 
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} from '../controllers/admin/assignmentController.js';

//Worker Management (Admin Handled)
import {
  getAllWorkers,
  getWorkerById,
  deleteWorker
} from '../controllers/admin/workerManagementController.js';

import verifyToken from '../middlewares/authMiddleware.js';

const router = express.Router();

// Assignment CRUD operations 
router.post('/assign', verifyToken, createAssignment);
router.get('/assignments', verifyToken, getAllAssignmentsByAdmin);
router.get('/assignments/:id', verifyToken, getAssignmentById);
router.put('/assignments/:id', verifyToken, updateAssignment);
router.delete('/assignments/:id', verifyToken, deleteAssignment);

// Worker management
router.get('/workers', verifyToken, getAllWorkers); //Assignment Creation

router.get('/workers/:id', verifyToken, getWorkerById);
router.delete('/workers/:id', verifyToken, deleteWorker);

export default router;
