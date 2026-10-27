import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FindingCard } from '../components/findings/FindingCard';
import { Finding } from '../types';

describe('FindingCard Component', () => {
  const mockFinding: Finding = {
    id: 'find-101',
    reviewId: 'rev-1',
    file: 'src/auth.ts',
    line: 42,
    severity: 'HIGH',
    category: 'SECURITY',
    message: 'Hardcoded JWT secret detected.',
    suggestion: 'Load secret from environment variable.',
    feedback: 'PENDING',
    createdAt: new Date().toISOString(),
  };

  it('renders file, line, severity, and message correctly', () => {
    render(<FindingCard finding={mockFinding} />);

    expect(screen.getByText('src/auth.ts')).toBeInTheDocument();
    expect(screen.getByText(':42')).toBeInTheDocument();
    expect(screen.getByText('High Severity')).toBeInTheDocument();
    expect(screen.getByText('SECURITY')).toBeInTheDocument();
    expect(screen.getByText('Hardcoded JWT secret detected.')).toBeInTheDocument();
    expect(screen.getByText('Load secret from environment variable.')).toBeInTheDocument();
  });

  it('triggers onFeedback with ACCEPTED when Accept button is clicked', () => {
    const handleFeedback = vi.fn();
    render(<FindingCard finding={mockFinding} onFeedback={handleFeedback} />);

    const acceptBtn = screen.getByTestId('accept-btn-find-101');
    fireEvent.click(acceptBtn);

    expect(handleFeedback).toHaveBeenCalledWith('find-101', 'ACCEPTED');
  });

  it('triggers onFeedback with FALSE_POSITIVE when False Positive is clicked', () => {
    const handleFeedback = vi.fn();
    render(<FindingCard finding={mockFinding} onFeedback={handleFeedback} />);

    const fpBtn = screen.getByTestId('fp-btn-find-101');
    fireEvent.click(fpBtn);

    expect(handleFeedback).toHaveBeenCalledWith('find-101', 'FALSE_POSITIVE');
  });
});
