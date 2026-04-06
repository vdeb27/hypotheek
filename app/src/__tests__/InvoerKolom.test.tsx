import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvoerKolom from '../components/InvoerKolom';
import type { MortgageProvider } from '../providers/types';
import type { GemeenteTarieven } from '../gemeente-tarieven';

const mockProvider: MortgageProvider = {
  id: 'test-provider',
  naam: 'Test Bank — Hypotheek',
  bank: 'Test Bank',
  beschikbarePeriodes: [1, 5, 10, 20],
  berekenRente: () => 4.0,
};

const mockGemeenteData: GemeenteTarieven = {
  naam: 'Utrecht',
  ozbPercentage: 0.0985,
  waterschap: {
    naam: 'HDSR',
    eigenarenPercentage: 0.0224,
    ingezetenenJaar: 106.78,
    zuiveringPerVE: 68.52,
    veMeerpersoons: 3,
  },
  rioolheffingJaar: 252,
  afvalstoffenheffingJaar: 366.72,
};

function renderInvoerKolom(overrides = {}) {
  const defaultProps = {
    woningwaarde: 450000,
    setWoningwaarde: vi.fn(),
    buffer: 30000,
    setBuffer: vi.fn(),
    hypotheekProduct: 'test-provider',
    setHypotheekProduct: vi.fn(),
    hypotheekType: 'annuitair',
    setHypotheekType: vi.fn(),
    energielabel: 'C',
    setEnergielabel: vi.fn(),
    rentevastePeriode: 10,
    setRentevastePeriode: vi.fn(),
    provider: mockProvider,
    heeftBouwkundigeKeuring: true,
    setHeeftBouwkundigeKeuring: vi.fn(),
    heeftAankoopmakelaar: false,
    setHeeftAankoopmakelaar: vi.fn(),
    makelaarsKosten: 4000,
    setMakelaarsKosten: vi.fn(),
    gemeente: 'utrecht',
    setGemeente: vi.fn(),
    gemeenteData: mockGemeenteData,
    opstalverzekeringMaand: 30,
    setOpstalverzekeringMaand: vi.fn(),
    onderhoudspercentage: 0.75,
    setOnderhoudspercentage: vi.fn(),
    toonGemeenteTarieven: false,
    setToonGemeenteTarieven: vi.fn(),
    rente: 4.0,
    heeftNHG: false,
    ltv: 85,
    ...overrides,
  };

  return { ...render(<InvoerKolom {...defaultProps} />), props: defaultProps };
}

describe('InvoerKolom', () => {
  it('toont de drie fieldsets', () => {
    renderInvoerKolom();

    expect(screen.getByText('Woning & Hypotheek')).toBeInTheDocument();
    expect(screen.getByText('Kosten Koper Opties')).toBeInTheDocument();
    expect(screen.getByText('Woonlasten & Heffingen')).toBeInTheDocument();
  });

  it('toont de berekende rente', () => {
    renderInvoerKolom({ rente: 4.25 });

    expect(screen.getByText('4.25%')).toBeInTheDocument();
  });

  it('toont NHG-status', () => {
    renderInvoerKolom({ heeftNHG: true });
    expect(screen.getByText(/NHG mogelijk/)).toBeInTheDocument();
  });

  it('toont geen NHG als woningwaarde te hoog is', () => {
    renderInvoerKolom({ heeftNHG: false });
    expect(screen.getByText(/Geen NHG/)).toBeInTheDocument();
  });

  it('wisselt hypotheektype bij klik op Lineair', async () => {
    const user = userEvent.setup();
    const { props } = renderInvoerKolom();

    await user.click(screen.getByText('Lineair'));

    expect(props.setHypotheekType).toHaveBeenCalledWith('lineair');
  });

  it('wisselt hypotheektype bij klik op Annuitair', async () => {
    const user = userEvent.setup();
    const { props } = renderInvoerKolom({ hypotheekType: 'lineair' });

    await user.click(screen.getByText(/Annu/));

    expect(props.setHypotheekType).toHaveBeenCalledWith('annuitair');
  });

  it('togglet bouwkundige keuring checkbox', async () => {
    const user = userEvent.setup();
    const { props } = renderInvoerKolom();

    const checkbox = screen.getByRole('checkbox', { name: /Bouwkundige keuring/ });
    await user.click(checkbox);

    expect(props.setHeeftBouwkundigeKeuring).toHaveBeenCalledWith(false);
  });

  it('togglet aankoopmakelaar checkbox', async () => {
    const user = userEvent.setup();
    const { props } = renderInvoerKolom();

    const checkbox = screen.getByRole('checkbox', { name: /Aankoopmakelaar/ });
    await user.click(checkbox);

    expect(props.setHeeftAankoopmakelaar).toHaveBeenCalledWith(true);
  });

  it('toont makelaarkosten slider alleen als aankoopmakelaar is aangevinkt', () => {
    const { rerender } = render(
      <InvoerKolom
        {...{
          woningwaarde: 450000, setWoningwaarde: vi.fn(), buffer: 30000, setBuffer: vi.fn(),
          hypotheekProduct: 'test', setHypotheekProduct: vi.fn(), hypotheekType: 'annuitair',
          setHypotheekType: vi.fn(), energielabel: 'C', setEnergielabel: vi.fn(),
          rentevastePeriode: 10, setRentevastePeriode: vi.fn(), provider: mockProvider,
          heeftBouwkundigeKeuring: true, setHeeftBouwkundigeKeuring: vi.fn(),
          heeftAankoopmakelaar: false, setHeeftAankoopmakelaar: vi.fn(),
          makelaarsKosten: 4000, setMakelaarsKosten: vi.fn(),
          gemeente: 'utrecht', setGemeente: vi.fn(), gemeenteData: mockGemeenteData,
          opstalverzekeringMaand: 30, setOpstalverzekeringMaand: vi.fn(),
          onderhoudspercentage: 0.75, setOnderhoudspercentage: vi.fn(),
          toonGemeenteTarieven: false, setToonGemeenteTarieven: vi.fn(),
          rente: 4.0, heeftNHG: false, ltv: 85,
        }}
      />,
    );

    expect(screen.queryByText(/Kosten makelaar/)).not.toBeInTheDocument();

    rerender(
      <InvoerKolom
        {...{
          woningwaarde: 450000, setWoningwaarde: vi.fn(), buffer: 30000, setBuffer: vi.fn(),
          hypotheekProduct: 'test', setHypotheekProduct: vi.fn(), hypotheekType: 'annuitair',
          setHypotheekType: vi.fn(), energielabel: 'C', setEnergielabel: vi.fn(),
          rentevastePeriode: 10, setRentevastePeriode: vi.fn(), provider: mockProvider,
          heeftBouwkundigeKeuring: true, setHeeftBouwkundigeKeuring: vi.fn(),
          heeftAankoopmakelaar: true, setHeeftAankoopmakelaar: vi.fn(),
          makelaarsKosten: 4000, setMakelaarsKosten: vi.fn(),
          gemeente: 'utrecht', setGemeente: vi.fn(), gemeenteData: mockGemeenteData,
          opstalverzekeringMaand: 30, setOpstalverzekeringMaand: vi.fn(),
          onderhoudspercentage: 0.75, setOnderhoudspercentage: vi.fn(),
          toonGemeenteTarieven: false, setToonGemeenteTarieven: vi.fn(),
          rente: 4.0, heeftNHG: false, ltv: 85,
        }}
      />,
    );

    expect(screen.getByText(/Kosten makelaar/)).toBeInTheDocument();
  });

  it('toont gemeentetarieven na klik op toggle', async () => {
    const user = userEvent.setup();
    const { props } = renderInvoerKolom();

    await user.click(screen.getByText(/Gemeentelijke tarieven/));

    expect(props.setToonGemeenteTarieven).toHaveBeenCalledWith(true);
  });

  it('toont beschikbare rentevaste periodes van de provider', () => {
    renderInvoerKolom();

    const select = screen.getByDisplayValue('10 jaar vast');
    const options = within(select).getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.textContent)).toEqual(['1 jaar vast', '5 jaar vast', '10 jaar vast', '20 jaar vast']);
  });
});
