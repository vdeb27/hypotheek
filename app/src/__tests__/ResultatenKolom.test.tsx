import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultatenKolom from '../components/ResultatenKolom';
import type { JaarSituatie } from '../lib/berekeningen';
import type { GemeenteTarieven } from '../gemeente-tarieven';

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

function renderResultatenKolom(overrides = {}) {
  const defaultProps = {
    heeftPartner: true,
    woningwaarde: 450000,
    bekijkJaar: 2026,
    gemeenteData: mockGemeenteData,
    opstalverzekeringMaand: 30,
    onderhoudspercentage: 0.75,
    toonKostenKoperDetail: false,
    setToonKostenKoperDetail: vi.fn(),
    toonRenteDetail: false,
    setToonRenteDetail: vi.fn(),
    toonWoonlastenDetail: false,
    setToonWoonlastenDetail: vi.fn(),
    heeftStartersvrijstelling: true,
    overdrachtsbelasting: 0,
    kostenKoperBasis: 12500,
    kostenKoperTotaal: 14020,
    kostenKoperDetail: {
      notarisTransport: 1750,
      notarisHypotheek: 1200,
      kadaster: 740,
      taxatie: 695,
      bankgarantie: 450,
      bouwkundigeKeuring: 450,
      makelaarskosten: 0,
      overdrachtsbelasting: 0,
    },
    nhgPremie: 1520,
    heeftNHG: true,
    aftrekbareKosten: 2365,
    belastingvoordeelKosten: 875,
    kostenKoperNetto: 13145,
    eigenInlegHuis: 55480,
    hypotheekBedrag: 380000,
    hypotheekMogelijk: true,
    inlegWaarschuwingJij: false,
    inlegWaarschuwingPartner: false,
    bijdrageJij: 37500,
    bijdragePartner: 37500,
    rente: 4.0,
    ltv: 84.4,
    totaleRente30Jaar: 273000,
    totaleBetalingen30Jaar: 653000,
    rentePerPeriode: [
      { jaren: 5, rente: 68000 },
      { jaren: 10, rente: 58000 },
      { jaren: 15, rente: 47000 },
      { jaren: 20, rente: 36000 },
      { jaren: 25, rente: 36000 },
      { jaren: 30, rente: 28000 },
    ],
    renteEerste10Jaar: 126000,
    renteAlsPercentageHoofdsom: 71.8,
    renteLagerPercentage: 3.8,
    renteHogerPercentage: 4.2,
    totaleRenteLager: 255000,
    totaleRenteHoger: 291000,
    verschilLager: 18000,
    verschilHoger: 18000,
    situatie2026: mockSituatie,
    situatieBekijkJaar: mockSituatie,
    bufferInMaanden: 19.4,
    ...overrides,
  };

  return { ...render(<ResultatenKolom {...defaultProps} />), props: defaultProps };
}

describe('ResultatenKolom', () => {
  it('toont de drie secties', () => {
    renderResultatenKolom();

    expect(screen.getByText('Kosten & Hypotheek')).toBeInTheDocument();
    expect(screen.getByText('Rente over de Looptijd')).toBeInTheDocument();
    expect(screen.getByText('Woonlasten 2026')).toBeInTheDocument();
  });

  it('toont het hypotheekbedrag', () => {
    renderResultatenKolom();

    expect(screen.getByText('Hypotheekbedrag:')).toBeInTheDocument();
  });

  it('toont startersvrijstelling als die van toepassing is', () => {
    renderResultatenKolom({ heeftStartersvrijstelling: true });

    expect(screen.getByText(/Ja/)).toBeInTheDocument();
    expect(screen.getByText(/bespaard/)).toBeInTheDocument();
  });

  it('toont geen startersvrijstelling als woningwaarde te hoog is', () => {
    renderResultatenKolom({ heeftStartersvrijstelling: false });

    expect(screen.getByText('Nee')).toBeInTheDocument();
  });

  it('toont NHG-premie als NHG van toepassing is', () => {
    renderResultatenKolom({ heeftNHG: true, nhgPremie: 1520 });

    expect(screen.getByText(/NHG-premie/)).toBeInTheDocument();
  });

  it('klapt kosten koper detail uit bij klik', async () => {
    const user = userEvent.setup();
    const { props } = renderResultatenKolom();

    await user.click(screen.getByText(/Bekijk uitsplitsing/));

    expect(props.setToonKostenKoperDetail).toHaveBeenCalledWith(true);
  });

  it('toont kosten koper detail wanneer toonKostenKoperDetail is true', () => {
    renderResultatenKolom({ toonKostenKoperDetail: true });

    expect(screen.getByText('Transportakte:')).toBeInTheDocument();
    expect(screen.getByText('Hypotheekakte:')).toBeInTheDocument();
    expect(screen.getByText('Kadaster:')).toBeInTheDocument();
    expect(screen.getByText('Taxatie:')).toBeInTheDocument();
  });

  it('klapt rente detail uit bij klik', async () => {
    const user = userEvent.setup();
    const { props } = renderResultatenKolom();

    await user.click(screen.getByText(/Rente per 5-jaars periode/));

    expect(props.setToonRenteDetail).toHaveBeenCalledWith(true);
  });

  it('toont woonquote-status binnen Nibud-norm', () => {
    renderResultatenKolom();

    expect(screen.getByText(/binnen Nibud-norm/)).toBeInTheDocument();
  });

  it('toont waarschuwing als woonquote boven Nibud-norm is', () => {
    const hogeWoonquote = { ...mockSituatie, woonquoteBruto: 35.0, nibudNorm: 28 };
    renderResultatenKolom({ situatieBekijkJaar: hogeWoonquote });

    expect(screen.getByText(/boven Nibud-norm/)).toBeInTheDocument();
  });

  it('toont buffer in maanden', () => {
    renderResultatenKolom({ bufferInMaanden: 19.4 });

    expect(screen.getByText('19.4 maanden')).toBeInTheDocument();
  });

  it('toont waarschuwing als hypotheek niet mogelijk is', () => {
    renderResultatenKolom({ hypotheekMogelijk: false });

    expect(screen.getByText(/niet genoeg over voor de kosten koper/)).toBeInTheDocument();
  });

  it('verbergt waarschuwing als hypotheek wel mogelijk is', () => {
    renderResultatenKolom({ hypotheekMogelijk: true });

    expect(screen.queryByText(/niet genoeg over voor de kosten koper/)).not.toBeInTheDocument();
  });
});
