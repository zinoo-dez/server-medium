import { Router } from 'express';
import * as engagementController from './engagement.controller';
import { authMiddleware } from '../../middleware/auth';
import { isCommentAuthor } from '../../middleware/ownership';
import { validate } from '../../middleware/validate';
import { commentSchema, updateCommentSchema, clapSchema } from './engagement.schema';

const router = Router();

// Public routes
router.get('/articles/:slug/comments', engagementController.getComments);

// Protected routes
router.post('/articles/:slug/clap', authMiddleware, validate(clapSchema), engagementController.clapOnArticle);
router.post('/articles/:slug/comments', authMiddleware, validate(commentSchema), engagementController.addComment);
router.post('/articles/:slug/bookmark', authMiddleware, engagementController.bookmarkArticle);
router.delete('/articles/:slug/bookmark', authMiddleware, engagementController.removeBookmark);

router.put('/comments/:id', authMiddleware, isCommentAuthor, validate(updateCommentSchema), engagementController.updateComment);
router.delete('/comments/:id', authMiddleware, isCommentAuthor, engagementController.deleteComment);

router.get('/me/bookmarks', authMiddleware, engagementController.getMyBookmarks);

export default router;
