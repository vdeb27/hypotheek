import { formatBedrag, formatPercentage, getWoonquoteTekstKleur } from '../lib/formatters';
import type { JaarSituatie } from '../lib/berekeningen';

interface JaarlijkseTabelProps {
  jaren: number[];
  aantalZichtbareJaren: number;
  setAantalZichtbareJaren: (n: number | ((prev: number) => number)) => void;
  bekijkJaar: number;
  setBekijkJaar: (jaar: number) => void;
  berekenJaar: (jaar: number) => JaarSituatie;
}

export default function JaarlijkseTabel({
  jaren,
  aantalZichtbareJaren,
  setAantalZichtbareJaren,
  bekijkJaar,
  setBekijkJaar,
  berekenJaar,
}: JaarlijkseTabelProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h2 className="font-semibold text-gray-800 mb-3">Overzicht per jaar</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b bg-gray-100">
              <th className="text-left p-2">Jaar</th>
              <th className="text-right p-2">Jij</th>
              <th className="text-right p-2">Partner</th>
              <th className="text-right p-2">Bruto/jaar</th>
              <th className="text-right p-2">Fin.last</th>
              <th className="text-right p-2">Woonlasten/jaar</th>
              <th className="text-right p-2">Eigen vermogen</th>
            </tr>
          </thead>
          <tbody>
            {jaren.slice(0, aantalZichtbareJaren).map((jaar) => {
              const situatie = berekenJaar(jaar);
              const isGeselecteerd = jaar === bekijkJaar;

              return (
                <tr
                  key={jaar}
                  className={`border-b cursor-pointer hover:bg-blue-50 transition-colors ${
                    isGeselecteerd ? 'bg-blue-100 font-medium' : ''
                  }`}
                  onClick={() => setBekijkJaar(jaar)}
                >
                  <td className="p-2">{jaar}</td>
                  <td className="text-right p-2">
                    {formatBedrag(situatie.jijMaandloon)}
                    <span className="text-gray-400 text-xs ml-1">({situatie.jijUren}u)</span>
                  </td>
                  <td className="text-right p-2">
                    {formatBedrag(situatie.partnerMaandloon)}
                    <span className="text-gray-400 text-xs ml-1">({situatie.partnerUren}u)</span>
                  </td>
                  <td className="text-right p-2">{formatBedrag(situatie.totaalBrutoJaar)}</td>
                  <td
                    className={`text-right p-2 font-medium ${getWoonquoteTekstKleur(situatie.woonquoteBruto, situatie.nibudNorm)}`}
                  >
                    {formatPercentage(situatie.woonquoteBruto)}
                    <span className="text-gray-400 text-xs font-normal ml-1">(norm {situatie.nibudNorm}%)</span>
                  </td>
                  <td className="text-right p-2">{formatBedrag(situatie.brutoMaandlast * 12)}</td>
                  <td className="text-right p-2 text-green-700 font-medium">
                    {formatBedrag(situatie.eigenVermogen)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {aantalZichtbareJaren < 30 && (
        <button
          onClick={() => setAantalZichtbareJaren((prev: number) => Math.min(prev + 10, 30))}
          className="mt-3 w-full py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200 transition-colors"
        >
          Bekijk meer ({aantalZichtbareJaren === 10 ? 'jaar 11-20' : 'jaar 21-30'})
        </button>
      )}
      {aantalZichtbareJaren > 10 && (
        <button
          onClick={() => setAantalZichtbareJaren(10)}
          className="mt-2 w-full py-1 text-xs text-gray-500 hover:text-gray-700"
        >
          Toon minder
        </button>
      )}
    </div>
  );
}
