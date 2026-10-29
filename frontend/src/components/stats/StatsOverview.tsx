import React from 'react';
import { StatsResponse, Category } from '../../types';
import { Target, CheckCircle2, AlertOctagon, Layers } from 'lucide-react';
import { SpotlightCard } from '../bits/SpotlightCard';
import { GsapStagger } from '../animations/GsapStagger';
import { GsapCounter } from '../animations/GsapCounter';

interface StatsOverviewProps {
  stats?: StatsResponse;
  isLoading?: boolean;
}

const categoryInfo: Record<Category, { border: string; text: string; fill: string }> = {
  SECURITY: { border: 'border-rose-500/30', text: 'text-rose-400', fill: 'bg-rose-500' },
  BUG: { border: 'border-red-500/30', text: 'text-red-400', fill: 'bg-red-500' },
  PERFORMANCE: { border: 'border-amber-500/30', text: 'text-amber-400', fill: 'bg-amber-500' },
  TESTING: { border: 'border-emerald-500/30', text: 'text-emerald-400', fill: 'bg-emerald-500' },
  STYLE: { border: 'border-indigo-500/30', text: 'text-indigo-400', fill: 'bg-indigo-500' },
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-zinc-900/60 rounded-xl border border-zinc-800" />
        ))}
      </div>
    );
  }

  const precision = Math.round(stats.precisionPercentage || 0);
  const categories: Category[] = ['SECURITY', 'BUG', 'PERFORMANCE', 'TESTING', 'STYLE'];
  const maxCategoryCount = Math.max(...categories.map((c) => stats.byCategory?.[c] || 0), 1);

  return (
    <div className="space-y-4">
      {/* 4 Metric Cards */}
      <GsapStagger selector=".metric-card" stagger={0.06} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Precision Rate */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.15)"
          className="metric-card p-5 rounded-xl border border-zinc-800 bg-[#090C10] relative transition-all duration-200 hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              AI Precision Rate
            </span>
            <div className="w-7 h-7 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            {stats.acceptedCount + stats.falsePositiveCount > 0 ? (
              <GsapCounter
                id="stats-precision-val"
                value={precision}
                suffix="%"
                className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums"
              />
            ) : (
              <span
                id="stats-precision-val"
                className="text-3xl font-extrabold tracking-tight text-zinc-500 font-mono"
              >
                100%
              </span>
            )}
            <span className="text-[11px] font-mono text-zinc-400">
              ({stats.acceptedCount} / {stats.acceptedCount + stats.falsePositiveCount} verified)
            </span>
          </div>
          <div className="mt-3 w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${stats.acceptedCount + stats.falsePositiveCount > 0 ? precision : 100}%` }}
            />
          </div>
        </SpotlightCard>

        {/* Total Reviews */}
        <SpotlightCard
          spotlightColor="rgba(14, 165, 233, 0.15)"
          className="metric-card p-5 rounded-xl border border-zinc-800 bg-[#090C10] relative transition-all duration-200 hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Total Audits
            </span>
            <div className="w-7 h-7 rounded-md bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <GsapCounter
              value={stats.totalReviews}
              duration={1.0}
              className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums"
            />
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gemini 3.1 & Claude 3.5</span>
          </p>
        </SpotlightCard>

        {/* Total Findings */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.15)"
          className="metric-card p-5 rounded-xl border border-zinc-800 bg-[#090C10] relative transition-all duration-200 hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Detected Findings
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5">
            <GsapCounter
              value={stats.totalFindings}
              duration={1.1}
              className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums"
            />
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-400">
            Security, bugs & perf bottlenecks
          </p>
        </SpotlightCard>

        {/* Accepted Findings */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.15)"
          className="metric-card p-5 rounded-xl border border-zinc-800 bg-[#090C10] relative transition-all duration-200 hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              Accepted Fixes
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline space-x-2">
            <GsapCounter
              value={stats.acceptedCount}
              duration={1.2}
              className="text-3xl font-extrabold tracking-tight text-emerald-400 font-mono tabular-nums"
            />
            <span className="text-[11px] font-mono text-zinc-400">
              ({stats.falsePositiveCount} false pos.)
            </span>
          </div>
          <p className="mt-3 text-[11px] font-mono text-zinc-400">
            Confirmed by engineering team
          </p>
        </SpotlightCard>
      </GsapStagger>

      {/* Category Breakdown Progress Grid */}
      {stats.byCategory && (
        <div className="rounded-xl border border-zinc-800 bg-[#090C10] p-4 text-xs font-mono">
          <div className="text-[11px] text-zinc-400 uppercase tracking-wider mb-3">
            Finding Category Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const count = stats.byCategory?.[cat] || 0;
              const percent = Math.round((count / maxCategoryCount) * 100);
              const info = categoryInfo[cat];

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={info.text}>{cat}</span>
                    <span className="text-zinc-300 font-semibold">{count}</span>
                  </div>
                  <div className="w-full bg-zinc-800/80 h-1 rounded-full overflow-hidden">
                    <div
                      className={`${info.fill} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
