import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import articleRoutes from './modules/article/article.routes';
import engagementRoutes from './modules/engagement/engagement.routes';
import tagRoutes from './modules/tag/tag.routes';
import notificationRoutes from './modules/notification/notification.routes';
import adminRoutes from './modules/admin/admin.routes';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

const app = express();

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', userRoutes);
app.use('/api/v1', articleRoutes);
app.use('/api/v1', engagementRoutes);
app.use('/api/v1', tagRoutes);
app.use('/api/v1', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

export default app;
