import { Router } from 'express';
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateScheduleStatus,
  deleteSchedule
} from '../controllers/bus.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import { UserRole } from '../models/User';

const router = Router();

// Public routes for both passengers and drivers
router.get('/schedules', getSchedules);
router.get('/schedules/:id', getScheduleById);

// Protected routes (Only Drivers can modify)
router.post(
  '/schedules',
  authenticate,
  authorizeRoles(UserRole.DRIVER),
  createSchedule
);

router.patch(
  '/schedules/:id/status',
  authenticate,
  authorizeRoles(UserRole.DRIVER),
  updateScheduleStatus
);

router.delete(
  '/schedules/:id',
  authenticate,
  authorizeRoles(UserRole.DRIVER),
  deleteSchedule
);

export default router;
