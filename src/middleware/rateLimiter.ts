import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response';

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  handler: (req, res) => {
    sendError(res, 'Too many requests, please try again later.', 'RATE_LIMIT_EXCEEDED', 429);
  },
});
