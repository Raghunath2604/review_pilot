import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatsOverview } from '../components/stats/StatsOverview';
import { useAuth } from '../context/AuthContext';
import { GsapStagger } from '../components/animations/GsapStagger';
import { MagnetButton } from '../components/bits/MagnetButton';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  PlusCircle,
  FileDiff,
  GitPullRequest,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Search,
  XCircle,
} from 'lucide-react';

const statusBadge: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    text: 'text-emerald-400',
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  },
  PENDING: {
    label: 'Analyzing',
    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    text: 'text-amber-400',
    icon: <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />,
  },
  FAILED: {
    label: 'Failed',
    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]',
    text: 'text-rose-400',
    icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
  },
};

export const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useGSAP(
    () => {
      // Top header banner entrance
      gsap.from('.dash-header-banner', {
        y: -25,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
      // Review history card entrance
      gsap.from('.dash-history-card', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.15,
        ease: 'power3.out',
      });
    },
    { scope: dashboardRef }
  );

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

  const { user } = useAuth();

  const handleRefresh = () => {
    refetchReviews();
    refetchStats();
  };

  const reviews = reviewsData?.reviews || [];

  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      (r.sourceRef && r.sourceRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div ref={dashboardRef} className="pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top Header Banner */}
        <div className="dash-header-banner flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Production Evaluation Suite</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Engineering Review Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Welcome back, <span className="text-slate-200 font-semibold">{user?.email}</span>. Real-time telemetry, false-positive metrics, and diff audits.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition shadow-sm active:scale-95"
              title="Refresh telemetry and review status"
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
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-[0_0_20px_-3px_rgba(99,102,241,0.5)]"
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
        <div className="dash-history-card glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Pull Request Review History
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Detailed audit trail of all unified diffs and GitHub pull requests analyzed
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search diffs or PRs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition w-48 sm:w-56"
                />
              </div>

              <div className="flex items-center bg-white/[0.04] p-1 rounded-xl text-xs font-semibold text-slate-400 border border-white/[0.06]">
                {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-lg transition ${
                      filterStatus === status
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)] font-bold'
                        : 'hover:text-white'
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
                <div key={i} className="h-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-white/[0.1] rounded-2xl bg-white/[0.02] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <FileDiff className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-sm">No code reviews found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || filterStatus !== 'ALL'
                  ? 'No reviews match your current filter criteria. Try resetting the filters.'
                  : 'Start your first automated code review by pasting a unified diff or a public GitHub PR.'}
              </p>
              <Link
                to="/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit First Review</span>
              </Link>
            </div>
          ) : (
            <GsapStagger selector=".review-row" stagger={0.05} className="divide-y divide-white/[0.06]">
              {filteredReviews.map((rev) => {
                const badge = statusBadge[rev.status] || statusBadge.COMPLETED;

                return (
                  <div
                    key={rev.id}
                    className="review-row py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] p-3 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 flex-shrink-0 group-hover:scale-105 transition-transform">
                        {rev.sourceType === 'GITHUB_PR' ? (
                          <GitPullRequest className="w-5 h-5 text-indigo-400" />
                        ) : (
                          <FileDiff className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white">
                            {rev.sourceRef ? rev.sourceRef : `Diff Review (${rev.id.slice(0, 8)})`}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-400">
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
                          <span className="font-medium text-slate-300">
                            {rev.findingsCount} {rev.findingsCount === 1 ? 'finding' : 'findings'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/reviews/${rev.id}`}
                      className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 shadow-sm transition"
                    >
                      <span>Inspect Review</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                    </Link>
                  </div>
                );
              })}
            </GsapStagger>
          )}
        </div>
      </div>
    </div>
  );
};
