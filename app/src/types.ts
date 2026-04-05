export interface GebruikersConfig {
  // Persoonlijke financiën
  woningwaarde: number; // Aankoopprijs woning
  buffer: number; // Spaargeld achter de hand houden
  spaargeldJij: number; // Beschikbaar spaargeld jij
  spaargeldPartner: number; // Beschikbaar spaargeld partner
  inlegPercentageJij: number; // Percentage van spaargeld dat jij inlegt (rest is partner)

  // Toetsinkomen (bruto per jaar)
  // Gebruik bij voorkeur het toetsinkomen van de werkgeversverklaring.
  // Kan benaderd worden als: bruto maandloon * 12 + structurele extra's
  // (vakantiegeld, 13e maand, vaste eindejaarsuitkering, etc.)
  brutoJaarinkomenJij: number;
  brutoJaarinkomenPartner: number;

  // Werk
  jijMaxUren: number; // Fulltime uren per week
  partnerMaxUren: number;
  jijUrenNaMinderWerken: number; // Default uren bij minder werken scenario
  partnerUrenNaMinderWerken: number;
  promotieOpslagPercentage: number; // Bruto-opslag bij promotie (bijv. 15 = 15%)

  // Overig
  startJaar: number;
  gemeente: string;
  energielabel: string;
  opstalverzekeringMaand: number;
  makelaarsKosten: number;
}
