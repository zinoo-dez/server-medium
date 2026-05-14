import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { prisma } from '../config/database';
import { Role } from '@prisma/client';

export const isAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).user) {
      return next(new ForbiddenError('Unauthorized'));
    }

    // Admins can bypass ownership checks
    if ((req as any).user.role === Role.ADMIN) {
      return next();
    }

    const slug = req.params.slug as string;
    
    const article = await prisma.article.findUnique({
      where: { slug }
    });

    if (!article || article.deletedAt) {
      return next(new NotFoundError('Article not found'));
    }

    if (article.authorId !== (req as any).user.id) {
      return next(new ForbiddenError('You do not have permission to modify this resource'));
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const isCommentAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).user) {
      return next(new ForbiddenError('Unauthorized'));
    }

    // Admins can bypass ownership checks
    if ((req as any).user.role === Role.ADMIN) {
      return next();
    }

    const id = req.params.id as string;
    
    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment || comment.deletedAt) {
      return next(new NotFoundError('Comment not found'));
    }

    if (comment.userId !== (req as any).user.id) {
      return next(new ForbiddenError('You do not have permission to modify this resource'));
    }

    next();
  } catch (error) {
    next(error);
  }
};
