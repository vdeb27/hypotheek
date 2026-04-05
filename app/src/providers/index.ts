import { asnHypotheek } from './asn-hypotheek';
import { bespaarhypotheek } from './bespaarhypotheek';
import { createProviderFromCache } from './rate-engine';
import type { MortgageProvider } from './types';
import type { RatesCache } from './rate-schema';

export type { MortgageProvider } from './types';

// Vite importeert JSON synchroon als module
import ratesCacheRaw from './data/rates-cache.json';
const ratesCache = ratesCacheRaw as unknown as RatesCache;

// Labels die geen reguliere woninghypotheken zijn
const EXCLUDED_LABELS = [
  'bedrijfsruimte', 'vastgoed', 'verhuur', 'investering', 'woonboot',
  'verzilver', 'levenslangrente', '(prof)',
];

function isWoninghypotheek(labelName: string): boolean {
  const lower = labelName.toLowerCase();
  return !EXCLUDED_LABELS.some(kw => lower.includes(kw));
}

// Bouw providers op uit cache of fallback
function buildProviders(): Record<string, MortgageProvider> {
  if (!ratesCache || !ratesCache.providers || ratesCache.providers.length === 0) {
    return {
      asn: asnHypotheek,
      bespaar: bespaarhypotheek,
    };
  }

  const result: Record<string, MortgageProvider> = {};

  for (const cached of ratesCache.providers) {
    if (!isWoninghypotheek(cached.labelName)) continue;
    const provider = createProviderFromCache(cached);
    provider.laatstBijgewerkt = ratesCache.fetchedAt;
    result[provider.id] = provider;
  }

  return result;
}

export const providers = buildProviders();

/** Providers gegroepeerd per bank (providerName). */
export const providerGroups: Record<string, MortgageProvider[]> = {};
for (const provider of Object.values(providers)) {
  const bank = provider.bank;
  if (!providerGroups[bank]) providerGroups[bank] = [];
  providerGroups[bank].push(provider);
}

/** Datum van laatste data-update, of null bij fallback. */
export const laatstBijgewerkt: string | null = ratesCache?.fetchedAt ?? null;
