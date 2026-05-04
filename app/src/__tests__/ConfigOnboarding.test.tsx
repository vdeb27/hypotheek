import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfigOnboarding from '../components/ConfigOnboarding';

const noOp = () => {};

describe('ConfigOnboarding', () => {
  it('toont de intro-tekst en titel', () => {
    render(<ConfigOnboarding onBegin={noOp} onSlaOver={noOp} />);

    expect(screen.getByText('Hypotheek Scenario Calculator')).toBeInTheDocument();
    expect(screen.getByText(/actuele rentetarieven/)).toBeInTheDocument();
  });

  it('toont de privacymelding', () => {
    render(<ConfigOnboarding onBegin={noOp} onSlaOver={noOp} />);

    expect(screen.getByText(/Privacy/)).toBeInTheDocument();
    expect(screen.getByText(/alleen in jouw browser opgeslagen/)).toBeInTheDocument();
    expect(screen.getByText(/geen gegevens naar de server of naar de ontwikkelaar/)).toBeInTheDocument();
  });

  it('toont de basisinstellingen-form', () => {
    render(<ConfigOnboarding onBegin={noOp} onSlaOver={noOp} />);

    expect(screen.getByText(/Koop je alleen of samen/)).toBeInTheDocument();
    expect(screen.getByText(/In welk jaar koop je/)).toBeInTheDocument();
    expect(screen.getByText(/Jouw fulltime uren per week/)).toBeInTheDocument();
  });

  it('roept onBegin aan bij klik op begin-knop', async () => {
    const user = userEvent.setup();
    const onBegin = vi.fn();

    render(<ConfigOnboarding onBegin={onBegin} onSlaOver={noOp} />);

    await user.click(screen.getByText('Begin met rekenen'));

    expect(onBegin).toHaveBeenCalledOnce();
  });

  it('roept onSlaOver aan bij klik op overslaan-link', async () => {
    const user = userEvent.setup();
    const onSlaOver = vi.fn();

    render(<ConfigOnboarding onBegin={noOp} onSlaOver={onSlaOver} />);

    await user.click(screen.getByText(/Sla over/));

    expect(onSlaOver).toHaveBeenCalledOnce();
  });

  it('toont partner uren-veld alleen bij "Samen"', async () => {
    const user = userEvent.setup();
    render(<ConfigOnboarding onBegin={noOp} onSlaOver={noOp} />);

    // Standaard "Alleen": geen partner-uren-veld
    expect(screen.queryByText(/Partner fulltime uren/)).not.toBeInTheDocument();

    // Na klik op "Samen": partner-uren-veld zichtbaar
    await user.click(screen.getByText('Samen'));
    expect(screen.getByText(/Partner fulltime uren/)).toBeInTheDocument();
  });

  it('vult huidigeWaarden voor in de form', () => {
    render(
      <ConfigOnboarding
        huidigeWaarden={{ heeftPartner: true, startJaar: 2027, jijMaxUren: 32, partnerMaxUren: 36 }}
        onBegin={noOp}
        onSlaOver={noOp}
      />
    );

    expect(screen.getByDisplayValue('32')).toBeInTheDocument();
  });
});
