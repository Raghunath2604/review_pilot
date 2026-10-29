import React, { useState } from 'react';
import { Finding, Severity, Category, Feedback } from '../../types';
import {
  ShieldAlert,
  Bug,
  Zap,
  CheckCircle2,
  Paintbrush,
  FileCode,
  ThumbsUp,
  ThumbsDown,
  Check,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import { SpotlightCard } from '../bits/SpotlightCard';

interface FindingCardProps {
  finding: Finding;
  onFeedback?: (findingId: string, feedback: Feedback) => void;
  isUpdating?: boolean;
}

const severityConfig: Record<
  Severity,
  { label: string; bg: string; text: string; dot: string }
> = {
  HIGH: {
    label: 'High Severity',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  MEDIUM: {
    label: 'Medium Severity',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  LOW: {
    label: 'Low Severity',
    bg: 'bg-sky-50 text-sky-700 border-sky-200',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
  },
};

const categoryIcons: Record<Category, React.ReactNode> = {
  BUG: <Bug className="w-3.5 h-3.5 text-rose-600" />,
  SECURITY: <ShieldAlert className="w-3.5 h-3.5 text-red-600" />,
  PERFORMANCE: <Zap className="w-3.5 h-3.5 text-amber-600" />,
  TESTING: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
  STYLE: <Paintbrush className="w-3.5 h-3.5 text-purple-600" />,
};

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onFeedback,
  isUpdating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const sev = severityConfig[finding.severity] || severityConfig.LOW;

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spotlightColor =
    finding.severity === 'HIGH'
      ? 'rgba(239, 68, 68, 0.14)'
      : finding.severity === 'MEDIUM'
      ? 'rgba(245, 158, 11, 0.14)'
      : 'rgba(99, 102, 241, 0.14)';

  return (
    <SpotlightCard
      data-testid={`finding-card-${finding.id}`}
      spotlightColor={spotlightColor}
      className="p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 space-y-4"
    >
      {/* Header: Location & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <FileCode className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="truncate max-w-xs">{finding.file}</span>
          {finding.line !== null && (
            <span className="text-indigo-600">:{finding.line}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Badge */}
          <span className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
            {categoryIcons[finding.category]}
            <span>{finding.category}</span>
          </span>

          {/* Severity Badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${sev.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
            <span>{sev.label}</span>
          </span>
        </div>
      </div>

      {/* Finding Message */}
      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Identified Risk
        </h4>
        <p className="text-slate-800 text-sm leading-relaxed font-medium">
          {finding.message}
        </p>
      </div>

      {/* Suggested Fix Code Box */}
      <div className="bg-[#0B0F19] rounded-xl border border-slate-800 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold text-[11px] uppercase tracking-wider">
            <Check className="w-3.5 h-3.5" />
            <span>Suggested Remediation</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3.5 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
          {finding.suggestion}
        </pre>
      </div>

      {/* Feedback Verification Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-500 flex items-center space-x-1.5">
          <span className="font-medium">Verification Status:</span>
          {finding.feedback === 'ACCEPTED' && (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              <Check className="w-3 h-3" />
              <span>Accepted (True Positive)</span>
            </span>
          )}
          {finding.feedback === 'FALSE_POSITIVE' && (
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
              <AlertTriangle className="w-3 h-3" />
              <span>Marked False Positive</span>
            </span>
          )}
          {finding.feedback === 'PENDING' && (
            <span className="text-slate-400 italic">Awaiting Engineer Verification</span>
          )}
        </div>

        {onFeedback && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFeedback(finding.id, 'ACCEPTED')}
              disabled={isUpdating || finding.feedback === 'ACCEPTED'}
              data-testid={`accept-btn-${finding.id}`}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                finding.feedback === 'ACCEPTED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 shadow-sm active:scale-95'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>

            <button
              onClick={() => onFeedback(finding.id, 'FALSE_POSITIVE')}
              disabled={isUpdating || finding.feedback === 'FALSE_POSITIVE'}
              data-testid={`fp-btn-${finding.id}`}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                finding.feedback === 'FALSE_POSITIVE'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-default'
                  : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 shadow-sm active:scale-95'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>False Positive</span>
            </button>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
};
