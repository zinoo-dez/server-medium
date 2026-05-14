import { Router } from 'express';
import multer from 'multer';
import * as articleController from './article.controller';
import { authMiddleware } from '../../middleware/auth';
import { isAuthor } from '../../middleware/ownership';
import { validate } from '../../middleware/validate';
import { articleSchema, articleQuerySchema, searchQuerySchema } from './article.schema';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Public Routes
router.get('/articles', validate(articleQuerySchema), articleController.listArticles);
router.get('/search', validate(searchQuerySchema), articleController.searchArticles);

// This needs a custom middleware or inline logic since it allows both guest and authenticated users
// However, the controller handles the auth check if req.user exists (for drafts).
// We can use a loose auth middleware that doesn't throw if no token.
const looseAuth = (req: any, res: any, next: any) => {
  // Try to authenticate, but don't fail if no token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'secret');
      req.user = { id: decoded.id, role: decoded.role };
    } catch (e) {}
  }
  next();
};

router.get('/articles/:slug', looseAuth, articleController.getArticleBySlug);

// Protected Routes
router.post('/articles', authMiddleware, validate(articleSchema), articleController.createArticle);
router.put('/articles/:slug', authMiddleware, isAuthor, validate(articleSchema), articleController.updateArticle);
router.delete('/articles/:slug', authMiddleware, isAuthor, articleController.deleteArticle);

// User-specific protected routes
router.get('/me/stories', authMiddleware, articleController.getMyStories);
router.get('/feed', authMiddleware, articleController.getPersonalizedFeed);

// Image Upload
router.post('/upload/image', authMiddleware, upload.single('image'), articleController.uploadImage);

export default router;
