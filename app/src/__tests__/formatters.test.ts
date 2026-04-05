import { describe, it, expect } from 'vitest';
import { formatBedrag, formatPercentage, getWoonquoteKleur, getWoonquoteTekstKleur } from '../lib/formatters';

describe('formatBedrag', () => {
  it('formatteert bedrag in euro zonder decimalen', () => {
    const result = formatBedrag(450000);
    expect(result).toContain('450.000');
    expect(result).toContain('€');
  });

  it('rondt af naar hele euro', () => {
    const result = formatBedrag(1234.56);
    expect(result).toContain('1.235');
  });

  it('werkt met negatieve bedragen', () => {
    const result = formatBedrag(-5000);
    expect(result).toContain('5.000');
  });

  it('werkt met 0', () => {
    const result = formatBedrag(0);
    expect(result).toContain('0');
  });
});

describe('formatPercentage', () => {
  it('formatteert met 1 decimaal standaard', () => {
    expect(formatPercentage(25.678)).toBe('25.7%');
  });

  it('formatteert met opgegeven decimalen', () => {
    expect(formatPercentage(3.456, 2)).toBe('3.46%');
    expect(formatPercentage(3.456, 0)).toBe('3%');
  });
});

describe('getWoonquoteKleur', () => {
  it('retourneert groen onder nibud-norm', () => {
    expect(getWoonquoteKleur(20, 28)).toContain('green');
  });

  it('retourneert geel net boven nibud-norm', () => {
    expect(getWoonquoteKleur(30, 28)).toContain('yellow');
  });

  it('retourneert rood ver boven nibud-norm', () => {
    expect(getWoonquoteKleur(35, 28)).toContain('red');
  });
});

describe('getWoonquoteTekstKleur', () => {
  it('retourneert groene tekst onder nibud-norm', () => {
    expect(getWoonquoteTekstKleur(20, 28)).toContain('green');
  });

  it('retourneert gele tekst net boven nibud-norm', () => {
    expect(getWoonquoteTekstKleur(30, 28)).toContain('yellow');
  });

  it('retourneert rode tekst ver boven nibud-norm', () => {
    expect(getWoonquoteTekstKleur(35, 28)).toContain('red');
  });
});
