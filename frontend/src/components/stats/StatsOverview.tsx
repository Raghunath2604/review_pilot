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
  SECURITY: { bg: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700', fill: 'bg-red-500' },
  BUG: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', fill: 'bg-rose-500' },
  PERFORMANCE: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', fill: 'bg-amber-500' },
  TESTING: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', fill: 'bg-emerald-500' },
  STYLE: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', text: 'text-indigo-700', fill: 'bg-indigo-500' },
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white/70 rounded-2xl border border-slate-200/80 shadow-sm" />
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
          spotlightColor="rgba(99, 102, 241, 0.18)"
          className="metric-card p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI Precision Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            {stats.acceptedCount + stats.falsePositiveCount > 0 ? (
              <GsapCounter
                id="stats-precision-val"
                value={precision}
                suffix="%"
                className="text-4xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-indigo-900 to-indigo-600 bg-clip-text text-transparent"
              />
            ) : (
              <span
                id="stats-precision-val"
                className="text-4xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-indigo-900 to-indigo-600 bg-clip-text text-transparent"
              >
                N/A
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">
              ({stats.acceptedCount} / {stats.acceptedCount + stats.falsePositiveCount} verified)
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-100/80 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${precision}%` }}
            />
          </div>
        </SpotlightCard>

        {/* Total Code Reviews */}
        <SpotlightCard
          spotlightColor="rgba(14, 165, 233, 0.18)"
          className="metric-card p-6 relative transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Reviews
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <GsapCounter
              value={stats.totalReviews}
              duration={1.2}
              className="text-4xl font-extrabold tracking-tight text-slate-900"
            />
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Gemini 3.1 & Claude Engine
          </p>
        </SpotlightCard>

        {/* Total Findings Identified */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.18)"
          className="metric-card p-6 relative transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Identified Findings
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <GsapCounter
              value={stats.totalFindings}
              duration={1.3}
              className="text-4xl font-extrabold tracking-tight text-slate-900"
            />
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            Security, bugs & performance risks
          </p>
        </SpotlightCard>

        {/* Accepted Findings (True Positives) */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.18)"
          className="metric-card p-6 relative transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Accepted Findings
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <GsapCounter
              value={stats.acceptedCount}
              duration={1.4}
              className="text-4xl font-extrabold tracking-tight text-emerald-600"
            />
            <span className="text-xs text-slate-500">
              ({stats.falsePositiveCount} false pos.)
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-500">
            Confirmed by engineering team
          </p>
        </SpotlightCard>
      </GsapStagger>

      {/* Category Distribution Bar Card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Findings Breakdown by Engineering Category
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution across security, bugs, performance, and test coverage
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {stats.totalFindings} Total
          </span>
        </div>

        <div className="space-y-3.5">
          {categories.map((cat) => {
            const count = stats.byCategory?.[cat] || 0;
            const percentage = Math.round((count / maxCategoryCount) * 100);
            const info = categoryInfo[cat];

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className={`px-2 py-0.5 rounded font-mono font-semibold border ${info.bg}`}>
                    {cat}
                  </span>
                  <span className="font-semibold text-slate-700">{count}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
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
