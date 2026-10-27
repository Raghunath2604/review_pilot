import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../src/services/auth.service.js';
import { prisma } from '../../src/db/prisma.js';
import { env } from '../../src/config/env.js';
import { AppError } from '../../src/middlewares/error.middleware.js';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'user-uuid-123', email: 'test@example.com' };
      const token = AuthService.generateToken(payload);

      expect(typeof token).toBe('string');
      const decoded = jwt.verify(token, env.JWT_SECRET) as any;
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe('register', () => {
    it('should throw AppError with 409 if email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'existing-id',
        email: 'user@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        AuthService.register('user@example.com', 'password123')
      ).rejects.toThrow(AppError);
    });

    it('should hash password and create new user if email is unique', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      const mockCreatedUser = {
        id: 'new-user-id',
        email: 'newuser@example.com',
        createdAt: new Date(),
      };
      vi.mocked(prisma.user.create).mockResolvedValueOnce(mockCreatedUser as any);

      const result = await AuthService.register('newuser@example.com', 'password123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'newuser@example.com' },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.id).toBe('new-user-id');
      expect(result.token).toBeDefined();
    });
  });

  describe('login', () => {
    it('should throw 401 if user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      await expect(
        AuthService.login('notfound@example.com', 'password123')
      ).rejects.toThrow(AppError);
    });

    it('should throw 401 if password does not match', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user-id',
        email: 'user@example.com',
        passwordHash: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        AuthService.login('user@example.com', 'wrong-password')
      ).rejects.toThrow(AppError);
    });

    it('should return user and token when credentials are valid', async () => {
      const plainPassword = 'validPassword123';
      const hash = await bcrypt.hash(plainPassword, 10);
      const mockUser = {
        id: 'user-id-valid',
        email: 'valid@example.com',
        passwordHash: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);

      const result = await AuthService.login('valid@example.com', plainPassword);

      expect(result.user.id).toBe('user-id-valid');
      expect(result.user.email).toBe('valid@example.com');
      expect(result.token).toBeDefined();
    });
  });
});
