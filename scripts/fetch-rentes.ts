/**
 * Fetch hypotheekrente data van de Hypotheekbond Renteoverzicht widget.
 *
 * Gebruik: npx tsx scripts/fetch-rentes.ts
 *
 * Dit script haalt actuele rentes op voor alle actieve hypotheekverstrekkers
 * in Nederland, voor meerdere LTV-staffels en energielabels, en schrijft
 * het resultaat naar app/src/providers/data/rates-cache.json.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'https://284380d7-6882-4373-9db9-24643e6d1083.tools.hypotheekbond.nl/renteoverzicht';

// LTV-staffels om op te vragen
const LTV_CLASSES = [
  { key: 'nhg', nhg: true, ltv: 100 },
  { key: '60', nhg: false, ltv: 60 },
  { key: '70', nhg: false, ltv: 70 },
  { key: '80', nhg: false, ltv: 80 },
  { key: '90', nhg: false, ltv: 90 },
  { key: '100', nhg: false, ltv: 100 },
];

// Energielabels: A t/m G (elk label kan andere rentes geven)
const ENERGY_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

// Alle gangbare rentevaste periodes (in maanden)
const ALL_FRT_MONTHS = [0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 144, 180, 240, 300, 360];

interface ApiProvider {
  mortgage_provider_id: number;
  mortgage_provider_name: string;
  label_id: number;
  label_name: string;
  frts: { frt: number; is_variable: boolean; interest_rate: number | null }[];
  products: { product_id: number; product_name: string; mortgage_type: number }[];
  logo_url?: string;
}

interface CachedProvider {
  providerId: number;
  providerName: string;
  labelId: number;
  labelName: string;
  products: { name: string; mortgageType: number }[];
  // Key = "A:nhg" | "A:60" | "B:nhg" | "C:80" etc.
  rates: Record<string, Record<number, number | null>>;
  logoUrl?: string;
}

interface RatesCache {
  fetchedAt: string;
  providers: CachedProvider[];
}

async function getSession(): Promise<{ cookie: string; csrf: string }> {
  const response = await fetch(BASE_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  });

  const html = await response.text();
  const csrfMatch = html.match(/csrf-token" content="([^"]+)"/);
  if (!csrfMatch) throw new Error('Kon CSRF-token niet vinden');

  const setCookies = response.headers.getSetCookie?.() ?? [];
  const cookies = setCookies.map(c => c.split(';')[0]).join('; ');

  return { cookie: cookies, csrf: csrfMatch[1] };
}

async function fetchRates(
  session: { cookie: string; csrf: string },
  nhg: boolean,
  ltv: number,
  energyLabel: string,
): Promise<ApiProvider[]> {
  const body = {
    mortgage_type: 6, // Annuïteiten
    nhg,
    ltv,
    available_for: 'A', // Alleen actieve aanbieders
    frt: ALL_FRT_MONTHS,
    sorted_frt: 120,
    energy_label: energyLabel,
    rate_deviations: [],
    prefer_collaboration: false,
    prefer_auto_risk_class_reduction: false,
    showAllResults: false,
  };

  const response = await fetch(`${BASE_URL}/calculate/interest-overview`, {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-TOKEN': session.csrf,
      'Cookie': session.cookie,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API fout (${response.status}): ${text.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.data ?? data;
}

async function main() {
  console.log('Hypotheekrente data ophalen...\n');

  // Stap 1: Session verkrijgen
  console.log('Session ophalen...');
  const session = await getSession();
  console.log('Session verkregen.\n');

  // Stap 2: Per energielabel + LTV-staffel rentes ophalen
  const providerMap = new Map<string, CachedProvider>();

  for (const energyLabel of ENERGY_LABELS) {
    for (const ltvClass of LTV_CLASSES) {
      const label = ltvClass.nhg ? 'NHG' : `LTV ${ltvClass.ltv}%`;
      const rateKey = `${energyLabel}:${ltvClass.key}`;
      process.stdout.write(`Ophalen: Label ${energyLabel}, ${label}...`);

      const providers = await fetchRates(session, ltvClass.nhg, ltvClass.ltv, energyLabel);
      console.log(` ${providers.length} producten`);

      // Data samenvoegen per provider/label
      for (const p of providers) {
        const mapKey = `${p.mortgage_provider_id}-${p.label_id}`;

        if (!providerMap.has(mapKey)) {
          providerMap.set(mapKey, {
            providerId: p.mortgage_provider_id,
            providerName: p.mortgage_provider_name,
            labelId: p.label_id,
            labelName: p.label_name,
            products: p.products.map(pr => ({
              name: pr.product_name,
              mortgageType: pr.mortgage_type,
            })),
            rates: {},
            logoUrl: p.logo_url,
          });
        }

        const cached = providerMap.get(mapKey)!;
        const ratesForCombo: Record<number, number | null> = {};
        for (const frt of p.frts) {
          ratesForCombo[frt.frt] = frt.interest_rate;
        }
        cached.rates[rateKey] = ratesForCombo;
      }

      // Kleine pauze om de server niet te overbelasten
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Stap 3: Sorteren en wegschrijven
  const cache: RatesCache = {
    fetchedAt: new Date().toISOString(),
    providers: Array.from(providerMap.values()).sort((a, b) =>
      a.providerName.localeCompare(b.providerName) || a.labelName.localeCompare(b.labelName)
    ),
  };

  const outputPath = resolve(__dirname, '../app/src/providers/data/rates-cache.json');
  writeFileSync(outputPath, JSON.stringify(cache, null, 2), 'utf-8');

  // Samenvatting
  const uniqueProviders = new Set(cache.providers.map(p => p.providerName));
  console.log(`\nKlaar! ${cache.providers.length} producten van ${uniqueProviders.size} aanbieders opgeslagen.`);
  console.log(`Bestand: ${outputPath}`);
  console.log(`Tijdstip: ${cache.fetchedAt}`);
}

main().catch(err => {
  console.error('Fout:', err.message);
  process.exit(1);
});
