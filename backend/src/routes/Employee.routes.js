import {Router} from 'express'
import {
  createEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
} from '../controllers/Employee.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { protect, authorize } from '../middlewares/auth.middleware.js'; // Protect routes and enforce roles
const router = Router();

router.post('/', protect, authorize('Admin', 'Manager'),upload.single('profilePicture'), createEmployee);
router.get('/', protect, authorize('Admin', 'Manager', 'Regular'), getAllEmployees);
router.put('/:id', protect, authorize('Admin', 'Manager'),upload.single('profilePicture'), updateEmployee);
router.delete('/:id', protect, authorize('Admin'), deleteEmployee);

export default router;
