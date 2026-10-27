import React from 'react';
import { StatsResponse, Category } from '../../types';
import { Target, CheckCircle2, AlertOctagon, Layers } from 'lucide-react';

interface StatsOverviewProps {
  stats?: StatsResponse;
  isLoading?: boolean;
}

const categoryColors: Record<Category, string> = {
  BUG: 'bg-rose-500',
  SECURITY: 'bg-red-500',
  PERFORMANCE: 'bg-amber-500',
  TESTING: 'bg-emerald-500',
  STYLE: 'bg-purple-500',
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-xl" />
        ))}
      </div>
    );
  }

  const precision = Math.round(stats.precisionPercentage || 0);

  // Category breakdown calculation for bar visualization
  const categories: Category[] = ['BUG', 'SECURITY', 'PERFORMANCE', 'TESTING', 'STYLE'];
  const maxCategoryCount = Math.max(...categories.map((c) => stats.byCategory?.[c] || 0), 1);

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Precision Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">AI Precision Rate</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span
              id="stats-precision-val"
              className="text-3xl font-bold tracking-tight text-white"
            >
              {stats.acceptedCount + stats.falsePositiveCount > 0 ? `${precision}%` : 'N/A'}
            </span>
            <span className="text-xs text-slate-500">
              ({stats.acceptedCount} / {stats.acceptedCount + stats.falsePositiveCount} verified)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${precision}%` }}
            />
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Code Reviews</span>
            <Layers className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              {stats.totalReviews}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Processed through ReviewPilot</p>
        </div>

        {/* Total Findings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Identified Findings</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              {stats.totalFindings}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Across all reviewed diffs</p>
        </div>

        {/* Accepted Findings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Accepted True Positives</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-bold tracking-tight text-emerald-400">
              {stats.acceptedCount}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {stats.falsePositiveCount} marked false positive
          </p>
        </div>
      </div>

      {/* Findings by Category Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Findings Breakdown by Category</h3>
        <div className="space-y-3">
          {categories.map((cat) => {
            const count = stats.byCategory?.[cat] || 0;
            const percentage = Math.round((count / maxCategoryCount) * 100);

            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-mono text-slate-300">{cat}</span>
                  <span className="text-slate-400 font-medium">{count}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
                  <div
                    className={`h-full rounded-full ${categoryColors[cat]} transition-all duration-500`}
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
