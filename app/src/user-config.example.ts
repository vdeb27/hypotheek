import type { GebruikersConfig } from './types';

// Kopieer dit bestand naar user-config.ts en vul je eigen waarden in.
// user-config.ts wordt NIET meegenomen in git.

const config: GebruikersConfig = {
  woningwaarde: 400000,               // Aankoopprijs van de woning
  buffer: 20000,                      // Spaargeld dat je achter de hand wilt houden
  spaargeldJij: 60000,               // Beschikbaar spaargeld jij
  spaargeldPartner: 40000,           // Beschikbaar spaargeld partner
  inlegPercentageJij: 50,             // Jouw aandeel in de eigen inleg (percentage, rest is partner)

  brutoJaarinkomenJij: 60000,         // Toetsinkomen: bruto jaarloon + vakantiegeld/13e maand e.d.
  brutoJaarinkomenPartner: 50000,     // Idem voor partner

  jijMaxUren: 40,                     // Fulltime werkuren per week
  partnerMaxUren: 40,
  jijUrenNaMinderWerken: 32,          // Uren per week als je minder gaat werken
  partnerUrenNaMinderWerken: 32,
  promotieOpslagPercentage: 10,       // Verwachte bruto-opslag bij promotie (percentage)

  startJaar: 2026,                    // Jaar van aankoop
  gemeente: 'utrecht',                // Gemeente voor OZB/gemeentelijke lasten
  energielabel: 'C',                  // Energielabel van de woning
  opstalverzekeringMaand: 30,         // Opstalverzekering per maand in euro
  makelaarsKosten: 4000,              // Kosten aankoopmakelaar
};

export default config;
