export function formatBedrag(n: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPercentage(n: number, decimalen = 1): string {
  return `${n.toFixed(decimalen)}%`;
}

export function getWoonquoteKleur(woonquote: number, nibudNorm: number): string {
  if (woonquote > nibudNorm + 5) return 'bg-red-50 border-red-300';
  if (woonquote > nibudNorm) return 'bg-yellow-50 border-yellow-300';
  return 'bg-green-50 border-green-300';
}

export function getWoonquoteTekstKleur(woonquote: number, nibudNorm: number): string {
  if (woonquote > nibudNorm + 5) return 'text-red-600';
  if (woonquote > nibudNorm) return 'text-yellow-600';
  return 'text-green-600';
}
