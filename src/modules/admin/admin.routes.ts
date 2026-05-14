import { Router } from 'express';
import * as adminController from './admin.controller';
import { authMiddleware } from '../../middleware/auth';
import { adminOnly } from '../../middleware/admin';

const router = Router();

// Apply both auth and admin check to all routes in this router
router.use(authMiddleware, adminOnly);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/growth', adminController.getGrowthMetrics);

// Users
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);
router.put('/users/:id/role', adminController.changeUserRole);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);

// Articles
router.get('/articles', adminController.listArticles);
router.put('/articles/:id/status', adminController.changeArticleStatus);
router.delete('/articles/:id', adminController.forceRemoveArticle);

// Comments
router.get('/comments', adminController.listComments);
router.delete('/comments/:id', adminController.forceRemoveComment);

// Reports
router.get('/reports', adminController.listReports);
router.put('/reports/:id/resolve', adminController.resolveReport);
router.put('/reports/:id/dismiss', adminController.dismissReport);

// Tags
router.post('/tags', adminController.createTag);
router.put('/tags/:id', adminController.updateTag);
router.delete('/tags/:id', adminController.deleteTag);

// Platform Settings
router.get('/settings', adminController.getPlatformSettings);
router.put('/settings', adminController.updatePlatformSetting);

export default router;
