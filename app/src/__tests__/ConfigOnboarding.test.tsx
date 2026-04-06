import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigOnboarding from '../components/ConfigOnboarding';

describe('ConfigOnboarding', () => {
  it('toont de configuratie-instructies', () => {
    render(<ConfigOnboarding onGebruikStandaard={() => {}} />);

    expect(screen.getByText('Hypotheek Scenario Calculator')).toBeInTheDocument();
    expect(screen.getByText('Configuratie nodig')).toBeInTheDocument();
    expect(screen.getByText(/configuratiebestand aanmaken/)).toBeInTheDocument();
  });

  it('toont de stappen voor het aanmaken van een config', () => {
    render(<ConfigOnboarding onGebruikStandaard={() => {}} />);

    expect(screen.getByText(/Kopieer het voorbeeldbestand/)).toBeInTheDocument();
    expect(screen.getAllByText(/user-config.json/).length).toBeGreaterThanOrEqual(1);
  });

  it('toont privacy-informatie', () => {
    render(<ConfigOnboarding onGebruikStandaard={() => {}} />);

    expect(screen.getByText(/Privacy/)).toBeInTheDocument();
    expect(screen.getByText(/lokaal in je browser/)).toBeInTheDocument();
  });

  it('roept onGebruikStandaard aan bij klik op standaardwaarden-knop', async () => {
    const user = userEvent.setup();
    const onGebruikStandaard = vi.fn();

    render(<ConfigOnboarding onGebruikStandaard={onGebruikStandaard} />);

    await user.click(screen.getByText('Gebruik standaardwaarden (voor nu)'));

    expect(onGebruikStandaard).toHaveBeenCalledOnce();
  });
});
