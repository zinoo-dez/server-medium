import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof ZodError) {
    const errors = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors);
  }

  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.statusCode, err.errors);
  }

  // Handle Prisma errors roughly
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      return sendError(res, 'Duplicate record', 'CONFLICT', 409);
    }
    return sendError(res, 'Database error', 'DATABASE_ERROR', 500);
  }

  sendError(res, 'Internal server error', 'INTERNAL_ERROR', 500);
};
