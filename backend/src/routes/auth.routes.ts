import { Router } from 'express';
import { register, login, getMe, updateDriverBus, updateDriverStatus } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/driver-bus', authenticate, updateDriverBus);
router.put('/driver-status', authenticate, updateDriverStatus);

export default router;