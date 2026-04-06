const MS_PER_DAG = 1000 * 60 * 60 * 24;

export function isTariefVerouderd(laatstBijgewerkt: string | null, maxDagen = 14): boolean {
  if (!laatstBijgewerkt) return true;
  const leeftijdMs = Date.now() - new Date(laatstBijgewerkt).getTime();
  return leeftijdMs > maxDagen * MS_PER_DAG;
}

export function dagenOud(laatstBijgewerkt: string | null): number | null {
  if (!laatstBijgewerkt) return null;
  return Math.floor((Date.now() - new Date(laatstBijgewerkt).getTime()) / MS_PER_DAG);
}
