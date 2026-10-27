import {
  User,
  ReviewDetail,
  ReviewsResponse,
  Feedback,
  Finding,
  StatsResponse,
} from '../types';

const API_HOST = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = `${API_HOST}/api/v1`;

class ApiError extends Error {
  statusCode: number;
  details?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('reviewpilot_token') : null;
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const config: RequestInit = {
    ...options,
    credentials: 'include', // Ensures httpOnly JWT cookies are sent with requests
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let data: any = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  }

  if (!response.ok) {
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data.details);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(email: string, password: string): Promise<{ user: User }> {
    const res = await request<{ user: User; token?: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token && typeof window !== 'undefined') {
      localStorage.setItem('reviewpilot_token', res.token);
    }
    return { user: res.user };
  },

  async login(email: string, password: string): Promise<{ user: User }> {
    const res = await request<{ user: User; token?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token && typeof window !== 'undefined') {
      localStorage.setItem('reviewpilot_token', res.token);
    }
    return { user: res.user };
  },

  async logout(): Promise<{ message: string }> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('reviewpilot_token');
    }
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  // Reviews
  async createReview(payload: {
    sourceType: 'DIFF' | 'GITHUB_PR';
    diff?: string;
    prUrl?: string;
  }): Promise<{ review: ReviewDetail }> {
    return request<{ review: ReviewDetail }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getReviews(page = 1, limit = 10): Promise<ReviewsResponse> {
    return request<ReviewsResponse>(`/reviews?page=${page}&limit=${limit}`);
  },

  async getReviewById(id: string): Promise<{ review: ReviewDetail }> {
    return request<{ review: ReviewDetail }>(`/reviews/${id}`);
  },

  // Findings
  async updateFindingFeedback(
    findingId: string,
    feedback: Feedback
  ): Promise<{ finding: Finding }> {
    return request<{ finding: Finding }>(`/findings/${findingId}/feedback`, {
      method: 'PATCH',
      body: JSON.stringify({ feedback }),
    });
  },

  // Stats
  async getStats(): Promise<StatsResponse> {
    return request<StatsResponse>('/stats');
  },
};
