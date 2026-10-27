import React from 'react';
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
} from 'lucide-react';

interface FindingCardProps {
  finding: Finding;
  onFeedback?: (findingId: string, feedback: Feedback) => void;
  isUpdating?: boolean;
}

const severityConfig: Record<
  Severity,
  { label: string; bg: string; text: string; border: string }
> = {
  HIGH: {
    label: 'High Severity',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  MEDIUM: {
    label: 'Medium Severity',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  LOW: {
    label: 'Low Severity',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
  },
};

const categoryIcons: Record<Category, React.ReactNode> = {
  BUG: <Bug className="w-3.5 h-3.5" />,
  SECURITY: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
  PERFORMANCE: <Zap className="w-3.5 h-3.5 text-amber-400" />,
  TESTING: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  STYLE: <Paintbrush className="w-3.5 h-3.5 text-purple-400" />,
};

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onFeedback,
  isUpdating = false,
}) => {
  const sev = severityConfig[finding.severity] || severityConfig.LOW;

  return (
    <div
      data-testid={`finding-card-${finding.id}`}
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-all duration-200 shadow-sm"
    >
      {/* Header: Location & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center space-x-2 text-sm font-mono text-slate-300 bg-slate-950/70 px-2.5 py-1 rounded-md border border-slate-800">
          <FileCode className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="truncate max-w-xs">{finding.file}</span>
          {finding.line !== null && (
            <span className="text-slate-500">:{finding.line}</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Category Badge */}
          <span className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {categoryIcons[finding.category]}
            <span>{finding.category}</span>
          </span>

          {/* Severity Badge */}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${sev.bg} ${sev.text} ${sev.border}`}
          >
            {sev.label}
          </span>
        </div>
      </div>

      {/* Message */}
      <p className="text-slate-200 text-sm leading-relaxed mb-3">
        {finding.message}
      </p>

      {/* Actionable Suggestion Box */}
      <div className="bg-slate-950/90 rounded-lg p-3.5 border border-slate-800/80 mb-4">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-400 mb-1.5">
          <Check className="w-3.5 h-3.5 text-indigo-400" />
          <span>Recommended Fix</span>
        </div>
        <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
          {finding.suggestion}
        </p>
      </div>

      {/* Feedback Verification Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <div className="text-xs text-slate-500 flex items-center space-x-1">
          <span>Feedback:</span>
          {finding.feedback === 'ACCEPTED' && (
            <span className="text-emerald-400 font-medium flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Accepted (True Positive)</span>
            </span>
          )}
          {finding.feedback === 'FALSE_POSITIVE' && (
            <span className="text-amber-400 font-medium flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>Marked False Positive</span>
            </span>
          )}
          {finding.feedback === 'PENDING' && (
            <span className="text-slate-400 italic">Unreviewed</span>
          )}
        </div>

        {onFeedback && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onFeedback(finding.id, 'ACCEPTED')}
              disabled={isUpdating || finding.feedback === 'ACCEPTED'}
              data-testid={`accept-btn-${finding.id}`}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                finding.feedback === 'ACCEPTED'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-slate-800 text-slate-300 hover:bg-emerald-600 hover:text-white border border-slate-700'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Accept</span>
            </button>

            <button
              onClick={() => onFeedback(finding.id, 'FALSE_POSITIVE')}
              disabled={isUpdating || finding.feedback === 'FALSE_POSITIVE'}
              data-testid={`fp-btn-${finding.id}`}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                finding.feedback === 'FALSE_POSITIVE'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                  : 'bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white border border-slate-700'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>False Positive</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
