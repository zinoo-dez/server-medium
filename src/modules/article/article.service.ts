import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { calculateReadingTime, generateSlug } from '../../utils/helpers';
import { ArticleStatus, Prisma } from '@prisma/client';

export const createArticle = async (authorId: string, data: any) => {
  const slug = generateSlug(data.title);
  const readingTime = calculateReadingTime(data.content);

  const tagConnectOrCreate = data.tags ? data.tags.map((tag: string) => {
    const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return {
      tag: {
        connectOrCreate: {
          where: { name: tag },
          create: { name: tag, slug: tagSlug },
        },
      },
    };
  }) : [];

  const article = await prisma.article.create({
    data: {
      authorId,
      title: data.title,
      slug,
      content: data.content || {},
      excerpt: data.excerpt || '',
      status: data.status || ArticleStatus.DRAFT,
      readingTime,
      publishedAt: data.status === ArticleStatus.PUBLISHED ? new Date() : null,
      tags: {
        create: tagConnectOrCreate,
      },
    },
    include: {
      tags: { include: { tag: true } },
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  return article;
};

export const updateArticle = async (slug: string, data: any) => {
  const existing = await prisma.article.findUnique({ where: { slug }, include: { tags: true } });
  if (!existing) throw new NotFoundError('Article not found');

  const updates: Prisma.ArticleUpdateInput = {};
  if (data.title) {
    updates.title = data.title;
    // Don't auto-update slug on edit to prevent breaking links, unless explicitly requested.
  }
  if (data.content !== undefined) {
    updates.content = data.content;
    updates.readingTime = calculateReadingTime(data.content);
  }
  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  
  if (data.status) {
    updates.status = data.status;
    if (data.status === ArticleStatus.PUBLISHED && existing.status !== ArticleStatus.PUBLISHED && !existing.publishedAt) {
      updates.publishedAt = new Date();
    }
  }

  if (data.tags) {
    // We clear existing tags and recreate them
    await prisma.articleTag.deleteMany({ where: { articleId: existing.id } });
    
    const tagConnectOrCreate = data.tags.map((tag: string) => {
      const tagSlug = tag.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return {
        tag: {
          connectOrCreate: {
            where: { name: tag },
            create: { name: tag, slug: tagSlug },
          },
        },
      };
    });
    updates.tags = { create: tagConnectOrCreate };
  }

  const updated = await prisma.article.update({
    where: { slug },
    data: updates,
    include: {
      tags: { include: { tag: true } },
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  return updated;
};

export const deleteArticle = async (slug: string) => {
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (!existing) throw new NotFoundError('Article not found');

  await prisma.article.update({
    where: { slug },
    data: { deletedAt: new Date() },
  });
};

export const getArticleBySlug = async (slug: string) => {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } },
      tags: { include: { tag: true } },
      _count: { select: { claps: true, comments: { where: { deletedAt: null } } } },
    },
  });

  if (!article || article.deletedAt) throw new NotFoundError('Article not found');
  
  // Need to only allow non-authors to see if it's published, but controller handles that or we do it here
  return article;
};

export const listArticles = async (query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
    status: ArticleStatus.PUBLISHED,
  };

  if (query.tag) {
    where.tags = { some: { tag: { slug: query.tag } } };
  }

  if (query.author) {
    where.author = { username: query.author };
  }

  let orderBy: Prisma.ArticleOrderByWithRelationInput = { publishedAt: 'desc' };
  if (query.sort === 'oldest') {
    orderBy = { publishedAt: 'asc' };
  } else if (query.sort === 'popular') {
    orderBy = { claps: { _count: 'desc' } };
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { claps: true, comments: { where: { deletedAt: null } } } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { data: articles, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getMyStories = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const where: Prisma.ArticleWhereInput = {
    authorId: userId,
    deletedAt: null,
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        _count: { select: { claps: true, comments: { where: { deletedAt: null } } } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { data: articles, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const searchArticles = async (query: any) => {
  const q = query.q as string;
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  // Basic search using contains
  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
    status: ArticleStatus.PUBLISHED,
    OR: [
      { title: { contains: q, mode: 'insensitive' } },
      { excerpt: { contains: q, mode: 'insensitive' } },
    ],
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { claps: true } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { data: articles, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getPersonalizedFeed = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = follows.map(f => f.followingId);

  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
    status: ArticleStatus.PUBLISHED,
    authorId: { in: followingIds },
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        tags: { include: { tag: true } },
        _count: { select: { claps: true, comments: { where: { deletedAt: null } } } },
      },
    }),
    prisma.article.count({ where }),
  ]);

  return { data: articles, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
