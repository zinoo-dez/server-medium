import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { sendSuccess } from '../../utils/response';

export const getPublicProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getPublicProfile(req.params.username as string);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const getOwnProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getOwnProfile((req as any).user!.id);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.updateProfile((req as any).user!.id, req.body);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.changePassword((req as any).user!.id, req.body);
    sendSuccess(res, { message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real app, upload to S3/Cloudinary and get URL.
    // Here we'll just mock it and save a dummy URL or accept one from body for testing.
    // We will assume the uploaded file is processed and available at some URL.
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded', code: 'VALIDATION_ERROR' });
    }
    
    // Mock URL
    const avatarUrl = `https://ui-avatars.com/api/?name=${(req as any).user!.id}&background=random`;
    const user = await userService.updateAvatarUrl((req as any).user!.id, avatarUrl);
    
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.followUser((req as any).user!.id, req.params.username as string);
    sendSuccess(res, { message: 'Successfully followed user' });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await userService.unfollowUser((req as any).user!.id, req.params.username as string);
    sendSuccess(res, { message: 'Successfully unfollowed user' });
  } catch (error) {
    next(error);
  }
};
