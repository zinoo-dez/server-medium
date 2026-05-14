import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { Role } from '@prisma/client';

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user || (req as any).user.role !== Role.ADMIN) {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};
