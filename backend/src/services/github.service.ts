import { AppError } from '../middlewares/error.middleware.js';

const MAX_DIFF_BYTES = 200 * 1024; // 200 KB

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  pullNumber: number;
}

export class GitHubService {
  /**
   * Parses public GitHub PR URL
   * Example: https://github.com/facebook/react/pull/12345
   */
  static parsePrUrl(url: string): ParsedGitHubUrl {
    const regex = /^https?:\/\/(www\.)?github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
    const match = url.trim().match(regex);

    if (!match) {
      throw new AppError(
        'Invalid GitHub PR URL. Expected format: https://github.com/:owner/:repo/pull/:number',
        400
      );
    }

    return {
      owner: match[2],
      repo: match[3],
      pullNumber: parseInt(match[4], 10),
    };
  }

  /**
   * Fetches the unified diff from the public GitHub API
   */
  static async fetchPrDiff(url: string): Promise<string> {
    const { owner, repo, pullNumber } = this.parsePrUrl(url);
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`;

    let response: Response;
    try {
      response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3.diff',
          'User-Agent': 'ReviewPilot-CodeReviewEngine',
        },
        redirect: 'follow',
      });
    } catch (err) {
      throw new AppError(`Failed to reach GitHub API: ${(err as Error).message}`, 502);
    }

    if (response.status === 404) {
      throw new AppError('GitHub Pull Request not found. Verify repository visibility and PR number.', 404);
    }

    if (response.status === 403) {
      throw new AppError('GitHub API rate limit exceeded or access forbidden. Please paste raw diff directly.', 429);
    }

    if (!response.ok) {
      throw new AppError(`GitHub API returned status ${response.status}: ${response.statusText}`, 502);
    }

    const diffText = await response.text();

    if (!diffText || diffText.trim().length === 0) {
      throw new AppError('The specified GitHub PR contains no code changes / empty diff.', 400);
    }

    const byteLength = Buffer.byteLength(diffText, 'utf8');
    if (byteLength > MAX_DIFF_BYTES) {
      throw new AppError(
        `PR diff is ${Math.round(byteLength / 1024)} KB, which exceeds the 200 KB limit.`,
        400
      );
    }

    return diffText;
  }
}
