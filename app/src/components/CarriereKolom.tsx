import { config } from '../lib/config-loader';
import type { JaarSituatie } from '../lib/berekeningen';
import { formatBedrag } from '../lib/formatters';
import Tooltip from './Tooltip';

interface ScheidingResultaat {
  jarenTotScheiding: number;
  restschuldBijScheiding: number;
  woningwaardeBijScheiding: number;
  overwaardebruto: number;
  verkoopprijs: number;
  verkoopKostenDetail: {
    verkoopkorting: number;
    makelaarskosten: number;
    stylingFotos: number;
    energielabel: number;
    notarisRoyement: number;
    kadaster: number;
    opknappen: number;
    maxBoeterente: number;
  };
  verkoopKostenTotaal: number;
  overwaardeNetto: number;
  boetevrijPercentage: number;
  resterendeRentevasteJaren: number;
  providerNaam: string;
  jijInleg: number;
  partnerInleg: number;
  vorderingJij: number;
  jijKrijgt: number;
  partnerKrijgt: number;
}

interface CarriereKolomProps {
  // Huishouden
  heeftPartner: boolean;
  setHeeftPartner: (b: boolean) => void;

  // Inkomen
  brutoJaarJij: number;
  setBrutoJaarJij: (n: number) => void;
  brutoJaarPartner: number;
  setBrutoJaarPartner: (n: number) => void;

  // Carrière
  jijMinderWerkenJaar: number | null;
  setJijMinderWerkenJaar: (n: number | null) => void;
  partnerMinderWerkenJaar: number | null;
  setPartnerMinderWerkenJaar: (n: number | null) => void;
  jijUrenNaMinderWerken: number;
  setJijUrenNaMinderWerken: (n: number) => void;
  partnerUrenNaMinderWerken: number;
  setPartnerUrenNaMinderWerken: (n: number) => void;
  promotieJaar: number | null;
  setPromotieJaar: (n: number | null) => void;
  promotieOpslag: number;
  setPromotieOpslag: (n: number) => void;

  // Scheiding
  jarenTotScheiding: number;
  setJarenTotScheiding: (n: number) => void;
  scheidingResultaat: ScheidingResultaat | null;

  // Bekijk jaar
  bekijkJaar: number;
  woningwaarde: number;
  startJaar: number;
  jaren: number[];

  // Berekende situaties
  situatie2026: JaarSituatie;
  situatieBekijkJaar: JaarSituatie;
}

export default function CarriereKolom({
  heeftPartner,
  setHeeftPartner,
  brutoJaarJij,
  setBrutoJaarJij,
  brutoJaarPartner,
  setBrutoJaarPartner,
  jijMinderWerkenJaar,
  setJijMinderWerkenJaar,
  partnerMinderWerkenJaar,
  setPartnerMinderWerkenJaar,
  jijUrenNaMinderWerken,
  setJijUrenNaMinderWerken,
  partnerUrenNaMinderWerken,
  setPartnerUrenNaMinderWerken,
  promotieJaar,
  setPromotieJaar,
  promotieOpslag,
  setPromotieOpslag,
  jarenTotScheiding,
  setJarenTotScheiding,
  scheidingResultaat,
  bekijkJaar,
  woningwaarde,
  startJaar,
  jaren,
  situatie2026,
  situatieBekijkJaar,
}: CarriereKolomProps) {
  return (
    <section aria-label="Carrière & Scenario's" className="space-y-4">
      {/* Inkomen */}
      <fieldset className="bg-emerald-50 p-4 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-emerald-800">Inkomen</h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border overflow-hidden text-xs">
              <button
                onClick={() => setHeeftPartner(false)}
                aria-pressed={!heeftPartner}
                className={`px-2 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${!heeftPartner ? 'bg-emerald-600 text-white font-medium' : 'bg-white hover:bg-gray-50'}`}
              >
                Alleen
              </button>
              <button
                onClick={() => setHeeftPartner(true)}
                aria-pressed={heeftPartner}
                className={`px-2 py-1 transition-colors border-l focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 ${heeftPartner ? 'bg-emerald-600 text-white font-medium' : 'bg-white hover:bg-gray-50'}`}
              >
                Samen
              </button>
            </div>
            {(brutoJaarJij !== config.brutoJaarinkomenJij || (heeftPartner && brutoJaarPartner !== config.brutoJaarinkomenPartner)) && (
              <button
                onClick={() => {
                  setBrutoJaarJij(config.brutoJaarinkomenJij);
                  setBrutoJaarPartner(config.brutoJaarinkomenPartner);
                }}
                className="text-xs text-emerald-600 hover:text-emerald-800"
              >
                Herstel
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-gray-600 text-xs mb-1">Jij bruto/jaar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
              <input
                type="number"
                min={0}
                step={100}
                value={brutoJaarJij}
                onChange={(e) => setBrutoJaarJij(Number(e.target.value))}
                className="w-full p-2 pl-7 border rounded text-sm"
              />
            </div>
          </div>
          {heeftPartner && (
            <div>
              <label className="block text-gray-600 text-xs mb-1">Partner bruto/jaar</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={brutoJaarPartner}
                  onChange={(e) => setBrutoJaarPartner(Number(e.target.value))}
                  className="w-full p-2 pl-7 border rounded text-sm"
                />
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500">
            Toetsinkomen<Tooltip term="toetsinkomen" />: bruto jaarloon incl. vakantiegeld, 13e maand e.d. Jaarlijks 2% geïndexeerd.
          </p>
        </div>

        {/* Berekend inkomen resultaat */}
        <div className="bg-white rounded p-2 text-sm space-y-1 border-t pt-3 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Jij ({situatie2026.jijUren}u/wk):</span>
            <span>{formatBedrag(situatie2026.jijMaandloon)}/mnd</span>
          </div>
          {heeftPartner && (
            <div className="flex justify-between">
              <span className="text-gray-600">Partner ({situatie2026.partnerUren}u/wk):</span>
              <span>{formatBedrag(situatie2026.partnerMaandloon)}/mnd</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-1">
            <span>Totaal bruto/jaar:</span>
            <span>{formatBedrag(situatie2026.totaalBrutoJaar)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Netto beschikbaar:</span>
            <span>{formatBedrag(situatie2026.nettoInkomenMaand)}/mnd</span>
          </div>
        </div>
      </fieldset>

      {/* Carrière & Werk */}
      <fieldset className="bg-green-50 p-4 rounded-lg space-y-3">
        <legend className="font-semibold text-green-800">Carrière & Werk</legend>

        <div>
          <label className="block text-gray-600 text-xs mb-1">Jij: minder gaan werken vanaf</label>
          <select
            value={jijMinderWerkenJaar || ''}
            onChange={(e) => setJijMinderWerkenJaar(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">Niet minder gaan werken</option>
            {jaren.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {jijMinderWerkenJaar && (
          <div className="pl-3 border-l-2 border-green-200">
            <label className="block text-gray-700 mb-1">
              Jouw uren daarna: <span className="font-medium">{jijUrenNaMinderWerken} uur/week</span>
            </label>
            <input
              type="range"
              min={0}
              max={config.jijMaxUren}
              step={1}
              value={jijUrenNaMinderWerken}
              onChange={(e) => setJijUrenNaMinderWerken(Number(e.target.value))}
              className="w-full h-2"
            />
          </div>
        )}

        {heeftPartner && (
          <>
            <div>
              <label className="block text-gray-600 text-xs mb-1">Partner: minder gaan werken vanaf</label>
              <select
                value={partnerMinderWerkenJaar || ''}
                onChange={(e) => setPartnerMinderWerkenJaar(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Niet minder gaan werken</option>
                {jaren.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {partnerMinderWerkenJaar && (
              <div className="pl-3 border-l-2 border-green-200">
                <label className="block text-gray-700 mb-1">
                  Partner uren daarna: <span className="font-medium">{partnerUrenNaMinderWerken} uur/week</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={config.partnerMaxUren}
                  step={1}
                  value={partnerUrenNaMinderWerken}
                  onChange={(e) => setPartnerUrenNaMinderWerken(Number(e.target.value))}
                  className="w-full h-2"
                />
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-gray-600 text-xs mb-1">Jij: promotie/opslag vanaf</label>
          <select
            value={promotieJaar || ''}
            onChange={(e) => setPromotieJaar(e.target.value ? Number(e.target.value) : null)}
            className="w-full p-2 border rounded text-sm"
          >
            <option value="">Geen promotie</option>
            {jaren.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        {promotieJaar && (
          <div className="pl-3 border-l-2 border-green-200">
            <label className="block text-gray-700 mb-1">
              Bruto-opslag: <span className="font-medium">{promotieOpslag}%</span>
            </label>
            <input
              type="range"
              min={5}
              max={30}
              step={1}
              value={promotieOpslag}
              onChange={(e) => setPromotieOpslag(Number(e.target.value))}
              className="w-full h-2"
            />
          </div>
        )}
      </fieldset>

      {/* Scheiding scenario */}
      {heeftPartner && (
      <div className="bg-orange-50 p-4 rounded-lg space-y-3">
        <h2 className="font-semibold text-orange-800">Scheiding scenario</h2>

        <div>
          <label className="block text-gray-700 mb-1">
            {jarenTotScheiding === 0 ? (
              <span className="font-medium">Geen scheiding</span>
            ) : (
              <span>
                Scheiding na <span className="font-medium">{jarenTotScheiding} jaar</span> (
                {startJaar + jarenTotScheiding})
              </span>
            )}
          </label>
          <input
            type="range"
            min={0}
            max={25}
            step={1}
            value={jarenTotScheiding}
            onChange={(e) => setJarenTotScheiding(Number(e.target.value))}
            className="w-full h-2"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Geen</span>
            <span>25 jaar</span>
          </div>
        </div>

        {scheidingResultaat &&
          (() => {
            const s = scheidingResultaat;
            return (
              <div className="bg-white p-3 rounded border text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500">Woningwaarde:</p>
                    <p className="font-medium">{formatBedrag(s.woningwaardeBijScheiding)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Restschuld:</p>
                    <p className="font-medium">{formatBedrag(s.restschuldBijScheiding)}</p>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <p className="text-gray-500">Overwaarde (bruto):</p>
                  <p className="font-medium">{formatBedrag(s.overwaardebruto)}</p>
                </div>

                <details className="border-t pt-2">
                  <summary className="text-orange-700 font-medium cursor-pointer">
                    Verkoopkosten: -{formatBedrag(s.verkoopKostenTotaal)}
                  </summary>
                  <div className="mt-1 space-y-0.5 text-gray-600 pl-2">
                    <div className="flex justify-between">
                      <span>Verkoopkorting (3%, snelle verkoop)</span>
                      <span>-{formatBedrag(s.verkoopKostenDetail.verkoopkorting)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verkoopmakelaar (1,5%)</span>
                      <span>-{formatBedrag(s.verkoopKostenDetail.makelaarskosten)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Styling & foto's</span>
                      <span>-{formatBedrag(s.verkoopKostenDetail.stylingFotos)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energielabel</span>
                      <span>-{formatBedrag(s.verkoopKostenDetail.energielabel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notaris (royement hypotheek)</span>
                      <span>-{formatBedrag(s.verkoopKostenDetail.notarisRoyement)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kadaster</span>
                      <span>-{formatBedrag(s.verkoopKostenDetail.kadaster)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Opknappen/presentabel maken</span>
                      <span>-{formatBedrag(s.verkoopKostenDetail.opknappen)}</span>
                    </div>
                    {s.verkoopKostenDetail.maxBoeterente > 0 && (
                      <div className="flex justify-between text-orange-700">
                        <span>Boeterente<Tooltip term="boeterente" /> (conservatief)*</span>
                        <span>-{formatBedrag(s.verkoopKostenDetail.maxBoeterente)}</span>
                      </div>
                    )}
                  </div>
                  {s.verkoopKostenDetail.maxBoeterente > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1 pl-2">
                      * Conservatieve schatting (aanname marktrente 2%). Boetevrij aflossen: {s.boetevrijPercentage}% (
                      {s.providerNaam}). Nog {s.resterendeRentevasteJaren} jaar rentevast. Werkelijke boete hangt af van
                      marktrente op dat moment.
                    </p>
                  )}
                </details>

                <div className="border-t pt-2">
                  <p className="text-gray-500">Netto overwaarde (na verkoopkosten):</p>
                  <p className={`font-medium text-lg ${s.overwaardeNetto >= 0 ? '' : 'text-red-600'}`}>
                    {formatBedrag(s.overwaardeNetto)}
                  </p>
                </div>

                <div className="border-t pt-2 space-y-1">
                  <p className="text-gray-600 font-medium">Inleg (terugvordering):</p>
                  <div className="flex justify-between">
                    <span>Jij ({config.inlegPercentageJij}%):</span>
                    <span>{formatBedrag(s.jijInleg)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partner ({100 - config.inlegPercentageJij}%):</span>
                    <span>{formatBedrag(s.partnerInleg)}</span>
                  </div>
                </div>

                <div className="border-t pt-2 space-y-1">
                  <p className="text-gray-600 font-medium">Verdeling (inleg terug + 50/50):</p>
                  <div className="flex justify-between text-green-700">
                    <span>Jij ontvangt:</span>
                    <span className="font-bold">{formatBedrag(s.jijKrijgt)}</span>
                  </div>
                  <div className="flex justify-between text-blue-700">
                    <span>Partner ontvangt:</span>
                    <span className="font-bold">{formatBedrag(s.partnerKrijgt)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
      )}

      {/* Vermogen */}
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
