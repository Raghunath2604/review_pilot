import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { FindingCard } from '../components/findings/FindingCard';
import { Severity, Category, Feedback, Finding } from '../types';
import {
  ArrowLeft,
  GitPullRequest,
  FileDiff,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
  CheckCheck,
} from 'lucide-react';

export const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['review', id],
    queryFn: () => api.getReviewById(id!),
    enabled: Boolean(id),
  });

  const feedbackMutation = useMutation({
    mutationFn: ({
      findingId,
      feedback,
    }: {
      findingId: string;
      feedback: Feedback;
    }) => api.updateFindingFeedback(findingId, feedback),
    onSuccess: (updatedFinding) => {
      // Update cache locally for immediate UI response
      queryClient.setQueryData(['review', id], (old: any) => {
        if (!old?.review) return old;
        return {
          ...old,
          review: {
            ...old.review,
            findings: old.review.findings.map((f: Finding) =>
              f.id === updatedFinding.finding.id ? updatedFinding.finding : f
            ),
          },
        };
      });
      // Invalidate global stats so precision % updates
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleFeedback = (findingId: string, feedback: Feedback) => {
    feedbackMutation.mutate({ findingId, feedback });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-400">
        <Clock className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-2" />
        <p className="text-sm">Loading review findings...</p>
      </div>
    );
  }

  if (error || !data?.review) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md mx-auto">
          <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Review Not Found</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            {(error as Error)?.message || 'The requested code review does not exist or you do not have permission to view it.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const { review } = data;
  const findings: Finding[] = review.findings || [];

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    const matchesSeverity =
      selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesCategory =
      selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSeverity && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      {/* Review Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
              {review.sourceType === 'GITHUB_PR' ? (
                <GitPullRequest className="w-6 h-6 text-indigo-400" />
              ) : (
                <FileDiff className="w-6 h-6 text-sky-400" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {review.sourceRef || 'Unified Diff Review'}
                </h1>
                {review.status === 'COMPLETED' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />
                    <span>Completed</span>
                  </span>
                )}
                {review.status === 'FAILED' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Failed</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Submitted on{' '}
                {new Date(review.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <div className="text-center">
              <span className="text-lg font-bold text-white">
                {findings.length}
              </span>
              <p className="text-[10px] uppercase font-mono text-slate-500">
                Findings
              </p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-lg font-bold text-emerald-400">
                {findings.filter((f) => f.feedback === 'ACCEPTED').length}
              </span>
              <p className="text-[10px] uppercase font-mono text-slate-500">
                Accepted
              </p>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <span className="text-lg font-bold text-amber-400">
                {findings.filter((f) => f.feedback === 'FALSE_POSITIVE').length}
              </span>
              <p className="text-[10px] uppercase font-mono text-slate-500">
                False Pos
              </p>
            </div>
          </div>
        </div>

        {/* Failure message if failed */}
        {review.status === 'FAILED' && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Review Error: </span>
              <span>{review.failureReason || 'An unknown error occurred during AI analysis.'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Severity:</span>
          </div>
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              data-testid={`filter-severity-${sev.toLowerCase()}`}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                selectedSeverity === sev
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Category:</span>
          </div>
          {(['ALL', 'BUG', 'SECURITY', 'PERFORMANCE', 'TESTING', 'STYLE'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              data-testid={`filter-category-${cat.toLowerCase()}`}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center">
            <CheckCheck className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">
              {findings.length === 0
                ? 'No issues detected in this code change!'
                : 'No findings match the selected filters.'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {findings.length === 0
                ? 'The submitted diff followed best practices with no critical bugs, security vulnerabilities, or performance bottlenecks identified.'
                : 'Try adjusting your severity or category filter buttons above.'}
            </p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onFeedback={handleFeedback}
              isUpdating={feedbackMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};
