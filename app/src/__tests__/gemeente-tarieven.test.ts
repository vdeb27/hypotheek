import { describe, it, expect } from 'vitest';
import { berekenWaterschapJaar, gemeenteTarieven } from '../gemeente-tarieven';
import type { WaterschapTarieven } from '../gemeente-tarieven';

describe('berekenWaterschapJaar', () => {
  const testWaterschap: WaterschapTarieven = {
    naam: 'Test Waterschap',
    ingezetenenJaar: 100,
    eigenarenPercentage: 0.02, // 0.02% van WOZ
    zuiveringPerVE: 80,
    veMeerpersoons: 3,
  };

  it('berekent de totale waterschapslasten correct', () => {
    const wozWaarde = 500000;
    const result = berekenWaterschapJaar(testWaterschap, wozWaarde);

    // ingezetenen: 100
    // eigenaren: 500.000 * (0.02 / 100) = 100
    // zuivering: 80 * 3 = 240
    // totaal: 440
    expect(result).toBeCloseTo(440, 0);
  });

  it('schaalt eigenarenheffing mee met WOZ-waarde', () => {
    const laag = berekenWaterschapJaar(testWaterschap, 300000);
    const hoog = berekenWaterschapJaar(testWaterschap, 600000);
    expect(hoog).toBeGreaterThan(laag);
  });

  it('berekent correct voor nul WOZ-waarde', () => {
    const result = berekenWaterschapJaar(testWaterschap, 0);
    // Alleen ingezetenen + zuivering, geen eigenaren
    expect(result).toBeCloseTo(100 + 80 * 3, 0);
  });
});

describe('gemeenteTarieven', () => {
  it('bevat alle verwachte gemeenten', () => {
    expect(gemeenteTarieven).toHaveProperty('amsterdam');
    expect(gemeenteTarieven).toHaveProperty('utrecht');
    expect(gemeenteTarieven).toHaveProperty('eindhoven');
    expect(gemeenteTarieven).toHaveProperty('groningen');
    expect(gemeenteTarieven).toHaveProperty('den-haag');
    expect(gemeenteTarieven).toHaveProperty('leidschendam-voorburg');
    expect(gemeenteTarieven).toHaveProperty('rijswijk');
    expect(gemeenteTarieven).toHaveProperty('pijnacker-nootdorp');
  });

  it('heeft complete data per gemeente', () => {
    for (const [key, gemeente] of Object.entries(gemeenteTarieven)) {
      expect(gemeente.naam, `${key}.naam`).toBeTruthy();
      expect(gemeente.ozbPercentage, `${key}.ozbPercentage`).toBeGreaterThan(0);
      expect(gemeente.rioolheffingJaar, `${key}.rioolheffingJaar`).toBeGreaterThan(0);
      expect(gemeente.afvalstoffenheffingJaar, `${key}.afvalstoffenheffingJaar`).toBeGreaterThan(0);
      expect(gemeente.waterschap, `${key}.waterschap`).toBeTruthy();
      expect(gemeente.waterschap.naam, `${key}.waterschap.naam`).toBeTruthy();
    }
  });
});
