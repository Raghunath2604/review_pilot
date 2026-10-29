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
        y: -15,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.from('.detail-filter-bar', {
        y: 10,
        opacity: 0,
        duration: 0.5,
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
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleFeedback = (findingId: string, feedback: Feedback) => {
    feedbackMutation.mutate({ findingId, feedback });
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-zinc-400 space-y-3 font-mono">
        <Clock className="w-6 h-6 animate-spin text-indigo-400" />
        <p className="text-xs text-zinc-300">Loading audit findings & AST analysis...</p>
      </div>
    );
  }

  if (error || !data?.review) {
    return (
      <div className="py-20 px-4 font-mono">
        <div className="rounded-xl border border-zinc-800 bg-[#090C10] p-8 max-w-md mx-auto text-center space-y-4">
          <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-sm font-bold text-white">Review Not Found</h2>
          <p className="text-xs text-zinc-400">
            {(error as Error)?.message || 'The requested code review does not exist or you do not have permission to view it.'}
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-md bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
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

  const filteredFindings = findings.filter((f) => {
    const matchesSeverity =
      selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesCategory =
      selectedCategory === 'ALL' || f.category === selectedCategory;
    return matchesSeverity && matchesCategory;
  });

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
      `| Accepted Fixes (True Positives) | ${acceptedCount} |`,
      `| False Positives (Suppressed) | ${fpCount} |`,
      `| Unreviewed Findings | ${findings.length - verifiedCount} |`,
      ``,
      `---`,
      ``,
      `## 2. Audit Findings & Remediations`,
      ``,
    ];

    findings.forEach((f, idx) => {
      lines.push(`### Finding #${idx + 1}: [${f.severity}] ${f.category} in \`${f.file}${f.line ? `:${f.line}` : ''}\``);
      lines.push(`- **Risk**: ${f.message}`);
      lines.push(`- **Verification**: ${f.feedback || 'PENDING'}`);
      lines.push(``);
      lines.push('```');
      lines.push(f.suggestion);
      lines.push('```');
      lines.push(``);
    });

    lines.push(`---`);
    lines.push(`*Generated autonomously by ReviewPilot (Google Gemini 3.1 & Anthropic Claude Engine).*`);

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reviewpilot-audit-${review.id.slice(0, 8)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={detailRef} className="pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between font-mono text-xs">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-zinc-400 hover:text-white transition group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-zinc-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Dashboard</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-300">Reviews</span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-500">{review.id.slice(0, 8)}</span>
          </Link>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportMarkdown}
              id="export-markdown-btn"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
              title="Download Markdown Report"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span>Export .md</span>
            </button>
            <button
              onClick={handlePrint}
              id="print-report-btn"
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition"
              title="Print or Save PDF"
            >
              <Printer className="w-3 h-3 text-zinc-400" />
              <span>Print PDF</span>
            </button>
          </div>
        </div>

        {/* Audit Summary Card */}
        <div className="detail-summary-card rounded-xl border border-zinc-800 bg-[#090C10] p-6 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{review.status}</span>
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-500">ID: {review.id}</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                {review.sourceType === 'GITHUB_PR' ? (
                  <GitPullRequest className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                ) : (
                  <FileDiff className="w-6 h-6 text-zinc-400 flex-shrink-0" />
                )}
                <span>
                  {review.sourceRef ? review.sourceRef : `Diff Audit #${review.id.slice(0, 8)}`}
                </span>
              </h1>
            </div>

            {/* Precision Score Badge */}
            <div className="flex items-center space-x-3 bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 font-mono">
              <div className="w-8 h-8 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  Review Precision
                </div>
                <div className="text-lg font-bold text-white tabular-nums">
                  {reviewPrecision !== null ? `${reviewPrecision}%` : '100%'}
                  <span className="text-[10px] text-zinc-500 font-normal ml-1">
                    ({acceptedCount}/{verifiedCount || findings.length} verified)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metric Sub-Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-zinc-800 font-mono text-xs">
            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase">Total Findings</span>
              <div className="text-lg font-bold text-white mt-1 tabular-nums">
                <GsapCounter value={findings.length} duration={0.8} />
              </div>
            </div>

            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase">Accepted Fixes</span>
              <div className="text-lg font-bold text-emerald-400 mt-1 tabular-nums">
                <GsapCounter value={acceptedCount} duration={0.8} />
              </div>
            </div>

            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase">False Positives</span>
              <div className="text-lg font-bold text-amber-400 mt-1 tabular-nums">
                <GsapCounter value={fpCount} duration={0.8} />
              </div>
            </div>

            <div className="bg-zinc-900/60 rounded-lg p-3 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase">Unreviewed</span>
              <div className="text-lg font-bold text-zinc-400 mt-1 tabular-nums">
                <GsapCounter value={findings.length - verifiedCount} duration={0.8} />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="detail-filter-bar flex flex-wrap items-center justify-between gap-3 bg-[#090C10] p-3 rounded-lg border border-zinc-800 text-xs font-mono">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-zinc-300">Severity:</span>
            <div className="flex items-center bg-zinc-900 p-0.5 rounded border border-zinc-800">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2 py-0.5 rounded text-[11px] transition ${
                    selectedSeverity === sev
                      ? 'bg-zinc-800 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-zinc-400">
            <span className="font-semibold text-zinc-300">Category:</span>
            <div className="flex items-center bg-zinc-900 p-0.5 rounded border border-zinc-800">
              {(['ALL', 'SECURITY', 'BUG', 'PERFORMANCE', 'TESTING', 'STYLE'] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] transition ${
                      selectedCategory === cat
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Findings List */}
        {filteredFindings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center space-y-2 bg-zinc-950/40 font-mono">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No findings match active filters</h3>
            <p className="text-xs text-zinc-500">
              Adjust your severity or category filter buttons above to inspect other findings.
            </p>
          </div>
        ) : (
          <GsapStagger selector=".finding-card-item" stagger={0.05} className="space-y-4">
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
  );
};
