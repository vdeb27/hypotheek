# Bijdragen aan Hypotheek Calculator

## Gebruik

De calculator is direct te gebruiken via **[vdeb27.github.io/hypotheek-calculator](https://vdeb27.github.io/hypotheek-calculator/)**. Geen installatie nodig — je gegevens worden alleen lokaal in je browser opgeslagen.

Om lokaal te ontwikkelen:

```bash
cd app && npm install && npm run dev
```

## Gemeente toevoegen

Gemeentelijke tarieven staan in `app/src/gemeente-tarieven.ts`. Om een gemeente toe te voegen:

1. Zoek de OZB-tarieven op de website van de gemeente
2. Zoek het waterschapstarief op de website van het waterschap
3. Voeg een entry toe aan het `gemeenteTarieven` object:

```typescript
'gemeente-naam': {
  naam: 'Gemeente Naam',
  ozbPercentage: 0.0XX,  // OZB eigenaar percentage
  waterschap: {
    naam: 'Waterschap Naam',
    eigenarenPercentage: 0.00XX,
    ingezetenenJaar: XX,
    zuiveringPerVE: XX,
    veMeerpersoons: 3,
  },
  rioolheffingJaar: XXX,
  afvalstoffenheffingJaar: XXX,
},
```

4. Voeg de bron-URL als commentaar toe boven de entry

## Architectuur

### Dataflow

```
localStorage / standaardwaarden → HypotheekCalculator (state + berekeningen)
                                           ↓
                           ┌───────────────┼───────────────┐
                           ↓               ↓               ↓
                    PersoonlijkKolom  WoningKolom  HypotheekKolom
                                                        ↓
                                               UitkomstenKolom
                                                        ↓
                                               JaarlijkseTabel
```

### Berekeningen

- `lib/berekeningen.ts` — Pure functions voor jaarlijkse financiele situatie
- `belasting.ts` — Nederlandse inkomstenbelasting (progressief, met kortingen)
- `providers/rate-engine.ts` — Renteberekening op basis van LTV, NHG, energielabel

Alle berekeningen zijn pure functions en worden ge-memoized via React's `useMemo`.

### Styling

- Tailwind CSS utility classes
- Nederlandse variabelenamen in de code
- Kleurenschema per sectie (blauw=hypotheek, groen=inkomen, amber=rente, etc.)

## Code conventies

- **Taal**: Nederlandse variabelenamen en UI-teksten
- **Types**: TypeScript strict mode
- **Formatting**: Prettier (run `npm run format`)
- **Linting**: ESLint (run `npm run lint`)
- **Tests**: Vitest (run `npm run test`)
