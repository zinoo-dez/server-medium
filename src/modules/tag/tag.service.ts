import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { ArticleStatus } from '@prisma/client';

export const listTags = async () => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          articles: true,
        },
      },
    },
    orderBy: {
      articles: {
        _count: 'desc',
      },
    },
  });

  return tags;
};

export const getArticlesByTag = async (slug: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) throw new NotFoundError('Tag not found');

  const where = {
    deletedAt: null,
    status: ArticleStatus.PUBLISHED,
    tags: {
      some: { tagId: tag.id },
    },
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

  return { tag, data: articles, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
