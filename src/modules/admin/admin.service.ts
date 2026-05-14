import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { Role, ArticleStatus, ReportStatus } from '@prisma/client';

// -- Dashboard --
export const getDashboardStats = async () => {
  const [users, articles, comments, claps] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.article.count({ where: { deletedAt: null } }),
    prisma.comment.count({ where: { deletedAt: null } }),
    prisma.clap.aggregate({ _sum: { count: true } }),
  ]);

  return {
    users,
    articles,
    comments,
    claps: claps._sum.count || 0,
  };
};

export const getGrowthMetrics = async () => {
  // Simplified growth metrics. In a real app, group by date using raw SQL or Prisma groupBy
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const newUsers = await prisma.user.count({ where: { createdAt: { gte: lastMonth } } });
  const newArticles = await prisma.article.count({ where: { createdAt: { gte: lastMonth } } });

  return {
    newUsersLast30Days: newUsers,
    newArticlesLast30Days: newArticles,
  };
};

// -- Users --
export const listUsers = async (query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, email: true, displayName: true, role: true, createdAt: true, deletedAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return { data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const getUserDetail = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { articles: true, comments: true } },
    },
  });
  if (!user) throw new NotFoundError('User not found');
  return user;
};

export const changeUserRole = async (id: string, role: Role) => {
  return prisma.user.update({ where: { id }, data: { role }, select: { id: true, role: true } });
};

export const banUser = async (id: string) => {
  return prisma.user.update({ where: { id }, data: { deletedAt: new Date() }, select: { id: true, deletedAt: true } });
};

export const unbanUser = async (id: string) => {
  return prisma.user.update({ where: { id }, data: { deletedAt: null }, select: { id: true, deletedAt: true } });
};

// -- Articles --
export const listArticles = async (query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { username: true } },
      },
    }),
    prisma.article.count(),
  ]);

  return { data: articles, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const changeArticleStatus = async (id: string, status: ArticleStatus) => {
  return prisma.article.update({ where: { id }, data: { status } });
};

export const forceRemoveArticle = async (id: string) => {
  return prisma.article.update({ where: { id }, data: { deletedAt: new Date() } });
};

// -- Comments --
export const listComments = async (query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { username: true } },
        article: { select: { title: true, slug: true } },
      },
    }),
    prisma.comment.count(),
  ]);

  return { data: comments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const forceRemoveComment = async (id: string) => {
  return prisma.comment.update({ where: { id }, data: { deletedAt: new Date() } });
};

// -- Reports --
export const listReports = async (query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '20', 10);
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count(),
  ]);

  return { data: reports, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

export const resolveReport = async (id: string, adminId: string) => {
  return prisma.report.update({
    where: { id },
    data: { status: ReportStatus.RESOLVED, resolvedById: adminId },
  });
};

export const dismissReport = async (id: string, adminId: string) => {
  return prisma.report.update({
    where: { id },
    data: { status: ReportStatus.DISMISSED, resolvedById: adminId },
  });
};

// -- Tags --
export const createTag = async (data: any) => {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return prisma.tag.create({ data: { name: data.name, slug, description: data.description } });
};

export const updateTag = async (id: string, data: any) => {
  const updates: any = {};
  if (data.name) {
    updates.name = data.name;
    updates.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  if (data.description !== undefined) updates.description = data.description;
  return prisma.tag.update({ where: { id }, data: updates });
};

export const deleteTag = async (id: string) => {
  return prisma.tag.delete({ where: { id } });
};

// -- Platform Settings --
export const getPlatformSettings = async () => {
  return prisma.platformSetting.findMany();
};

export const updatePlatformSetting = async (key: string, value: any, adminId: string) => {
  return prisma.platformSetting.upsert({
    where: { key },
    update: { value, updatedBy: adminId },
    create: { key, value, updatedBy: adminId },
  });
};
