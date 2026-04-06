import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock providers module — moet voor import van HypotheekCalculator
vi.mock('../providers', () => ({
  providers: {
    'test-hypotheek': {
      id: 'test-hypotheek',
      naam: 'Test Bank — Hypotheek',
      bank: 'Test Bank',
      beschikbarePeriodes: [1, 5, 10, 20],
      berekenRente: () => 4.0,
      beschikbareLtvKlassen: ['nhg', '60', '70', '80', '90', '100'],
      voorwaarden: { boetevrijAflossenPercentage: 10 },
    },
  },
  providerGroups: {
    'Test Bank': [
      {
        id: 'test-hypotheek',
        naam: 'Test Bank — Hypotheek',
        bank: 'Test Bank',
        beschikbarePeriodes: [1, 5, 10, 20],
        berekenRente: () => 4.0,
      },
    ],
  },
  laatstBijgewerkt: '2026-01-15T00:00:00Z',
}));

// Mock config-loader met vaste testwaarden
vi.mock('../lib/config-loader', () => ({
  isDefaultConfig: false,
  config: {
    woningwaarde: 450000,
    buffer: 30000,
    spaargeldJij: 60000,
    spaargeldPartner: 40000,
    inlegPercentageJij: 50,
    brutoJaarinkomenJij: 60000,
    brutoJaarinkomenPartner: 50000,
    jijMaxUren: 40,
    partnerMaxUren: 40,
    jijUrenNaMinderWerken: 32,
    partnerUrenNaMinderWerken: 32,
    promotieOpslagPercentage: 10,
    startJaar: 2026,
    gemeente: 'utrecht',
    energielabel: 'C',
    opstalverzekeringMaand: 30,
    makelaarsKosten: 4000,
    heeftPartner: true,
  },
}));

import HypotheekCalculator from '../HypotheekCalculator';

describe('HypotheekCalculator (integratie)', () => {
  it('rendert de volledige calculator zonder crashes', () => {
    render(<HypotheekCalculator />);

    expect(screen.getByText('Hypotheek Scenario Calculator')).toBeInTheDocument();
  });

  it('toont de vier kolommen', () => {
    render(<HypotheekCalculator />);

    expect(screen.getByLabelText('Persoonlijk')).toBeInTheDocument();
    expect(screen.getByLabelText('Woning')).toBeInTheDocument();
    expect(screen.getByLabelText('Hypotheek')).toBeInTheDocument();
    expect(screen.getByLabelText('Uitkomsten')).toBeInTheDocument();
  });

  it('toont de jaarlijkse tabel', () => {
    render(<HypotheekCalculator />);

    expect(screen.getByText('Overzicht per jaar')).toBeInTheDocument();
  });

  it('toont een berekende rente', () => {
    render(<HypotheekCalculator />);

    // De mock provider geeft altijd 4.0% terug — verschijnt meerdere keren (invoer + vergelijkingstabel)
    const renteElements = screen.getAllByText('4.00%');
    expect(renteElements.length).toBeGreaterThanOrEqual(1);
  });

  it('toont het hypotheekbedrag (woningwaarde - eigen inleg)', () => {
    render(<HypotheekCalculator />);

    // Hypotheekbedrag wordt getoond in zowel Woning als Uitkomsten kolom
    const hypotheekBedragElements = screen.getAllByText('Hypotheekbedrag:');
    expect(hypotheekBedragElements.length).toBeGreaterThanOrEqual(1);
  });

  it('toont woonlasten sectie met het startjaar', () => {
    render(<HypotheekCalculator />);

    expect(screen.getByText('Woonlasten 2026')).toBeInTheDocument();
  });

  it('toont inkomenssectie', () => {
    render(<HypotheekCalculator />);

    expect(screen.getByText('Inkomen & Vermogen')).toBeInTheDocument();
  });

  it('wisselt hypotheektype van annuitair naar lineair', async () => {
    const user = userEvent.setup();
    render(<HypotheekCalculator />);

    // Standaard is annuitair geselecteerd
    const annuitairKnop = screen.getByText(/Annu/);
    expect(annuitairKnop).toHaveAttribute('aria-pressed', 'true');

    // Klik op lineair
    await user.click(screen.getByText('Lineair'));

    const lineairKnop = screen.getByText('Lineair');
    expect(lineairKnop).toHaveAttribute('aria-pressed', 'true');
  });

  it('toont de footer met disclaimers', () => {
    render(<HypotheekCalculator />);

    expect(screen.getByText(/Indicatieve berekeningen/)).toBeInTheDocument();
    expect(screen.getByText(/hypotheekadviseur/)).toBeInTheDocument();
  });

  it('toont de Alleen/Samen toggle voor partner', () => {
    render(<HypotheekCalculator />);

    expect(screen.getByText('Alleen')).toBeInTheDocument();
    expect(screen.getByText('Samen')).toBeInTheDocument();
  });

  it('verbergt partner-inkomen na klik op Alleen', async () => {
    const user = userEvent.setup();
    render(<HypotheekCalculator />);

    // Standaard is "Samen" actief (config.heeftPartner = true)
    expect(screen.getByText('Samen')).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByText('Alleen'));

    expect(screen.getByText('Alleen')).toHaveAttribute('aria-pressed', 'true');
    // Partner inkomen veld moet verdwijnen
    expect(screen.queryByText('Partner bruto/jaar')).not.toBeInTheDocument();
  });

  it('toont kosten koper detail na uitklappen', async () => {
    const user = userEvent.setup();
    render(<HypotheekCalculator />);

    // Klik op uitsplitsing
    await user.click(screen.getByText(/Bekijk uitsplitsing/));

    expect(screen.getByText('Transportakte:')).toBeInTheDocument();
    expect(screen.getByText('Hypotheekakte:')).toBeInTheDocument();
  });

  it('toont scheiding scenario sectie alleen met partner', async () => {
    const user = userEvent.setup();
    render(<HypotheekCalculator />);

    // Met partner: scheiding scenario zichtbaar
    expect(screen.getByText('Scheiding scenario')).toBeInTheDocument();

    // Zonder partner: niet meer zichtbaar
    await user.click(screen.getByText('Alleen'));
    expect(screen.queryByText('Scheiding scenario')).not.toBeInTheDocument();
  });
});
