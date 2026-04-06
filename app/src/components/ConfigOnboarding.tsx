interface ConfigOnboardingProps {
  onGebruikStandaard: () => void;
}

export default function ConfigOnboarding({ onGebruikStandaard }: ConfigOnboardingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hypotheek Scenario Calculator</h1>
          <p className="text-gray-500 mt-1">
            Een tool om hypotheekscenario's door te rekenen bij de aankoop van je eerste huis.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold text-blue-800">Configuratie nodig</h2>
          <p className="text-sm text-blue-700">
            Om de calculator te gebruiken met je eigen gegevens, moet je eerst een configuratiebestand aanmaken.
            Er staat een voorbeeldbestand in de repository dat je kunt kopiëren en aanpassen.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Stappen:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>
              Kopieer het voorbeeldbestand:
              <code className="block mt-1 bg-gray-100 px-3 py-2 rounded text-xs font-mono">
                cp src/user-config.example.json src/user-config.json
              </code>
            </li>
            <li>
              Open <code className="bg-gray-100 px-1 rounded text-xs">src/user-config.json</code> in een teksteditor
            </li>
            <li>
              Vul je eigen gegevens in: woningwaarde, spaargeld, inkomen, gemeente, etc.
            </li>
            <li>
              Sla het bestand op — de calculator herlaadt automatisch
            </li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            <span className="font-medium">Privacy:</span> Je configuratiebestand staat in{' '}
            <code className="bg-green-100 px-1 rounded text-xs">.gitignore</code> en wordt nooit gedeeld.
            Alle berekeningen draaien lokaal in je browser.
          </p>
        </div>

        <button
          onClick={onGebruikStandaard}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
        >
          Gebruik standaardwaarden (voor nu)
        </button>
      </div>
    </div>
  );
}
