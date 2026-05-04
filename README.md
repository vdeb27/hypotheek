# Hypotheek Calculator

Een interactieve calculator voor het doorrekenen van hypotheekscenario's bij de aankoop van je eerste huis in Nederland.

## Probeer het

**[→ vdeb27.github.io/hypotheek-calculator](https://vdeb27.github.io/hypotheek-calculator/)**

Geen installatie nodig. Alle gegevens worden alleen in jouw browser opgeslagen — er gaat niets naar de server of naar de ontwikkelaar.

## Voor wie is dit?

Deze tool is gemaakt voor starters op de Nederlandse woningmarkt die willen begrijpen wat een hypotheek werkelijk kost. Je kunt er onder meer mee:

- **Scenario's doorrekenen**: wat als je parttime gaat werken, promotie krijgt, of uit elkaar gaat?
- **Kosten vergelijken**: actuele rentetarieven van 100+ hypotheekproducten
- **Maandlasten begrijpen**: inclusief gemeentelijke belastingen, verzekering, onderhoud en belastingvoordeel
- **Betaalbaarheid toetsen**: woonquote en Nibud-norm vergelijking

## Rentetarieven

De calculator gebruikt actuele rentetarieven van Nederlandse hypotheekverstrekkers via de Hypotheekbond API. De tarieven worden automatisch elke week bijgewerkt via een GitHub Actions workflow en gecached in `app/src/providers/data/rates-cache.json`.

## Jaarlijks bijwerken

Bij de overgang naar een nieuw belastingjaar moeten de volgende bestanden worden bijgewerkt:

| Bestand | Wat bijwerken | Bron |
|---------|--------------|------|
| `src/belasting.ts` | Belastingschijven, heffingskortingen, HRA-tarief | [belastingdienst.nl](https://www.belastingdienst.nl) |
| `src/constants.ts` | NHG-grenzen, startersvrijstelling, eigenwoningforfait, `BELASTINGJAAR` | [nhg.nl](https://www.nhg.nl), belastingdienst.nl |
| `src/gemeente-tarieven.ts` | OZB-percentages, waterschapstarieven, riool/afval | Websites van gemeenten en waterschappen |

Werk ook de constanten `BELASTINGJAAR` en `GEMEENTE_TARIEVEN_JAAR` in `constants.ts` bij, zodat de calculator het juiste jaar toont in de interface.

## Development

De calculator gebruikt:
- **Vite 5** — Build tool
- **React 18** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

### Tests, linting & formatting
```bash
npm run test          # Eenmalig
npm run test:watch    # Watch mode
npm run lint
npm run format
```

### Productie build
```bash
npm run build
```

Deployen gaat automatisch bij elke push naar `main` via `.github/workflows/deploy.yml`.

## Project structuur

```
hypotheek-calculator/
├── app/                          # React applicatie
│   ├── src/
│   │   ├── HypotheekCalculator.tsx   # Hoofdcomponent
│   │   ├── App.tsx               # App wrapper
│   │   ├── types.ts              # Gedeelde TypeScript types
│   │   ├── constants.ts          # Constanten (NHG, belasting, kosten)
│   │   ├── belasting.ts          # Inkomstenbelasting berekening
│   │   ├── gemeente-tarieven.ts  # Gemeentelijke belastingtarieven
│   │   ├── components/           # UI componenten
│   │   │   ├── ConfigOnboarding.tsx  # Welkomstscherm / instellingen
│   │   │   ├── PersoonlijkKolom.tsx  # Inkomen & vermogen
│   │   │   ├── WoningKolom.tsx       # Woning & kosten koper
│   │   │   ├── HypotheekKolom.tsx    # Hypotheekproduct & rente
│   │   │   ├── UitkomstenKolom.tsx   # Berekende resultaten
│   │   │   ├── JaarlijkseTabel.tsx   # 30-jaar overzicht
│   │   │   └── Tooltip.tsx           # Info-tooltips
│   │   ├── lib/                  # Berekeningen & hulpfuncties
│   │   │   ├── berekeningen.ts       # Financiële berekeningen
│   │   │   ├── calculator-storage.ts # localStorage persistentie
│   │   │   ├── formatters.ts         # Geld/percentage formatting
│   │   │   ├── config-loader.ts      # Standaardwaarden laden
│   │   │   ├── staleness.ts          # Verouderingsdetectie tarieven
│   │   │   └── nibud-normen.ts       # Nibud financieringslastnormen
│   │   └── providers/            # Hypotheekverstrekker data
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   └── fetch-rentes.ts           # Script om rentetarieven bij te werken
├── .github/workflows/
│   ├── deploy.yml                # Automatisch deployen naar GitHub Pages
│   └── update-rentes.yml         # Wekelijks rentetarieven bijwerken
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

## Licentie

MIT — zie [LICENSE](LICENSE) voor details.
