import { useState, useMemo } from 'react';
import { providers, laatstBijgewerkt } from './providers';
import { config, isDefaultConfig } from './lib/config-loader';
import ConfigOnboarding from './components/ConfigOnboarding';
import { HRA_MAX_TARIEF } from './belasting';
import { gemeenteTarieven } from './gemeente-tarieven';
import {
  LOOPTIJD_JAREN,
  RENTE_VERGELIJKING_STAP,
  NHG_GRENS,
  NHG_GRENS_VERDUURZAMING,
  NHG_PREMIE_PERCENTAGE,
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
  WONING_INDEXATIE,
  BELASTINGJAAR,
  GEMEENTE_TARIEVEN_JAAR,
} from './constants';
import { isTariefVerouderd, dagenOud } from './lib/staleness';
import { NIBUD_NORMEN_JAAR } from './lib/nibud-normen';
import { berekenTotaleRente, berekenJaarSituatiePure } from './lib/berekeningen';
import type { JaarContext } from './lib/berekeningen';
import InvoerKolom from './components/InvoerKolom';
import CarriereKolom from './components/CarriereKolom';
import ResultatenKolom from './components/ResultatenKolom';
import JaarlijkseTabel from './components/JaarlijkseTabel';

export default function HypotheekCalculator() {
  const [gebruikStandaard, setGebruikStandaard] = useState(false);

  if (isDefaultConfig && !gebruikStandaard) {
    return <ConfigOnboarding onGebruikStandaard={() => setGebruikStandaard(true)} />;
  }

  // === WONING & HYPOTHEEK ===
  const [woningwaarde, setWoningwaarde] = useState(config.woningwaarde);
  const [buffer, setBuffer] = useState(config.buffer);
  const [hypotheekType, setHypotheekType] = useState('annuitair');
  const [hypotheekProduct, setHypotheekProduct] = useState(() => {
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

  // === HUISHOUDEN ===
  const [heeftPartner, setHeeftPartner] = useState(config.heeftPartner ?? config.brutoJaarinkomenPartner > 0);

  // === INKOMEN ===
  const [brutoJaarJij, setBrutoJaarJij] = useState(config.brutoJaarinkomenJij);
  const [brutoJaarPartner, setBrutoJaarPartner] = useState(config.brutoJaarinkomenPartner);

  // === SCENARIO'S ===
  const [jarenTotScheiding, setJarenTotScheiding] = useState(0);
  const [bekijkJaar, setBekijkJaar] = useState(config.startJaar);

  // === UI STATE ===
  const [toonRenteDetail, setToonRenteDetail] = useState(false);
  const [toonKostenKoperDetail, setToonKostenKoperDetail] = useState(false);
  const [toonWoonlastenDetail, setToonWoonlastenDetail] = useState(false);
  const [toonGemeenteTarieven, setToonGemeenteTarieven] = useState(false);
  const [aantalZichtbareJaren, setAantalZichtbareJaren] = useState(10);

  // === KOSTEN KOPER OPTIES ===
  const [heeftBouwkundigeKeuring, setHeeftBouwkundigeKeuring] = useState(true);
  const [heeftAankoopmakelaar, setHeeftAankoopmakelaar] = useState(false);
  const [makelaarsKosten, setMakelaarsKosten] = useState(config.makelaarsKosten);

  // === WOONLASTEN OPTIES ===
  const [gemeente, setGemeente] = useState<string>(config.gemeente);
  const [opstalverzekeringMaand, setOpstalverzekeringMaand] = useState(config.opstalverzekeringMaand);
  const [onderhoudspercentage, setOnderhoudspercentage] = useState(0.75);

  // === AFGELEIDE WAARDEN ===
  const startJaar = config.startJaar;
  const totaalSpaargeld = config.spaargeldJij + (heeftPartner ? config.spaargeldPartner : 0);
  const jijInlegRatio = heeftPartner ? config.inlegPercentageJij / 100 : 1;
  const partnerInlegRatio = 1 - jijInlegRatio;
  const effectiefBrutoJaarPartner = heeftPartner ? brutoJaarPartner : 0;
  const gemeenteData = gemeenteTarieven[gemeente];
  const jaren = Array.from({ length: 30 }, (_, i) => startJaar + i);
  const provider = providers[hypotheekProduct];

  // Context voor jaarlijkse berekening (gememoized)
  const jaarCtx: JaarContext = useMemo(
    () => ({
      startJaar,
      brutoJaarJij,
      brutoJaarPartner: effectiefBrutoJaarPartner,
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
      effectiefBrutoJaarPartner,
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
    const heeftStartersvrijstelling = woningwaarde <= STARTERSVRIJSTELLING_GRENS;
    const overdrachtsbelasting = heeftStartersvrijstelling ? 0 : woningwaarde * OVERDRACHTSBELASTING_PERCENTAGE;

    const kostenKoperDetail = {
      notarisTransport: NOTARIS_TRANSPORTAKTE,
      notarisHypotheek: NOTARIS_HYPOTHEEKAKTE,
      kadaster: KADASTERKOSTEN,
      taxatie: TAXATIEKOSTEN,
      bankgarantie: Math.round(woningwaarde * BANKGARANTIE_PERCENTAGE),
      bouwkundigeKeuring: heeftBouwkundigeKeuring ? BOUWKUNDIGE_KEURING : 0,
      makelaarskosten: heeftAankoopmakelaar ? makelaarsKosten : 0,
      overdrachtsbelasting,
    };

    const kostenKoperVast =
      kostenKoperDetail.notarisTransport +
      kostenKoperDetail.notarisHypotheek +
      kostenKoperDetail.kadaster +
      kostenKoperDetail.taxatie +
      kostenKoperDetail.bankgarantie;

    const kostenKoperOptioneel = kostenKoperDetail.bouwkundigeKeuring + kostenKoperDetail.makelaarskosten;
    const kostenKoperBasis = kostenKoperVast + kostenKoperOptioneel + overdrachtsbelasting;

    const beschikbaarVoorInleg = totaalSpaargeld - buffer;
    const eigenInlegHuis = Math.max(0, beschikbaarVoorInleg - kostenKoperBasis);
    const hypotheekBedrag = woningwaarde - eigenInlegHuis;

    const heeftNHG = woningwaarde <= NHG_GRENS;
    const nhgPremie = heeftNHG ? hypotheekBedrag * NHG_PREMIE_PERCENTAGE : 0;
    const nhgMetVerduurzaming = woningwaarde <= NHG_GRENS_VERDUURZAMING;

    const kostenKoperTotaal = kostenKoperBasis + nhgPremie;
    const hypotheekMogelijk = beschikbaarVoorInleg >= kostenKoperTotaal;

    const bijdrageJij = beschikbaarVoorInleg * jijInlegRatio;
    const bijdragePartner = beschikbaarVoorInleg * partnerInlegRatio;
    const inlegWaarschuwingJij = bijdrageJij > config.spaargeldJij;
    const inlegWaarschuwingPartner = bijdragePartner > config.spaargeldPartner;

    const HRA_TARIEF = HRA_MAX_TARIEF;
    const aftrekbareKosten =
      kostenKoperDetail.notarisHypotheek + kostenKoperDetail.taxatie + kostenKoperDetail.bankgarantie + nhgPremie;
    const belastingvoordeelKosten = aftrekbareKosten * HRA_TARIEF;
    const kostenKoperNetto = kostenKoperTotaal - belastingvoordeelKosten;

    const ltv = (hypotheekBedrag / woningwaarde) * 100;
    const rente = provider.berekenRente({ ltv, heeftNHG, energielabel, rentevastePeriode });

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

    const renteEerste10Jaar = renteBerekening.rentePerPeriode.slice(0, 2).reduce((sum, p) => sum + p.rente, 0);
    const verschilLager = renteBerekening.totaleRente - renteLager.totaleRente;
    const verschilHoger = renteHoger.totaleRente - renteBerekening.totaleRente;

    const situatie2026 = berekenJaarSituatiePure(startJaar, hypotheekBedrag, rente, jaarCtx);
    const situatieBekijkJaar = berekenJaarSituatiePure(bekijkJaar, hypotheekBedrag, rente, jaarCtx);

    const bufferInMaanden = buffer / situatieBekijkJaar.nettoMaandlast;

    // Scheidingsberekening
    let scheidingResultaat = null;
    if (jarenTotScheiding > 0) {
      const afgelostBijScheiding = (hypotheekBedrag / LOOPTIJD_JAREN) * jarenTotScheiding;
      const restschuldBijScheiding = hypotheekBedrag - afgelostBijScheiding;
      const woningwaardeBijScheiding = woningwaarde * Math.pow(1 + WONING_INDEXATIE, jarenTotScheiding);
      const overwaardebruto = woningwaardeBijScheiding - restschuldBijScheiding;

      const verkoopkorting = woningwaardeBijScheiding * VERKOOP_KORTING_PERCENTAGE;
      const verkoopprijs = woningwaardeBijScheiding - verkoopkorting;
      const verkoopMakelaarskosten = verkoopprijs * VERKOOP_MAKELAAR_PERCENTAGE;

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
        makelaarskosten: verkoopMakelaarskosten,
        stylingFotos: VERKOOP_STYLING_FOTOS,
        energielabel: VERKOOP_ENERGIELABEL,
        notarisRoyement: VERKOOP_NOTARIS_ROYEMENT,
        kadaster: VERKOOP_KADASTER,
        opknappen: VERKOOP_OPKNAPPEN,
        maxBoeterente,
      };

      const verkoopKostenTotaal =
        verkoopkorting +
        verkoopMakelaarskosten +
        VERKOOP_STYLING_FOTOS +
        VERKOOP_ENERGIELABEL +
        VERKOOP_NOTARIS_ROYEMENT +
        VERKOOP_KADASTER +
        VERKOOP_OPKNAPPEN +
        maxBoeterente;

      const overwaardeNetto = woningwaardeBijScheiding - restschuldBijScheiding - verkoopKostenTotaal;

      const jijInleg = eigenInlegHuis * jijInlegRatio;
      const partnerInleg = eigenInlegHuis * partnerInlegRatio;
      const vorderingJij = jijInleg - partnerInleg;
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
      totaleRente30Jaar: renteBerekening.totaleRente,
      totaleBetalingen30Jaar: renteBerekening.totaleBetalingen,
      rentePerPeriode: renteBerekening.rentePerPeriode,
      renteEerste10Jaar,
      renteAlsPercentageHoofdsom: (renteBerekening.totaleRente / hypotheekBedrag) * 100,
      renteLagerPercentage: rente - 0.2,
      renteHogerPercentage: rente + 0.2,
      totaleRenteLager: renteLager.totaleRente,
      totaleRenteHoger: renteHoger.totaleRente,
      verschilLager,
      verschilHoger,
      situatie2026,
      situatieBekijkJaar,
      bufferInMaanden,
      scheidingResultaat,
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

  // === RENDER ===
  return (
    <main className="p-2 sm:p-4 max-w-7xl mx-auto space-y-4 text-sm">
      {/* Header */}
      <header className="border-b pb-3">
        <h1 className="text-xl font-bold text-gray-800">Hypotheek Scenario Calculator</h1>
        <p className="text-gray-500 text-xs mt-1">
          {laatstBijgewerkt
            ? `${Object.keys(providers).length} hypotheekproducten · Tarieven van ${new Date(laatstBijgewerkt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'ASN Bank tarieven (fallback)'}{' '}
          · Belastingtarieven {BELASTINGJAAR} · Inclusief NHG-premie, HRA en woningindexatie
        </p>
        {isTariefVerouderd(laatstBijgewerkt) && (
          <p role="alert" className="text-xs mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded inline-block">
            ⚠ Rentetarieven zijn {dagenOud(laatstBijgewerkt) ?? '?'} dagen oud — voer <code className="bg-yellow-200 px-1 rounded">npm run update-rentes</code> uit om bij te werken
          </p>
        )}
        {new Date().getFullYear() > BELASTINGJAAR && (
          <p role="alert" className="text-xs mt-1 px-2 py-1 bg-orange-100 text-orange-800 rounded inline-block">
            ⚠ Belastingtarieven zijn van {BELASTINGJAAR} — controleer of er nieuwe tarieven beschikbaar zijn
          </p>
        )}
      </header>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Kolom 1: Invoer */}
        <InvoerKolom
          woningwaarde={woningwaarde}
          setWoningwaarde={setWoningwaarde}
          buffer={buffer}
          setBuffer={setBuffer}
          hypotheekProduct={hypotheekProduct}
          setHypotheekProduct={setHypotheekProduct}
          hypotheekType={hypotheekType}
          setHypotheekType={setHypotheekType}
          energielabel={energielabel}
          setEnergielabel={setEnergielabel}
          rentevastePeriode={rentevastePeriode}
          setRentevastePeriode={setRentevastePeriode}
          provider={provider}
          heeftBouwkundigeKeuring={heeftBouwkundigeKeuring}
          setHeeftBouwkundigeKeuring={setHeeftBouwkundigeKeuring}
          heeftAankoopmakelaar={heeftAankoopmakelaar}
          setHeeftAankoopmakelaar={setHeeftAankoopmakelaar}
          makelaarsKosten={makelaarsKosten}
          setMakelaarsKosten={setMakelaarsKosten}
          gemeente={gemeente}
          setGemeente={setGemeente}
          gemeenteData={gemeenteData}
          opstalverzekeringMaand={opstalverzekeringMaand}
          setOpstalverzekeringMaand={setOpstalverzekeringMaand}
          onderhoudspercentage={onderhoudspercentage}
          setOnderhoudspercentage={setOnderhoudspercentage}
          toonGemeenteTarieven={toonGemeenteTarieven}
          setToonGemeenteTarieven={setToonGemeenteTarieven}
          rente={berekening.rente}
          heeftNHG={berekening.heeftNHG}
          ltv={berekening.ltv}
        />

        {/* Kolom 2: Carrière & Scenario's */}
        <CarriereKolom
          heeftPartner={heeftPartner}
          setHeeftPartner={setHeeftPartner}
          brutoJaarJij={brutoJaarJij}
          setBrutoJaarJij={setBrutoJaarJij}
          brutoJaarPartner={brutoJaarPartner}
          setBrutoJaarPartner={setBrutoJaarPartner}
          jijMinderWerkenJaar={jijMinderWerkenJaar}
          setJijMinderWerkenJaar={setJijMinderWerkenJaar}
          partnerMinderWerkenJaar={partnerMinderWerkenJaar}
          setPartnerMinderWerkenJaar={setPartnerMinderWerkenJaar}
          jijUrenNaMinderWerken={jijUrenNaMinderWerken}
          setJijUrenNaMinderWerken={setJijUrenNaMinderWerken}
          partnerUrenNaMinderWerken={partnerUrenNaMinderWerken}
          setPartnerUrenNaMinderWerken={setPartnerUrenNaMinderWerken}
          promotieJaar={promotieJaar}
          setPromotieJaar={setPromotieJaar}
          promotieOpslag={promotieOpslag}
          setPromotieOpslag={setPromotieOpslag}
          jarenTotScheiding={jarenTotScheiding}
          setJarenTotScheiding={setJarenTotScheiding}
          scheidingResultaat={berekening.scheidingResultaat}
          bekijkJaar={bekijkJaar}
          woningwaarde={woningwaarde}
          startJaar={startJaar}
          jaren={jaren}
          situatie2026={berekening.situatie2026}
          situatieBekijkJaar={berekening.situatieBekijkJaar}
        />

        {/* Kolom 3: Resultaten */}
        <ResultatenKolom
          heeftPartner={heeftPartner}
          woningwaarde={woningwaarde}
          bekijkJaar={bekijkJaar}
          gemeenteData={gemeenteData}
          opstalverzekeringMaand={opstalverzekeringMaand}
          onderhoudspercentage={onderhoudspercentage}
          toonKostenKoperDetail={toonKostenKoperDetail}
          setToonKostenKoperDetail={setToonKostenKoperDetail}
          toonRenteDetail={toonRenteDetail}
          setToonRenteDetail={setToonRenteDetail}
          toonWoonlastenDetail={toonWoonlastenDetail}
          setToonWoonlastenDetail={setToonWoonlastenDetail}
          heeftStartersvrijstelling={berekening.heeftStartersvrijstelling}
          overdrachtsbelasting={berekening.overdrachtsbelasting}
          kostenKoperBasis={berekening.kostenKoperBasis}
          kostenKoperTotaal={berekening.kostenKoperTotaal}
          kostenKoperDetail={berekening.kostenKoperDetail}
          nhgPremie={berekening.nhgPremie}
          heeftNHG={berekening.heeftNHG}
          aftrekbareKosten={berekening.aftrekbareKosten}
          belastingvoordeelKosten={berekening.belastingvoordeelKosten}
          kostenKoperNetto={berekening.kostenKoperNetto}
          eigenInlegHuis={berekening.eigenInlegHuis}
          hypotheekBedrag={berekening.hypotheekBedrag}
          hypotheekMogelijk={berekening.hypotheekMogelijk}
          inlegWaarschuwingJij={berekening.inlegWaarschuwingJij}
          inlegWaarschuwingPartner={berekening.inlegWaarschuwingPartner}
          bijdrageJij={berekening.bijdrageJij}
          bijdragePartner={berekening.bijdragePartner}
          rente={berekening.rente}
          ltv={berekening.ltv}
          totaleRente30Jaar={berekening.totaleRente30Jaar}
          totaleBetalingen30Jaar={berekening.totaleBetalingen30Jaar}
          rentePerPeriode={berekening.rentePerPeriode}
          renteEerste10Jaar={berekening.renteEerste10Jaar}
          renteAlsPercentageHoofdsom={berekening.renteAlsPercentageHoofdsom}
          renteLagerPercentage={berekening.renteLagerPercentage}
          renteHogerPercentage={berekening.renteHogerPercentage}
          totaleRenteLager={berekening.totaleRenteLager}
          totaleRenteHoger={berekening.totaleRenteHoger}
          verschilLager={berekening.verschilLager}
          verschilHoger={berekening.verschilHoger}
          situatie2026={berekening.situatie2026}
          situatieBekijkJaar={berekening.situatieBekijkJaar}
          bufferInMaanden={berekening.bufferInMaanden}
        />
      </div>

      {/* Jaarlijks overzicht */}
      <JaarlijkseTabel
        jaren={jaren}
        aantalZichtbareJaren={aantalZichtbareJaren}
        setAantalZichtbareJaren={setAantalZichtbareJaren}
        bekijkJaar={bekijkJaar}
        setBekijkJaar={setBekijkJaar}
        berekenJaar={berekening.berekenJaar}
      />

      {/* Footer */}
      <footer className="text-gray-400 text-center text-xs">
        Indicatieve berekeningen · 2% loonstijging/jaar · 3% woningindexatie/jaar ·
        Nibud financieringslastnormen {NIBUD_NORMEN_JAAR} · Belastingtarieven {BELASTINGJAAR} · Gemeentetarieven {GEMEENTE_TARIEVEN_JAAR} · Bespreek altijd met je hypotheekadviseur
      </footer>
    </main>
  );
}
