import { describe, it, expect } from 'vitest';
import { getLtvKey, createProviderFromCache } from '../providers/rate-engine';
import type { CachedProvider } from '../providers/rate-schema';

describe('getLtvKey', () => {
  it('retourneert "nhg" bij NHG', () => {
    expect(getLtvKey(90, true)).toBe('nhg');
    expect(getLtvKey(50, true)).toBe('nhg');
  });

  it('retourneert juiste LTV-klasse zonder NHG', () => {
    expect(getLtvKey(50, false)).toBe('60');
    expect(getLtvKey(60, false)).toBe('60');
    expect(getLtvKey(65, false)).toBe('70');
    expect(getLtvKey(70, false)).toBe('70');
    expect(getLtvKey(75, false)).toBe('80');
    expect(getLtvKey(80, false)).toBe('80');
    expect(getLtvKey(85, false)).toBe('90');
    expect(getLtvKey(90, false)).toBe('90');
    expect(getLtvKey(95, false)).toBe('100');
    expect(getLtvKey(100, false)).toBe('100');
  });
});

describe('createProviderFromCache', () => {
  const mockCachedProvider: CachedProvider = {
    providerId: 1,
    providerName: 'Test Bank',
    labelId: 1,
    labelName: 'Test Hypotheek',
    products: [{ name: 'Annuïteiten', mortgageType: 6 }],
    rates: {
      'A:nhg': { 60: 3.5, 120: 3.8, 240: 4.0 },
      'A:80': { 60: 3.7, 120: 4.0, 240: 4.2 },
      'B:nhg': { 60: 3.6, 120: 3.9, 240: 4.1 },
    },
  };

  it('genereert een geldig id', () => {
    const provider = createProviderFromCache(mockCachedProvider);
    expect(provider.id).toBe('test-bank-test-hypotheek');
  });

  it('formatteert naam correct bij verschillende provider/label', () => {
    const provider = createProviderFromCache(mockCachedProvider);
    expect(provider.naam).toBe('Test Bank — Test Hypotheek');
  });

  it('formatteert naam correct bij gelijke provider/label', () => {
    const provider = createProviderFromCache({
      ...mockCachedProvider,
      labelName: 'Test Bank',
    });
    expect(provider.naam).toBe('Test Bank');
  });

  it('extraheert beschikbare periodes in jaren', () => {
    const provider = createProviderFromCache(mockCachedProvider);
    // 60 maanden = 5 jaar, 120 = 10, 240 = 20
    expect(provider.beschikbarePeriodes).toEqual([5, 10, 20]);
  });

  it('extraheert beschikbare LTV-klassen', () => {
    const provider = createProviderFromCache(mockCachedProvider);
    expect(provider.beschikbareLtvKlassen).toContain('nhg');
    expect(provider.beschikbareLtvKlassen).toContain('80');
  });

  it('berekent rente correct voor een bekende combinatie', () => {
    const provider = createProviderFromCache(mockCachedProvider);
    const rente = provider.berekenRente({
      ltv: 75,
      heeftNHG: false,
      energielabel: 'A',
      rentevastePeriode: 10,
    });
    expect(rente).toBe(4.0); // A:80, 120 maanden
  });

  it('berekent rente correct voor NHG', () => {
    const provider = createProviderFromCache(mockCachedProvider);
    const rente = provider.berekenRente({
      ltv: 90,
      heeftNHG: true,
      energielabel: 'A',
      rentevastePeriode: 5,
    });
    expect(rente).toBe(3.5); // A:nhg, 60 maanden
  });

  it('valt terug op A bij onbekend energielabel', () => {
    const provider = createProviderFromCache(mockCachedProvider);
    const rente = provider.berekenRente({
      ltv: 75,
      heeftNHG: false,
      energielabel: 'G',
      rentevastePeriode: 10,
    });
    // G:80 bestaat niet, fallback naar A:80 → 120 maanden = 4.0
    expect(rente).toBe(4.0);
  });

  it('retourneert 0 bij lege rates', () => {
    const emptyProvider = createProviderFromCache({
      ...mockCachedProvider,
      rates: {},
    });
    const rente = emptyProvider.berekenRente({
      ltv: 80,
      heeftNHG: false,
      energielabel: 'A',
      rentevastePeriode: 10,
    });
    expect(rente).toBe(0);
  });
});
