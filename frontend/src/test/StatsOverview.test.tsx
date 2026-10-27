import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsOverview } from '../components/stats/StatsOverview';
import { StatsResponse } from '../types';

describe('StatsOverview Component', () => {
  const mockStats: StatsResponse = {
    totalReviews: 12,
    totalFindings: 35,
    acceptedCount: 20,
    falsePositiveCount: 5,
    pendingCount: 10,
    precisionPercentage: 80,
    byCategory: {
      BUG: 15,
      SECURITY: 8,
      PERFORMANCE: 6,
      TESTING: 4,
      STYLE: 2,
    },
    bySeverity: {
      HIGH: 10,
      MEDIUM: 15,
      LOW: 10,
    },
  };

  it('renders precision metric and counts accurately', () => {
    render(<StatsOverview stats={mockStats} />);

    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('(20 / 25 verified)')).toBeInTheDocument();
  });

  it('renders category breakdown list with labels and counts', () => {
    render(<StatsOverview stats={mockStats} />);

    expect(screen.getByText('BUG')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('SECURITY')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
