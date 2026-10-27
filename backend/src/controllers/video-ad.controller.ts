import { Request, Response } from 'express';
import { GeminiVideoAdService } from '../services/gemini.service.js';

export class VideoAdController {
  public static async generate(req: Request, res: Response): Promise<void> {
    try {
      const { productName, targetAudience, tone, duration, keyFeatures } = req.body;

      const ad = await GeminiVideoAdService.generateVideoAd({
        productName: typeof productName === 'string' ? productName : undefined,
        targetAudience: typeof targetAudience === 'string' ? targetAudience : undefined,
        tone: typeof tone === 'string' ? tone : undefined,
        duration: duration === '15s' || duration === '60s' ? duration : '30s',
        keyFeatures: Array.isArray(keyFeatures) ? keyFeatures : undefined,
      });

      res.status(200).json({
        success: true,
        ad,
      });
    } catch (error: any) {
      console.error('[VideoAdController] Error generating video ad:', error);
      res.status(500).json({
        error: 'Failed to generate video ad script',
        details: error?.message || 'Internal server error',
      });
    }
  }

  public static async getTemplates(_req: Request, res: Response): Promise<void> {
    const templates = [
      {
        id: 'reviewpilot-flagship',
        name: 'ReviewPilot Flagship Commercial',
        productName: 'ReviewPilot',
        targetAudience: 'Engineering Leaders, Staff SDEs & DevSecOps',
        tone: 'Cinematic High-Tech & Provocative Security',
        duration: '30s',
        description: 'Highlight real-time SQL injection discovery, Zod verification, and the 99.4% precision guarantee.',
      },
      {
        id: 'saas-developer-tool',
        name: 'Modern Developer Infrastructure',
        productName: 'CloudScale Engine',
        targetAudience: 'Backend Engineers & SREs',
        tone: 'Fast-Paced, High-Energy Cyberpunk',
        duration: '15s',
        description: 'Punchy 15-second teaser showing instant deployment speed and sub-millisecond latencies.',
      },
      {
        id: 'enterprise-security',
        name: 'Enterprise Zero-Trust Platform',
        productName: 'ArmorGuard AI',
        targetAudience: 'CISOs & Security Architects',
        tone: 'Authoritative, Premium Apple-Style Minimalist',
        duration: '60s',
        description: 'Comprehensive 60-second deep-dive into multi-layered defensive boundary systems.',
      },
    ];

    res.status(200).json({
      success: true,
      templates,
    });
  }
}
