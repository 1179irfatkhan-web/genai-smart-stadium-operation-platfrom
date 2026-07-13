import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SkeletonCard, SkeletonList, SkeletonDashboard } from '../components/common/Skeletons';

describe('LoadingSpinner', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with text', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('has role status for accessibility', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has sr-only loading text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('Skeletons', () => {
  it('SkeletonCard renders without crashing', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).not.toBeNull();
  });

  it('SkeletonList renders correct number of items', () => {
    const { container } = render(<SkeletonList count={5} />);
    expect(container.firstChild).not.toBeNull();
  });

  it('SkeletonDashboard renders without crashing', () => {
    const { container } = render(<SkeletonDashboard />);
    expect(container.firstChild).not.toBeNull();
  });

  it('skeletons have aria-hidden', () => {
    const { container } = render(<SkeletonCard />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).not.toBeNull();
  });
});
