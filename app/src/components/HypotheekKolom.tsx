import { useMemo } from 'react';
import type { MortgageProvider } from '../providers';
import { providers, laatstBijgewerkt } from '../providers';
import { getLtvKey } from '../providers/rate-engine';
import { formatPercentage } from '../lib/formatters';
import Tooltip from './Tooltip';

interface HypotheekKolomProps {
  // Inputs
  hypotheekType: string;
  setHypotheekType: (s: string) => void;
  rentevastePeriode: number;
  setRentevastePeriode: (n: number) => void;
  hypotheekProduct: string;
  setHypotheekProduct: (s: string) => void;

  // Berekende waarden voor vergelijking
  ltv: number;
  heeftNHG: boolean;
  energielabel: string;
  rente: number;
  provider: MortgageProvider;
}

interface ProviderRij {
  id: string;
  naam: string;
  bank: string;
  rente: number;
  beschikbaarLtv: boolean;
  heeftPeriode: boolean;
  beschikbarePeriodes: number[];
}

// Alle unieke rentevaste periodes over alle providers (eenmalig berekend)
const allePeriodes: number[] = (() => {
  const set = new Set<number>();
  for (const p of Object.values(providers)) {
    for (const periode of p.beschikbarePeriodes) {
      set.add(periode);
    }
  }
  return [...set].sort((a, b) => a - b);
})();

function formatPeriodes(periodes: number[]): string {
  return periodes
    .map((p) => (p === 0 ? 'variabel' : `${p}j`))
    .join(', ');
}

export default function HypotheekKolom({
  hypotheekType,
  setHypotheekType,
  rentevastePeriode,
  setRentevastePeriode,
  hypotheekProduct,
  setHypotheekProduct,
  ltv,
  heeftNHG,
  energielabel,
  rente,
  provider,
}: HypotheekKolomProps) {
  const ltvKey = getLtvKey(ltv, heeftNHG);

  // Bouw vergelijkingstabel: alle providers, uitgegrijsd als LTV of periode niet matcht
  const vergelijking = useMemo((): ProviderRij[] => {
    const rijen: ProviderRij[] = [];

    for (const p of Object.values(providers)) {
      const pRente = p.berekenRente({ ltv, heeftNHG, energielabel, rentevastePeriode });
      const beschikbaarLtv =
        !p.beschikbareLtvKlassen ||
        p.beschikbareLtvKlassen.length === 0 ||
        p.beschikbareLtvKlassen.includes(ltvKey);
      const heeftPeriode = p.beschikbarePeriodes.includes(rentevastePeriode);

      // Sla over als geen rente beschikbaar (0 = geen data)
      if (pRente === 0) continue;

      rijen.push({
        id: p.id,
        naam: p.naam,
        bank: p.bank,
        rente: pRente,
        beschikbaarLtv,
        heeftPeriode,
        beschikbarePeriodes: p.beschikbarePeriodes,
      });
    }

    // Sorteer: volledig beschikbaar eerst, dan gedeeltelijk, dan geen van beide. Binnen groep: op rente.
    rijen.sort((a, b) => {
      const aBeschikbaar = a.beschikbaarLtv && a.heeftPeriode;
      const bBeschikbaar = b.beschikbaarLtv && b.heeftPeriode;
      if (aBeschikbaar !== bBeschikbaar) return aBeschikbaar ? -1 : 1;
      return a.rente - b.rente;
    });

    return rijen;
  }, [ltv, heeftNHG, energielabel, rentevastePeriode, ltvKey]);

  return (
    <section aria-label="Hypotheek" className="space-y-4">
      {/* Fieldset 3a: Hypotheektype */}
      <fieldset className="bg-purple-50 p-4 rounded-lg space-y-3">
        <div><legend className="font-semibold text-purple-800">Hypotheektype</legend></div>

        <div>
          <label className="block text-gray-600 text-xs mb-1">Type<Tooltip term="hypotheektype" /></label>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setHypotheekType('annuitair')}
              aria-pressed={hypotheekType === 'annuitair'}
              className={`flex-1 py-2 px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 ${
                hypotheekType === 'annuitair' ? 'bg-purple-600 text-white font-medium' : 'bg-white hover:bg-gray-50'
              }`}
            >
              Annuïtair
            </button>
            <button
              onClick={() => setHypotheekType('lineair')}
              aria-pressed={hypotheekType === 'lineair'}
              className={`flex-1 py-2 px-3 text-sm transition-colors border-l focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 ${
                hypotheekType === 'lineair' ? 'bg-purple-600 text-white font-medium' : 'bg-white hover:bg-gray-50'
              }`}
            >
              Lineair
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-600 text-xs mb-1">Rentevaste periode<Tooltip term="rentevastePeriode" /></label>
          <select
            value={rentevastePeriode}
            onChange={(e) => setRentevastePeriode(Number(e.target.value))}
            className="w-full p-2 border rounded text-sm"
          >
            {allePeriodes.map((p) => (
              <option key={p} value={p}>
                {p === 0 ? 'Variabel' : `${p} jaar vast`}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Component 3b: Aanbiedervergelijking */}
      <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
        <h2 className="font-semibold text-gray-800 mb-2">Aanbieders</h2>
        <p className="text-xs text-gray-500 mb-3">
          {vergelijking.length} producten · LTV {ltvKey === 'nhg' ? 'NHG' : `≤${ltvKey}%`} · Label {energielabel} · {rentevastePeriode === 0 ? 'variabel' : `${rentevastePeriode}j vast`}
        </p>

        <div className="max-h-80 overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b text-gray-500">
                <th className="text-left py-1 pr-1">Aanbieder</th>
                <th className="text-right py-1 px-1">Rente</th>
              </tr>
            </thead>
            <tbody>
              {vergelijking.map((rij) => {
                const isGeselecteerd = rij.id === hypotheekProduct;
                const beschikbaar = rij.beschikbaarLtv && rij.heeftPeriode;
                return (
                  <tr
                    key={rij.id}
                    onClick={() => setHypotheekProduct(rij.id)}
                    className={`border-b cursor-pointer transition-colors ${
                      isGeselecteerd
                        ? 'bg-purple-100 font-medium'
                        : beschikbaar
                          ? 'hover:bg-purple-50'
                          : 'opacity-50 hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-1.5 pr-1">
                      <span className="block truncate max-w-[200px]" title={rij.naam}>
                        {rij.naam}
                      </span>
                    </td>
                    <td className="text-right py-1.5 px-1 font-mono">
                      {formatPercentage(rij.rente, 2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Output-blok 3c: Gekozen product */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="font-semibold text-purple-800 mb-2">Gekozen product</h2>
        <div className="bg-white p-3 rounded border space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">{provider.naam}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Berekende rente:</span>
            <span className="text-xl font-bold text-purple-700">{formatPercentage(rente, 2)}</span>
          </div>
          {provider.beschikbareLtvKlassen &&
            provider.beschikbareLtvKlassen.length > 0 &&
            !provider.beschikbareLtvKlassen.includes(ltvKey) && (
              <p className="text-xs text-amber-600">
                ⚠ Deze aanbieder is niet beschikbaar bij jouw LTV ({Math.round(ltv)}%). Beschikbaar bij:{' '}
                {provider.beschikbareLtvKlassen.map((k) => (k === 'nhg' ? 'NHG' : `≤${k}%`)).join(', ')}.
              </p>
            )}
          {!provider.beschikbarePeriodes.includes(rentevastePeriode) && (
            <p className="text-xs text-amber-600">
              ⚠ {rentevastePeriode === 0 ? 'Variabel' : `${rentevastePeriode} jaar vast`} is niet beschikbaar bij deze aanbieder.
              Beschikbaar: {formatPeriodes(provider.beschikbarePeriodes)}.
              Getoond tarief is voor de dichtstbijzijnde periode.
            </p>
          )}
          {provider.voorwaarden?.toelichting && (
            <p className="text-xs text-green-600">{provider.voorwaarden.toelichting}</p>
          )}
          {provider.voorwaarden && (
            <div className="text-xs text-gray-500 space-y-0.5 border-t pt-2">
              {provider.voorwaarden.boetevrijAflossenPercentage != null && (
                <div>Boetevrij aflossen: {provider.voorwaarden.boetevrijAflossenPercentage}%</div>
              )}
              {provider.voorwaarden.verhuisregeling != null && (
                <div>Verhuisregeling: {provider.voorwaarden.verhuisregeling ? 'Ja' : 'Nee'}</div>
              )}
              {provider.voorwaarden.ophogenMogelijk != null && (
                <div>Ophogen mogelijk: {provider.voorwaarden.ophogenMogelijk ? 'Ja' : 'Nee'}</div>
              )}
              {provider.voorwaarden.betaalpauze != null && (
                <div>Betaalpauze: {provider.voorwaarden.betaalpauze ? 'Ja' : 'Nee'}</div>
              )}
            </div>
          )}
          {laatstBijgewerkt && (
            <p className="text-xs text-gray-400">
              Tarieven van{' '}
              {new Date(laatstBijgewerkt).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
