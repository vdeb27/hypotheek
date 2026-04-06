import { config } from '../lib/config-loader';
import type { GemeenteTarieven } from '../gemeente-tarieven';
import type { JaarSituatie } from '../lib/berekeningen';
import { OVERDRACHTSBELASTING_PERCENTAGE } from '../constants';
import { formatBedrag, formatPercentage, getWoonquoteKleur, getWoonquoteTekstKleur } from '../lib/formatters';
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

interface ResultatenKolomProps {
  heeftPartner: boolean;
  woningwaarde: number;
  bekijkJaar: number;
  gemeenteData: GemeenteTarieven;
  opstalverzekeringMaand: number;
  onderhoudspercentage: number;

  // Toggle state
  toonKostenKoperDetail: boolean;
  setToonKostenKoperDetail: (b: boolean) => void;
  toonRenteDetail: boolean;
  setToonRenteDetail: (b: boolean) => void;
  toonWoonlastenDetail: boolean;
  setToonWoonlastenDetail: (b: boolean) => void;

  // Berekende waarden
  heeftStartersvrijstelling: boolean;
  overdrachtsbelasting: number;
  kostenKoperBasis: number;
  kostenKoperTotaal: number;
  kostenKoperDetail: KostenKoperDetail;
  nhgPremie: number;
  heeftNHG: boolean;
  aftrekbareKosten: number;
  belastingvoordeelKosten: number;
  kostenKoperNetto: number;
  eigenInlegHuis: number;
  hypotheekBedrag: number;
  hypotheekMogelijk: boolean;
  inlegWaarschuwingJij: boolean;
  inlegWaarschuwingPartner: boolean;
  bijdrageJij: number;
  bijdragePartner: number;
  rente: number;
  ltv: number;

  // Rente over looptijd
  totaleRente30Jaar: number;
  totaleBetalingen30Jaar: number;
  rentePerPeriode: { jaren: number; rente: number }[];
  renteEerste10Jaar: number;
  renteAlsPercentageHoofdsom: number;
  renteLagerPercentage: number;
  renteHogerPercentage: number;
  totaleRenteLager: number;
  totaleRenteHoger: number;
  verschilLager: number;
  verschilHoger: number;

  // Situaties
  situatie2026: JaarSituatie;
  situatieBekijkJaar: JaarSituatie;
  bufferInMaanden: number;
}

export default function ResultatenKolom({
  heeftPartner,
  woningwaarde,
  bekijkJaar,
  gemeenteData,
  opstalverzekeringMaand,
  onderhoudspercentage,
  toonKostenKoperDetail,
  setToonKostenKoperDetail,
  toonRenteDetail,
  setToonRenteDetail,
  toonWoonlastenDetail,
  setToonWoonlastenDetail,
  heeftStartersvrijstelling,
  overdrachtsbelasting,
  kostenKoperBasis,
  kostenKoperTotaal,
  kostenKoperDetail,
  nhgPremie,
  heeftNHG,
  belastingvoordeelKosten,
  kostenKoperNetto,
  eigenInlegHuis,
  hypotheekBedrag,
  hypotheekMogelijk,
  inlegWaarschuwingJij,
  inlegWaarschuwingPartner,
  bijdrageJij,
  bijdragePartner,
  rente,
  ltv,
  totaleRente30Jaar,
  totaleBetalingen30Jaar,
  rentePerPeriode,
  renteEerste10Jaar,
  renteAlsPercentageHoofdsom,
  renteLagerPercentage,
  renteHogerPercentage,
  totaleRenteLager,
  totaleRenteHoger,
  verschilLager,
  verschilHoger,
  situatie2026,
  situatieBekijkJaar,
  bufferInMaanden,
}: ResultatenKolomProps) {
  return (
    <section aria-label="Resultaten" className="space-y-4">
      {/* Kosten & Hypotheek */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Kosten & Hypotheek</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Kosten koper<Tooltip term="kostenKoper" />:</span>
            <span>{formatBedrag(kostenKoperBasis)}</span>
          </div>

          {/* Uitklapbaar: kosten koper detail */}
          <button
            onClick={() => setToonKostenKoperDetail(!toonKostenKoperDetail)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            {toonKostenKoperDetail ? '▼' : '▶'} Bekijk uitsplitsing
          </button>
          {toonKostenKoperDetail && (
            <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
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
                    <span>Overdrachtsbelasting<Tooltip term="overdrachtsbelasting" /> (2%):</span>
                    <span>{formatBedrag(overdrachtsbelasting)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {heeftNHG && (
            <div className="flex justify-between text-blue-600">
              <span>NHG-premie<Tooltip term="nhg" /> (0.4%):</span>
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
          <div className="flex justify-between">
            <span className="text-gray-600">Startersvrijstelling<Tooltip term="startersvrijstelling" />:</span>
            <span className={heeftStartersvrijstelling ? 'text-green-600' : 'text-red-600'}>
              {heeftStartersvrijstelling
                ? `Ja (${formatBedrag(woningwaarde * OVERDRACHTSBELASTING_PERCENTAGE)} bespaard)`
                : 'Nee'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Eigen inleg in huis:</span>
            <span>{formatBedrag(eigenInlegHuis)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Hypotheekbedrag:</span>
            <span>{formatBedrag(hypotheekBedrag)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>LTV<Tooltip term="ltv" />: {formatPercentage(ltv, 1)}</span>
          </div>
        </div>
      </div>

      {/* Rente over de Looptijd */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
        <h2 className="font-semibold text-amber-800 mb-3">Rente over de Looptijd</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Totaal betaald aan rente:</span>
            <span className="font-bold text-amber-700">{formatBedrag(totaleRente30Jaar)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Rente als % van hoofdsom:</span>
            <span>{formatPercentage(renteAlsPercentageHoofdsom, 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Totaal betaald (30 jaar):</span>
            <span>{formatBedrag(totaleBetalingen30Jaar)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              ≈ {(totaleRente30Jaar / situatie2026.totaalBrutoJaar).toFixed(1)} jaarsalarissen aan rente
            </span>
          </div>

          {/* Vergelijkingstabel */}
          <div className="border-t pt-2 mt-2">
            <p className="text-xs text-gray-500 mb-2">Vergelijking ±0.2% rente:</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1"></th>
                  <th className="text-right py-1 text-green-600">−0.2%</th>
                  <th className="text-right py-1 font-bold">Huidig</th>
                  <th className="text-right py-1 text-red-600">+0.2%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-1 text-gray-600">Rente</td>
                  <td className="text-right text-green-600">{formatPercentage(renteLagerPercentage, 2)}</td>
                  <td className="text-right font-bold">{formatPercentage(rente, 2)}</td>
                  <td className="text-right text-red-600">{formatPercentage(renteHogerPercentage, 2)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-600">Totale rente</td>
                  <td className="text-right text-green-600">{formatBedrag(totaleRenteLager)}</td>
                  <td className="text-right font-bold">{formatBedrag(totaleRente30Jaar)}</td>
                  <td className="text-right text-red-600">{formatBedrag(totaleRenteHoger)}</td>
                </tr>
                <tr className="border-t">
                  <td className="py-1 text-gray-600">Verschil</td>
                  <td className="text-right text-green-700 font-medium">−{formatBedrag(verschilLager)}</td>
                  <td className="text-right">—</td>
                  <td className="text-right text-red-700 font-medium">+{formatBedrag(verschilHoger)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Uitklapbaar: detail per periode */}
          <button
            onClick={() => setToonRenteDetail(!toonRenteDetail)}
            className="text-xs text-amber-600 hover:text-amber-800 mt-2 flex items-center gap-1"
          >
            {toonRenteDetail ? '▼' : '▶'} Rente per 5-jaars periode
          </button>
          {toonRenteDetail && (
            <div className="bg-white rounded p-2 text-xs space-y-1 mt-1">
              {rentePerPeriode.map((periode, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-600">
                    Jaar {periode.jaren - 4}-{periode.jaren}:
                  </span>
                  <span>{formatBedrag(periode.rente)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-1 font-medium">
                <span>Eerste 10 jaar:</span>
                <span>{formatBedrag(renteEerste10Jaar)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Woonlasten */}
      <div
        className={`border-2 rounded-lg p-4 ${getWoonquoteKleur(situatieBekijkJaar.woonquoteBruto, situatieBekijkJaar.nibudNorm)}`}
      >
        <h2 className="font-semibold text-gray-800 mb-3">Woonlasten {bekijkJaar}</h2>
        <div className="space-y-2 text-sm">
          {/* Hypotheeklasten */}
          <div className="flex justify-between">
            <span className="text-gray-600">Hypotheek bruto:</span>
            <span>{formatBedrag(situatieBekijkJaar.brutoMaandlast)}/mnd</span>
          </div>
          <div className="flex justify-between text-green-600 text-xs">
            <span>- HRA voordeel<Tooltip term="hra" />:</span>
            <span>
              -
              {formatBedrag(situatieBekijkJaar.brutoMaandlast - situatieBekijkJaar.nettoMaandlast)}
              /mnd
            </span>
          </div>
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Hypotheek netto:</span>
            <span>{formatBedrag(situatieBekijkJaar.nettoMaandlast)}/mnd</span>
          </div>
          {/* Uitklapbaar: Bijkomende lasten */}
          <button
            onClick={() => setToonWoonlastenDetail(!toonWoonlastenDetail)}
            className="text-xs text-cyan-600 hover:text-cyan-800 mt-2 flex items-center gap-1"
          >
            {toonWoonlastenDetail ? '▼' : '▶'} Bijkomende lasten (
            {formatBedrag(situatieBekijkJaar.bijkomendeLastenMaand)}/mnd)
          </button>
          {toonWoonlastenDetail && (
            <div className="bg-white/50 rounded p-2 text-xs space-y-1">
              <div className="flex justify-between">
                <span>OZB ({gemeenteData.ozbPercentage}%):</span>
                <span>{formatBedrag(situatieBekijkJaar.ozbJaar / 12)}/mnd</span>
              </div>
              <div className="flex justify-between">
                <span>Waterschap ({gemeenteData.waterschap.naam}):</span>
                <span>{formatBedrag(situatieBekijkJaar.waterschapJaar / 12)}/mnd</span>
              </div>
              <div className="flex justify-between">
                <span>Riool + afval:</span>
                <span>
                  {formatBedrag((gemeenteData.rioolheffingJaar + gemeenteData.afvalstoffenheffingJaar) / 12)}/mnd
                </span>
              </div>
              <div className="flex justify-between">
                <span>Opstalverzekering:</span>
                <span>{formatBedrag(opstalverzekeringMaand)}/mnd</span>
              </div>
              <div className="flex justify-between">
                <span>Onderhoudsreservering ({onderhoudspercentage}%):</span>
                <span>{formatBedrag(situatieBekijkJaar.onderhoudJaar / 12)}/mnd</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Subtotaal bijkomend:</span>
                <span>{formatBedrag(situatieBekijkJaar.bijkomendeLastenMaand)}/mnd</span>
              </div>
            </div>
          )}

          {/* Totale woonlasten */}
          <div className="flex justify-between font-bold text-lg border-t border-b py-2 mt-2">
            <span>Totaal woonlasten:</span>
            <span>{formatBedrag(situatieBekijkJaar.totaleWoonlastenNettoMaand)}/mnd</span>
          </div>

          {/* Woonquotes */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between font-medium">
              <span>Financieringslast<Tooltip term="woonquote" />:</span>
              <span
                className={`text-lg ${getWoonquoteTekstKleur(situatieBekijkJaar.woonquoteBruto, situatieBekijkJaar.nibudNorm)}`}
              >
                {formatPercentage(situatieBekijkJaar.woonquoteBruto)}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Nibud-norm<Tooltip term="nibudNorm" /> bij dit inkomen + rente:</span>
              <span>{situatieBekijkJaar.nibudNorm}%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Woonquote incl. bijkomende lasten:</span>
              <span>{formatPercentage(situatieBekijkJaar.woonquoteTotaalBruto)}</span>
            </div>
          </div>

          <div className="flex justify-between pt-1">
            <span className="text-gray-600">Buffer dekt:</span>
            <span className="font-medium">{bufferInMaanden.toFixed(1)} maanden</span>
          </div>
        </div>
        <p className="text-xs mt-3" role="status">
          {situatieBekijkJaar.woonquoteBruto > situatieBekijkJaar.nibudNorm + 5
            ? '⚠️ Financieringslast boven Nibud-norm'
            : situatieBekijkJaar.woonquoteBruto > situatieBekijkJaar.nibudNorm
              ? '⚡ Financieringslast op rand van Nibud-norm'
              : '✓ Financieringslast binnen Nibud-norm'}
        </p>
      </div>

      {/* Waarschuwing */}
      {!hypotheekMogelijk && (
        <div role="alert" className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
          <p className="text-red-800 font-medium">
            ⚠️ Met deze buffer houd je niet genoeg over voor de kosten koper. Verhoog de buffer of kies een goedkoper
            huis.
          </p>
        </div>
      )}

      {(inlegWaarschuwingJij || (heeftPartner && inlegWaarschuwingPartner)) && (
        <div role="alert" className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
          <p className="text-yellow-800 font-medium">
            ⚠️ {heeftPartner
              ? `Het inlegpercentage (${config.inlegPercentageJij}% / ${100 - config.inlegPercentageJij}%) past niet bij het beschikbare spaargeld:`
              : 'Je spaargeld is onvoldoende voor de benodigde inleg:'}
          </p>
          <ul className="text-yellow-800 text-sm mt-1 list-disc list-inside">
            {inlegWaarschuwingJij && (
              <li>
                Jij moet {formatBedrag(bijdrageJij)} inleggen, maar heeft {formatBedrag(config.spaargeldJij)} spaargeld
                (tekort: {formatBedrag(bijdrageJij - config.spaargeldJij)})
              </li>
            )}
            {heeftPartner && inlegWaarschuwingPartner && (
              <li>
                Partner moet {formatBedrag(bijdragePartner)} inleggen, maar heeft{' '}
                {formatBedrag(config.spaargeldPartner)} spaargeld (tekort:{' '}
                {formatBedrag(bijdragePartner - config.spaargeldPartner)})
              </li>
            )}
          </ul>
        </div>
      )}
    </section>
  );
}
