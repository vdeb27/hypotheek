import type { MortgageProvider } from './types';
import type { RatesCache } from './rate-schema';
import { createProviderFromCache } from './rate-engine';

export type { MortgageProvider } from './types';

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

// Mutable exports: worden gevuld door initProviders() voordat de calculator rendert.
// ESM live bindings zorgen ervoor dat consumers altijd de huidige waarde zien.
export let providers: Record<string, MortgageProvider> = {};
export let providerGroups: Record<string, MortgageProvider[]> = {};
export let laatstBijgewerkt: string | null = null;

/**
 * Laad de rentedata (async) en bouw de provider-map op.
 * Moet aangeroepen worden voordat de calculator rendert.
 */
export async function initProviders(): Promise<void> {
  const ratesCacheRaw = await import('./data/rates-cache.json');
  const ratesCache = ratesCacheRaw.default as RatesCache;

  if (!ratesCache || !ratesCache.providers || ratesCache.providers.length === 0) {
    return;
  }

  const result: Record<string, MortgageProvider> = {};
  for (const cached of ratesCache.providers) {
    if (!isWoninghypotheek(cached.labelName)) continue;
    const provider = createProviderFromCache(cached);
    provider.laatstBijgewerkt = ratesCache.fetchedAt;
    result[provider.id] = provider;
  }

  providers = result;
  laatstBijgewerkt = ratesCache.fetchedAt ?? null;

  // Groepeer per bank
  const groups: Record<string, MortgageProvider[]> = {};
  for (const provider of Object.values(providers)) {
    const bank = provider.bank;
    if (!groups[bank]) groups[bank] = [];
    groups[bank].push(provider);
  }
  providerGroups = groups;
}
