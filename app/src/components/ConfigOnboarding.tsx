import { useState } from 'react';

export interface InstellingenWaarden {
  heeftPartner: boolean;
  startJaar: number;
  jijMaxUren: number;
  partnerMaxUren: number;
}

interface ConfigOnboardingProps {
  huidigeWaarden?: InstellingenWaarden;
  onBegin: (waarden: InstellingenWaarden) => void;
  onSlaOver: () => void;
}

export default function ConfigOnboarding({ huidigeWaarden, onBegin, onSlaOver }: ConfigOnboardingProps) {
  const huidigJaar = new Date().getFullYear();
  const [heeftPartner, setHeeftPartner] = useState(huidigeWaarden?.heeftPartner ?? false);
  const [startJaar, setStartJaar] = useState(huidigeWaarden?.startJaar ?? huidigJaar);
  const [jijMaxUren, setJijMaxUren] = useState(huidigeWaarden?.jijMaxUren ?? 40);
  const [partnerMaxUren, setPartnerMaxUren] = useState(huidigeWaarden?.partnerMaxUren ?? 40);

  function handleBegin() {
    onBegin({ heeftPartner, startJaar, jijMaxUren, partnerMaxUren });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 space-y-6">

        {/* Intro */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hypotheek Scenario Calculator</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Reken door wat een hypotheek werkelijk kost: maandlasten, kosten koper, het effect van
            parttime werken of promotie, en wat er overblijft bij verkoop. Met actuele rentetarieven
            van 100+ hypotheekproducten.
          </p>
        </div>

        {/* Privacy */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Privacy:</span> Alle gegevens worden alleen in jouw
            browser opgeslagen. Er gaan geen gegevens naar de server of naar de ontwikkelaar.
          </p>
        </div>

        {/* Basisinstellingen */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-700">Stel je situatie in</h2>

          {/* Alleen / Samen */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">Koop je alleen of samen?</label>
            <div className="flex rounded-md border overflow-hidden w-fit text-sm">
              <button
                type="button"
                aria-pressed={!heeftPartner}
                onClick={() => setHeeftPartner(false)}
                className={`px-4 py-2 transition-colors ${!heeftPartner ? 'bg-blue-600 text-white font-medium' : 'bg-white hover:bg-gray-50'}`}
              >
                Alleen
              </button>
              <button
                type="button"
                aria-pressed={heeftPartner}
                onClick={() => setHeeftPartner(true)}
                className={`px-4 py-2 transition-colors border-l ${heeftPartner ? 'bg-blue-600 text-white font-medium' : 'bg-white hover:bg-gray-50'}`}
              >
                Samen
              </button>
            </div>
          </div>

          {/* Aankoopmaar */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              In welk jaar koop je (naar verwachting)?
            </label>
            <input
              type="number"
              min={huidigJaar}
              max={huidigJaar + 10}
              value={startJaar}
              onChange={(e) => setStartJaar(Number(e.target.value))}
              className="w-32 p-2 border rounded text-sm"
            />
          </div>

          {/* Max uren */}
          <div className={`grid gap-3 ${heeftPartner ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Jouw fulltime uren per week
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={jijMaxUren}
                onChange={(e) => setJijMaxUren(Number(e.target.value))}
                className="w-24 p-2 border rounded text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Gebruikt bij minder-werken scenario</p>
            </div>
            {heeftPartner && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Partner fulltime uren per week
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={partnerMaxUren}
                  onChange={(e) => setPartnerMaxUren(Number(e.target.value))}
                  className="w-24 p-2 border rounded text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Gebruikt bij minder-werken scenario</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-2 pt-2">
          <button
            onClick={handleBegin}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Begin met rekenen
          </button>
          <button
            onClick={onSlaOver}
            className="w-full py-2 px-4 text-gray-400 hover:text-gray-600 text-xs transition-colors"
          >
            Sla over — gebruik standaardwaarden
          </button>
        </div>

      </div>
    </div>
  );
}
