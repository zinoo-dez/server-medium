import { Router } from 'express';
import multer from 'multer';
import * as userController from './user.controller';
import { authMiddleware } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from './user.schema';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Public routes
router.get('/users/:username', userController.getPublicProfile);

// Protected user routes
router.post('/users/:username/follow', authMiddleware, userController.followUser);
router.delete('/users/:username/follow', authMiddleware, userController.unfollowUser);

// Protected 'me' routes
router.get('/me/profile', authMiddleware, userController.getOwnProfile);
router.put('/me/profile', authMiddleware, validate(updateProfileSchema), userController.updateProfile);
router.put('/me/password', authMiddleware, validate(changePasswordSchema), userController.changePassword);
router.post('/me/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);

export default router;
