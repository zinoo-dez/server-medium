import { Response } from 'express';

export const sendSuccess = (
  res: Response,
  data: any,
  meta?: any,
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
  });
};

export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode = 500,
  errors?: any[]
) => {
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(errors && { errors }),
  });
};
