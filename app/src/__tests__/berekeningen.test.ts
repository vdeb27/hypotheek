import { describe, it, expect } from 'vitest';
import { berekenTotaleRente, berekenJaarSituatiePure } from '../lib/berekeningen';
import type { JaarContext } from '../lib/berekeningen';

describe('berekenTotaleRente', () => {
  it('berekent totale rente voor annuïtaire hypotheek', () => {
    const result = berekenTotaleRente(400000, 4.0, 30, 'annuitair');
    expect(result.totaleRente).toBeGreaterThan(0);
    expect(result.totaleBetalingen).toBeCloseTo(400000 + result.totaleRente, 0);
    // Bij 4% rente op €400k over 30 jaar: ronde ~€287k totale rente
    expect(result.totaleRente).toBeGreaterThan(250000);
    expect(result.totaleRente).toBeLessThan(350000);
  });

  it('berekent totale rente voor lineaire hypotheek', () => {
    const result = berekenTotaleRente(400000, 4.0, 30, 'lineair');
    expect(result.totaleRente).toBeGreaterThan(0);
    // Lineair betaalt minder rente dan annuïtair
    const annuitair = berekenTotaleRente(400000, 4.0, 30, 'annuitair');
    expect(result.totaleRente).toBeLessThan(annuitair.totaleRente);
  });

  it('genereert 6 renteperiodes van 5 jaar over 30 jaar', () => {
    const result = berekenTotaleRente(400000, 4.0, 30, 'annuitair');
    expect(result.rentePerPeriode).toHaveLength(6);
    expect(result.rentePerPeriode[0].jaren).toBe(5);
    expect(result.rentePerPeriode[5].jaren).toBe(30);
  });

  it('renteperiodes tellen op tot totale rente', () => {
    const result = berekenTotaleRente(400000, 4.0, 30, 'annuitair');
    const somPeriodes = result.rentePerPeriode.reduce((sum, p) => sum + p.rente, 0);
    expect(somPeriodes).toBeCloseTo(result.totaleRente, 0);
  });

  it('eerste periodes hebben meer rente dan latere (annuïtair)', () => {
    const result = berekenTotaleRente(400000, 4.0, 30, 'annuitair');
    expect(result.rentePerPeriode[0].rente).toBeGreaterThan(result.rentePerPeriode[5].rente);
  });

  it('0% rente geeft 0 totale rente', () => {
    const result = berekenTotaleRente(400000, 0, 30, 'lineair');
    expect(result.totaleRente).toBe(0);
    expect(result.totaleBetalingen).toBe(400000);
  });
});

describe('berekenJaarSituatiePure', () => {
  const basisCtx: JaarContext = {
    startJaar: 2026,
    brutoJaarJij: 60000,
    brutoJaarPartner: 50000,
    promotieJaar: null,
    promotieOpslag: 0,
    jijMinderWerkenJaar: null,
    partnerMinderWerkenJaar: null,
    jijUrenNaMinderWerken: 32,
    partnerUrenNaMinderWerken: 32,
    jijMaxUren: 40,
    partnerMaxUren: 40,
    woningwaarde: 450000,
    hypotheekType: 'annuitair',
    gemeenteData: {
      ozbPercentage: 0.08,
      rioolheffingJaar: 200,
      afvalstoffenheffingJaar: 400,
      waterschap: {
        naam: 'Test',
        ingezetenenJaar: 100,
        eigenarenPercentage: 0.02,
        zuiveringPerVE: 80,
        veMeerpersoons: 3,
      },
    },
    opstalverzekeringMaand: 30,
    onderhoudspercentage: 0.75,
  };

  it('berekent startjaar correcte waarden', () => {
    const result = berekenJaarSituatiePure(2026, 400000, 4.0, basisCtx);
    expect(result.totaalBrutoJaar).toBe(110000); // 60k + 50k
    expect(result.restschuld).toBe(400000); // Geen aflossing in jaar 0
    expect(result.woningwaardeNu).toBe(450000); // Geen indexatie in jaar 0
    expect(result.eigenVermogen).toBe(50000); // 450k - 400k
  });

  it('indexeert loon met 2% per jaar', () => {
    const jaar1 = berekenJaarSituatiePure(2026, 400000, 4.0, basisCtx);
    const jaar2 = berekenJaarSituatiePure(2027, 400000, 4.0, basisCtx);
    expect(jaar2.totaalBrutoJaar).toBeCloseTo(jaar1.totaalBrutoJaar * 1.02, 0);
  });

  it('indexeert woningwaarde met 3% per jaar', () => {
    const result = berekenJaarSituatiePure(2027, 400000, 4.0, basisCtx);
    expect(result.woningwaardeNu).toBeCloseTo(450000 * 1.03, 0);
  });

  it('past promotie-opslag toe vanaf promotiejaar', () => {
    const ctxMetPromotie: JaarContext = { ...basisCtx, promotieJaar: 2028, promotieOpslag: 10 };
    const voorPromotie = berekenJaarSituatiePure(2027, 400000, 4.0, ctxMetPromotie);
    const naPromotie = berekenJaarSituatiePure(2028, 400000, 4.0, ctxMetPromotie);

    // Na promotie: jij krijgt 10% extra bovenop geïndexeerd loon
    // Partner is ongewijzigd, dus totaal bruto stijgt meer dan alleen indexatie
    const verwachteStijgingZonderPromotie = voorPromotie.totaalBrutoJaar * 1.02;
    expect(naPromotie.totaalBrutoJaar).toBeGreaterThan(verwachteStijgingZonderPromotie);
  });

  it('past minder werken toe vanaf het juiste jaar', () => {
    const ctxMinderWerken: JaarContext = {
      ...basisCtx,
      jijMinderWerkenJaar: 2028,
      jijUrenNaMinderWerken: 32,
      jijMaxUren: 40,
    };
    const voor = berekenJaarSituatiePure(2027, 400000, 4.0, ctxMinderWerken);
    const na = berekenJaarSituatiePure(2028, 400000, 4.0, ctxMinderWerken);
    // Jij werkt 32/40 = 80% → jij's loon daalt, maar partner blijft gelijk
    // Totaal bruto na 2028 is lager dan verwacht met alleen indexatie
    expect(na.jijUren).toBe(32);
    expect(voor.jijUren).toBe(40);
  });

  it('berekent woonquotes', () => {
    const result = berekenJaarSituatiePure(2026, 400000, 4.0, basisCtx);
    expect(result.woonquoteBruto).toBeGreaterThan(0);
    expect(result.woonquoteBruto).toBeLessThan(100);
    expect(result.woonquoteNetto).toBeGreaterThan(0);
    expect(result.nibudNorm).toBeGreaterThan(0);
  });

  it('berekent bijkomende lasten', () => {
    const result = berekenJaarSituatiePure(2026, 400000, 4.0, basisCtx);
    expect(result.bijkomendeLastenMaand).toBeGreaterThan(0);
    expect(result.ozbJaar).toBeGreaterThan(0);
    expect(result.waterschapJaar).toBeGreaterThan(0);
    expect(result.verzekeringenJaar).toBe(30 * 12); // 30/mnd
  });

  it('netto maandlast is lager dan bruto (door HRA)', () => {
    const result = berekenJaarSituatiePure(2026, 400000, 4.0, basisCtx);
    expect(result.nettoMaandlast).toBeLessThan(result.brutoMaandlast);
  });
});
