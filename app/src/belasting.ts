// Nederlandse inkomstenbelasting 2026 (Box 1)
// Bron: belastingdienst.nl

export interface BelastingResultaat {
  brutoJaar: number;
  inkomstenbelasting: number;
  algemeenKorting: number;
  arbeidskorting: number;
  nettoJaar: number;
}

// === Box 1 schijven 2026 (jonger dan AOW-leeftijd) ===
const SCHIJF1_GRENS = 38_883;
const SCHIJF1_TARIEF = 0.3575;
const SCHIJF2_GRENS = 78_426;
const SCHIJF2_TARIEF = 0.3756;
const SCHIJF3_TARIEF = 0.4950;

// Maximaal aftrekpercentage eigenwoningregeling 2026
export const HRA_MAX_TARIEF = 0.3756;

function berekenInkomstenbelasting(brutoJaar: number): number {
  if (brutoJaar <= 0) return 0;

  let belasting = Math.min(brutoJaar, SCHIJF1_GRENS) * SCHIJF1_TARIEF;

  if (brutoJaar > SCHIJF1_GRENS) {
    belasting += (Math.min(brutoJaar, SCHIJF2_GRENS) - SCHIJF1_GRENS) * SCHIJF2_TARIEF;
  }

  if (brutoJaar > SCHIJF2_GRENS) {
    belasting += (brutoJaar - SCHIJF2_GRENS) * SCHIJF3_TARIEF;
  }

  return belasting;
}

// === Algemene heffingskorting 2026 ===
const AHK_MAX = 3_115;
const AHK_AFBOUW_START = 29_736;
const AHK_AFBOUW_PERCENTAGE = 0.06398;

function berekenAlgemeneHeffingskorting(verzamelinkomen: number): number {
  if (verzamelinkomen <= AHK_AFBOUW_START) return AHK_MAX;
  if (verzamelinkomen > SCHIJF2_GRENS) return 0;
  return Math.max(0, AHK_MAX - AHK_AFBOUW_PERCENTAGE * (verzamelinkomen - AHK_AFBOUW_START));
}

// === Arbeidskorting 2026 ===
const AK_GRENS1 = 11_965;
const AK_GRENS2 = 25_845;
const AK_GRENS3 = 45_592;
const AK_GRENS4 = 132_920;
const AK_MAX = 5_685;

function berekenArbeidskorting(arbeidsinkomen: number): number {
  if (arbeidsinkomen <= 0) return 0;

  if (arbeidsinkomen <= AK_GRENS1) {
    return arbeidsinkomen * 0.08324;
  }
  if (arbeidsinkomen <= AK_GRENS2) {
    return 996 + (arbeidsinkomen - AK_GRENS1) * 0.31009;
  }
  if (arbeidsinkomen <= AK_GRENS3) {
    return 5_300 + (arbeidsinkomen - AK_GRENS2) * 0.01950;
  }
  if (arbeidsinkomen <= AK_GRENS4) {
    return Math.max(0, AK_MAX - (arbeidsinkomen - AK_GRENS3) * 0.06510);
  }
  return 0;
}

// === Hoofdfuncties ===

export function berekenNettojaar(brutoJaar: number): BelastingResultaat {
  const inkomstenbelasting = berekenInkomstenbelasting(brutoJaar);
  const algemeenKorting = berekenAlgemeneHeffingskorting(brutoJaar);
  const arbeidskorting = berekenArbeidskorting(brutoJaar);

  const teBetalen = Math.max(0, inkomstenbelasting - algemeenKorting - arbeidskorting);
  const nettoJaar = brutoJaar - teBetalen;

  return { brutoJaar, inkomstenbelasting, algemeenKorting, arbeidskorting, nettoJaar };
}

export function berekenHuishoudNettoMaand(jijBrutoJaar: number, partnerBrutoJaar: number): number {
  const jijNetto = berekenNettojaar(jijBrutoJaar);
  const partnerNetto = berekenNettojaar(partnerBrutoJaar);
  return (jijNetto.nettoJaar + partnerNetto.nettoJaar) / 12;
}
