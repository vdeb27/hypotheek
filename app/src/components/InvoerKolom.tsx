import type { MortgageProvider } from '../providers';
import { providerGroups, laatstBijgewerkt } from '../providers';
import { getLtvKey } from '../providers/rate-engine';
import { gemeenteTarieven } from '../gemeente-tarieven';
import type { GemeenteTarieven } from '../gemeente-tarieven';
import { BOUWKUNDIGE_KEURING } from '../constants';
import { formatBedrag, formatPercentage } from '../lib/formatters';
import Tooltip from './Tooltip';

interface InvoerKolomProps {
  // Woning & Hypotheek
  woningwaarde: number;
  setWoningwaarde: (n: number) => void;
  buffer: number;
  setBuffer: (n: number) => void;
  hypotheekProduct: string;
  setHypotheekProduct: (s: string) => void;
  hypotheekType: string;
  setHypotheekType: (s: string) => void;
  energielabel: string;
  setEnergielabel: (s: string) => void;
  rentevastePeriode: number;
  setRentevastePeriode: (n: number) => void;
  provider: MortgageProvider;

  // Kosten Koper
  heeftBouwkundigeKeuring: boolean;
  setHeeftBouwkundigeKeuring: (b: boolean) => void;
  heeftAankoopmakelaar: boolean;
  setHeeftAankoopmakelaar: (b: boolean) => void;
  makelaarsKosten: number;
  setMakelaarsKosten: (n: number) => void;

  // Woonlasten
  gemeente: string;
  setGemeente: (s: string) => void;
  gemeenteData: GemeenteTarieven;
  opstalverzekeringMaand: number;
  setOpstalverzekeringMaand: (n: number) => void;
  onderhoudspercentage: number;
  setOnderhoudspercentage: (n: number) => void;
  toonGemeenteTarieven: boolean;
  setToonGemeenteTarieven: (b: boolean) => void;

  // Berekende waarden
  rente: number;
  heeftNHG: boolean;
  ltv: number;
}

export default function InvoerKolom({
  woningwaarde,
  setWoningwaarde,
  buffer,
  setBuffer,
  hypotheekProduct,
  setHypotheekProduct,
  hypotheekType,
  setHypotheekType,
  energielabel,
  setEnergielabel,
  rentevastePeriode,
  setRentevastePeriode,
  provider,
  heeftBouwkundigeKeuring,
  setHeeftBouwkundigeKeuring,
  heeftAankoopmakelaar,
  setHeeftAankoopmakelaar,
  makelaarsKosten,
  setMakelaarsKosten,
  gemeente,
  setGemeente,
  gemeenteData,
  opstalverzekeringMaand,
  setOpstalverzekeringMaand,
  onderhoudspercentage,
  setOnderhoudspercentage,
  toonGemeenteTarieven,
  setToonGemeenteTarieven,
  rente,
  heeftNHG,
  ltv,
}: InvoerKolomProps) {
  return (
    <section aria-label="Invoer" className="space-y-4">
      {/* Woning & Financiën */}
      <fieldset className="bg-blue-50 p-4 rounded-lg space-y-3">
        <legend className="font-semibold text-blue-800">Woning & Hypotheek</legend>

        <div>
          <label className="block text-gray-700 mb-1">
            Woningwaarde: <span className="font-medium">{formatBedrag(woningwaarde)}</span>
          </label>
          <input
            type="range"
            min={400000}
            max={900000}
            step={5000}
            value={woningwaarde}
            onChange={(e) => setWoningwaarde(Number(e.target.value))}
            aria-valuetext={formatBedrag(woningwaarde)}
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-gray-400" aria-hidden="true">
            <span>€400k</span>
            <span className="text-blue-600">€555k (starter)</span>
            <span>€900k</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Buffer<Tooltip term="buffer" /> aanhouden: <span className="font-medium">{formatBedrag(buffer)}</span>
          </label>
          <input
            type="range"
            min={20000}
            max={100000}
            step={5000}
            value={buffer}
            onChange={(e) => setBuffer(Number(e.target.value))}
            aria-valuetext={formatBedrag(buffer)}
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>€20k</span>
            <span>€100k</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-600 text-xs mb-1">Hypotheekproduct</label>
          <select
            value={hypotheekProduct}
            onChange={(e) => setHypotheekProduct(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            {Object.entries(providerGroups)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([bank, bankProviders]) =>
                bankProviders.length === 1 ? (
                  <option key={bankProviders[0].id} value={bankProviders[0].id}>
                    {bankProviders[0].naam}
                  </option>
                ) : (
                  <optgroup key={bank} label={bank}>
                    {bankProviders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.naam.replace(`${bank} — `, '')}
                      </option>
                    ))}
                  </optgroup>
                ),
              )}
          </select>
        </div>

        <div>
          <label className="block text-gray-600 text-xs mb-1">Hypotheektype<Tooltip term="hypotheektype" /></label>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => setHypotheekType('annuitair')}
              aria-pressed={hypotheekType === 'annuitair'}
              className={`flex-1 py-2 px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                hypotheekType === 'annuitair' ? 'bg-blue-600 text-white font-medium' : 'bg-white hover:bg-gray-50'
              }`}
            >
              Annuïtair
            </button>
            <button
              onClick={() => setHypotheekType('lineair')}
              aria-pressed={hypotheekType === 'lineair'}
              className={`flex-1 py-2 px-3 text-sm transition-colors border-l focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                hypotheekType === 'lineair' ? 'bg-blue-600 text-white font-medium' : 'bg-white hover:bg-gray-50'
              }`}
            >
              Lineair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-gray-600 text-xs mb-1">Energielabel<Tooltip term="energielabel" /></label>
            <select
              value={energielabel}
              onChange={(e) => setEnergielabel(e.target.value)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="A">Label A (of hoger)</option>
              <option value="B">Label B</option>
              <option value="C">Label C</option>
              <option value="D">Label D</option>
              <option value="E">Label E</option>
              <option value="F">Label F</option>
              <option value="G">Label G</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-600 text-xs mb-1">Rentevaste periode<Tooltip term="rentevastePeriode" /></label>
            <select
              value={rentevastePeriode}
              onChange={(e) => setRentevastePeriode(Number(e.target.value))}
              className="w-full p-2 border rounded text-sm"
            >
              {(provider.beschikbarePeriodes.length > 0
                ? provider.beschikbarePeriodes
                : [1, 2, 3, 4, 5, 6, 7, 10, 12, 15, 20]
              ).map((p) => (
                <option key={p} value={p}>
                  {p === 0 ? 'Variabel' : `${p} jaar vast`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rente resultaat */}
        <div className="bg-white p-3 rounded border mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Berekende rente:</span>
            <span className="text-xl font-bold text-blue-700">{formatPercentage(rente, 2)}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className={heeftNHG ? 'text-green-600' : 'text-gray-400'}>
              {heeftNHG ? '✓ NHG mogelijk' : '✗ Geen NHG'}
              <Tooltip term="nhg" />
            </span>
            {laatstBijgewerkt && (
              <span className="text-gray-400">
                Tarieven van{' '}
                {new Date(laatstBijgewerkt).toLocaleDateString('nl-NL', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
          {provider.beschikbareLtvKlassen &&
            provider.beschikbareLtvKlassen.length > 0 &&
            !provider.beschikbareLtvKlassen.includes(getLtvKey(ltv, heeftNHG)) && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠ Deze aanbieder is niet beschikbaar bij jouw LTV ({Math.round(ltv)}%). Beschikbaar bij:{' '}
                {provider.beschikbareLtvKlassen.map((k) => (k === 'nhg' ? 'NHG' : `≤${k}%`)).join(', ')}.
              </p>
            )}
          {provider.voorwaarden?.toelichting && (
            <p className="text-xs text-green-600 mt-1">{provider.voorwaarden.toelichting}</p>
          )}
        </div>
      </fieldset>

      {/* Kosten Koper Opties */}
      <fieldset className="bg-slate-50 p-4 rounded-lg space-y-3">
        <legend className="font-semibold text-slate-800">Kosten Koper Opties</legend>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={heeftBouwkundigeKeuring}
            onChange={(e) => setHeeftBouwkundigeKeuring(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-700">Bouwkundige keuring</span>
          <span className="text-gray-400 text-xs">(€{BOUWKUNDIGE_KEURING})</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={heeftAankoopmakelaar}
            onChange={(e) => setHeeftAankoopmakelaar(e.target.checked)}
            className="rounded"
          />
          <span className="text-gray-700">Aankoopmakelaar</span>
        </label>

        {heeftAankoopmakelaar && (
          <div className="pl-6">
            <label className="block text-gray-700 mb-1">
              Kosten makelaar: <span className="font-medium">{formatBedrag(makelaarsKosten)}</span>
            </label>
            <input
              type="range"
              min={2000}
              max={6000}
              step={250}
              value={makelaarsKosten}
              onChange={(e) => setMakelaarsKosten(Number(e.target.value))}
              className="w-full h-2"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>€2.000</span>
              <span>€6.000</span>
            </div>
          </div>
        )}
      </fieldset>

      {/* Woonlasten & Heffingen */}
      <fieldset className="bg-cyan-50 p-4 rounded-lg space-y-3">
        <legend className="font-semibold text-cyan-800">Woonlasten & Heffingen</legend>

        <div>
          <label className="block text-gray-600 text-xs mb-1">Gemeente</label>
          <select
            value={gemeente}
            onChange={(e) => setGemeente(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            {Object.entries(gemeenteTarieven).map(([key, data]) => (
              <option key={key} value={key}>
                {data.naam}
              </option>
            ))}
          </select>
        </div>

        {/* Uitklapbaar: gemeentelijke tarieven */}
        <button
          onClick={() => setToonGemeenteTarieven(!toonGemeenteTarieven)}
          className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
        >
          {toonGemeenteTarieven ? '▼' : '▶'} Gemeentelijke tarieven
        </button>
        {toonGemeenteTarieven && (
          <div className="bg-white rounded p-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span>OZB<Tooltip term="ozb" />:</span>
              <span>{gemeenteData.ozbPercentage}% van WOZ</span>
            </div>
            <div className="flex justify-between">
              <span>Waterschap ({gemeenteData.waterschap.naam}):</span>
              <span>
                {gemeenteData.waterschap.eigenarenPercentage}% +{' '}
                {formatBedrag(
                  gemeenteData.waterschap.ingezetenenJaar +
                    gemeenteData.waterschap.zuiveringPerVE * gemeenteData.waterschap.veMeerpersoons,
                )}
                /jaar
              </span>
            </div>
            <div className="flex justify-between">
              <span>Rioolheffing:</span>
              <span>{formatBedrag(gemeenteData.rioolheffingJaar)}/jaar</span>
            </div>
            <div className="flex justify-between">
              <span>Afvalstoffenheffing:</span>
              <span>{formatBedrag(gemeenteData.afvalstoffenheffingJaar)}/jaar</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-1">
            Opstalverzekering: <span className="font-medium">{formatBedrag(opstalverzekeringMaand)}/mnd</span>
          </label>
          <input
            type="range"
            min={15}
            max={50}
            step={5}
            value={opstalverzekeringMaand}
            onChange={(e) => setOpstalverzekeringMaand(Number(e.target.value))}
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>€15</span>
            <span>€50</span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-1">
            Onderhoudsreservering: <span className="font-medium">{onderhoudspercentage}%</span> van woningwaarde
          </label>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.25}
            value={onderhoudspercentage}
            onChange={(e) => setOnderhoudspercentage(Number(e.target.value))}
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.5%</span>
            <span>2%</span>
          </div>
        </div>
      </fieldset>
    </section>
  );
}
