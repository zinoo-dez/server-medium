import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/me/notifications', authMiddleware, notificationController.getNotifications);
router.put('/me/notifications/read', authMiddleware, notificationController.markAsRead);

export default router;
