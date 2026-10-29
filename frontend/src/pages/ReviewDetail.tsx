import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Finding, Severity, Category, Feedback } from '../types';
import { FindingCard } from '../components/findings/FindingCard';
import { GsapStagger } from '../components/animations/GsapStagger';
import { GsapCounter } from '../components/animations/GsapCounter';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  FileDiff,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Filter,
  Download,
  Printer,
  Target,
  XCircle,
} from 'lucide-react';

export const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const detailRef = useRef<HTMLDivElement>(null);

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

  useGSAP(
    () => {
      if (isLoading || !data?.review) return;
      gsap.from('.detail-summary-card', {
        y: -20,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
      gsap.from('.detail-filter-bar', {
        y: 15,
        opacity: 0,
        duration: 0.6,
        delay: 0.1,
        ease: 'power3.out',
      });
    },
    { scope: detailRef, dependencies: [isLoading, data?.review] }
  );

  const feedbackMutation = useMutation({
    mutationFn: ({
      findingId,
      feedback,
    }: {
      findingId: string;
      feedback: Feedback;
    }) => api.updateFindingFeedback(findingId, feedback),
    onSuccess: ({ finding: updatedFinding }) => {
      // Optimistically update query cache
      queryClient.setQueryData(['review', id], (old: any) => {
        if (!old?.review) return old;
        return {
          ...old,
          review: {
            ...old.review,
            findings: old.review.findings.map((f: Finding) =>
              f.id === updatedFinding.id ? updatedFinding : f
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Clock className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-semibold text-slate-300">Loading audit findings & AI security analysis...</p>
      </div>
    );
  }

  if (error || !data?.review) {
    return (
      <div className="py-20 px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md mx-auto text-center space-y-4">
          <XCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Review Not Found</h2>
          <p className="text-xs text-slate-400">
            {(error as Error)?.message || 'The requested code review does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-[0_0_15px_rgba(99,102,241,0.4)]"
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
    lines.push(`*Generated by ReviewPilot — AI Code Review System*`);

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
    <div ref={detailRef} className="pb-20 print:bg-white print:p-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Breadcrumb & Export Actions */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Dashboard</span>
          </Link>

          {/* Export Action Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={handleExportMarkdown}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white transition shadow-sm"
              title="Download Markdown Report"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export .MD</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/40 hover:text-white transition shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-300" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Header Summary Card */}
        <div className="detail-summary-card glass-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Subtle Cyber Glow in Card Header */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
            <div className="flex items-start space-x-4">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0 shadow-[0_0_20px_-3px_rgba(99,102,241,0.25)]">
                {review.sourceType === 'GITHUB_PR' ? (
                  <GitPullRequest className="w-7 h-7 text-indigo-400" />
                ) : (
                  <FileDiff className="w-7 h-7 text-indigo-400" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {review.sourceRef || 'Unified Git Diff Review'}
                  </h1>
                  {review.status === 'COMPLETED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Completed</span>
                    </span>
                  )}
                  {review.status === 'FAILED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Analysis Failed</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Analyzed on{' '}
                  <span className="text-slate-300">
                    {new Date(review.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {' • '}
                  <span className="font-mono text-indigo-400">ID: {review.id}</span>
                </p>
              </div>
            </div>

            {/* Precision Metric Telemetry Pill */}
            <div className="flex items-center space-x-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 self-start lg:self-auto shadow-inner">
              <div className="text-right">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Review Precision
                </div>
                <div className="text-2xl font-black text-white">
                  {reviewPrecision !== null ? (
                    <GsapCounter value={reviewPrecision} suffix="%" duration={1.2} />
                  ) : (
                    <span className="text-slate-400 text-base font-medium">Pending Feedback</span>
                  )}
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]">
                <Target className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 4 Interactive Metric Sub-tiles */}
          <div className="pt-4 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.15] transition space-y-1">
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">Total Findings</span>
              <span className="text-xl font-black text-white">
                <GsapCounter value={findings.length} duration={1} />
              </span>
            </div>
            <div className="bg-emerald-500/[0.04] p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition space-y-1">
              <span className="text-emerald-400/90 block font-semibold text-[11px] uppercase tracking-wider">Accepted Findings</span>
              <span className="text-xl font-black text-emerald-400">
                <GsapCounter value={acceptedCount} duration={1} />
              </span>
            </div>
            <div className="bg-amber-500/[0.04] p-4 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition space-y-1">
              <span className="text-amber-400/90 block font-semibold text-[11px] uppercase tracking-wider">False Positives</span>
              <span className="text-xl font-black text-amber-400">
                <GsapCounter value={fpCount} duration={1} />
              </span>
            </div>
            <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/[0.06] hover:border-white/[0.15] transition space-y-1">
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">Unreviewed</span>
              <span className="text-xl font-black text-slate-300">
                <GsapCounter value={findings.length - verifiedCount} duration={1} />
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="detail-filter-bar flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/[0.08] print:hidden shadow-lg">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Findings:</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            {/* Severity Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Severity:
              </span>
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedSeverity === sev
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.6)] border border-indigo-400/40'
                      : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                Category:
              </span>
              {(['ALL', 'SECURITY', 'PERFORMANCE', 'BUG', 'TESTING', 'STYLE'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_15px_-3px_rgba(99,102,241,0.6)] border border-indigo-400/40'
                        : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Findings List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
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
                className="text-indigo-400 hover:text-indigo-300 normal-case font-semibold transition"
              >
                Reset filters
              </button>
            )}
          </div>

          {filteredFindings.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">
                No matching findings
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No issues match your selected severity and category filters.
              </p>
            </div>
          ) : (
            <GsapStagger
              key={`${selectedSeverity}-${selectedCategory}`}
              selector=".finding-card-item"
              stagger={0.06}
              className="space-y-4"
            >
              {filteredFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  onFeedback={handleFeedback}
                  isUpdating={feedbackMutation.isPending}
                />
              ))}
            </GsapStagger>
          )}
        </div>
      </div>
    </div>
  );
};
