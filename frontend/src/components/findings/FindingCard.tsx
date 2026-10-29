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
  { label: string; badgeClass: string; dot: string }
> = {
  HIGH: {
    label: 'High Severity',
    badgeClass: 'border-rose-500/30 text-rose-300 bg-rose-500/10',
    dot: 'bg-rose-400',
  },
  MEDIUM: {
    label: 'Medium Severity',
    badgeClass: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    dot: 'bg-amber-400',
  },
  LOW: {
    label: 'Low Severity',
    badgeClass: 'border-sky-500/30 text-sky-300 bg-sky-500/10',
    dot: 'bg-sky-400',
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

  return (
    <SpotlightCard
      data-testid={`finding-card-${finding.id}`}
      spotlightColor="rgba(99, 102, 241, 0.12)"
      className="finding-card-item p-5 transition-all duration-200 rounded-xl border border-zinc-800 bg-[#090C10] hover:border-zinc-700 space-y-3.5"
    >
      {/* Header: Location & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-200 bg-zinc-900 px-3 py-1.5 rounded-md border border-zinc-800">
          <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
          <span className="font-semibold text-white">{finding.file}</span>
          {finding.line !== null && (
            <span className="text-indigo-400 font-bold">:{finding.line}</span>
          )}
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Category Badge */}
          <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800 text-[11px]">
            {categoryIcons[finding.category]}
            <span>{finding.category}</span>
          </span>

          {/* Severity Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold ${sev.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
            <span>{sev.label}</span>
          </span>
        </div>
      </div>

      {/* Finding Message */}
      <div className="space-y-1">
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
          Identified Risk Analysis
        </h4>
        <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-normal">
          {finding.message}
        </p>
      </div>

      {/* Suggested Fix Code Box with VS Code aesthetics */}
      <div className="bg-[#05070C] rounded-lg border border-zinc-800 overflow-hidden font-mono">
        <div className="flex items-center justify-between px-3.5 py-2 bg-[#0D1117] border-b border-zinc-800 text-[11px]">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Suggested Remediation</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Fix</span>
              </>
            )}
          </button>
        </div>
        <div className="p-3.5 text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto selection:bg-indigo-900 selection:text-white">
          <code>{finding.suggestion}</code>
        </div>
      </div>

      {/* Feedback Verification Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-zinc-800 text-xs font-mono">
        <div className="text-[11px] text-zinc-400 flex items-center space-x-2">
          <span className="text-zinc-500">Telemetry Status:</span>
          {finding.feedback === 'ACCEPTED' && (
            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
              <Check className="w-3 h-3" />
              <span>Accepted (True Positive)</span>
            </span>
          )}
          {finding.feedback === 'FALSE_POSITIVE' && (
            <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
              <span>False Positive (Suppressed)</span>
            </span>
          )}
          {(!finding.feedback || finding.feedback === 'PENDING') && (
            <span className="text-zinc-500">Unreviewed by engineer</span>
          )}
        </div>

        {onFeedback && (
          <div className="flex items-center space-x-2">
            <button
              data-testid={`accept-btn-${finding.id}`}
              onClick={() => onFeedback(finding.id, 'ACCEPTED')}
              disabled={isUpdating || finding.feedback === 'ACCEPTED'}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition ${
                finding.feedback === 'ACCEPTED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold cursor-default'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
              } disabled:opacity-50`}
            >
              <ThumbsUp className="w-3 h-3 text-emerald-400" />
              <span>Accept Fix</span>
            </button>

            <button
              data-testid={`fp-btn-${finding.id}`}
              onClick={() => onFeedback(finding.id, 'FALSE_POSITIVE')}
              disabled={isUpdating || finding.feedback === 'FALSE_POSITIVE'}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition ${
                finding.feedback === 'FALSE_POSITIVE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold cursor-default'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700'
              } disabled:opacity-50`}
            >
              <ThumbsDown className="w-3 h-3 text-amber-400" />
              <span>False Positive</span>
            </button>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
};
