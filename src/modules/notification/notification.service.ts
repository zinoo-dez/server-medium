import { prisma } from '../../config/database';
import { NotificationType } from '@prisma/client';

export const createNotification = async (data: {
  userId: string;
  actorId: string;
  type: NotificationType;
  articleId?: string;
  commentId?: string;
}) => {
  if (data.userId === data.actorId) return; // Don't notify self

  return prisma.notification.create({
    data: {
      recipientId: data.userId,
      actorId: data.actorId,
      type: data.type,
      articleId: data.articleId,
      commentId: data.commentId,
    },
  });
};

export const getNotifications = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        article: { select: { id: true, slug: true, title: true } },
        comment: { select: { id: true, content: true } },
      },
    }),
    prisma.notification.count({ where: { recipientId: userId } }),
    prisma.notification.count({ where: { recipientId: userId, isRead: false } }),
  ]);

  return { data: notifications, meta: { page, limit, total, totalPages: Math.ceil(total / limit), unreadCount } };
};

export const markAsRead = async (userId: string, notificationIds?: string[]) => {
  const where: any = { recipientId: userId, isRead: false };
  
  if (notificationIds && notificationIds.length > 0) {
    where.id = { in: notificationIds };
  }

  await prisma.notification.updateMany({
    where,
    data: { isRead: true },
  });
};
