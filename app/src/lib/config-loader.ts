import type { GebruikersConfig } from '../types';

const DEFAULT_CONFIG: GebruikersConfig = {
  woningwaarde: 450000,
  buffer: 20000,
  spaargeldJij: 35000,
  spaargeldPartner: 25000,
  inlegPercentageJij: 50,

  brutoJaarinkomenJij: 54000,
  brutoJaarinkomenPartner: 46500,

  jijMaxUren: 40,
  partnerMaxUren: 40,
  jijUrenNaMinderWerken: 32,
  partnerUrenNaMinderWerken: 32,
  promotieOpslagPercentage: 10,

  startJaar: new Date().getFullYear(),
  gemeente: 'utrecht',
  energielabel: 'C',
  opstalverzekeringMaand: 30,
  makelaarsKosten: 4000,
};

// Vite's import.meta.glob returns an empty object if the file doesn't exist.
// This lets us detect whether the user has created their own config.
const configModules = import.meta.glob('../user-config.json', { eager: true });
const userConfigModule = configModules['../user-config.json'] as { default: Partial<GebruikersConfig> } | undefined;

export const isDefaultConfig = !userConfigModule;
export const config: GebruikersConfig = userConfigModule
  ? { ...DEFAULT_CONFIG, ...userConfigModule.default }
  : DEFAULT_CONFIG;
