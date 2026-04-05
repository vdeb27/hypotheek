import type { MortgageProvider } from './types';

// Bespaarhypotheek: per energielabel [NHG, ≤60%, ≤80%, ≤90%, >90%]
const bespaarhypotheekRentes: Record<number, Record<string, number[]>> = {
  1:  { A: [3.12, 3.24, 3.27, 3.30, 3.33], B: [3.19, 3.31, 3.34, 3.37, 3.40], C: [3.21, 3.33, 3.36, 3.39, 3.42] },
  2:  { A: [3.17, 3.29, 3.33, 3.35, 3.38], B: [3.24, 3.36, 3.40, 3.42, 3.45], C: [3.26, 3.38, 3.42, 3.44, 3.47] },
  3:  { A: [3.22, 3.34, 3.39, 3.40, 3.43], B: [3.29, 3.41, 3.46, 3.47, 3.50], C: [3.31, 3.43, 3.48, 3.49, 3.52] },
  4:  { A: [3.26, 3.38, 3.41, 3.42, 3.45], B: [3.33, 3.45, 3.48, 3.49, 3.52], C: [3.35, 3.47, 3.50, 3.51, 3.54] },
  5:  { A: [3.31, 3.42, 3.44, 3.45, 3.48], B: [3.38, 3.49, 3.51, 3.52, 3.55], C: [3.40, 3.51, 3.53, 3.54, 3.57] },
  6:  { A: [3.36, 3.48, 3.51, 3.52, 3.55], B: [3.43, 3.55, 3.58, 3.59, 3.62], C: [3.45, 3.57, 3.60, 3.61, 3.64] },
  10: { A: [3.60, 3.72, 3.79, 3.82, 3.85], B: [3.67, 3.79, 3.86, 3.89, 3.92], C: [3.69, 3.81, 3.88, 3.91, 3.94] },
  15: { A: [4.06, 4.12, 4.12, 4.21, 4.35], B: [4.13, 4.19, 4.19, 4.28, 4.42], C: [4.15, 4.21, 4.21, 4.30, 4.44] },
  20: { A: [4.12, 4.28, 4.28, 4.31, 4.45], B: [4.19, 4.35, 4.35, 4.38, 4.52], C: [4.21, 4.37, 4.37, 4.40, 4.54] }
};

const beschikbarePeriodes = [1, 2, 3, 4, 5, 6, 10, 15, 20];

function vindDichtstbijzijndePeriode(rentevastePeriode: number): number {
  return beschikbarePeriodes.reduce((prev, curr) =>
    Math.abs(curr - rentevastePeriode) < Math.abs(prev - rentevastePeriode) ? curr : prev
  );
}

export const bespaarhypotheek: MortgageProvider = {
  id: 'bespaar',
  naam: 'Bespaarhypotheek',
  bank: 'ASN Bank',
  beschikbarePeriodes,

  berekenRente({ ltv, heeftNHG, energielabel, rentevastePeriode }) {
    const periode = vindDichtstbijzijndePeriode(rentevastePeriode);
    const labelKey = energielabel === 'A' ? 'A' : energielabel === 'B' ? 'B' : 'C';
    const ltvIndex = heeftNHG ? 0 : ltv <= 60 ? 1 : ltv <= 80 ? 2 : ltv <= 90 ? 3 : 4;
    return bespaarhypotheekRentes[periode][labelKey][ltvIndex];
  },

  voorwaarden: {
    boetevrijAflossenPercentage: 20,
    verhuisregeling: true,
    ophogenMogelijk: false,
    betaalpauze: false,
    toelichting: 'Rente afhankelijk van energielabel (A/B/C). Lagere LTV-staffels dan ASN Hypotheek.',
  },
};
