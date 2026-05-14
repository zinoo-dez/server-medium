import { Request, Response, NextFunction } from 'express';
import * as notificationService from './notification.service';
import { sendSuccess } from '../../utils/response';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, meta } = await notificationService.getNotifications((req as any).user!.id, req.query);
    sendSuccess(res, data, meta);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notificationIds = req.body.notificationIds as string[] | undefined;
    await notificationService.markAsRead((req as any).user!.id, notificationIds);
    sendSuccess(res, { message: 'Notifications marked as read' });
  } catch (error) {
    next(error);
  }
};
