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
  Download,
  Printer,
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

  // Export as Markdown report
  const handleExportMarkdown = () => {
    const lines: string[] = [
      `# ReviewPilot Automated Code Review Audit Report`,
      ``,
      `> **Report Date**: ${new Date(review.createdAt).toUTCString()}`,
      `> **Review ID**: \`${review.id}\``,
      `> **Source Reference**: ${review.sourceRef || 'Unified Git Diff'}`,
      `> **Status**: ${review.status}`,
      `> **AI Precision Score**: ${reviewPrecision !== null ? `${reviewPrecision}%` : 'Pending developer feedback'}`,
      ``,
      `---`,
      ``,
      `## 1. Executive Summary`,
      ``,
      `| Metric | Count |`,
      `| :--- | :--- |`,
      `| Total Findings | ${findings.length} |`,
      `| Accepted Findings | ${acceptedCount} |`,
      `| False Positives Flagged | ${fpCount} |`,
      `| High / Critical Severity | ${findings.filter((f) => f.severity === 'HIGH').length} |`,
      `| Medium Severity | ${findings.filter((f) => f.severity === 'MEDIUM').length} |`,
      `| Low Severity | ${findings.filter((f) => f.severity === 'LOW').length} |`,
      ``,
      `---`,
      ``,
      `## 2. Detailed Findings & Remediation`,
      ``,
    ];

    findings.forEach((f, idx) => {
      lines.push(`### ${idx + 1}. [${f.severity}] ${f.category} in \`${f.file}${f.line ? `:${f.line}` : ''}\``);
      lines.push(``);
      lines.push(`- **Message**: ${f.message}`);
      lines.push(`- **Actionable Fix**: ${f.suggestion}`);
      lines.push(`- **Developer Feedback**: \`${f.feedback}\``);
      lines.push(``);
    });

    lines.push(`---`);
    lines.push(`*Generated by ReviewPilot — Final Year Engineering Project System*`);

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reviewpilot-audit-${review.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export / Print PDF report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#FAF8FF] bg-mesh-radial min-h-screen text-slate-900 pb-16 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Back Link (Hidden on Print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Export Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition shadow-sm"
              title="Download Markdown Report"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Export .MD</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-sm shadow-indigo-600/20"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Header Summary Card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 print:border-slate-300">
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
            <div className="flex items-center space-x-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 print:border-slate-300">
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
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 print:border-slate-300">
              <span className="text-slate-500 block">Total Findings</span>
              <span className="text-base font-bold text-slate-900">{findings.length}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 print:border-slate-300">
              <span className="text-slate-500 block">Accepted Findings</span>
              <span className="text-base font-bold text-emerald-600">{acceptedCount}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 print:border-slate-300">
              <span className="text-slate-500 block">False Positives</span>
              <span className="text-base font-bold text-amber-600">{fpCount}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 print:border-slate-300">
              <span className="text-slate-500 block">Unreviewed</span>
              <span className="text-base font-bold text-slate-600">{findings.length - verifiedCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 print:hidden">
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
                type="button"
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedSeverity === sev
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            {(['ALL', 'SECURITY', 'PERFORMANCE', 'BUG', 'TESTING', 'STYLE'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>
              Showing {filteredFindings.length} of {findings.length} findings
            </span>
            {filteredFindings.length < findings.length && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSeverity('ALL');
                  setSelectedCategory('ALL');
                }}
                className="text-indigo-600 hover:underline normal-case font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>

          {filteredFindings.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                No matching findings
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No issues match your selected severity and category filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onFeedback={handleFeedback}
                  isUpdating={feedbackMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
