export interface MortgageProvider {
  id: string;
  naam: string;
  bank: string;
  beschikbarePeriodes: number[];

  berekenRente(params: { ltv: number; heeftNHG: boolean; energielabel: string; rentevastePeriode: number }): number;

  afsluitkosten?: number;
  laatstBijgewerkt?: string; // ISO date van laatste data-update
  /** Beschikbare LTV-klassen, bijv. ["nhg","60","70","80","90","100"] */
  beschikbareLtvKlassen?: string[];

  voorwaarden?: {
    boetevrijAflossenPercentage?: number;
    verhuisregeling?: boolean;
    ophogenMogelijk?: boolean;
    betaalpauze?: boolean;
    toelichting?: string;
  };
}
