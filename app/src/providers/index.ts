import type { MortgageProvider } from './types';
import type { RatesCache } from './rate-schema';
import { createProviderFromCache } from './rate-engine';
import ratesCacheRaw from './data/rates-cache.json';

export type { MortgageProvider } from './types';
const ratesCache = ratesCacheRaw as RatesCache;

// Labels die geen reguliere woninghypotheken zijn
const EXCLUDED_LABELS = [
  'bedrijfsruimte',
  'vastgoed',
  'verhuur',
  'investering',
  'woonboot',
  'verzilver',
  'levenslangrente',
  '(prof)',
];

function isWoninghypotheek(labelName: string): boolean {
  const lower = labelName.toLowerCase();
  return !EXCLUDED_LABELS.some((kw) => lower.includes(kw));
}

// Bouw providers op uit cache of fallback
function buildProviders(): Record<string, MortgageProvider> {
  if (!ratesCache || !ratesCache.providers || ratesCache.providers.length === 0) {
    return {};
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
