export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type SourceType = 'DIFF' | 'GITHUB_PR';
export type ReviewStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';
export type Category = 'BUG' | 'SECURITY' | 'PERFORMANCE' | 'TESTING' | 'STYLE';
export type Feedback = 'PENDING' | 'ACCEPTED' | 'FALSE_POSITIVE';

export interface Finding {
  id: string;
  reviewId: string;
  file: string;
  line: number | null;
  severity: Severity;
  category: Category;
  message: string;
  suggestion: string;
  feedback: Feedback;
  createdAt: string;
}

export interface ReviewSummary {
  id: string;
  sourceType: SourceType;
  sourceRef: string | null;
  status: ReviewStatus;
  failureReason: string | null;
  createdAt: string;
  findingsCount: number;
}

export interface ReviewDetail {
  id: string;
  userId: string;
  sourceType: SourceType;
  sourceRef: string | null;
  status: ReviewStatus;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  findings: Finding[];
}

export interface ReviewsResponse {
  reviews: ReviewSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StatsResponse {
  totalReviews: number;
  totalFindings: number;
  acceptedCount: number;
  falsePositiveCount: number;
  pendingCount: number;
  precisionPercentage: number;
  byCategory: Record<Category, number>;
  bySeverity: Record<Severity, number>;
}
