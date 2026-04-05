import { describe, it, expect } from 'vitest';
import { berekenNettojaar, berekenHuishoudNettoMaand } from '../belasting';

describe('berekenNettojaar', () => {
  it('retourneert 0 belasting bij 0 inkomen', () => {
    const result = berekenNettojaar(0);
    expect(result.nettoJaar).toBe(0);
    expect(result.inkomstenbelasting).toBe(0);
  });

  it('berekent correct voor inkomen in schijf 1 (onder €38.883)', () => {
    const result = berekenNettojaar(30000);
    expect(result.inkomstenbelasting).toBeCloseTo(30000 * 0.3575, 0);
    expect(result.algemeenKorting).toBeGreaterThan(0);
    expect(result.arbeidskorting).toBeGreaterThan(0);
    expect(result.nettoJaar).toBeGreaterThan(0);
    expect(result.nettoJaar).toBeLessThan(30000);
  });

  it('berekent correct voor inkomen in schijf 2 (€38.883 - €78.426)', () => {
    const result = berekenNettojaar(60000);
    // Schijf 1: 38.883 * 0.3575 = 13.900,67
    // Schijf 2: (60.000 - 38.883) * 0.3756 = 7.931,54
    const verwachteBelasting = 38883 * 0.3575 + (60000 - 38883) * 0.3756;
    expect(result.inkomstenbelasting).toBeCloseTo(verwachteBelasting, 0);
  });

  it('berekent correct voor inkomen in schijf 3 (boven €78.426)', () => {
    const result = berekenNettojaar(100000);
    const verwachteBelasting =
      38883 * 0.3575 + (78426 - 38883) * 0.3756 + (100000 - 78426) * 0.495;
    expect(result.inkomstenbelasting).toBeCloseTo(verwachteBelasting, 0);
  });

  it('netto is altijd lager dan bruto bij positief inkomen', () => {
    for (const bruto of [20000, 40000, 60000, 80000, 120000]) {
      const result = berekenNettojaar(bruto);
      expect(result.nettoJaar).toBeLessThan(bruto);
      expect(result.nettoJaar).toBeGreaterThan(0);
    }
  });

  it('algemene heffingskorting bouwt af bij hoog inkomen', () => {
    const laag = berekenNettojaar(25000);
    const hoog = berekenNettojaar(80000);
    expect(laag.algemeenKorting).toBeGreaterThan(hoog.algemeenKorting);
    expect(hoog.algemeenKorting).toBe(0); // Boven schijf 2 grens = 0
  });

  it('arbeidskorting bouwt af bij zeer hoog inkomen', () => {
    const modaal = berekenNettojaar(45000);
    const hoog = berekenNettojaar(140000);
    expect(modaal.arbeidskorting).toBeGreaterThan(hoog.arbeidskorting);
    expect(hoog.arbeidskorting).toBe(0); // Boven €132.920 = 0
  });
});

describe('berekenHuishoudNettoMaand', () => {
  it('berekent gecombineerd huishoudnetto per maand', () => {
    const maandNetto = berekenHuishoudNettoMaand(60000, 50000);
    const jijNetto = berekenNettojaar(60000).nettoJaar;
    const partnerNetto = berekenNettojaar(50000).nettoJaar;
    expect(maandNetto).toBeCloseTo((jijNetto + partnerNetto) / 12, 2);
  });

  it('werkt met één partner zonder inkomen', () => {
    const maandNetto = berekenHuishoudNettoMaand(60000, 0);
    const enkelNetto = berekenNettojaar(60000).nettoJaar;
    expect(maandNetto).toBeCloseTo(enkelNetto / 12, 2);
  });
});
