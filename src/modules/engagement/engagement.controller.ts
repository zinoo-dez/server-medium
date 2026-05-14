import { Request, Response, NextFunction } from 'express';
import * as engagementService from './engagement.service';
import { sendSuccess } from '../../utils/response';

export const clapOnArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clap = await engagementService.clapOnArticle((req as any).user!.id, req.params.slug as string, req.body.count || 1);
    sendSuccess(res, clap);
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await engagementService.addComment((req as any).user!.id, req.params.slug as string, req.body);
    sendSuccess(res, comment, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comment = await engagementService.updateComment(req.params.id as string, req.body.content);
    sendSuccess(res, comment);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await engagementService.deleteComment(req.params.id as string);
    sendSuccess(res, { message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comments = await engagementService.getComments(req.params.slug as string);
    sendSuccess(res, comments);
  } catch (error) {
    next(error);
  }
};

export const bookmarkArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await engagementService.bookmarkArticle((req as any).user!.id, req.params.slug as string);
    sendSuccess(res, { message: 'Article bookmarked successfully' });
  } catch (error) {
    next(error);
  }
};

export const removeBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await engagementService.removeBookmark((req as any).user!.id, req.params.slug as string);
    sendSuccess(res, { message: 'Bookmark removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMyBookmarks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await engagementService.getMyBookmarks((req as any).user!.id, req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};
