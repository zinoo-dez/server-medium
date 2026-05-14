import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors';

const generateTokens = (user: { id: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'secret',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (data: any) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.email }, { username: data.username }],
    },
  });

  if (existingUser) {
    throw new ConflictError('User with this email or username already exists');
  }

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    },
  });

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    },
    ...tokens,
  };
};

export const login = async (data: any) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user || user.deletedAt) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    ...tokens,
  };
};

export const refresh = async (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as any;
    
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'secret',
      { expiresIn: '15m' }
    );

    return { accessToken };
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.deletedAt) {
    // Return silently to prevent email enumeration
    return;
  }

  // Generate a mock reset token
  const resetToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  // In a real app, send an email here
  console.log(`Password reset token for ${email}: ${resetToken}`);
};

export const resetPassword = async (data: any) => {
  try {
    const decoded = jwt.verify(data.token, process.env.JWT_SECRET || 'secret') as any;
    
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid token');
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const passwordHash = await bcrypt.hash(data.newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
};
