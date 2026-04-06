import { describe, it, expect } from 'vitest';
import { zoekFinancieringslastpercentage } from '../lib/nibud-normen';

describe('zoekFinancieringslastpercentage', () => {
  it('zoekt een exacte waarde op (€85.000, 4,1% rente)', () => {
    // 4,1% valt in klasse 4,001-4,500% (kolom index 6)
    expect(zoekFinancieringslastpercentage(85000, 4.1)).toBe(26.5);
  });

  it('zoekt de waarde op bij de Excel-verificatie (€125.000, 4,1%)', () => {
    expect(zoekFinancieringslastpercentage(125000, 4.1)).toBe(28.3);
  });

  it('rondt af naar dichtstbijzijnde €1.000', () => {
    // €85.400 rondt af naar €85.000
    expect(zoekFinancieringslastpercentage(85400, 4.1)).toBe(26.5);
    // €85.500 rondt af naar €86.000
    expect(zoekFinancieringslastpercentage(85500, 4.1)).toBe(26.5);
    // €85.600 rondt af naar €86.000
    expect(zoekFinancieringslastpercentage(85600, 4.1)).toBe(26.5);
  });

  it('kapt af op ondergrens (€30.000) bij laag inkomen', () => {
    expect(zoekFinancieringslastpercentage(20000, 4.1)).toBe(20.9);
    expect(zoekFinancieringslastpercentage(30000, 4.1)).toBe(20.9);
  });

  it('kapt af op bovengrens (€125.000) bij hoog inkomen', () => {
    expect(zoekFinancieringslastpercentage(150000, 4.1)).toBe(28.3);
    expect(zoekFinancieringslastpercentage(125000, 4.1)).toBe(28.3);
  });

  it('selecteert de juiste rentekolom bij grenzen', () => {
    // Exact 1,5% valt in <=1,500%
    expect(zoekFinancieringslastpercentage(85000, 1.5)).toBe(20.2);
    // 1,501% valt in 1,501-2,000%
    expect(zoekFinancieringslastpercentage(85000, 1.501)).toBe(21.3);
    // Exact 2,0% valt in 1,501-2,000%
    expect(zoekFinancieringslastpercentage(85000, 2.0)).toBe(21.3);
    // Zeer hoge rente (>= 6,501%) pakt de laatste kolom
    expect(zoekFinancieringslastpercentage(85000, 7.5)).toBe(30.7);
  });

  it('geeft hogere norm bij hoger inkomen', () => {
    const laag = zoekFinancieringslastpercentage(50000, 4.25);
    const hoog = zoekFinancieringslastpercentage(100000, 4.25);
    expect(hoog).toBeGreaterThan(laag);
  });

  it('geeft hogere norm bij hogere rente', () => {
    const laag = zoekFinancieringslastpercentage(85000, 2.0);
    const hoog = zoekFinancieringslastpercentage(85000, 5.0);
    expect(hoog).toBeGreaterThan(laag);
  });
});
