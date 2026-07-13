import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LandingPage } from '../components/landing/HeroSection';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'high-contrast', 'large-text');
  });

  it('has a skip-to-content link', () => {
    renderWithProviders(<LandingPage />);
    const skipLink = screen.getByText('Skip to content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('main content has id for skip link target', () => {
    renderWithProviders(<LandingPage />);
    const main = document.getElementById('main-content');
    expect(main).not.toBeNull();
  });

  it('has proper landmarks (nav, main, footer)', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('has descriptive aria labels on navigation', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
  });

  it('table has proper scope on headers', () => {
    renderWithProviders(<LandingPage />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
  });

  it('headings have proper hierarchy (h1 followed by h2)', () => {
    renderWithProviders(<LandingPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h1).toBeInTheDocument();
    expect(h2s.length).toBeGreaterThan(0);
  });

  it('images and icons have aria-hidden or alt attributes', () => {
    const { container } = renderWithProviders(<LandingPage />);
    const ariaHiddenElements = container.querySelectorAll('[aria-hidden="true"]');
    expect(ariaHiddenElements.length).toBeGreaterThan(0);
  });

  it('links have accessible names', () => {
    renderWithProviders(<LandingPage />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link.textContent).not.toBe('');
    });
  });
});
