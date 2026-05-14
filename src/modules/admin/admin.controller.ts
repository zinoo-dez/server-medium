import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';
import { sendSuccess } from '../../utils/response';
import { Role, ArticleStatus } from '@prisma/client';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
};

export const getGrowthMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const metrics = await adminService.getGrowthMetrics();
    sendSuccess(res, metrics);
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await adminService.listUsers(req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.getUserDetail(req.params.id as string);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.changeUserRole(req.params.id as string, req.body.role as Role);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.banUser(req.params.id as string);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.unbanUser(req.params.id as string);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const listArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await adminService.listArticles(req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const changeArticleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await adminService.changeArticleStatus(req.params.id as string, req.body.status as ArticleStatus);
    sendSuccess(res, article);
  } catch (error) {
    next(error);
  }
};

export const forceRemoveArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.forceRemoveArticle(req.params.id as string);
    sendSuccess(res, { message: 'Article removed' });
  } catch (error) {
    next(error);
  }
};

export const listComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await adminService.listComments(req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const forceRemoveComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.forceRemoveComment(req.params.id as string);
    sendSuccess(res, { message: 'Comment removed' });
  } catch (error) {
    next(error);
  }
};

export const listReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await adminService.listReports(req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await adminService.resolveReport(req.params.id as string, (req as any).user!.id);
    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const dismissReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await adminService.dismissReport(req.params.id as string, (req as any).user!.id);
    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await adminService.createTag(req.body);
    sendSuccess(res, tag, undefined, 201);
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await adminService.updateTag(req.params.id as string, req.body);
    sendSuccess(res, tag);
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await adminService.deleteTag(req.params.id as string);
    sendSuccess(res, { message: 'Tag deleted' });
  } catch (error) {
    next(error);
  }
};

export const getPlatformSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await adminService.getPlatformSettings();
    sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
};

export const updatePlatformSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await adminService.updatePlatformSetting(req.body.key, req.body.value, (req as any).user!.id);
    sendSuccess(res, setting);
  } catch (error) {
    next(error);
  }
};
