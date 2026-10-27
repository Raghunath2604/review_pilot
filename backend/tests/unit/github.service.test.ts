import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubService } from '../../src/services/github.service.js';
import { AppError } from '../../src/middlewares/error.middleware.js';

describe('GitHubService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('parsePrUrl', () => {
    it('should parse standard GitHub PR URLs', () => {
      const parsed = GitHubService.parsePrUrl('https://github.com/facebook/react/pull/42');
      expect(parsed).toEqual({
        owner: 'facebook',
        repo: 'react',
        pullNumber: 42,
      });
    });

    it('should parse URLs with www and trailing path', () => {
      const parsed = GitHubService.parsePrUrl('https://www.github.com/torvalds/linux/pull/999/files');
      expect(parsed).toEqual({
        owner: 'torvalds',
        repo: 'linux',
        pullNumber: 999,
      });
    });

    it('should throw AppError for non-PR or malformed GitHub URLs', () => {
      expect(() => GitHubService.parsePrUrl('https://github.com/facebook/react')).toThrow(AppError);
      expect(() => GitHubService.parsePrUrl('https://gitlab.com/owner/repo/pull/1')).toThrow(AppError);
    });
  });

  describe('fetchPrDiff', () => {
    it('should successfully fetch diff when GitHub responds 200', async () => {
      const mockDiff = 'diff --git a/file.ts b/file.ts\n+const a = 1;';
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockDiff,
      });

      const result = await GitHubService.fetchPrDiff('https://github.com/owner/repo/pull/1');
      expect(result).toBe(mockDiff);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/pulls/1',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'application/vnd.github.v3.diff',
          }),
        })
      );
    });

    it('should throw 404 when PR does not exist', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        GitHubService.fetchPrDiff('https://github.com/owner/repo/pull/99999')
      ).rejects.toThrow('GitHub Pull Request not found');
    });

    it('should throw 429 when GitHub rate limit is hit', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(
        GitHubService.fetchPrDiff('https://github.com/owner/repo/pull/1')
      ).rejects.toThrow('rate limit exceeded');
    });

    it('should throw 400 if diff exceeds 200 KB', async () => {
      const hugeDiff = 'a'.repeat(201 * 1024); // 201 KB
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => hugeDiff,
      });

      await expect(
        GitHubService.fetchPrDiff('https://github.com/owner/repo/pull/1')
      ).rejects.toThrow('exceeds the 200 KB limit');
    });
  });
});
