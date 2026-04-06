/** Types voor de gecachte rentedata uit de Hypotheekbond API. */

export interface CachedProduct {
  name: string;
  mortgageType: number; // 6=Annuïteiten, 7=Lineair, 1=Aflossingsvrij
}

export interface CachedProvider {
  providerId: number;
  providerName: string;
  labelId: number;
  labelName: string;
  hasAutoRiskClassReduction: boolean;
  products: CachedProduct[];
  /**
   * Rentes per energielabel+LTV-klasse per rentevaste periode (in maanden).
   * Key = "A:nhg" | "A:60" | "B:80" | "C:100" etc.
   * Value = { 0: 3.25, 60: 3.54, 120: 3.88, ... }
   */
  rates: Record<string, Record<number, number | null>>;
  logoUrl?: string;
}

export interface RatesCache {
  fetchedAt: string; // ISO date
  providers: CachedProvider[];
}
