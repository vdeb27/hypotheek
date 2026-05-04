import { useEffect, useState } from 'react';
import { initProviders } from './providers';
import HypotheekCalculator from './HypotheekCalculator';
import ConfigOnboarding, { type InstellingenWaarden } from './components/ConfigOnboarding';
import { isDefaultConfig } from './lib/config-loader';
import { laadOpgeslagenState, slaStateOp } from './lib/calculator-storage';

function App() {
  const [ready, setReady] = useState(false);
  const [toonLandingspagina, setToonLandingspagina] = useState(() => {
    const opgeslagen = laadOpgeslagenState();
    return isDefaultConfig && !opgeslagen;
  });
  // calcKey zorgt voor een volledige hermontage van de calculator na instellingen-wijziging
  const [calcKey, setCalcKey] = useState(0);

  useEffect(() => {
    initProviders().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <p>Rentetarieven laden...</p>
      </div>
    );
  }

  function handleBegin(waarden: InstellingenWaarden) {
    slaStateOp({
      ...(laadOpgeslagenState() ?? {}),
      heeftPartner: waarden.heeftPartner,
      startJaar: waarden.startJaar,
      jijMaxUren: waarden.jijMaxUren,
      partnerMaxUren: waarden.partnerMaxUren,
    });
    setCalcKey((k) => k + 1);
    setToonLandingspagina(false);
  }

  function handleSlaOver() {
    setCalcKey((k) => k + 1);
    setToonLandingspagina(false);
  }

  if (toonLandingspagina) {
    const huidig = laadOpgeslagenState();
    return (
      <ConfigOnboarding
        huidigeWaarden={huidig ? {
          heeftPartner: huidig.heeftPartner ?? false,
          startJaar: huidig.startJaar ?? new Date().getFullYear(),
          jijMaxUren: huidig.jijMaxUren ?? 40,
          partnerMaxUren: huidig.partnerMaxUren ?? 40,
        } : undefined}
        onBegin={handleBegin}
        onSlaOver={handleSlaOver}
      />
    );
  }

  return (
    <HypotheekCalculator
      key={calcKey}
      onInstellingen={() => setToonLandingspagina(true)}
    />
  );
}

export default App;
