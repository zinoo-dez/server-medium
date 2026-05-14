import { Request, Response, NextFunction } from 'express';
import * as articleService from './article.service';
import { sendSuccess } from '../../utils/response';
import { ArticleStatus } from '@prisma/client';

export const createArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await articleService.createArticle((req as any).user!.id, req.body);
    sendSuccess(res, article, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await articleService.updateArticle(req.params.slug as string, req.body);
    sendSuccess(res, article);
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await articleService.deleteArticle(req.params.slug as string);
    sendSuccess(res, { message: 'Article deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getArticleBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug as string);
    
    // Non-authors cannot see drafts
    if (article.status !== ArticleStatus.PUBLISHED) {
      if (!(req as any).user || (req as any).user.id !== article.authorId) {
        return res.status(403).json({ success: false, message: 'Forbidden', code: 'FORBIDDEN' });
      }
    }

    sendSuccess(res, article);
  } catch (error) {
    next(error);
  }
};

export const listArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await articleService.listArticles(req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const getMyStories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await articleService.getMyStories((req as any).user!.id, req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const searchArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await articleService.searchArticles(req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const getPersonalizedFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await articleService.getPersonalizedFeed((req as any).user!.id, req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded', code: 'VALIDATION_ERROR' });
    }
    
    // Mock URL for editor
    const imageUrl = `https://ui-avatars.com/api/?name=${file.originalname}&background=random`;
    
    // Note: Editor.js image tool expects a specific format
    res.status(200).json({
      success: 1,
      file: {
        url: imageUrl,
      }
    });
  } catch (error) {
    next(error);
  }
};
