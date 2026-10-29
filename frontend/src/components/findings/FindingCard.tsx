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
    bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.2)]',
    text: 'text-rose-400',
    dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
  },
  MEDIUM: {
    label: 'Medium Severity',
    bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    text: 'text-amber-400',
    dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
  },
  LOW: {
    label: 'Low Severity',
    bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-[0_0_12px_rgba(14,165,233,0.2)]',
    text: 'text-sky-400',
    dot: 'bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.8)]',
  },
};

const categoryIcons: Record<Category, React.ReactNode> = {
  BUG: <Bug className="w-3.5 h-3.5 text-rose-400" />,
  SECURITY: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />,
  PERFORMANCE: <Zap className="w-3.5 h-3.5 text-amber-400" />,
  TESTING: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  STYLE: <Paintbrush className="w-3.5 h-3.5 text-purple-400" />,
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
      ? 'rgba(239, 68, 68, 0.22)'
      : finding.severity === 'MEDIUM'
      ? 'rgba(245, 158, 11, 0.22)'
      : 'rgba(99, 102, 241, 0.22)';

  return (
    <SpotlightCard
      data-testid={`finding-card-${finding.id}`}
      spotlightColor={spotlightColor}
      className="finding-card-item p-6 transition-all duration-300 hover:shadow-2xl hover:border-indigo-500/30 space-y-4 rounded-3xl"
    >
      {/* Header: Location & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-200 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/[0.08] shadow-inner">
          <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="truncate max-w-xs">{finding.file}</span>
          {finding.line !== null && (
            <span className="text-indigo-400 font-bold">:{finding.line}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Badge */}
          <span className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08]">
            {categoryIcons[finding.category]}
            <span>{finding.category}</span>
          </span>

          {/* Severity Badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${sev.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
            <span>{sev.label}</span>
          </span>
        </div>
      </div>

      {/* Finding Message */}
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Identified Risk
        </h4>
        <p className="text-slate-100 text-sm leading-relaxed font-normal">
          {finding.message}
        </p>
      </div>

      {/* Suggested Fix Code Box */}
      <div className="bg-[#05070C] rounded-2xl border border-slate-800/90 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/90 text-xs">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-[11px] uppercase tracking-wider">
            <Check className="w-3.5 h-3.5" />
            <span>Suggested Remediation</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-indigo-600">
          {finding.suggestion}
        </pre>
      </div>

      {/* Feedback Verification Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <span className="font-medium text-slate-500">Verification Status:</span>
          {finding.feedback === 'ACCEPTED' && (
            <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(16,185,129,0.25)]">
              <Check className="w-3.5 h-3.5" />
              <span>Accepted (True Positive)</span>
            </span>
          )}
          {finding.feedback === 'FALSE_POSITIVE' && (
            <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Marked False Positive</span>
            </span>
          )}
          {finding.feedback === 'PENDING' && (
            <span className="text-slate-500 italic">Awaiting Engineer Verification</span>
          )}
        </div>

        {onFeedback && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFeedback(finding.id, 'ACCEPTED')}
              disabled={isUpdating || finding.feedback === 'ACCEPTED'}
              data-testid={`accept-btn-${finding.id}`}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                finding.feedback === 'ACCEPTED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-500/40 border border-white/[0.08] active:scale-95'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>

            <button
              onClick={() => onFeedback(finding.id, 'FALSE_POSITIVE')}
              disabled={isUpdating || finding.feedback === 'FALSE_POSITIVE'}
              data-testid={`fp-btn-${finding.id}`}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                finding.feedback === 'FALSE_POSITIVE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-white/[0.04] text-slate-300 hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/40 border border-white/[0.08] active:scale-95'
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
