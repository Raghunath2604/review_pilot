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
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Filter,
  Target,
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
      <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen flex flex-col items-center justify-center text-slate-600">
        <Clock className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold">Loading review findings & security analysis...</p>
      </div>
    );
  }

  if (error || !data?.review) {
    return (
      <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen py-16 px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md mx-auto text-center space-y-4 shadow-xl">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Review Not Found</h2>
          <p className="text-xs text-slate-500">
            {(error as Error)?.message || 'The requested code review does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { review } = data;
  const findings: Finding[] = review.findings || [];

  const acceptedCount = findings.filter((f) => f.feedback === 'ACCEPTED').length;
  const fpCount = findings.filter((f) => f.feedback === 'FALSE_POSITIVE').length;
  const verifiedCount = acceptedCount + fpCount;
  const reviewPrecision = verifiedCount > 0 ? Math.round((acceptedCount / verifiedCount) * 100) : null;

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    const matchesSeverity =
      selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesCategory =
      selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSeverity && matchesCategory;
  });

  return (
    <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header Summary Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                {review.sourceType === 'GITHUB_PR' ? (
                  <GitPullRequest className="w-6 h-6 text-indigo-600" />
                ) : (
                  <FileDiff className="w-6 h-6 text-indigo-600" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {review.sourceRef || 'Unified Git Diff Review'}
                  </h1>
                  {review.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Completed</span>
                    </span>
                  )}
                  {review.status === 'FAILED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Failed</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Analyzed on{' '}
                  {new Date(review.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' • '}
                  <span className="font-mono text-slate-600">ID: {review.id}</span>
                </p>
              </div>
            </div>

            {/* Precision Pill for this Review */}
            <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Review Precision
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {reviewPrecision !== null ? `${reviewPrecision}%` : 'Pending'}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Target className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Metric Sub-bar */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block">Total Findings</span>
              <span className="text-base font-bold text-slate-900">{findings.length}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block">Accepted Findings</span>
              <span className="text-base font-bold text-emerald-600">{acceptedCount}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block">False Positives</span>
              <span className="text-base font-bold text-amber-600">{fpCount}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <span className="text-slate-500 block">Unreviewed</span>
              <span className="text-base font-bold text-slate-600">{findings.length - verifiedCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filter Findings:</span>
          </div>

          {/* Severity Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Severity:
            </span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedSeverity === sev
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {(['ALL', 'SECURITY', 'BUG', 'PERFORMANCE', 'TESTING', 'STYLE'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
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
            <div className="text-center py-12 px-4 glass-card rounded-2xl border border-dashed border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No findings match active filters</h3>
              <p className="text-xs text-slate-500">
                Try selecting a different severity or category filter.
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
    </div>
  );
};
