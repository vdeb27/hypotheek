import type { GemeenteTarieven } from '../gemeente-tarieven';
import type { JaarSituatie } from '../lib/berekeningen';
import { formatBedrag, formatPercentage, getWoonquoteKleur, getWoonquoteTekstKleur } from '../lib/formatters';
import Tooltip from './Tooltip';

interface UitkomstenKolomProps {
  heeftPartner: boolean;
  woningwaarde: number;
  startJaar: number;
  bekijkJaar: number;
  gemeenteData: GemeenteTarieven;
  opstalverzekeringMaand: number;
  onderhoudspercentage: number;

  // Toggle state
  toonRenteDetail: boolean;
  setToonRenteDetail: (b: boolean) => void;
  toonWoonlastenDetail: boolean;
  setToonWoonlastenDetail: (b: boolean) => void;

  // Berekende waarden
  hypotheekBedrag: number;
  hypotheekMogelijk: boolean;
  inlegWaarschuwingJij: boolean;
  inlegWaarschuwingPartner: boolean;
  bijdrageJij: number;
  bijdragePartner: number;
  spaargeldJij: number;
  spaargeldPartner: number;
  inlegPercentageJij: number;
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

export default function UitkomstenKolom({
  heeftPartner,
  woningwaarde,
  startJaar,
  bekijkJaar,
  gemeenteData,
  opstalverzekeringMaand,
  onderhoudspercentage,
  toonRenteDetail,
  setToonRenteDetail,
  toonWoonlastenDetail,
  setToonWoonlastenDetail,
  hypotheekBedrag,
  hypotheekMogelijk,
  inlegWaarschuwingJij,
  inlegWaarschuwingPartner,
  bijdrageJij,
  bijdragePartner,
  spaargeldJij,
  spaargeldPartner,
  inlegPercentageJij,
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
}: UitkomstenKolomProps) {
  return (
    <section aria-label="Uitkomsten" className="space-y-4">
      {/* Blok 4a: Hypotheek samenvatting */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
        <h2 className="font-semibold text-gray-800 mb-3">Hypotheek</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-lg font-bold">
            <span>Hypotheekbedrag:</span>
            <span>{formatBedrag(hypotheekBedrag)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>LTV<Tooltip term="ltv" />: {formatPercentage(ltv, 1)}</span>
          </div>
        </div>
      </div>

      {/* Waarschuwingen */}
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
              ? `Het inlegpercentage (${inlegPercentageJij}% / ${100 - inlegPercentageJij}%) past niet bij het beschikbare spaargeld:`
              : 'Je spaargeld is onvoldoende voor de benodigde inleg:'}
          </p>
          <ul className="text-yellow-800 text-sm mt-1 list-disc list-inside">
            {inlegWaarschuwingJij && (
              <li>
                Jij moet {formatBedrag(bijdrageJij)} inleggen, maar hebt {formatBedrag(spaargeldJij)} spaargeld
                (tekort: {formatBedrag(bijdrageJij - spaargeldJij)})
              </li>
            )}
            {heeftPartner && inlegWaarschuwingPartner && (
              <li>
                Partner moet {formatBedrag(bijdragePartner)} inleggen, maar heeft{' '}
                {formatBedrag(spaargeldPartner)} spaargeld (tekort:{' '}
                {formatBedrag(bijdragePartner - spaargeldPartner)})
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Blok 4b: Rente over de Looptijd */}
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

          {/* Vergelijkingstabel ±0.2% */}
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

          {/* Rente per 5-jaars periode */}
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

      {/* Blok 4c: Woonlasten */}
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

          {/* Bijkomende lasten */}
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

      {/* Blok 4d: Vermogen */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <h2 className="font-semibold text-gray-800">Vermogen {bekijkJaar}</h2>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-600">Woningwaarde:</span>
            <span>{formatBedrag(situatieBekijkJaar.woningwaardeNu)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Restschuld:</span>
            <span>-{formatBedrag(situatieBekijkJaar.restschuld)}</span>
          </div>
          <div className="flex justify-between font-bold text-green-700 border-t pt-1">
            <span>Eigen vermogen:</span>
            <span className="text-lg">{formatBedrag(situatieBekijkJaar.eigenVermogen)}</span>
          </div>
        </div>
        <div className="bg-white rounded p-2 text-xs space-y-1 mt-2">
          <div className="flex justify-between text-gray-500">
            <span>Afgelost sinds {startJaar}:</span>
            <span>{formatBedrag(situatieBekijkJaar.totaalAfgelost)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Waardestijging (3%/jaar):</span>
            <span>+{formatBedrag(situatieBekijkJaar.woningwaardeNu - woningwaarde)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
