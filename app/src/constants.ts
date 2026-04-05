// === HYPOTHEEK ===
export const LOOPTIJD_JAREN = 30;
export const LOOPTIJD_MAANDEN = LOOPTIJD_JAREN * 12; // 360
export const MAANDEN_PER_JAAR = 12;
export const MAANDEN_PER_RENTEPERIODE = 60; // 5 jaar, voor rente-per-periode berekening
export const LOONINDEXATIE = 0.02; // 2% per jaar
export const WONING_INDEXATIE = 0.03; // 3% per jaar
export const RENTE_VERGELIJKING_STAP = 0.2; // ±0.2% voor rentevergelijking

// === NHG (Nationale Hypotheek Garantie) 2026 ===
export const NHG_GRENS = 470_000; // Geldt voor WONINGWAARDE, niet hypotheekbedrag
export const NHG_GRENS_VERDUURZAMING = 498_200; // Met energiebesparende voorzieningen
export const NHG_PREMIE_PERCENTAGE = 0.004; // 0.4%

// === BELASTING ===
export const EIGENWONINGFORFAIT_PERCENTAGE = 0.0035; // 0.35% van WOZ-waarde
export const OVERDRACHTSBELASTING_PERCENTAGE = 0.02; // 2%
export const STARTERSVRIJSTELLING_GRENS = 555_000; // Geen overdrachtsbelasting onder deze grens

// === KOSTEN KOPER ===
export const NOTARIS_TRANSPORTAKTE = 850;
export const NOTARIS_HYPOTHEEKAKTE = 800;
export const KADASTERKOSTEN = 150;
export const TAXATIEKOSTEN = 650;
export const BOUWKUNDIGE_KEURING = 400;
export const BANKGARANTIE_PERCENTAGE = 0.001; // 1% van waarborgsom (10% van koopsom)

// === VERKOOPKOSTEN BIJ SCHEIDING ===
export const VERKOOP_MAKELAAR_PERCENTAGE = 0.015; // 1.5%
export const VERKOOP_STYLING_FOTOS = 750;
export const VERKOOP_ENERGIELABEL = 350;
export const VERKOOP_NOTARIS_ROYEMENT = 500;
export const VERKOOP_KADASTER = 100;
export const VERKOOP_KORTING_PERCENTAGE = 0.03; // 3% minder dan marktwaarde bij snelle verkoop
export const VERKOOP_OPKNAPPEN = 1500;

// === BOETERENTE ===
export const AANGENOMEN_BODEM_MARKTRENTE = 2; // Historisch dieptepunt NL hypotheekrentes (%)
