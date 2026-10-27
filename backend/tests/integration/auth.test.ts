import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { env } from '../../src/config/env.js';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

describe('Auth Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should reject invalid email format with 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject password shorter than 8 chars with 400', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'short' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should register successfully, set httpOnly cookie, and return 201', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.user.create).mockResolvedValueOnce({
        id: 'user-uuid-1',
        email: 'newuser@example.com',
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'newuser@example.com', password: 'ValidPassword123' });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('newuser@example.com');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should return 409 if email already registered', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'existing-id',
        email: 'existing@example.com',
        passwordHash: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'existing@example.com', password: 'ValidPassword123' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 401 on incorrect credentials', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'anyPassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('should return 200 and set cookie on valid credentials', async () => {
      const hash = await bcrypt.hash('CorrectPass123', 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user-uuid-2',
        email: 'login@example.com',
        passwordHash: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'login@example.com', password: 'CorrectPass123' });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('login@example.com');
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 when no auth cookie is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should return 200 and user profile when valid cookie is provided', async () => {
      const token = jwt.sign(
        { userId: 'user-uuid-3', email: 'me@example.com' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        id: 'user-uuid-3',
        email: 'me@example.com',
        createdAt: new Date(),
      } as any);

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe('user-uuid-3');
      expect(res.body.user.email).toBe('me@example.com');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear token cookie and return 200', async () => {
      const res = await request(app).post('/api/v1/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
