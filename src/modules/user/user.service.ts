import { prisma } from '../../config/database';
import { NotFoundError, UnauthorizedError, ConflictError } from '../../utils/errors';
import bcrypt from 'bcrypt';
import { createNotification } from '../notification/notification.service';
import { NotificationType } from '@prisma/client';

export const getPublicProfile = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
      _count: {
        select: {
          articles: { where: { status: 'PUBLISHED', deletedAt: null } },
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const getOwnProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          articles: { where: { deletedAt: null } },
          followers: true,
          following: true,
          bookmarks: true,
        },
      },
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const updateProfile = async (userId: string, data: { displayName?: string; bio?: string }) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  });

  return user;
};

export const changePassword = async (userId: string, data: any) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User not found');

  const isPasswordValid = await bcrypt.compare(data.oldPassword, user.passwordHash);
  if (!isPasswordValid) throw new UnauthorizedError('Invalid old password');

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash(data.newPassword, saltRounds);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

export const updateAvatarUrl = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: { id: true, avatarUrl: true },
  });
  return user;
};

export const followUser = async (followerId: string, targetUsername: string) => {
  const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } });
  
  if (!targetUser) throw new NotFoundError('User not found');
  if (targetUser.id === followerId) throw new ConflictError('Cannot follow yourself');

  try {
    await prisma.follow.create({
      data: {
        followerId,
        followingId: targetUser.id,
      },
    });
    
    await createNotification({
      userId: targetUser.id,
      actorId: followerId,
      type: NotificationType.FOLLOW,
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new ConflictError('Already following this user');
    }
    throw error;
  }
};

export const unfollowUser = async (followerId: string, targetUsername: string) => {
  const targetUser = await prisma.user.findUnique({ where: { username: targetUsername } });
  
  if (!targetUser) throw new NotFoundError('User not found');

  try {
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Not found, meaning not following
      return;
    }
    throw error;
  }
};
