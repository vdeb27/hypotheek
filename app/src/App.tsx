import { useEffect, useState } from 'react';
import { initProviders } from './providers';
import HypotheekCalculator from './HypotheekCalculator';

function App() {
  const [ready, setReady] = useState(false);

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

  return <HypotheekCalculator />;
}

export default App;
