import { Router } from 'express';
import { addFeedback, getDriverFeedback } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/add', authenticate, addFeedback);
router.get('/driver/:driverId', getDriverFeedback);

export default router;
