import type { MortgageProvider } from './types';
import { vindDichtstbijzijnde } from './utils';

// ASN Hypotheek: [NHG≤90%, NHG>90%, ≤50%, ≤60%, ≤70%, ≤80%, ≤90%, ≤100%, >100%]
const asnHypotheekRentes: Record<number, number[]> = {
  1: [3.27, 3.27, 3.46, 3.46, 3.53, 3.53, 3.56, 3.59, 3.99],
  2: [3.32, 3.32, 3.49, 3.49, 3.55, 3.55, 3.59, 3.61, 4.01],
  3: [3.38, 3.38, 3.53, 3.53, 3.57, 3.57, 3.62, 3.64, 4.04],
  4: [3.42, 3.42, 3.54, 3.54, 3.57, 3.57, 3.62, 3.64, 4.04],
  5: [3.47, 3.47, 3.55, 3.55, 3.57, 3.57, 3.63, 3.64, 4.04],
  6: [3.53, 3.53, 3.63, 3.63, 3.65, 3.65, 3.7, 3.72, 4.12],
  7: [3.59, 3.59, 3.71, 3.71, 3.73, 3.73, 3.78, 3.81, 4.21],
  10: [3.79, 3.79, 3.97, 3.97, 3.97, 3.97, 4.01, 4.07, 4.47],
  12: [3.79, 3.79, 3.97, 3.97, 3.97, 3.97, 4.01, 4.07, 4.47],
  15: [4.22, 4.22, 4.29, 4.29, 4.35, 4.35, 4.46, 4.56, 4.96],
  20: [4.34, 4.34, 4.41, 4.41, 4.49, 4.49, 4.5, 4.62, 5.02],
};

// ASN Duurzaam Wonen (energielabel A+): lagere rentes
const asnDuurzaamRentes: Record<number, number[]> = {
  1: [2.58, 2.58, 2.77, 2.77, 2.84, 2.84, 2.87, 2.9, 3.3],
  2: [2.65, 2.65, 2.82, 2.82, 2.88, 2.88, 2.92, 2.94, 3.34],
  3: [2.72, 2.72, 2.87, 2.87, 2.91, 2.91, 2.96, 2.98, 3.38],
  4: [2.77, 2.77, 2.89, 2.89, 2.92, 2.92, 2.97, 2.99, 3.39],
  5: [2.84, 2.84, 2.92, 2.92, 2.94, 2.94, 3.0, 3.01, 3.41],
  6: [2.88, 2.88, 2.98, 2.98, 3.0, 3.0, 3.05, 3.07, 3.47],
  7: [2.93, 2.93, 3.05, 3.05, 3.07, 3.07, 3.12, 3.15, 3.55],
  10: [3.08, 3.08, 3.26, 3.26, 3.26, 3.26, 3.3, 3.36, 3.76],
  12: [3.08, 3.08, 3.26, 3.26, 3.26, 3.26, 3.3, 3.36, 3.76],
  15: [3.31, 3.31, 3.38, 3.38, 3.44, 3.44, 3.55, 3.65, 4.05],
  20: [3.7, 3.7, 3.77, 3.77, 3.85, 3.85, 3.86, 3.98, 4.38],
};

const beschikbarePeriodes = [1, 2, 3, 4, 5, 6, 7, 10, 12, 15, 20];

export const asnHypotheek: MortgageProvider = {
  id: 'asn',
  naam: 'ASN Hypotheek',
  bank: 'ASN Bank',
  beschikbarePeriodes,

  berekenRente({ ltv, heeftNHG, energielabel, rentevastePeriode }) {
    const periode = vindDichtstbijzijnde(rentevastePeriode, beschikbarePeriodes);

    const ltvIndex =
      heeftNHG && ltv <= 90
        ? 0
        : heeftNHG
          ? 1
          : ltv <= 50
            ? 2
            : ltv <= 60
              ? 3
              : ltv <= 70
                ? 4
                : ltv <= 80
                  ? 5
                  : ltv <= 90
                    ? 6
                    : ltv <= 100
                      ? 7
                      : 8;

    // Energielabel A krijgt ASN Duurzaam Wonen tarief
    if (energielabel === 'A') {
      return asnDuurzaamRentes[periode][ltvIndex];
    }

    return asnHypotheekRentes[periode][ltvIndex];
  },

  voorwaarden: {
    boetevrijAflossenPercentage: 20,
    verhuisregeling: true,
    ophogenMogelijk: false,
    betaalpauze: false,
    toelichting: 'Energielabel A+ krijgt ASN Duurzaam Wonen korting (ca. 0.6-0.7% lager).',
  },
};
