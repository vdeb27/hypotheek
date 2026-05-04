const STORAGE_KEY = 'hypotheek-calc-v1';

export interface OpgeslagenState {
  spaargeldJij?: number;
  spaargeldPartner?: number;
  inlegPercentageJij?: number;
  woningwaarde?: number;
  buffer?: number;
  hypotheekType?: string;
  hypotheekProduct?: string;
  energielabel?: string;
  rentevastePeriode?: number;
  heeftPartner?: boolean;
  brutoJaarJij?: number;
  brutoJaarPartner?: number;
  jijUrenNaMinderWerken?: number;
  partnerUrenNaMinderWerken?: number;
  promotieOpslag?: number;
  jijMinderWerkenJaar?: number | null;
  partnerMinderWerkenJaar?: number | null;
  promotieJaar?: number | null;
  jarenTotScheiding?: number;
  heeftBouwkundigeKeuring?: boolean;
  heeftAankoopmakelaar?: boolean;
  makelaarsKosten?: number;
  gemeente?: string;
  opstalverzekeringMaand?: number;
  onderhoudspercentage?: number;
  aantalZichtbareJaren?: number;
}

export function laadOpgeslagenState(): OpgeslagenState | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    return json ? (JSON.parse(json) as OpgeslagenState) : null;
  } catch {
    return null;
  }
}

export function slaStateOp(state: OpgeslagenState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage kan uitgeschakeld zijn (privévenster, opslaglimiet)
  }
}
