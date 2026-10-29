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

const categoryInfo: Record<Category, { bg: string; text: string; fill: string }> = {
  SECURITY: { bg: 'bg-red-500/15 text-red-300 border-red-500/30', text: 'text-red-400', fill: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
  BUG: { bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', text: 'text-rose-400', fill: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' },
  PERFORMANCE: { bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', text: 'text-amber-400', fill: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
  TESTING: { bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', text: 'text-emerald-400', fill: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' },
  STYLE: { bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', text: 'text-indigo-400', fill: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' },
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-900/60 rounded-3xl border border-white/[0.08]" />
        ))}
      </div>
    );
  }

  const precision = Math.round(stats.precisionPercentage || 0);
  const categories: Category[] = ['SECURITY', 'BUG', 'PERFORMANCE', 'TESTING', 'STYLE'];
  const maxCategoryCount = Math.max(...categories.map((c) => stats.byCategory?.[c] || 0), 1);

  return (
    <div className="space-y-6">
      {/* 4 Top Metric Cards with React Bits Spotlight Glow and GSAP Stagger Entrance */}
      <GsapStagger selector=".metric-card" stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Precision Metric Card */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.25)"
          className="metric-card p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              AI Precision Rate
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.3)]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            {stats.acceptedCount + stats.falsePositiveCount > 0 ? (
              <GsapCounter
                id="stats-precision-val"
                value={precision}
                suffix="%"
                className="text-4xl font-black tracking-tight text-white"
              />
            ) : (
              <span
                id="stats-precision-val"
                className="text-4xl font-black tracking-tight text-slate-400"
              >
                N/A
              </span>
            )}
            <span className="text-xs text-slate-400 font-medium">
              ({stats.acceptedCount} / {stats.acceptedCount + stats.falsePositiveCount} verified)
            </span>
          </div>
          <div className="mt-4 w-full bg-white/[0.06] h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
              style={{ width: `${precision}%` }}
            />
          </div>
        </SpotlightCard>

        {/* Total Code Reviews */}
        <SpotlightCard
          spotlightColor="rgba(14, 165, 233, 0.25)"
          className="metric-card p-6 relative transition-all duration-300 hover:-translate-y-1 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Reviews
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(14,165,233,0.3)]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <GsapCounter
              value={stats.totalReviews}
              duration={1.2}
              className="text-4xl font-black tracking-tight text-white"
            />
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Gemini 3.1 & Claude Engine</span>
          </p>
        </SpotlightCard>

        {/* Total Findings Identified */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.25)"
          className="metric-card p-6 relative transition-all duration-300 hover:-translate-y-1 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Identified Findings
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <GsapCounter
              value={stats.totalFindings}
              duration={1.3}
              className="text-4xl font-black tracking-tight text-white"
            />
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400">
            Security, bugs & performance risks
          </p>
        </SpotlightCard>

        {/* Accepted Findings (True Positives) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.25)"
          className="metric-card p-6 relative transition-all duration-300 hover:-translate-y-1 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Accepted Findings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <GsapCounter
              value={stats.acceptedCount}
              duration={1.4}
              className="text-4xl font-black tracking-tight text-emerald-400"
            />
            <span className="text-xs text-slate-400">
              ({stats.falsePositiveCount} false pos.)
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400">
            Confirmed by engineering team
          </p>
        </SpotlightCard>
      </GsapStagger>

      {/* Category Distribution Bar Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">
              Findings Breakdown by Engineering Category
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Automated distribution across security, bugs, performance, and test coverage
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
            {stats.totalFindings} Total
          </span>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const count = stats.byCategory?.[cat] || 0;
            const percentage = Math.round((count / maxCategoryCount) * 100);
            const info = categoryInfo[cat];

            return (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2.5 py-0.5 rounded-lg font-mono font-bold border ${info.bg}`}>
                    {cat}
                  </span>
                  <span className="font-bold text-slate-200">{count}</span>
                </div>
                <div className="w-full bg-white/[0.06] h-2.5 rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className={`h-full rounded-full ${info.fill} transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
