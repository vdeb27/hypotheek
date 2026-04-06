import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JaarlijkseTabel from '../components/JaarlijkseTabel';
import type { JaarSituatie } from '../lib/berekeningen';

const mockSituatie: JaarSituatie = {
  jijMaandloon: 5000,
  partnerMaandloon: 4167,
  jijUren: 40,
  partnerUren: 40,
  totaalBrutoJaar: 110000,
  nettoInkomenMaand: 6200,
  brutoMaandlast: 1900,
  nettoMaandlast: 1550,
  hraPercentage: 0.3697,
  eigenwoningforfait: 1575,
  jaarlijkseRente: 15200,
  ozbJaar: 443,
  waterschapJaar: 401,
  gemeentelijkeLastenJaar: 1463,
  verzekeringenJaar: 360,
  onderhoudJaar: 3375,
  bijkomendeLastenMaand: 433,
  totaleWoonlastenBrutoMaand: 2333,
  totaleWoonlastenNettoMaand: 1983,
  restschuld: 380000,
  woningwaardeNu: 450000,
  eigenVermogen: 70000,
  totaalAfgelost: 0,
  woonquoteBruto: 20.7,
  woonquoteNetto: 25.0,
  woonquoteTotaalBruto: 25.5,
  woonquoteTotaalNetto: 32.0,
  nibudNorm: 28,
};

const jaren = Array.from({ length: 30 }, (_, i) => 2026 + i);

function renderTabel(overrides = {}) {
  const defaultProps = {
    jaren,
    aantalZichtbareJaren: 10,
    setAantalZichtbareJaren: vi.fn(),
    bekijkJaar: 2026,
    setBekijkJaar: vi.fn(),
    berekenJaar: vi.fn(() => mockSituatie),
    ...overrides,
  };

  return { ...render(<JaarlijkseTabel {...defaultProps} />), props: defaultProps };
}

describe('JaarlijkseTabel', () => {
  it('toont de tabel met header', () => {
    renderTabel();

    expect(screen.getByText('Overzicht per jaar')).toBeInTheDocument();
    expect(screen.getByText('Jaar')).toBeInTheDocument();
    expect(screen.getByText('Bruto/jaar')).toBeInTheDocument();
    expect(screen.getByText('Eigen vermogen')).toBeInTheDocument();
  });

  it('toont het juiste aantal rijen', () => {
    renderTabel({ aantalZichtbareJaren: 10 });

    const rows = screen.getAllByRole('row');
    // 1 header row + 10 data rows
    expect(rows).toHaveLength(11);
  });

  it('roept berekenJaar aan voor elk zichtbaar jaar', () => {
    const berekenJaar = vi.fn(() => mockSituatie);
    renderTabel({ aantalZichtbareJaren: 10, berekenJaar });

    expect(berekenJaar).toHaveBeenCalledTimes(10);
    expect(berekenJaar).toHaveBeenCalledWith(2026);
    expect(berekenJaar).toHaveBeenCalledWith(2035);
  });

  it('selecteert een jaar bij klik op een rij', async () => {
    const user = userEvent.setup();
    const { props } = renderTabel();

    // Klik op de rij voor 2028
    const row = screen.getByText('2028').closest('tr')!;
    await user.click(row);

    expect(props.setBekijkJaar).toHaveBeenCalledWith(2028);
  });

  it('toont de "Bekijk meer" knop als er minder dan 30 jaren zichtbaar zijn', () => {
    renderTabel({ aantalZichtbareJaren: 10 });

    expect(screen.getByText(/Bekijk meer/)).toBeInTheDocument();
  });

  it('verbergt de "Bekijk meer" knop als alle 30 jaren zichtbaar zijn', () => {
    renderTabel({ aantalZichtbareJaren: 30 });

    expect(screen.queryByText(/Bekijk meer/)).not.toBeInTheDocument();
  });

  it('toont "Toon minder" knop als er meer dan 10 jaren zichtbaar zijn', () => {
    renderTabel({ aantalZichtbareJaren: 20 });

    expect(screen.getByText('Toon minder')).toBeInTheDocument();
  });

  it('verbergt "Toon minder" knop als er 10 of minder jaren zichtbaar zijn', () => {
    renderTabel({ aantalZichtbareJaren: 10 });

    expect(screen.queryByText('Toon minder')).not.toBeInTheDocument();
  });

  it('roept setAantalZichtbareJaren aan bij klik op "Toon minder"', async () => {
    const user = userEvent.setup();
    const { props } = renderTabel({ aantalZichtbareJaren: 20 });

    await user.click(screen.getByText('Toon minder'));

    expect(props.setAantalZichtbareJaren).toHaveBeenCalledWith(10);
  });
});
