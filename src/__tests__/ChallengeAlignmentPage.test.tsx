import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChallengeAlignmentPage } from '../components/alignment/ChallengeAlignmentPage';
import { describe, it, expect } from 'vitest';

describe('ChallengeAlignmentPage Component', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter>
        <ChallengeAlignmentPage />
      </MemoryRouter>
    );
  };

  it('renders page headings and header information', () => {
    renderPage();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText('How StadiumIQ Solves Challenge 4')).toBeInTheDocument();
    expect(screen.getByText(/Official Challenge 4 Statement/i)).toBeInTheDocument();
  });

  it('displays the 10 challenge areas in the table', () => {
    renderPage();
    const challengeAreas = [
      'Navigation',
      'Crowd Management',
      'Accessibility',
      'Transportation',
      'Sustainability',
      'Multilingual Assistance',
      'Operational Intelligence',
      'Real-Time Decision Support',
      'Volunteer Assistance',
      'Venue Staff Operations'
    ];
    challengeAreas.forEach((area) => {
      expect(screen.getByText(area)).toBeInTheDocument();
    });
  });

  it('has semantic table roles', () => {
    renderPage();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('toggles interactive workflows when tab buttons are clicked', async () => {
    renderPage();
    
    // Check default tab panel
    expect(screen.getByText('Accessible Egress: Seating Area to Less-Crowded Exit')).toBeInTheDocument();
    expect(screen.queryByText('Congestion Mitigation: Crowd Bottleneck Response')).not.toBeInTheDocument();

    // Click organizer tab
    const organizerTab = screen.getByRole('tab', { name: /Organizer Command Flow/i });
    fireEvent.click(organizerTab);

    // Verify update
    expect(await screen.findByText('Congestion Mitigation: Crowd Bottleneck Response')).toBeInTheDocument();

    // Click fan tab back
    const fanTab = screen.getByRole('tab', { name: /Fan Egress Flow/i });
    fireEvent.click(fanTab);

    // Verify back to fan
    expect(await screen.findByText('Accessible Egress: Seating Area to Less-Crowded Exit')).toBeInTheDocument();
  });

  it('displays simulated data disclosure section', () => {
    renderPage();
    expect(screen.getByText(/Simulated Real-Time Data Disclosure/i)).toBeInTheDocument();
    expect(screen.getByText(/FIFA ticketing systems, municipal transit telemetry/i)).toBeInTheDocument();
  });
});
