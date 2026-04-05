import { useState, useMemo } from 'react';
import { providers, providerGroups, laatstBijgewerkt } from './providers';
import { getLtvKey } from './providers/rate-engine';
import config from './user-config';
import { berekenHuishoudNettoMaand, HRA_MAX_TARIEF } from './belasting';
import { gemeenteTarieven, berekenWaterschapJaar } from './gemeente-tarieven';
import {
  LOOPTIJD_JAREN,
  LOOPTIJD_MAANDEN,
  MAANDEN_PER_RENTEPERIODE,
  LOONINDEXATIE,
  WONING_INDEXATIE,
  RENTE_VERGELIJKING_STAP,
  NHG_GRENS,
  NHG_GRENS_VERDUURZAMING,
  NHG_PREMIE_PERCENTAGE,
  EIGENWONINGFORFAIT_PERCENTAGE,
  OVERDRACHTSBELASTING_PERCENTAGE,
  STARTERSVRIJSTELLING_GRENS,
  NOTARIS_TRANSPORTAKTE,
  NOTARIS_HYPOTHEEKAKTE,
  KADASTERKOSTEN,
  TAXATIEKOSTEN,
  BOUWKUNDIGE_KEURING,
  BANKGARANTIE_PERCENTAGE,
  VERKOOP_MAKELAAR_PERCENTAGE,
  VERKOOP_STYLING_FOTOS,
  VERKOOP_ENERGIELABEL,
  VERKOOP_NOTARIS_ROYEMENT,
  VERKOOP_KADASTER,
  VERKOOP_KORTING_PERCENTAGE,
  VERKOOP_OPKNAPPEN,
  AANGENOMEN_BODEM_MARKTRENTE,
} from './constants';

// Bereken totale rente over de looptijd (pure functie)
function berekenTotaleRente(
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
interface JaarContext {
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
    waterschap: import('./gemeente-tarieven').WaterschapTarieven;
  };
  opstalverzekeringMaand: number;
  onderhoudspercentage: number;
}

function berekenJaarSituatiePure(jaar: number, hypotheekBedrag: number, rente: number, ctx: JaarContext) {
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

export default function HypotheekCalculator() {
  // === WONING & HYPOTHEEK ===
  const [woningwaarde, setWoningwaarde] = useState(config.woningwaarde);
  const [buffer, setBuffer] = useState(config.buffer);
  const [hypotheekType, setHypotheekType] = useState('annuitair');
  const [hypotheekProduct, setHypotheekProduct] = useState(() => {
    // Zoek ASN Bespaarhypotheek of neem eerste beschikbare provider
    const asnBespaar = Object.values(providers).find((p) => p.bank === 'ASN Bank' && p.naam.includes('Bespaar'));
    return asnBespaar?.id ?? Object.keys(providers)[0] ?? 'bespaar';
  });
  const [energielabel, setEnergielabel] = useState(config.energielabel);
  const [rentevastePeriode, setRentevastePeriode] = useState(10);

  // === CARRIÈRE & WERK ===
  const [jijMinderWerkenJaar, setJijMinderWerkenJaar] = useState<number | null>(null);
  const [partnerMinderWerkenJaar, setPartnerMinderWerkenJaar] = useState<number | null>(null);
  const [jijUrenNaMinderWerken, setJijUrenNaMinderWerken] = useState(config.jijUrenNaMinderWerken);
  const [partnerUrenNaMinderWerken, setPartnerUrenNaMinderWerken] = useState(config.partnerUrenNaMinderWerken);
  const [promotieJaar, setPromotieJaar] = useState<number | null>(null);
  const [promotieOpslag, setPromotieOpslag] = useState(config.promotieOpslagPercentage);

  // === INKOMEN ===
  const [brutoJaarJij, setBrutoJaarJij] = useState(config.brutoJaarinkomenJij);
  const [brutoJaarPartner, setBrutoJaarPartner] = useState(config.brutoJaarinkomenPartner);

  // === SCENARIO'S ===
  const [jarenTotScheiding, setJarenTotScheiding] = useState(0);
  const [bekijkJaar, setBekijkJaar] = useState(config.startJaar);

  // === UI STATE (uitklapbare secties) ===
  const [toonRenteDetail, setToonRenteDetail] = useState(false);
  const [toonKostenKoperDetail, setToonKostenKoperDetail] = useState(false);
  const [toonWoonlastenDetail, setToonWoonlastenDetail] = useState(false);
  const [toonGemeenteTarieven, setToonGemeenteTarieven] = useState(false);
  const [aantalZichtbareJaren, setAantalZichtbareJaren] = useState(10); // 10, 20, of 30

  // === KOSTEN KOPER OPTIES ===
  const [heeftBouwkundigeKeuring, setHeeftBouwkundigeKeuring] = useState(true); // Default AAN
  const [heeftAankoopmakelaar, setHeeftAankoopmakelaar] = useState(false); // Default UIT
  const [makelaarsKosten, setMakelaarsKosten] = useState(config.makelaarsKosten);

  // === WOONLASTEN OPTIES ===
  const [gemeente, setGemeente] = useState<string>(config.gemeente);
  const [opstalverzekeringMaand, setOpstalverzekeringMaand] = useState(config.opstalverzekeringMaand);
  const [onderhoudspercentage, setOnderhoudspercentage] = useState(0.75); // 0.75% conservatieve vuistregel

  // === AFGELEIDE WAARDEN UIT CONFIG ===
  const startJaar = config.startJaar;
  const totaalSpaargeld = config.spaargeldJij + config.spaargeldPartner;
  const jijInlegRatio = config.inlegPercentageJij / 100;
  const partnerInlegRatio = 1 - jijInlegRatio;

  const gemeenteData = gemeenteTarieven[gemeente];

  // === JAREN ARRAYS ===
  const jaren = Array.from({ length: 30 }, (_, i) => startJaar + i); // 2026-2055 (volledige looptijd)

  // Haal actieve provider op
  const provider = providers[hypotheekProduct];

  // Context voor jaarlijkse berekening (gememoized zodat useMemo niet onnodig herberekent)
  const jaarCtx: JaarContext = useMemo(
    () => ({
      startJaar,
      brutoJaarJij,
      brutoJaarPartner,
      promotieJaar,
      promotieOpslag,
      jijMinderWerkenJaar,
      partnerMinderWerkenJaar,
      jijUrenNaMinderWerken,
      partnerUrenNaMinderWerken,
      jijMaxUren: config.jijMaxUren,
      partnerMaxUren: config.partnerMaxUren,
      woningwaarde,
      hypotheekType,
      gemeenteData,
      opstalverzekeringMaand,
      onderhoudspercentage,
    }),
    [
      startJaar,
      brutoJaarJij,
      brutoJaarPartner,
      promotieJaar,
      promotieOpslag,
      jijMinderWerkenJaar,
      partnerMinderWerkenJaar,
      jijUrenNaMinderWerken,
      partnerUrenNaMinderWerken,
      woningwaarde,
      hypotheekType,
      gemeenteData,
      opstalverzekeringMaand,
      onderhoudspercentage,
    ],
  );

  // === HOOFDBEREKENING ===
  const berekening = useMemo(() => {
    // Kosten koper - gedetailleerde breakdown
    const heeftStartersvrijstelling = woningwaarde <= STARTERSVRIJSTELLING_GRENS;
    const overdrachtsbelasting = heeftStartersvrijstelling ? 0 : woningwaarde * OVERDRACHTSBELASTING_PERCENTAGE;

    // Kosten koper detail
    const kostenKoperDetail = {
      // Notaris & kadaster
      notarisTransport: NOTARIS_TRANSPORTAKTE,
      notarisHypotheek: NOTARIS_HYPOTHEEKAKTE,
      kadaster: KADASTERKOSTEN,

      // Advies & keuring
      taxatie: TAXATIEKOSTEN,
      bankgarantie: Math.round(woningwaarde * BANKGARANTIE_PERCENTAGE),
      bouwkundigeKeuring: heeftBouwkundigeKeuring ? BOUWKUNDIGE_KEURING : 0,
      makelaarskosten: heeftAankoopmakelaar ? makelaarsKosten : 0,

      // Belasting
      overdrachtsbelasting,
    };

    // Bereken totalen
    const kostenKoperVast =
      kostenKoperDetail.notarisTransport +
      kostenKoperDetail.notarisHypotheek +
      kostenKoperDetail.kadaster +
      kostenKoperDetail.taxatie +
      kostenKoperDetail.bankgarantie;

    const kostenKoperOptioneel = kostenKoperDetail.bouwkundigeKeuring + kostenKoperDetail.makelaarskosten;

    const kostenKoperBasis = kostenKoperVast + kostenKoperOptioneel + overdrachtsbelasting;

    // Inleg en hypotheek
    const beschikbaarVoorInleg = totaalSpaargeld - buffer;
    const eigenInlegHuis = Math.max(0, beschikbaarVoorInleg - kostenKoperBasis);
    const hypotheekBedrag = woningwaarde - eigenInlegHuis;

    // NHG - grens geldt voor WONINGWAARDE, niet hypotheekbedrag
    const heeftNHG = woningwaarde <= NHG_GRENS;
    const nhgPremie = heeftNHG ? hypotheekBedrag * NHG_PREMIE_PERCENTAGE : 0;
    const nhgMetVerduurzaming = woningwaarde <= NHG_GRENS_VERDUURZAMING;

    // Totale kosten koper (inclusief NHG-premie)
    const kostenKoperTotaal = kostenKoperBasis + nhgPremie;
    const hypotheekMogelijk = beschikbaarVoorInleg >= kostenKoperTotaal;

    // Waarschuwing als inlegpercentage niet past bij spaargeld per partner
    const bijdrageJij = beschikbaarVoorInleg * jijInlegRatio;
    const bijdragePartner = beschikbaarVoorInleg * partnerInlegRatio;
    const inlegWaarschuwingJij = bijdrageJij > config.spaargeldJij;
    const inlegWaarschuwingPartner = bijdragePartner > config.spaargeldPartner;

    // === BELASTINGVOORDEEL KOSTEN KOPER ===
    // Aftrekbaar zijn: notaris hypotheekakte, taxatie, NHG-premie, bankgarantie (hypotheekgerelateerd)
    const HRA_TARIEF = HRA_MAX_TARIEF;
    const aftrekbareKosten =
      kostenKoperDetail.notarisHypotheek + kostenKoperDetail.taxatie + kostenKoperDetail.bankgarantie + nhgPremie;
    const belastingvoordeelKosten = aftrekbareKosten * HRA_TARIEF;
    const kostenKoperNetto = kostenKoperTotaal - belastingvoordeelKosten;

    // Rente
    const ltv = (hypotheekBedrag / woningwaarde) * 100;
    const rente = provider.berekenRente({ ltv, heeftNHG, energielabel, rentevastePeriode });

    // === TOTALE RENTE BEREKENING ===
    const renteBerekening = berekenTotaleRente(hypotheekBedrag, rente, LOOPTIJD_JAREN, hypotheekType);
    const renteLager = berekenTotaleRente(
      hypotheekBedrag,
      rente - RENTE_VERGELIJKING_STAP,
      LOOPTIJD_JAREN,
      hypotheekType,
    );
    const renteHoger = berekenTotaleRente(
      hypotheekBedrag,
      rente + RENTE_VERGELIJKING_STAP,
      LOOPTIJD_JAREN,
      hypotheekType,
    );

    // Rente eerste 10 jaar
    const renteEerste10Jaar = renteBerekening.rentePerPeriode.slice(0, 2).reduce((sum, p) => sum + p.rente, 0);

    // Verschil berekeningen
    const verschilLager = renteBerekening.totaleRente - renteLager.totaleRente;
    const verschilHoger = renteHoger.totaleRente - renteBerekening.totaleRente;

    // Bereken situatie voor startjaar en bekijkjaar
    const situatie2026 = berekenJaarSituatiePure(startJaar, hypotheekBedrag, rente, jaarCtx);
    const situatieBekijkJaar = berekenJaarSituatiePure(bekijkJaar, hypotheekBedrag, rente, jaarCtx);

    // Buffer in maanden
    const bufferInMaanden = buffer / situatieBekijkJaar.nettoMaandlast;

    // Scheidingsberekening
    let scheidingResultaat = null;
    if (jarenTotScheiding > 0) {
      const afgelostBijScheiding = (hypotheekBedrag / LOOPTIJD_JAREN) * jarenTotScheiding;
      const restschuldBijScheiding = hypotheekBedrag - afgelostBijScheiding;
      const woningwaardeBijScheiding = woningwaarde * Math.pow(1 + WONING_INDEXATIE, jarenTotScheiding);
      const overwaardebruto = woningwaardeBijScheiding - restschuldBijScheiding;

      // Verkoopkosten berekenen
      const verkoopkorting = woningwaardeBijScheiding * VERKOOP_KORTING_PERCENTAGE;
      const verkoopprijs = woningwaardeBijScheiding - verkoopkorting;
      const makelaarskosten = verkoopprijs * VERKOOP_MAKELAAR_PERCENTAGE;

      // Boeterente (conservatief: aanname marktrente daalt naar historisch dieptepunt)
      const boetevrijPercentage = provider.voorwaarden?.boetevrijAflossenPercentage ?? 10;
      const resterendeRentevasteJaren = Math.max(0, rentevastePeriode - jarenTotScheiding);
      const renteVerschil = Math.max(0, rente - AANGENOMEN_BODEM_MARKTRENTE);
      let maxBoeterente = 0;
      if (resterendeRentevasteJaren > 0 && renteVerschil > 0) {
        const boetevrijDeel = (restschuldBijScheiding * boetevrijPercentage) / 100;
        maxBoeterente = (renteVerschil / 100) * (restschuldBijScheiding - boetevrijDeel) * resterendeRentevasteJaren;
      }

      const verkoopKostenDetail = {
        verkoopkorting,
        makelaarskosten,
        stylingFotos: VERKOOP_STYLING_FOTOS,
        energielabel: VERKOOP_ENERGIELABEL,
        notarisRoyement: VERKOOP_NOTARIS_ROYEMENT,
        kadaster: VERKOOP_KADASTER,
        opknappen: VERKOOP_OPKNAPPEN,
        maxBoeterente,
      };

      const verkoopKostenTotaal =
        verkoopkorting +
        makelaarskosten +
        VERKOOP_STYLING_FOTOS +
        VERKOOP_ENERGIELABEL +
        VERKOOP_NOTARIS_ROYEMENT +
        VERKOOP_KADASTER +
        VERKOOP_OPKNAPPEN +
        maxBoeterente;

      const overwaardeNetto = woningwaardeBijScheiding - restschuldBijScheiding - verkoopKostenTotaal;

      // Verdeling: eerst inleg terug (2/3 - 1/3), dan rest 50/50
      const jijInleg = eigenInlegHuis * jijInlegRatio;
      const partnerInleg = eigenInlegHuis * partnerInlegRatio;
      const vorderingJij = jijInleg - partnerInleg; // Vordering die jij hebt op partner

      // Overwaarde na aftrek inleg-verschil, dan 50/50
      const overwaardeNaVordering = overwaardeNetto - vorderingJij;
      const jijKrijgt = vorderingJij + overwaardeNaVordering / 2;
      const partnerKrijgt = overwaardeNaVordering / 2;

      scheidingResultaat = {
        jarenTotScheiding,
        restschuldBijScheiding,
        woningwaardeBijScheiding,
        overwaardebruto,
        verkoopprijs,
        verkoopKostenDetail,
        verkoopKostenTotaal,
        overwaardeNetto,
        boetevrijPercentage,
        resterendeRentevasteJaren,
        providerNaam: provider.naam,
        jijInleg,
        partnerInleg,
        vorderingJij,
        jijKrijgt,
        partnerKrijgt,
      };
    }

    return {
      // Kosten & hypotheek
      heeftStartersvrijstelling,
      overdrachtsbelasting,
      kostenKoperBasis,
      kostenKoperTotaal,
      kostenKoperDetail,
      kostenKoperVast,
      kostenKoperOptioneel,
      aftrekbareKosten,
      belastingvoordeelKosten,
      kostenKoperNetto,
      nhgPremie,
      eigenInlegHuis,
      hypotheekBedrag,
      hypotheekMogelijk,
      inlegWaarschuwingJij,
      inlegWaarschuwingPartner,
      bijdrageJij,
      bijdragePartner,
      heeftNHG,
      nhgMetVerduurzaming,
      rente,
      ltv,

      // Rente over looptijd
      totaleRente30Jaar: renteBerekening.totaleRente,
      totaleBetalingen30Jaar: renteBerekening.totaleBetalingen,
      rentePerPeriode: renteBerekening.rentePerPeriode,
      renteEerste10Jaar,
      renteAlsPercentageHoofdsom: (renteBerekening.totaleRente / hypotheekBedrag) * 100,

      // Rentevergelijking ±0.2%
      renteLagerPercentage: rente - 0.2,
      renteHogerPercentage: rente + 0.2,
      totaleRenteLager: renteLager.totaleRente,
      totaleRenteHoger: renteHoger.totaleRente,
      verschilLager,
      verschilHoger,

      // Situaties
      situatie2026,
      situatieBekijkJaar,

      // Buffer
      bufferInMaanden,

      // Scheiding
      scheidingResultaat,

      // Helper voor jaarlijkse tabel
      berekenJaar: (jaar: number) => berekenJaarSituatiePure(jaar, hypotheekBedrag, rente, jaarCtx),
    };
  }, [
    woningwaarde,
    buffer,
    hypotheekType,
    energielabel,
    rentevastePeriode,
    bekijkJaar,
    jarenTotScheiding,
    heeftBouwkundigeKeuring,
    heeftAankoopmakelaar,
    makelaarsKosten,
    provider,
    startJaar,
    totaalSpaargeld,
    jijInlegRatio,
    partnerInlegRatio,
    jaarCtx,
  ]);

  // === FORMATTERS ===
  const formatBedrag = (n: number) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n);

  const formatPercentage = (n: number, decimalen = 1) => `${n.toFixed(decimalen)}%`;

  // === KLEUREN ===
  const getWoonquoteKleur = (woonquote: number, nibudNorm: number) => {
    if (woonquote > nibudNorm + 5) return 'bg-red-50 border-red-300';
    if (woonquote > nibudNorm) return 'bg-yellow-50 border-yellow-300';
    return 'bg-green-50 border-green-300';
  };

  const getWoonquoteTekstKleur = (woonquote: number, nibudNorm: number) => {
    if (woonquote > nibudNorm + 5) return 'text-red-600';
    if (woonquote > nibudNorm) return 'text-yellow-600';
    return 'text-green-600';
  };

  // === RENDER ===
  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4 text-sm">
      {/* Header */}
      <div className="border-b pb-3">
        <h1 className="text-xl font-bold text-gray-800">Hypotheek Scenario Calculator</h1>
        <p className="text-gray-500 text-xs mt-1">
          {laatstBijgewerkt
            ? `${Object.keys(providers).length} hypotheekproducten · Tarieven van ${new Date(laatstBijgewerkt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'ASN Bank tarieven (fallback)'}{' '}
          · Inclusief NHG-premie, HRA en woningindexatie
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* === KOLOM 1: INVOER WONING & HYPOTHEEK === */}
        <div className="space-y-4">
          {/* Woning & Financiën */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h2 className="font-semibold text-blue-800">Woning & Hypotheek</h2>

            <div>
              <label className="block text-gray-700 mb-1">
                Woningwaarde: <span className="font-medium">{formatBedrag(woningwaarde)}</span>
              </label>
              <input
                type="range"
                min={400000}
                max={700000}
                step={5000}
                value={woningwaarde}
                onChange={(e) => setWoningwaarde(Number(e.target.value))}
                className="w-full h-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>€400k</span>
                <span className="text-blue-600">€555k (starter)</span>
                <span>€700k</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Buffer aanhouden: <span className="font-medium">{formatBedrag(buffer)}</span>
              </label>
              <input
                type="range"
                min={20000}
                max={100000}
                step={5000}
                value={buffer}
                onChange={(e) => setBuffer(Number(e.target.value))}
                className="w-full h-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>€20k</span>
                <span>€100k</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-xs mb-1">Hypotheekproduct</label>
              <select
                value={hypotheekProduct}
                onChange={(e) => setHypotheekProduct(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {Object.entries(providerGroups)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([bank, bankProviders]) =>
                    bankProviders.length === 1 ? (
                      <option key={bankProviders[0].id} value={bankProviders[0].id}>
                        {bankProviders[0].naam}
                      </option>
                    ) : (
                      <optgroup key={bank} label={bank}>
                        {bankProviders.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.naam.replace(`${bank} — `, '')}
                          </option>
                        ))}
                      </optgroup>
                    ),
                  )}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 text-xs mb-1">Hypotheektype</label>
              <div className="flex rounded-lg border overflow-hidden">
                <button
                  onClick={() => setHypotheekType('annuitair')}
                  className={`flex-1 py-2 px-3 text-sm transition-colors ${
                    hypotheekType === 'annuitair' ? 'bg-blue-600 text-white font-medium' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Annuïtair
                </button>
                <button
                  onClick={() => setHypotheekType('lineair')}
                  className={`flex-1 py-2 px-3 text-sm transition-colors border-l ${
                    hypotheekType === 'lineair' ? 'bg-blue-600 text-white font-medium' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Lineair
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-600 text-xs mb-1">Energielabel</label>
                <select
                  value={energielabel}
                  onChange={(e) => setEnergielabel(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="A">Label A (of hoger)</option>
                  <option value="B">Label B</option>
                  <option value="C">Label C</option>
                  <option value="D">Label D</option>
                  <option value="E">Label E</option>
                  <option value="F">Label F</option>
                  <option value="G">Label G</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Rentevaste periode</label>
                <select
                  value={rentevastePeriode}
                  onChange={(e) => setRentevastePeriode(Number(e.target.value))}
                  className="w-full p-2 border rounded text-sm"
                >
                  {(provider.beschikbarePeriodes.length > 0
                    ? provider.beschikbarePeriodes
                    : [1, 2, 3, 4, 5, 6, 7, 10, 12, 15, 20]
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p === 0 ? 'Variabel' : `${p} jaar vast`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rente resultaat */}
            <div className="bg-white p-3 rounded border mt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Berekende rente:</span>
                <span className="text-xl font-bold text-blue-700">{formatPercentage(berekening.rente, 2)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className={berekening.heeftNHG ? 'text-green-600' : 'text-gray-400'}>
                  {berekening.heeftNHG ? '✓ NHG mogelijk' : '✗ Geen NHG'}
                </span>
                {laatstBijgewerkt && (
                  <span className="text-gray-400">
                    Tarieven van{' '}
                    {new Date(laatstBijgewerkt).toLocaleDateString('nl-NL', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              {provider.beschikbareLtvKlassen &&
                provider.beschikbareLtvKlassen.length > 0 &&
                !provider.beschikbareLtvKlassen.includes(getLtvKey(berekening.ltv, berekening.heeftNHG)) && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠ Deze aanbieder is niet beschikbaar bij jouw LTV ({Math.round(berekening.ltv)}%). Beschikbaar bij:{' '}
                    {provider.beschikbareLtvKlassen.map((k) => (k === 'nhg' ? 'NHG' : `≤${k}%`)).join(', ')}.
                  </p>
                )}
              {provider.voorwaarden?.toelichting && (
                <p className="text-xs text-green-600 mt-1">{provider.voorwaarden.toelichting}</p>
              )}
            </div>
          </div>

          {/* Kosten Koper Opties */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-3">
            <h2 className="font-semibold text-slate-800">Kosten Koper Opties</h2>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={heeftBouwkundigeKeuring}
                onChange={(e) => setHeeftBouwkundigeKeuring(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">Bouwkundige keuring</span>
              <span className="text-gray-400 text-xs">(€{BOUWKUNDIGE_KEURING})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={heeftAankoopmakelaar}
                onChange={(e) => setHeeftAankoopmakelaar(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-700">Aankoopmakelaar</span>
            </label>

            {heeftAankoopmakelaar && (
              <div className="pl-6">
                <label className="block text-gray-700 mb-1">
                  Kosten makelaar: <span className="font-medium">{formatBedrag(makelaarsKosten)}</span>
                </label>
                <input
                  type="range"
                  min={2000}
                  max={6000}
                  step={250}
                  value={makelaarsKosten}
                  onChange={(e) => setMakelaarsKosten(Number(e.target.value))}
                  className="w-full h-2"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>€2.000</span>
                  <span>€6.000</span>
                </div>
              </div>
            )}
          </div>

          {/* Woonlasten & Heffingen */}
          <div className="bg-cyan-50 p-4 rounded-lg space-y-3">
            <h2 className="font-semibold text-cyan-800">Woonlasten & Heffingen</h2>

            <div>
              <label className="block text-gray-600 text-xs mb-1">Gemeente</label>
              <select
                value={gemeente}
                onChange={(e) => setGemeente(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                {Object.entries(gemeenteTarieven).map(([key, data]) => (
                  <option key={key} value={key}>
                    {data.naam}
                  </option>
                ))}
              </select>
            </div>

            {/* Uitklapbaar: gemeentelijke tarieven */}
            <button
              onClick={() => setToonGemeenteTarieven(!toonGemeenteTarieven)}
              className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center gap-1"
            >
              {toonGemeenteTarieven ? '▼' : '▶'} Gemeentelijke tarieven
            </button>
            {toonGemeenteTarieven && (
              <div className="bg-white rounded p-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span>OZB:</span>
                  <span>{gemeenteData.ozbPercentage}% van WOZ</span>
                </div>
                <div className="flex justify-between">
                  <span>Waterschap ({gemeenteData.waterschap.naam}):</span>
                  <span>
                    {gemeenteData.waterschap.eigenarenPercentage}% +{' '}
                    {formatBedrag(
                      gemeenteData.waterschap.ingezetenenJaar +
                        gemeenteData.waterschap.zuiveringPerVE * gemeenteData.waterschap.veMeerpersoons,
                    )}
                    /jaar
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Rioolheffing:</span>
                  <span>{formatBedrag(gemeenteData.rioolheffingJaar)}/jaar</span>
                </div>
                <div className="flex justify-between">
                  <span>Afvalstoffenheffing:</span>
                  <span>{formatBedrag(gemeenteData.afvalstoffenheffingJaar)}/jaar</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-1">
                Opstalverzekering: <span className="font-medium">{formatBedrag(opstalverzekeringMaand)}/mnd</span>
              </label>
              <input
                type="range"
                min={15}
                max={50}
                step={5}
                value={opstalverzekeringMaand}
                onChange={(e) => setOpstalverzekeringMaand(Number(e.target.value))}
                className="w-full h-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>€15</span>
                <span>€50</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-1">
                Onderhoudsreservering: <span className="font-medium">{onderhoudspercentage}%</span> van woningwaarde
              </label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.25}
                value={onderhoudspercentage}
                onChange={(e) => setOnderhoudspercentage(Number(e.target.value))}
                className="w-full h-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0.5%</span>
                <span>2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* === KOLOM 2: CARRIÈRE, INKOMEN, SCENARIO'S === */}
        <div className="space-y-4">
          {/* Inkomen */}
          <div className="bg-emerald-50 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-emerald-800">Inkomen</h2>
              {(brutoJaarJij !== config.brutoJaarinkomenJij || brutoJaarPartner !== config.brutoJaarinkomenPartner) && (
                <button
                  onClick={() => {
                    setBrutoJaarJij(config.brutoJaarinkomenJij);
                    setBrutoJaarPartner(config.brutoJaarinkomenPartner);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-800"
                >
                  Herstel standaardwaarden
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-gray-600 text-xs mb-1">Jij bruto/jaar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={brutoJaarJij}
                    onChange={(e) => setBrutoJaarJij(Number(e.target.value))}
                    className="w-full p-2 pl-7 border rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-600 text-xs mb-1">Partner bruto/jaar</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">€</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={brutoJaarPartner}
                    onChange={(e) => setBrutoJaarPartner(Number(e.target.value))}
                    className="w-full p-2 pl-7 border rounded text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Toetsinkomen: bruto jaarloon incl. vakantiegeld, 13e maand e.d. Jaarlijks 2% geïndexeerd.
              </p>
            </div>

            {/* Berekend inkomen resultaat */}
            <div className="bg-white rounded p-2 text-sm space-y-1 border-t pt-3 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Jij ({berekening.situatie2026.jijUren}u/wk):</span>
                <span>{formatBedrag(berekening.situatie2026.jijMaandloon)}/mnd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Partner ({berekening.situatie2026.partnerUren}u/wk):</span>
                <span>{formatBedrag(berekening.situatie2026.partnerMaandloon)}/mnd</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Totaal bruto/jaar:</span>
                <span>{formatBedrag(berekening.situatie2026.totaalBrutoJaar)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Netto beschikbaar:</span>
                <span>{formatBedrag(berekening.situatie2026.nettoInkomenMaand)}/mnd</span>
              </div>
            </div>
          </div>

          {/* Carrière & Werk */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h2 className="font-semibold text-green-800">Carrière & Werk</h2>

            <div>
              <label className="block text-gray-600 text-xs mb-1">Jij: minder gaan werken vanaf</label>
              <select
                value={jijMinderWerkenJaar || ''}
                onChange={(e) => setJijMinderWerkenJaar(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Niet minder gaan werken</option>
                {jaren.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {jijMinderWerkenJaar && (
              <div className="pl-3 border-l-2 border-green-200">
                <label className="block text-gray-700 mb-1">
                  Jouw uren daarna: <span className="font-medium">{jijUrenNaMinderWerken} uur/week</span>
                </label>
                <input
                  type="range"
                  min={16}
                  max={config.jijMaxUren}
                  step={1}
                  value={jijUrenNaMinderWerken}
                  onChange={(e) => setJijUrenNaMinderWerken(Number(e.target.value))}
                  className="w-full h-2"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-600 text-xs mb-1">Partner: minder gaan werken vanaf</label>
              <select
                value={partnerMinderWerkenJaar || ''}
                onChange={(e) => setPartnerMinderWerkenJaar(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Niet minder gaan werken</option>
                {jaren.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {partnerMinderWerkenJaar && (
              <div className="pl-3 border-l-2 border-green-200">
                <label className="block text-gray-700 mb-1">
                  Partner uren daarna: <span className="font-medium">{partnerUrenNaMinderWerken} uur/week</span>
                </label>
                <input
                  type="range"
                  min={16}
                  max={config.partnerMaxUren}
                  step={1}
                  value={partnerUrenNaMinderWerken}
                  onChange={(e) => setPartnerUrenNaMinderWerken(Number(e.target.value))}
                  className="w-full h-2"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-600 text-xs mb-1">Jij: promotie/opslag vanaf</label>
              <select
                value={promotieJaar || ''}
                onChange={(e) => setPromotieJaar(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Geen promotie</option>
                {jaren.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
            </div>

            {promotieJaar && (
              <div className="pl-3 border-l-2 border-green-200">
                <label className="block text-gray-700 mb-1">
                  Bruto-opslag: <span className="font-medium">{promotieOpslag}%</span>
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={1}
                  value={promotieOpslag}
                  onChange={(e) => setPromotieOpslag(Number(e.target.value))}
                  className="w-full h-2"
                />
              </div>
            )}
          </div>

          {/* Scheiding scenario */}
          <div className="bg-orange-50 p-4 rounded-lg space-y-3">
            <h2 className="font-semibold text-orange-800">Scheiding scenario</h2>

            <div>
              <label className="block text-gray-700 mb-1">
                {jarenTotScheiding === 0 ? (
                  <span className="font-medium">Geen scheiding</span>
                ) : (
                  <span>
                    Scheiding na <span className="font-medium">{jarenTotScheiding} jaar</span> (
                    {startJaar + jarenTotScheiding})
                  </span>
                )}
              </label>
              <input
                type="range"
                min={0}
                max={25}
                step={1}
                value={jarenTotScheiding}
                onChange={(e) => setJarenTotScheiding(Number(e.target.value))}
                className="w-full h-2"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Geen</span>
                <span>25 jaar</span>
              </div>
            </div>

            {berekening.scheidingResultaat &&
              (() => {
                const s = berekening.scheidingResultaat;
                return (
                  <div className="bg-white p-3 rounded border text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-500">Woningwaarde:</p>
                        <p className="font-medium">{formatBedrag(s.woningwaardeBijScheiding)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Restschuld:</p>
                        <p className="font-medium">{formatBedrag(s.restschuldBijScheiding)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-2">
                      <p className="text-gray-500">Overwaarde (bruto):</p>
                      <p className="font-medium">{formatBedrag(s.overwaardebruto)}</p>
                    </div>

                    <details className="border-t pt-2">
                      <summary className="text-orange-700 font-medium cursor-pointer">
                        Verkoopkosten: -{formatBedrag(s.verkoopKostenTotaal)}
                      </summary>
                      <div className="mt-1 space-y-0.5 text-gray-600 pl-2">
                        <div className="flex justify-between">
                          <span>Verkoopkorting (3%, snelle verkoop)</span>
                          <span>-{formatBedrag(s.verkoopKostenDetail.verkoopkorting)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verkoopmakelaar (1,5%)</span>
                          <span>-{formatBedrag(s.verkoopKostenDetail.makelaarskosten)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Styling & foto's</span>
                          <span>-{formatBedrag(s.verkoopKostenDetail.stylingFotos)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Energielabel</span>
                          <span>-{formatBedrag(s.verkoopKostenDetail.energielabel)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Notaris (royement hypotheek)</span>
                          <span>-{formatBedrag(s.verkoopKostenDetail.notarisRoyement)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kadaster</span>
                          <span>-{formatBedrag(s.verkoopKostenDetail.kadaster)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Opknappen/presentabel maken</span>
                          <span>-{formatBedrag(s.verkoopKostenDetail.opknappen)}</span>
                        </div>
                        {s.verkoopKostenDetail.maxBoeterente > 0 && (
                          <div className="flex justify-between text-orange-700">
                            <span>Boeterente (conservatief)*</span>
                            <span>-{formatBedrag(s.verkoopKostenDetail.maxBoeterente)}</span>
                          </div>
                        )}
                      </div>
                      {s.verkoopKostenDetail.maxBoeterente > 0 && (
                        <p className="text-[10px] text-gray-400 mt-1 pl-2">
                          * Conservatieve schatting (aanname marktrente 2%). Boetevrij aflossen: {s.boetevrijPercentage}
                          % ({s.providerNaam}). Nog {s.resterendeRentevasteJaren} jaar rentevast. Werkelijke boete hangt
                          af van marktrente op dat moment.
                        </p>
                      )}
                    </details>

                    <div className="border-t pt-2">
                      <p className="text-gray-500">Netto overwaarde (na verkoopkosten):</p>
                      <p className={`font-medium text-lg ${s.overwaardeNetto >= 0 ? '' : 'text-red-600'}`}>
                        {formatBedrag(s.overwaardeNetto)}
                      </p>
                    </div>

                    <div className="border-t pt-2 space-y-1">
                      <p className="text-gray-600 font-medium">Inleg (terugvordering):</p>
                      <div className="flex justify-between">
                        <span>Jij ({config.inlegPercentageJij}%):</span>
                        <span>{formatBedrag(s.jijInleg)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Partner ({100 - config.inlegPercentageJij}%):</span>
                        <span>{formatBedrag(s.partnerInleg)}</span>
                      </div>
                    </div>

                    <div className="border-t pt-2 space-y-1">
                      <p className="text-gray-600 font-medium">Verdeling (inleg terug + 50/50):</p>
                      <div className="flex justify-between text-green-700">
                        <span>Jij ontvangt:</span>
                        <span className="font-bold">{formatBedrag(s.jijKrijgt)}</span>
                      </div>
                      <div className="flex justify-between text-blue-700">
                        <span>Partner ontvangt:</span>
                        <span className="font-bold">{formatBedrag(s.partnerKrijgt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
          </div>

          {/* Vermogen */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h2 className="font-semibold text-gray-800">Vermogen {bekijkJaar}</h2>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Woningwaarde:</span>
                <span>{formatBedrag(berekening.situatieBekijkJaar.woningwaardeNu)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Restschuld:</span>
                <span>-{formatBedrag(berekening.situatieBekijkJaar.restschuld)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-700 border-t pt-1">
                <span>Eigen vermogen:</span>
                <span className="text-lg">{formatBedrag(berekening.situatieBekijkJaar.eigenVermogen)}</span>
              </div>
            </div>
            <div className="bg-white rounded p-2 text-xs space-y-1 mt-2">
              <div className="flex justify-between text-gray-500">
                <span>Afgelost sinds {startJaar}:</span>
                <span>{formatBedrag(berekening.situatieBekijkJaar.totaalAfgelost)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Waardestijging (3%/jaar):</span>
                <span>+{formatBedrag(berekening.situatieBekijkJaar.woningwaardeNu - woningwaarde)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* === KOLOM 3: RESULTATEN === */}
        <div className="space-y-4">
          {/* Kosten & Hypotheek */}
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Kosten & Hypotheek</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kosten koper:</span>
                <span>{formatBedrag(berekening.kostenKoperBasis)}</span>
              </div>

              {/* Uitklapbaar: kosten koper detail */}
              <button
                onClick={() => setToonKostenKoperDetail(!toonKostenKoperDetail)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                {toonKostenKoperDetail ? '▼' : '▶'} Bekijk uitsplitsing
              </button>
              {toonKostenKoperDetail && (
                <div className="bg-gray-50 rounded p-2 text-xs space-y-1">
                  <p className="font-medium text-gray-600 mb-1">Notaris & kadaster:</p>
                  <div className="flex justify-between pl-2">
                    <span>Transportakte:</span>
                    <span>{formatBedrag(berekening.kostenKoperDetail.notarisTransport)}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Hypotheekakte:</span>
                    <span>{formatBedrag(berekening.kostenKoperDetail.notarisHypotheek)}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Kadaster:</span>
                    <span>{formatBedrag(berekening.kostenKoperDetail.kadaster)}</span>
                  </div>

                  <p className="font-medium text-gray-600 mt-2 mb-1">Advies & keuring:</p>
                  <div className="flex justify-between pl-2">
                    <span>Taxatie:</span>
                    <span>{formatBedrag(berekening.kostenKoperDetail.taxatie)}</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Bankgarantie:</span>
                    <span>{formatBedrag(berekening.kostenKoperDetail.bankgarantie)}</span>
                  </div>
                  {berekening.kostenKoperDetail.bouwkundigeKeuring > 0 && (
                    <div className="flex justify-between pl-2">
                      <span>Bouwkundige keuring:</span>
                      <span>{formatBedrag(berekening.kostenKoperDetail.bouwkundigeKeuring)}</span>
                    </div>
                  )}
                  {berekening.kostenKoperDetail.makelaarskosten > 0 && (
                    <div className="flex justify-between pl-2">
                      <span>Aankoopmakelaar:</span>
                      <span>{formatBedrag(berekening.kostenKoperDetail.makelaarskosten)}</span>
                    </div>
                  )}

                  {berekening.overdrachtsbelasting > 0 && (
                    <>
                      <p className="font-medium text-gray-600 mt-2 mb-1">Belasting:</p>
                      <div className="flex justify-between pl-2">
                        <span>Overdrachtsbelasting (2%):</span>
                        <span>{formatBedrag(berekening.overdrachtsbelasting)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {berekening.heeftNHG && (
                <div className="flex justify-between text-blue-600">
                  <span>NHG-premie (0.4%):</span>
                  <span>{formatBedrag(berekening.nhgPremie)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Totaal kosten koper:</span>
                <span>{formatBedrag(berekening.kostenKoperTotaal)}</span>
              </div>
              <div className="flex justify-between text-green-600 text-xs">
                <span>- Belastingvoordeel (37%):</span>
                <span>-{formatBedrag(berekening.belastingvoordeelKosten)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Netto kosten koper:</span>
                <span>{formatBedrag(berekening.kostenKoperNetto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Startersvrijstelling:</span>
                <span className={berekening.heeftStartersvrijstelling ? 'text-green-600' : 'text-red-600'}>
                  {berekening.heeftStartersvrijstelling
                    ? `Ja (${formatBedrag(woningwaarde * OVERDRACHTSBELASTING_PERCENTAGE)} bespaard)`
                    : 'Nee'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Eigen inleg in huis:</span>
                <span>{formatBedrag(berekening.eigenInlegHuis)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Hypotheekbedrag:</span>
                <span>{formatBedrag(berekening.hypotheekBedrag)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>LTV: {formatPercentage(berekening.ltv, 1)}</span>
              </div>
            </div>
          </div>

          {/* Rente over de Looptijd */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <h2 className="font-semibold text-amber-800 mb-3">Rente over de Looptijd</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Totaal betaald aan rente:</span>
                <span className="font-bold text-amber-700">{formatBedrag(berekening.totaleRente30Jaar)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Rente als % van hoofdsom:</span>
                <span>{formatPercentage(berekening.renteAlsPercentageHoofdsom, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Totaal betaald (30 jaar):</span>
                <span>{formatBedrag(berekening.totaleBetalingen30Jaar)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  ≈ {(berekening.totaleRente30Jaar / berekening.situatie2026.totaalBrutoJaar).toFixed(1)} jaarsalarissen
                  aan rente
                </span>
              </div>

              {/* Vergelijkingstabel */}
              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-gray-500 mb-2">Vergelijking ±0.2% rente:</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1"></th>
                      <th className="text-right py-1 text-green-600">−0.2%</th>
                      <th className="text-right py-1 font-bold">Huidig</th>
                      <th className="text-right py-1 text-red-600">+0.2%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1 text-gray-600">Rente</td>
                      <td className="text-right text-green-600">
                        {formatPercentage(berekening.renteLagerPercentage, 2)}
                      </td>
                      <td className="text-right font-bold">{formatPercentage(berekening.rente, 2)}</td>
                      <td className="text-right text-red-600">
                        {formatPercentage(berekening.renteHogerPercentage, 2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 text-gray-600">Totale rente</td>
                      <td className="text-right text-green-600">{formatBedrag(berekening.totaleRenteLager)}</td>
                      <td className="text-right font-bold">{formatBedrag(berekening.totaleRente30Jaar)}</td>
                      <td className="text-right text-red-600">{formatBedrag(berekening.totaleRenteHoger)}</td>
                    </tr>
                    <tr className="border-t">
                      <td className="py-1 text-gray-600">Verschil</td>
                      <td className="text-right text-green-700 font-medium">
                        −{formatBedrag(berekening.verschilLager)}
                      </td>
                      <td className="text-right">—</td>
                      <td className="text-right text-red-700 font-medium">+{formatBedrag(berekening.verschilHoger)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Uitklapbaar: detail per periode */}
              <button
                onClick={() => setToonRenteDetail(!toonRenteDetail)}
                className="text-xs text-amber-600 hover:text-amber-800 mt-2 flex items-center gap-1"
              >
                {toonRenteDetail ? '▼' : '▶'} Rente per 5-jaars periode
              </button>
              {toonRenteDetail && (
                <div className="bg-white rounded p-2 text-xs space-y-1 mt-1">
                  {berekening.rentePerPeriode.map((periode, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-600">
                        Jaar {periode.jaren - 4}-{periode.jaren}:
                      </span>
                      <span>{formatBedrag(periode.rente)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t pt-1 font-medium">
                    <span>Eerste 10 jaar:</span>
                    <span>{formatBedrag(berekening.renteEerste10Jaar)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Woonlasten */}
          <div
            className={`border-2 rounded-lg p-4 ${getWoonquoteKleur(berekening.situatieBekijkJaar.woonquoteTotaalBruto, berekening.situatieBekijkJaar.nibudNorm)}`}
          >
            <h2 className="font-semibold text-gray-800 mb-3">Woonlasten {bekijkJaar}</h2>
            <div className="space-y-2 text-sm">
              {/* Hypotheeklasten */}
              <div className="flex justify-between">
                <span className="text-gray-600">Hypotheek bruto:</span>
                <span>{formatBedrag(berekening.situatieBekijkJaar.brutoMaandlast)}/mnd</span>
              </div>
              <div className="flex justify-between text-green-600 text-xs">
                <span>- HRA voordeel:</span>
                <span>
                  -
                  {formatBedrag(
                    berekening.situatieBekijkJaar.brutoMaandlast - berekening.situatieBekijkJaar.nettoMaandlast,
                  )}
                  /mnd
                </span>
              </div>
              <div className="flex justify-between font-medium border-t pt-1">
                <span>Hypotheek netto:</span>
                <span>{formatBedrag(berekening.situatieBekijkJaar.nettoMaandlast)}/mnd</span>
              </div>
              {/* Uitklapbaar: Bijkomende lasten */}
              <button
                onClick={() => setToonWoonlastenDetail(!toonWoonlastenDetail)}
                className="text-xs text-cyan-600 hover:text-cyan-800 mt-2 flex items-center gap-1"
              >
                {toonWoonlastenDetail ? '▼' : '▶'} Bijkomende lasten (
                {formatBedrag(berekening.situatieBekijkJaar.bijkomendeLastenMaand)}/mnd)
              </button>
              {toonWoonlastenDetail && (
                <div className="bg-white/50 rounded p-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>OZB ({gemeenteData.ozbPercentage}%):</span>
                    <span>{formatBedrag(berekening.situatieBekijkJaar.ozbJaar / 12)}/mnd</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waterschap ({gemeenteData.waterschap.naam}):</span>
                    <span>{formatBedrag(berekening.situatieBekijkJaar.waterschapJaar / 12)}/mnd</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Riool + afval:</span>
                    <span>
                      {formatBedrag((gemeenteData.rioolheffingJaar + gemeenteData.afvalstoffenheffingJaar) / 12)}/mnd
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Opstalverzekering:</span>
                    <span>{formatBedrag(opstalverzekeringMaand)}/mnd</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Onderhoudsreservering ({onderhoudspercentage}%):</span>
                    <span>{formatBedrag(berekening.situatieBekijkJaar.onderhoudJaar / 12)}/mnd</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Subtotaal bijkomend:</span>
                    <span>{formatBedrag(berekening.situatieBekijkJaar.bijkomendeLastenMaand)}/mnd</span>
                  </div>
                </div>
              )}

              {/* Totale woonlasten */}
              <div className="flex justify-between font-bold text-lg border-t border-b py-2 mt-2">
                <span>Totaal woonlasten:</span>
                <span>{formatBedrag(berekening.situatieBekijkJaar.totaleWoonlastenNettoMaand)}/mnd</span>
              </div>

              {/* Woonquotes */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Woonquote (alleen hypotheek):</span>
                  <span>{formatPercentage(berekening.situatieBekijkJaar.woonquoteBruto)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Woonquote (totaal):</span>
                  <span
                    className={`text-lg ${getWoonquoteTekstKleur(berekening.situatieBekijkJaar.woonquoteTotaalBruto, berekening.situatieBekijkJaar.nibudNorm)}`}
                  >
                    {formatPercentage(berekening.situatieBekijkJaar.woonquoteTotaalBruto)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500 text-xs">
                  <span>Nibud-norm bij dit inkomen:</span>
                  <span>~{berekening.situatieBekijkJaar.nibudNorm}%</span>
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-gray-600">Buffer dekt:</span>
                <span className="font-medium">{berekening.bufferInMaanden.toFixed(1)} maanden</span>
              </div>
            </div>
            <p className="text-xs mt-3">
              {berekening.situatieBekijkJaar.woonquoteTotaalBruto > berekening.situatieBekijkJaar.nibudNorm + 5
                ? '⚠️ Woonquote boven Nibud-norm'
                : berekening.situatieBekijkJaar.woonquoteTotaalBruto > berekening.situatieBekijkJaar.nibudNorm
                  ? '⚡ Woonquote op rand van Nibud-norm'
                  : '✓ Woonquote binnen Nibud-norm'}
            </p>
          </div>

          {/* Waarschuwing */}
          {!berekening.hypotheekMogelijk && (
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
              <p className="text-red-800 font-medium">
                ⚠️ Met deze buffer houd je niet genoeg over voor de kosten koper. Verhoog de buffer of kies een
                goedkoper huis.
              </p>
            </div>
          )}

          {(berekening.inlegWaarschuwingJij || berekening.inlegWaarschuwingPartner) && (
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">
                ⚠️ Het inlegpercentage ({config.inlegPercentageJij}% / {100 - config.inlegPercentageJij}%) past niet bij
                het beschikbare spaargeld:
              </p>
              <ul className="text-yellow-800 text-sm mt-1 list-disc list-inside">
                {berekening.inlegWaarschuwingJij && (
                  <li>
                    Jij moet {formatBedrag(berekening.bijdrageJij)} inleggen, maar heeft{' '}
                    {formatBedrag(config.spaargeldJij)} spaargeld (tekort:{' '}
                    {formatBedrag(berekening.bijdrageJij - config.spaargeldJij)})
                  </li>
                )}
                {berekening.inlegWaarschuwingPartner && (
                  <li>
                    Partner moet {formatBedrag(berekening.bijdragePartner)} inleggen, maar heeft{' '}
                    {formatBedrag(config.spaargeldPartner)} spaargeld (tekort:{' '}
                    {formatBedrag(berekening.bijdragePartner - config.spaargeldPartner)})
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* === OVERZICHT PER JAAR === */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="font-semibold text-gray-800 mb-3">Overzicht per jaar</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="text-left p-2">Jaar</th>
                <th className="text-right p-2">Jij</th>
                <th className="text-right p-2">Partner</th>
                <th className="text-right p-2">Bruto/jaar</th>
                <th className="text-right p-2">Woonquote</th>
                <th className="text-right p-2">Woonlasten/jaar</th>
                <th className="text-right p-2">Eigen vermogen</th>
              </tr>
            </thead>
            <tbody>
              {jaren.slice(0, aantalZichtbareJaren).map((jaar) => {
                const situatie = berekening.berekenJaar(jaar);
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
            onClick={() => setAantalZichtbareJaren((prev) => Math.min(prev + 10, 30))}
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

      {/* Footer */}
      <p className="text-gray-400 text-center text-xs">
        Indicatieve berekeningen · 2% loonstijging/jaar · 3% woningindexatie/jaar · Nibud-norm ~24% bij €100k+ bruto ·
        Bespreek altijd met je hypotheekadviseur
      </p>
    </div>
  );
}
