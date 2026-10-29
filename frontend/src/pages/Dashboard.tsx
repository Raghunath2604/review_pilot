import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatsOverview } from '../components/stats/StatsOverview';
import {
  PlusCircle,
  GitPullRequest,
  FileDiff,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { ReviewStatus } from '../types';
import { MagnetButton } from '../components/bits/MagnetButton';
import { ShinyBadge } from '../components/bits/ShinyBadge';

const statusBadge: Record<
  ReviewStatus,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  },
  PENDING: {
    label: 'Analyzing',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    icon: <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />,
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-rose-50 border-rose-200',
    text: 'text-rose-700',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
  },
};

export const Dashboard: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.getReviews(1, 30),
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

  const filteredReviews = reviews.filter((rev) => {
    if (filterStatus !== 'ALL' && rev.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSource = rev.sourceRef?.toLowerCase().includes(q) || false;
      const matchType = rev.sourceType.toLowerCase().includes(q);
      const matchId = rev.id.toLowerCase().includes(q);
      if (!matchSource && !matchType && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Banner & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="mb-2">
              <ShinyBadge icon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}>
                Workspace Intelligence Active
              </ShinyBadge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Code Review Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Track automated AI pull request findings, precision rate reliability, and code health.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-sm transition active:scale-95"
              title="Refresh dashboard"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/new"
              id="dashboard-new-review-btn"
              data-testid="dashboard-new-review-btn"
            >
              <MagnetButton
                padding={50}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Code Review</span>
              </MagnetButton>
            </Link>
          </div>
        </div>

        {/* Dynamic Precision & Reliability Metrics */}
        <StatsOverview stats={statsData} isLoading={isStatsLoading} />

        {/* Review History Section */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pull Request Review History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed audit trail of all unified diffs and GitHub pull requests analyzed
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search diffs or PRs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition w-48 sm:w-56"
                />
              </div>

              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-lg transition ${
                      filterStatus === status
                        ? 'bg-white text-indigo-700 shadow-sm'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          {isReviewsLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-50 border border-slate-200/80 rounded-xl" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                <FileDiff className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">No code reviews found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery || filterStatus !== 'ALL'
                  ? 'No reviews match your current filter criteria. Try resetting the filters.'
                  : 'Start your first automated code review by pasting a unified diff or a public GitHub PR.'}
              </p>
              <Link
                to="/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit First Review</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReviews.map((rev) => {
                const badge = statusBadge[rev.status];

                return (
                  <div
                    key={rev.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 p-3 rounded-xl transition-colors group"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                        {rev.sourceType === 'GITHUB_PR' ? (
                          <GitPullRequest className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <FileDiff className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-900">
                            {rev.sourceRef ? rev.sourceRef : `Diff Review (${rev.id.slice(0, 8)})`}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <span>
                            {new Date(rev.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">
                            {rev.findingsCount} {rev.findingsCount === 1 ? 'finding' : 'findings'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/reviews/${rev.id}`}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition group-hover:bg-indigo-50/50"
                    >
                      <span>Inspect Review</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
