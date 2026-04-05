/**
 * Vind de waarde in een array die het dichtst bij de gevraagde waarde ligt.
 */
export function vindDichtstbijzijnde(gevraagd: number, beschikbaar: number[]): number {
  return beschikbaar.reduce((prev, curr) => (Math.abs(curr - gevraagd) < Math.abs(prev - gevraagd) ? curr : prev));
}
