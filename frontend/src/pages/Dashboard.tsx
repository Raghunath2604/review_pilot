import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatsOverview } from '../components/stats/StatsOverview';
import {
  PlusCircle,
  GitPullRequest,
  FileDiff,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { ReviewSummary, ReviewStatus } from '../types';

const statusBadge: Record<
  ReviewStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/10 border-emerald-500/30',
    text: 'text-emerald-400',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  PENDING: {
    label: 'Analyzing',
    bg: 'bg-amber-500/10 border-amber-500/30',
    text: 'text-amber-400',
    icon: <Clock className="w-3.5 h-3.5 animate-spin" />,
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-rose-500/10 border-rose-500/30',
    text: 'text-rose-400',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export const Dashboard: React.FC = () => {
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.getReviews(1, 20),
  });

  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
  });

  const handleRefresh = () => {
    refetchReviews();
    refetchStats();
  };

  const reviews = reviewsData?.reviews || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Code Review Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track AI review findings, reliability metrics, and code health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Refresh dashboard"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/new"
            id="dashboard-new-review-btn"
            data-testid="dashboard-new-review-btn"
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Code Review</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <StatsOverview stats={statsData} isLoading={isStatsLoading} />

      {/* Reviews History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Recent Code Reviews</h2>
          <span className="text-xs text-slate-400">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} recorded
          </span>
        </div>

        {isReviewsLoading ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
            <p className="text-sm">Loading reviews history...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-medium text-slate-200">No reviews found yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Paste a git diff or connect a public GitHub Pull Request URL to run your first automated review.
            </p>
            <Link
              to="/new"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Your First Review</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {reviews.map((rev: ReviewSummary) => {
              const badge = statusBadge[rev.status] || statusBadge.COMPLETED;

              return (
                <Link
                  key={rev.id}
                  to={`/reviews/${rev.id}`}
                  data-testid={`review-item-${rev.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-850/50 hover:bg-slate-800/40 transition group"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-800 flex-shrink-0">
                      {rev.sourceType === 'GITHUB_PR' ? (
                        <GitPullRequest className="w-5 h-5 text-indigo-400" />
                      ) : (
                        <FileDiff className="w-5 h-5 text-sky-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300 transition">
                          {rev.sourceRef || 'Unified Diff'}
                        </span>
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium border ${badge.bg} ${badge.text}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {new Date(rev.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-white">
                        {rev.findingsCount}
                      </span>
                      <p className="text-xs text-slate-500">
                        {rev.findingsCount === 1 ? 'Finding' : 'Findings'}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
