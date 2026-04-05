import type { WaterschapTarieven } from '../gemeente-tarieven';
import { berekenHuishoudNettoMaand, HRA_MAX_TARIEF } from '../belasting';
import { berekenWaterschapJaar } from '../gemeente-tarieven';
import {
  LOOPTIJD_JAREN,
  LOOPTIJD_MAANDEN,
  MAANDEN_PER_RENTEPERIODE,
  LOONINDEXATIE,
  WONING_INDEXATIE,
  EIGENWONINGFORFAIT_PERCENTAGE,
} from '../constants';

// Bereken totale rente over de looptijd (pure functie)
export function berekenTotaleRente(
  hypotheekBedrag: number,
  rentePercentage: number,
  looptijdJaren: number,
  hypotheekType: string,
): {
  totaleRente: number;
  totaleBetalingen: number;
  rentePerPeriode: { jaren: number; rente: number }[];
} {
  const maandRente = rentePercentage / 100 / 12;
  const aantalMaanden = looptijdJaren * 12;
  let totaleRente = 0;
  let restschuld = hypotheekBedrag;
  const rentePerPeriode: { jaren: number; rente: number }[] = [];
  let periodeRente = 0;

  for (let maand = 1; maand <= aantalMaanden; maand++) {
    const renteDezeM = restschuld * maandRente;
    totaleRente += renteDezeM;
    periodeRente += renteDezeM;

    if (hypotheekType === 'annuitair') {
      const annuiteitFactor =
        (maandRente * Math.pow(1 + maandRente, aantalMaanden)) / (Math.pow(1 + maandRente, aantalMaanden) - 1);
      const maandlast = hypotheekBedrag * annuiteitFactor;
      const aflossing = maandlast - renteDezeM;
      restschuld -= aflossing;
    } else {
      restschuld -= hypotheekBedrag / aantalMaanden;
    }

    if (maand % MAANDEN_PER_RENTEPERIODE === 0) {
      rentePerPeriode.push({ jaren: maand / 12, rente: periodeRente });
      periodeRente = 0;
    }
  }

  return { totaleRente, totaleBetalingen: hypotheekBedrag + totaleRente, rentePerPeriode };
}

// Context voor jaarlijkse berekening (pure functie)
export interface JaarContext {
  startJaar: number;
  brutoJaarJij: number;
  brutoJaarPartner: number;
  promotieJaar: number | null;
  promotieOpslag: number;
  jijMinderWerkenJaar: number | null;
  partnerMinderWerkenJaar: number | null;
  jijUrenNaMinderWerken: number;
  partnerUrenNaMinderWerken: number;
  jijMaxUren: number;
  partnerMaxUren: number;
  woningwaarde: number;
  hypotheekType: string;
  gemeenteData: {
    ozbPercentage: number;
    rioolheffingJaar: number;
    afvalstoffenheffingJaar: number;
    waterschap: WaterschapTarieven;
  };
  opstalverzekeringMaand: number;
  onderhoudspercentage: number;
}

export function berekenJaarSituatiePure(jaar: number, hypotheekBedrag: number, rente: number, ctx: JaarContext) {
  const jarenSindsStart = jaar - ctx.startJaar;

  const indexering = Math.pow(1 + LOONINDEXATIE, jarenSindsStart);

  let jijBasis = ctx.brutoJaarJij * indexering;
  const partnerBasis = ctx.brutoJaarPartner * indexering;

  // Promotie-opslag
  if (ctx.promotieJaar && jaar >= ctx.promotieJaar) {
    jijBasis *= 1 + ctx.promotieOpslag / 100;
  }

  // Werkuren aanpassen indien minder werken
  const jijWerktMinder = ctx.jijMinderWerkenJaar && jaar >= ctx.jijMinderWerkenJaar;
  const partnerWerktMinder = ctx.partnerMinderWerkenJaar && jaar >= ctx.partnerMinderWerkenJaar;
  const jijUren = jijWerktMinder ? ctx.jijUrenNaMinderWerken : ctx.jijMaxUren;
  const partnerUren = partnerWerktMinder ? ctx.partnerUrenNaMinderWerken : ctx.partnerMaxUren;

  // Bruto inkomen naar rato van uren
  const jijBrutoJaar = jijBasis * (jijUren / ctx.jijMaxUren);
  const partnerBrutoJaar = partnerBasis * (partnerUren / ctx.partnerMaxUren);
  const jijMaandloon = jijBrutoJaar / 12;
  const partnerMaandloon = partnerBrutoJaar / 12;

  const totaalBrutoJaar = jijBrutoJaar + partnerBrutoJaar;

  // === HYPOTHEEK & WOONLASTEN ===
  const totaalAfgelost = (hypotheekBedrag / LOOPTIJD_JAREN) * jarenSindsStart;
  const restschuld = hypotheekBedrag - totaalAfgelost;
  const woningwaardeNu = ctx.woningwaarde * Math.pow(1 + WONING_INDEXATIE, jarenSindsStart);

  // Eigenwoningforfait (0.35% van WOZ-waarde)
  const eigenwoningforfait = woningwaardeNu * EIGENWONINGFORFAIT_PERCENTAGE;

  const hraPercentage = HRA_MAX_TARIEF;

  // Maandelijkse rente en aflossing
  const maandRente = rente / 100 / 12;
  let brutoMaandlast: number;

  if (ctx.hypotheekType === 'annuitair') {
    const annuiteitFactor =
      (maandRente * Math.pow(1 + maandRente, LOOPTIJD_MAANDEN)) / (Math.pow(1 + maandRente, LOOPTIJD_MAANDEN) - 1);
    brutoMaandlast = hypotheekBedrag * annuiteitFactor;
  } else {
    const maandAflossing = hypotheekBedrag / LOOPTIJD_MAANDEN;
    brutoMaandlast = maandAflossing + restschuld * maandRente;
  }

  // Netto maandlast na hypotheekrenteaftrek
  const jaarlijkseRente = restschuld * (rente / 100);
  const hraVoordeel = Math.max(0, jaarlijkseRente * hraPercentage - eigenwoningforfait * hraPercentage) / 12;
  const nettoMaandlast = brutoMaandlast - hraVoordeel;

  // Eigen vermogen
  const eigenVermogen = woningwaardeNu - restschuld;

  // Netto inkomen (progressieve belasting + heffingskortingen, per persoon)
  const nettoInkomenMaand = berekenHuishoudNettoMaand(jijBrutoJaar, partnerBrutoJaar);

  // === EXTRA WOONLASTEN ===
  const ozbJaar = woningwaardeNu * (ctx.gemeenteData.ozbPercentage / 100);
  const waterschapJaar = berekenWaterschapJaar(ctx.gemeenteData.waterschap, woningwaardeNu);
  const gemeentelijkeLastenJaar =
    ozbJaar + waterschapJaar + ctx.gemeenteData.rioolheffingJaar + ctx.gemeenteData.afvalstoffenheffingJaar;

  const verzekeringenJaar = ctx.opstalverzekeringMaand * 12;
  const onderhoudJaar = woningwaardeNu * (ctx.onderhoudspercentage / 100);

  const bijkomendeLastenJaar = gemeentelijkeLastenJaar + verzekeringenJaar + onderhoudJaar;
  const bijkomendeLastenMaand = bijkomendeLastenJaar / 12;

  const totaleWoonlastenBrutoMaand = brutoMaandlast + bijkomendeLastenMaand;
  const totaleWoonlastenNettoMaand = nettoMaandlast + bijkomendeLastenMaand;

  // Woonquotes
  const woonquoteBruto = ((brutoMaandlast * 12) / totaalBrutoJaar) * 100;
  const woonquoteNetto = (nettoMaandlast / nettoInkomenMaand) * 100;
  const woonquoteTotaalBruto = ((totaleWoonlastenBrutoMaand * 12) / totaalBrutoJaar) * 100;
  const woonquoteTotaalNetto = (totaleWoonlastenNettoMaand / nettoInkomenMaand) * 100;

  const nibudNorm = totaalBrutoJaar > 100000 ? 24 : totaalBrutoJaar > 70000 ? 26 : 28;

  return {
    jijMaandloon,
    partnerMaandloon,
    jijUren,
    partnerUren,
    totaalBrutoJaar,
    nettoInkomenMaand,
    brutoMaandlast,
    nettoMaandlast,
    hraPercentage,
    eigenwoningforfait,
    jaarlijkseRente,
    ozbJaar,
    waterschapJaar,
    gemeentelijkeLastenJaar,
    verzekeringenJaar,
    onderhoudJaar,
    bijkomendeLastenMaand,
    totaleWoonlastenBrutoMaand,
    totaleWoonlastenNettoMaand,
    restschuld,
    woningwaardeNu,
    eigenVermogen,
    totaalAfgelost,
    woonquoteBruto,
    woonquoteNetto,
    woonquoteTotaalBruto,
    woonquoteTotaalNetto,
    nibudNorm,
  };
}

export type JaarSituatie = ReturnType<typeof berekenJaarSituatiePure>;
