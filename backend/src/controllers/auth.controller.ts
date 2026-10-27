import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { env } from '../config/env.js';
import { AuthenticatedRequest } from '../types/index.js';

const COOKIE_NAME = 'token';

const setAuthCookie = (res: Response, token: string) => {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.register(email, password);
      setAuthCookie(res, token);
      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      setAuthCookie(res, token);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await AuthService.getCurrentUser(req.user.userId);
      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}
