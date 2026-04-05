import type { MortgageProvider } from './types';
import type { CachedProvider } from './rate-schema';

/**
 * Bepaal de LTV-klasse key op basis van LTV percentage en NHG status.
 */
export function getLtvKey(ltv: number, heeftNHG: boolean): string {
  if (heeftNHG) return 'nhg';
  if (ltv <= 60) return '60';
  if (ltv <= 70) return '70';
  if (ltv <= 80) return '80';
  if (ltv <= 90) return '90';
  return '100';
}

/**
 * Map energielabel naar cache-key (A t/m G).
 * A+ en hoger worden als A behandeld.
 */
function getEnergyKey(energielabel: string): string {
  const label = energielabel.replace(/\+/g, '').toUpperCase();
  if ('ABCDEFG'.includes(label)) return label;
  return 'A'; // A+ en hoger → A
}

/**
 * Bouw de rate-key: "A:nhg", "B:80", etc.
 */
function getRateKey(energielabel: string, ltv: number, heeftNHG: boolean): string {
  return `${getEnergyKey(energielabel)}:${getLtvKey(ltv, heeftNHG)}`;
}

/**
 * Vind de dichtstbijzijnde beschikbare rentevaste periode (in maanden).
 */
function vindDichtstbijzijndePeriode(
  gevraagdJaren: number,
  beschikbaarMaanden: number[],
): number {
  const gevraagdMaanden = gevraagdJaren * 12;
  return beschikbaarMaanden.reduce((prev, curr) =>
    Math.abs(curr - gevraagdMaanden) < Math.abs(prev - gevraagdMaanden) ? curr : prev
  );
}

/**
 * Maak een MortgageProvider van gecachte API-data.
 */
export function createProviderFromCache(data: CachedProvider): MortgageProvider {
  // Bepaal beschikbare periodes uit de rentes (neem de eerste beschikbare rate-key)
  const firstRateKey = Object.keys(data.rates)[0];
  const beschikbaarMaanden = firstRateKey
    ? Object.entries(data.rates[firstRateKey])
        .filter(([, rate]) => rate !== null)
        .map(([frt]) => Number(frt))
        .sort((a, b) => a - b)
    : [];

  // Converteer maanden naar jaren voor de interface
  const beschikbarePeriodes = beschikbaarMaanden
    .filter(m => m > 0)
    .map(m => m / 12)
    .filter(j => Number.isInteger(j));

  if (beschikbaarMaanden.includes(0)) {
    beschikbarePeriodes.unshift(0);
  }

  // Genereer een uniek id
  const id = `${data.providerName}-${data.labelName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id,
    naam: data.providerName === data.labelName
      ? data.labelName
      : `${data.providerName} — ${data.labelName}`,
    bank: data.providerName,
    beschikbarePeriodes,
    laatstBijgewerkt: undefined,
    beschikbareLtvKlassen: [...new Set(
      Object.keys(data.rates).map(k => k.split(':')[1]).filter(Boolean)
    )],

    berekenRente({ ltv, heeftNHG, energielabel, rentevastePeriode }) {
      // Zoek de rateKey: energielabel + LTV-klasse
      const rateKey = getRateKey(energielabel, ltv, heeftNHG);
      let ratesForCombo = data.rates[rateKey];

      if (!ratesForCombo) {
        // Fallback: probeer zonder energielabel-differentiatie (A als default)
        const fallbackKey = `A:${getLtvKey(ltv, heeftNHG)}`;
        ratesForCombo = data.rates[fallbackKey];
      }

      if (!ratesForCombo) {
        // Laatste fallback: neem de eerste beschikbare rate-key
        const availableKeys = Object.keys(data.rates);
        if (availableKeys.length === 0) return 0;
        ratesForCombo = data.rates[availableKeys[0]];
      }

      const beschikbaar = Object.entries(ratesForCombo)
        .filter(([, rate]) => rate !== null)
        .map(([frt]) => Number(frt));

      if (beschikbaar.length === 0) return 0;

      const periodeMaanden = vindDichtstbijzijndePeriode(rentevastePeriode, beschikbaar);
      return ratesForCombo[periodeMaanden] ?? 0;
    },
  };
}
