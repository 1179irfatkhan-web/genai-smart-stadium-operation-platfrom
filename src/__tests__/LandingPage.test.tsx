import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../components/landing/HeroSection';

describe('LandingPage', () => {
  it('renders the app name and tagline', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const appNames = screen.getAllByText('StadiumIQ');
    expect(appNames.length).toBeGreaterThan(0);
    const taglines = screen.getAllByText(/Smart Stadium Platform/);
    expect(taglines.length).toBeGreaterThan(0);
  });

  it('renders sign in and get started links', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const signInLinks = screen.getAllByText('Sign In');
    expect(signInLinks.length).toBeGreaterThan(0);
    const getStarted = screen.getAllByText('Get Started');
    expect(getStarted.length).toBeGreaterThan(0);
  });

  it('renders feature cards', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Smart Navigation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Crowd Intelligence').length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI Assistant').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Transport Planner').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sustainability').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Accessibility').length).toBeGreaterThan(0);
  });

  it('renders problem statement alignment table', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Problem Statement Alignment')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Crowd Management')).toBeInTheDocument();
    const implemented = screen.getAllByText('Implemented');
    expect(implemented.length).toBeGreaterThan(0);
  });

  it('has a skip-to-content link', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const skipLink = screen.getByText('Skip to content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has proper heading hierarchy', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('StadiumIQ');
  });
});
