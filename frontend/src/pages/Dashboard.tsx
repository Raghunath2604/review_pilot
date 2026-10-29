import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { StatsOverview } from '../components/stats/StatsOverview';
import { useAuth } from '../context/AuthContext';
import { GsapStagger } from '../components/animations/GsapStagger';
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
  Search,
  XCircle,
} from 'lucide-react';

const statusBadge: Record<
  string,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  COMPLETED: {
    label: 'Completed',
    badgeClass: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
  },
  PENDING: {
    label: 'Analyzing',
    badgeClass: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    icon: <Clock className="w-3 h-3 text-amber-400 animate-spin" />,
  },
  FAILED: {
    label: 'Failed',
    badgeClass: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    icon: <XCircle className="w-3 h-3 text-rose-400" />,
  },
};

export const Dashboard: React.FC = () => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useGSAP(
    () => {
      gsap.from('.dash-header-banner', {
        y: -15,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.from('.dash-history-card', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 0.1,
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
    <div ref={dashboardRef} className="pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Header Command Bar */}
        <div className="dash-header-banner flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Production Evaluation Suite</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Engineering Review Dashboard
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Signed in as <span className="text-zinc-200">{user?.email}</span> • Real-time AST extraction & team precision telemetry
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition shadow-sm"
              title="Refresh reviews and stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to="/new"
              id="dashboard-new-review-btn"
              data-testid="dashboard-new-review-btn"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-mono font-semibold transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Code Review</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Precision & Reliability Metrics */}
        <StatsOverview stats={statsData} isLoading={isStatsLoading} />

        {/* Review History Section */}
        <div className="dash-history-card rounded-xl border border-zinc-800 bg-[#090C10] p-5 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-indigo-400" />
                <span>Pull Request & Diff Audit Log</span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Full cryptographic history of analyzed unified diffs and PR webhooks
              </p>
            </div>

            {/* Filter and Search Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter reviews or PRs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition w-44 sm:w-56"
                />
              </div>

              <div className="flex items-center bg-zinc-900 p-0.5 rounded-md text-[11px] font-mono text-zinc-400 border border-zinc-800">
                {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 rounded transition ${
                      filterStatus === status
                        ? 'bg-zinc-800 text-white font-semibold shadow-sm'
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
            <div className="space-y-2 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-900/60 border border-zinc-800 rounded-lg" />
              ))}
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-10 px-4 border border-dashed border-zinc-800 rounded-lg bg-zinc-950/40 space-y-3 font-mono">
              <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                <FileDiff className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-white text-xs">No code reviews found</h3>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                  {searchQuery || filterStatus !== 'ALL'
                    ? 'No reviews match your current filter. Try resetting search criteria.'
                    : 'Paste a unified diff or GitHub pull request URL to execute your first automated review.'}
                </p>
              </div>
              <Link
                to="/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit First Review</span>
              </Link>
            </div>
          ) : (
            <GsapStagger selector=".review-row" stagger={0.04} className="divide-y divide-zinc-800/80">
              {filteredReviews.map((rev) => {
                const badge = statusBadge[rev.status] || statusBadge.COMPLETED;

                return (
                  <div
                    key={rev.id}
                    className="review-row py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/20 px-2 rounded-lg transition-colors group font-mono"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 flex-shrink-0 group-hover:border-zinc-700 transition-colors">
                        {rev.sourceType === 'GITHUB_PR' ? (
                          <GitPullRequest className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <FileDiff className="w-4 h-4 text-zinc-400" />
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {rev.sourceRef ? rev.sourceRef : `Diff Review (${rev.id.slice(0, 8)})`}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-semibold border ${badge.badgeClass}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-zinc-500">
                          <span>
                            {new Date(rev.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>•</span>
                          <span className="text-zinc-300">
                            {rev.findingsCount} {rev.findingsCount === 1 ? 'finding' : 'findings'}
                          </span>
                          <span>•</span>
                          <span className="text-zinc-600">ID: {rev.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/reviews/${rev.id}`}
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
                    >
                      <span>Inspect Review</span>
                      <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors" />
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
