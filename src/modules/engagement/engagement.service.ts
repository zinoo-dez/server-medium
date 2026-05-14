import { prisma } from '../../config/database';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { createNotification } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

export const clapOnArticle = async (userId: string, slug: string, count: number) => {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.deletedAt) throw new NotFoundError('Article not found');

  const existingClap = await prisma.clap.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId: article.id,
      },
    },
  });

  const totalClaps = Math.min((existingClap?.count || 0) + count, 50);

  const clap = await prisma.clap.upsert({
    where: {
      userId_articleId: {
        userId,
        articleId: article.id,
      },
    },
    update: { count: totalClaps },
    create: {
      userId,
      articleId: article.id,
      count: totalClaps,
    },
  });

  // Update denormalized count
  const totalArticleClaps = await prisma.clap.aggregate({
    where: { articleId: article.id },
    _sum: { count: true },
  });

  await prisma.article.update({
    where: { id: article.id },
    data: { clapCount: totalArticleClaps._sum.count || 0 },
  });

  if (!existingClap) {
    await createNotification({
      userId: article.authorId,
      actorId: userId,
      type: NotificationType.CLAP,
      articleId: article.id,
    });
  }

  return clap;
};

export const addComment = async (userId: string, slug: string, data: { content: string; parentId?: string }) => {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.deletedAt) throw new NotFoundError('Article not found');

  let parentComment: any = null;
  if (data.parentId) {
    parentComment = await prisma.comment.findUnique({ where: { id: data.parentId } });
    if (!parentComment || parentComment.articleId !== article.id) {
      throw new NotFoundError('Parent comment not found');
    }
  }

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      userId,
      articleId: article.id,
      parentId: data.parentId,
    },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  // Update denormalized count
  await prisma.article.update({
    where: { id: article.id },
    data: { commentCount: { increment: 1 } },
  });

  if (data.parentId && parentComment) {
    await createNotification({
      userId: parentComment.userId,
      actorId: userId,
      type: NotificationType.REPLY,
      articleId: article.id,
      commentId: comment.id,
    });
  } else {
    await createNotification({
      userId: article.authorId,
      actorId: userId,
      type: NotificationType.COMMENT,
      articleId: article.id,
      commentId: comment.id,
    });
  }

  return comment;
};

export const updateComment = async (id: string, content: string) => {
  const comment = await prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  return comment;
};

export const deleteComment = async (id: string) => {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) throw new NotFoundError('Comment not found');

  await prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // Update denormalized count
  await prisma.article.update({
    where: { id: comment.articleId },
    data: { commentCount: { decrement: 1 } },
  });
};

export const getComments = async (slug: string) => {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.deletedAt) throw new NotFoundError('Article not found');

  const comments = await prisma.comment.findMany({
    where: { articleId: article.id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  // Build tree
  const commentMap = new Map<string, any>();
  const rootComments: any[] = [];

  comments.forEach((c) => {
    commentMap.set(c.id, { ...c, children: [] });
  });

  comments.forEach((c) => {
    if (c.parentId) {
      const parent = commentMap.get(c.parentId);
      if (parent) {
        parent.children.push(commentMap.get(c.id));
      } else {
        // Parent deleted or missing, treat as root or discard. We will treat as root.
        rootComments.push(commentMap.get(c.id));
      }
    } else {
      rootComments.push(commentMap.get(c.id));
    }
  });

  return rootComments;
};

export const bookmarkArticle = async (userId: string, slug: string) => {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.deletedAt) throw new NotFoundError('Article not found');

  try {
    await prisma.bookmark.create({
      data: {
        userId,
        articleId: article.id,
      },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ConflictError('Article already bookmarked');
    }
    throw error;
  }
};

export const removeBookmark = async (userId: string, slug: string) => {
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article || article.deletedAt) throw new NotFoundError('Article not found');

  try {
    await prisma.bookmark.delete({
      where: {
        userId_articleId: {
          userId,
          articleId: article.id,
        },
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return; // Already deleted/not bookmarked
    }
    throw error;
  }
};

export const getMyBookmarks = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        article: {
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
            tags: { include: { tag: true } },
            _count: { select: { claps: true, comments: { where: { deletedAt: null } } } },
          },
        },
      },
    }),
    prisma.bookmark.count({ where: { userId } }),
  ]);

  const mappedData = bookmarks
    .filter((b) => b.article && !b.article.deletedAt)
    .map((b) => ({
      bookmarkId: b.id,
      bookmarkedAt: b.createdAt,
      article: b.article,
    }));

  return { data: mappedData, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
