import { Router } from 'express';
import * as tagController from './tag.controller';

const router = Router();

router.get('/tags', tagController.listTags);
router.get('/tags/:slug/articles', tagController.getArticlesByTag);

export default router;
