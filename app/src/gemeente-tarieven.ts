// === GEMEENTE & WATERSCHAP TARIEVEN 2026 ===

export type WaterschapTarieven = {
  naam: string;
  ingezetenenJaar: number;      // vast bedrag per huishouden
  eigenarenPercentage: number;  // percentage van WOZ-waarde
  zuiveringPerVE: number;       // bedrag per vervuilingseenheid
  veMeerpersoons: number;       // aantal VE voor meerpersoonshuishouden
};

export type GemeenteTarieven = {
  naam: string;
  ozbPercentage: number;
  rioolheffingJaar: number;
  afvalstoffenheffingJaar: number;
  waterschap: WaterschapTarieven;
};

// Waterschap Amstel, Gooi en Vecht 2026
const agv: WaterschapTarieven = {
  naam: 'Amstel, Gooi en Vecht',
  ingezetenenJaar: 186.85,
  eigenarenPercentage: 0.017654,
  zuiveringPerVE: 92.79,
  veMeerpersoons: 3
};

// Hoogheemraadschap De Stichtse Rijnlanden 2026
const hdsr: WaterschapTarieven = {
  naam: 'De Stichtse Rijnlanden',
  ingezetenenJaar: 126.98,
  eigenarenPercentage: 0.02261,
  zuiveringPerVE: 78.48,
  veMeerpersoons: 3
};

// Waterschap De Dommel 2026
const dommel: WaterschapTarieven = {
  naam: 'De Dommel',
  ingezetenenJaar: 66.60,
  eigenarenPercentage: 0.01987,
  zuiveringPerVE: 78.48,
  veMeerpersoons: 3
};

// Waterschap Noorderzijlvest 2026
const noorderzijlvest: WaterschapTarieven = {
  naam: 'Noorderzijlvest',
  ingezetenenJaar: 129.11,
  eigenarenPercentage: 0.0552,
  zuiveringPerVE: 106.27,
  veMeerpersoons: 3
};

export function berekenWaterschapJaar(waterschap: WaterschapTarieven, wozWaarde: number): number {
  const ingezetenen = waterschap.ingezetenenJaar;
  const eigenaren = wozWaarde * (waterschap.eigenarenPercentage / 100);
  const zuivering = waterschap.zuiveringPerVE * waterschap.veMeerpersoons;
  return ingezetenen + eigenaren + zuivering;
}

export const gemeenteTarieven: Record<string, GemeenteTarieven> = {
  'amsterdam': {
    naam: 'Amsterdam',
    ozbPercentage: 0.0527,
    rioolheffingJaar: 192.04,
    afvalstoffenheffingJaar: 469,
    waterschap: agv
  },
  'utrecht': {
    naam: 'Utrecht',
    ozbPercentage: 0.0806,
    rioolheffingJaar: 247.27,
    afvalstoffenheffingJaar: 600.05,
    waterschap: hdsr
  },
  'eindhoven': {
    naam: 'Eindhoven',
    ozbPercentage: 0.08464,
    rioolheffingJaar: 202,
    afvalstoffenheffingJaar: 420,
    waterschap: dommel
  },
  'groningen': {
    naam: 'Groningen',
    ozbPercentage: 0.1460,
    rioolheffingJaar: 178.69,
    afvalstoffenheffingJaar: 402.12,
    waterschap: noorderzijlvest
  }
};
