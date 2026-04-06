import { gemeenteTarieven } from '../gemeente-tarieven';
import type { GemeenteTarieven } from '../gemeente-tarieven';
import {
  BOUWKUNDIGE_KEURING,
  NHG_GRENS,
  NHG_GRENS_VERDUURZAMING,
  OVERDRACHTSBELASTING_PERCENTAGE,
  STARTERSVRIJSTELLING_GRENS,
} from '../constants';
import { formatBedrag, formatPercentage } from '../lib/formatters';
import Tooltip from './Tooltip';

interface KostenKoperDetail {
  notarisTransport: number;
  notarisHypotheek: number;
  kadaster: number;
  taxatie: number;
  bankgarantie: number;
  bouwkundigeKeuring: number;
  makelaarskosten: number;
  overdrachtsbelasting: number;
}

interface WoningKolomProps {
  // Woning
  woningwaarde: number;
  setWoningwaarde: (n: number) => void;
  energielabel: string;
  setEnergielabel: (s: string) => void;
  gemeente: string;
  setGemeente: (s: string) => void;
  gemeenteData: GemeenteTarieven;

  // Kosten Koper
  heeftBouwkundigeKeuring: boolean;
  setHeeftBouwkundigeKeuring: (b: boolean) => void;
  heeftAankoopmakelaar: boolean;
  setHeeftAankoopmakelaar: (b: boolean) => void;
  makelaarsKosten: number;
  setMakelaarsKosten: (n: number) => void;

  // Woonlasten
  opstalverzekeringMaand: number;
  setOpstalverzekeringMaand: (n: number) => void;
  onderhoudspercentage: number;
  setOnderhoudspercentage: (n: number) => void;
  toonGemeenteTarieven: boolean;
  setToonGemeenteTarieven: (b: boolean) => void;
  toonKostenKoperDetail: boolean;
  setToonKostenKoperDetail: (b: boolean) => void;

  // Berekende waarden
  heeftStartersvrijstelling: boolean;
  heeftNHG: boolean;
  nhgMetVerduurzaming: boolean;
  overdrachtsbelasting: number;
  kostenKoperDetail: KostenKoperDetail;
  kostenKoperBasis: number;
  kostenKoperTotaal: number;
  nhgPremie: number;
  belastingvoordeelKosten: number;
  kostenKoperNetto: number;
  eigenInlegHuis: number;
  hypotheekBedrag: number;
  ltv: number;
}

export default function WoningKolom({
  woningwaarde,
  setWoningwaarde,
  energielabel,
  setEnergielabel,
  gemeente,
  setGemeente,
  gemeenteData,
  heeftBouwkundigeKeuring,
  setHeeftBouwkundigeKeuring,
  heeftAankoopmakelaar,
  setHeeftAankoopmakelaar,
  makelaarsKosten,
  setMakelaarsKosten,
  opstalverzekeringMaand,
  setOpstalverzekeringMaand,
  onderhoudspercentage,
  setOnderhoudspercentage,
  toonGemeenteTarieven,
  setToonGemeenteTarieven,
  toonKostenKoperDetail,
  setToonKostenKoperDetail,
  heeftStartersvrijstelling,
  heeftNHG,
  nhgMetVerduurzaming,
  overdrachtsbelasting,
  kostenKoperDetail,
  kostenKoperBasis,
  kostenKoperTotaal,
  nhgPremie,
  belastingvoordeelKosten,
  kostenKoperNetto,
  eigenInlegHuis,
  hypotheekBedrag,
  ltv,
}: WoningKolomProps) {
  return (
    <section aria-label="Woning" className="space-y-4">
      {/* Fieldset 2a: Woningdetails */}
      <fieldset className="bg-blue-50 p-4 rounded-lg space-y-3">
        <div><legend className="font-semibold text-blue-800">Woningdetails</legend></div>

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
        </div>

        {/* Outputs: Startersvrijstelling, NHG, Overdrachtsbelasting */}
        <div className="bg-white p-3 rounded border text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Startersvrijstelling<Tooltip term="startersvrijstelling" />:</span>
            <span className={heeftStartersvrijstelling ? 'text-green-600' : 'text-red-600'}>
              {heeftStartersvrijstelling
                ? `Ja (${formatBedrag(woningwaarde * OVERDRACHTSBELASTING_PERCENTAGE)} bespaard)`
                : 'Nee'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">NHG<Tooltip term="nhg" />:</span>
            <span className={heeftNHG ? 'text-green-600' : 'text-gray-400'}>
              {heeftNHG ? '✓ Mogelijk' : nhgMetVerduurzaming ? '✓ Met verduurzaming' : '✗ Niet mogelijk'}
            </span>
          </div>
          {overdrachtsbelasting > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Overdrachtsbelasting<Tooltip term="overdrachtsbelasting" /> (2%):</span>
              <span>{formatBedrag(overdrachtsbelasting)}</span>
            </div>
          )}
        </div>

        {/* Gemeentelijke tarieven */}
        <button
          onClick={() => setToonGemeenteTarieven(!toonGemeenteTarieven)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
      </fieldset>

      {/* Fieldset 2b: Kosten Koper */}
      <fieldset className="bg-slate-50 p-4 rounded-lg space-y-3">
        <div><legend className="font-semibold text-slate-800">Kosten Koper</legend></div>

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

        {/* Kosten koper uitsplitsing */}
        <button
          onClick={() => setToonKostenKoperDetail(!toonKostenKoperDetail)}
          className="text-xs text-slate-600 hover:text-slate-800 flex items-center gap-1"
        >
          {toonKostenKoperDetail ? '▼' : '▶'} Bekijk uitsplitsing
        </button>
        {toonKostenKoperDetail && (
          <div className="bg-white rounded p-2 text-xs space-y-1">
            <p className="font-medium text-gray-600 mb-1">Notaris & kadaster:</p>
            <div className="flex justify-between pl-2">
              <span>Transportakte:</span>
              <span>{formatBedrag(kostenKoperDetail.notarisTransport)}</span>
            </div>
            <div className="flex justify-between pl-2">
              <span>Hypotheekakte:</span>
              <span>{formatBedrag(kostenKoperDetail.notarisHypotheek)}</span>
            </div>
            <div className="flex justify-between pl-2">
              <span>Kadaster:</span>
              <span>{formatBedrag(kostenKoperDetail.kadaster)}</span>
            </div>

            <p className="font-medium text-gray-600 mt-2 mb-1">Advies & keuring:</p>
            <div className="flex justify-between pl-2">
              <span>Taxatie:</span>
              <span>{formatBedrag(kostenKoperDetail.taxatie)}</span>
            </div>
            <div className="flex justify-between pl-2">
              <span>Bankgarantie:</span>
              <span>{formatBedrag(kostenKoperDetail.bankgarantie)}</span>
            </div>
            {kostenKoperDetail.bouwkundigeKeuring > 0 && (
              <div className="flex justify-between pl-2">
                <span>Bouwkundige keuring:</span>
                <span>{formatBedrag(kostenKoperDetail.bouwkundigeKeuring)}</span>
              </div>
            )}
            {kostenKoperDetail.makelaarskosten > 0 && (
              <div className="flex justify-between pl-2">
                <span>Aankoopmakelaar:</span>
                <span>{formatBedrag(kostenKoperDetail.makelaarskosten)}</span>
              </div>
            )}

            {overdrachtsbelasting > 0 && (
              <>
                <p className="font-medium text-gray-600 mt-2 mb-1">Belasting:</p>
                <div className="flex justify-between pl-2">
                  <span>Overdrachtsbelasting (2%):</span>
                  <span>{formatBedrag(overdrachtsbelasting)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Kosten koper samenvatting */}
        <div className="bg-white p-3 rounded border text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Kosten koper<Tooltip term="kostenKoper" />:</span>
            <span>{formatBedrag(kostenKoperBasis)}</span>
          </div>
          {heeftNHG && (
            <div className="flex justify-between text-blue-600 text-xs">
              <span>NHG-premie (0.4%):</span>
              <span>{formatBedrag(nhgPremie)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Totaal kosten koper:</span>
            <span>{formatBedrag(kostenKoperTotaal)}</span>
          </div>
          <div className="flex justify-between text-green-600 text-xs">
            <span>- Belastingvoordeel (37%):</span>
            <span>-{formatBedrag(belastingvoordeelKosten)}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Netto kosten koper:</span>
            <span>{formatBedrag(kostenKoperNetto)}</span>
          </div>
        </div>
      </fieldset>

      {/* Fieldset 2c: Woonlasten */}
      <fieldset className="bg-cyan-50 p-4 rounded-lg space-y-3">
        <div><legend className="font-semibold text-cyan-800">Woonlasten</legend></div>

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

      {/* Output-blok 2d: Financiering */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Financiering</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Eigen inleg in huis:</span>
            <span>{formatBedrag(eigenInlegHuis)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Hypotheekbedrag:</span>
            <span>{formatBedrag(hypotheekBedrag)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>LTV<Tooltip term="ltv" />: {formatPercentage(ltv, 1)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
