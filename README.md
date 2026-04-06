# Hypotheek Calculator

Een interactieve calculator voor het doorrekenen van hypotheekscenario's bij de aankoop van je eerste huis in Nederland.

## Voor wie is dit?

Deze tool is gemaakt voor starters op de Nederlandse woningmarkt die willen begrijpen wat een hypotheek werkelijk kost. Je kunt er onder meer mee:

- **Scenario's doorrekenen**: wat als je parttime gaat werken, promotie krijgt, of uit elkaar gaat?
- **Kosten vergelijken**: actuele rentetarieven van 100+ hypotheekproducten
- **Maandlasten begrijpen**: inclusief gemeentelijke belastingen, verzekering, onderhoud en belastingvoordeel
- **Betaalbaarheid toetsen**: woonquote en Nibud-norm vergelijking

Alle berekeningen draaien lokaal in je browser. Er wordt geen data verstuurd naar externe servers.

## Starten

### 1. Dependencies installeren
```bash
cd app
npm install
```

### 2. Persoonlijke configuratie aanmaken
```bash
cp src/user-config.example.json src/user-config.json
```
Open `src/user-config.json` in een teksteditor en vul je eigen gegevens in (woningwaarde, inkomen, spaargeld, gemeente, etc.). Dit bestand wordt **niet** meegenomen in git.

### 3. Calculator starten
```bash
npm run dev
```

De calculator is dan beschikbaar op: **http://localhost:5173**

Als je geen eigen configuratie aanmaakt, toont de calculator een welkomstscherm met instructies.

## Configuratie

Het bestand `src/user-config.json` bevat je persoonlijke financiele gegevens:

| Veld | Beschrijving |
|------|-------------|
| `woningwaarde` | Aankoopprijs van de woning |
| `buffer` | Spaargeld dat je achter de hand wilt houden |
| `spaargeldJij` / `spaargeldPartner` | Beschikbaar spaargeld per persoon |
| `inlegPercentageJij` | Jouw aandeel in de eigen inleg (percentage) |
| `brutoJaarinkomenJij` / `brutoJaarinkomenPartner` | Toetsinkomen (bruto per jaar) |
| `jijMaxUren` / `partnerMaxUren` | Fulltime werkuren per week |
| `jijUrenNaMinderWerken` / `partnerUrenNaMinderWerken` | Uren bij minder werken scenario |
| `promotieOpslagPercentage` | Verwachte bruto-opslag bij promotie |
| `startJaar` | Jaar van aankoop |
| `gemeente` | Gemeente voor OZB/gemeentelijke lasten |
| `energielabel` | Energielabel van de woning (A t/m G) |
| `opstalverzekeringMaand` | Opstalverzekering per maand |
| `makelaarsKosten` | Kosten aankoopmakelaar |

Bij alleen kopen: zet de partner-velden op `0`.

## Rentetarieven bijwerken

De calculator gebruikt actuele rentetarieven van Nederlandse hypotheekverstrekkers via de Hypotheekbond API. Deze tarieven zijn gecached in `src/providers/data/rates-cache.json`.

```bash
npm run update-rentes
```

Draai dit commando periodiek (bijv. maandelijks) om de tarieven actueel te houden. De calculator toont een waarschuwing als de tarieven ouder zijn dan 14 dagen.

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
- **Vite 5** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

Wijzigingen worden automatisch ververst in de browser (Hot Module Replacement).

### Productie build maken
```bash
cd app
npm run build
```

### Tests draaien
```bash
npm run test          # Eenmalig
npm run test:watch    # Watch mode
```

### Linting & formatting
```bash
npm run lint
npm run format
```

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
│   │   ├── user-config.json      # Persoonlijke configuratie (gitignored)
│   │   ├── user-config.example.json  # Configuratie template
│   │   ├── components/           # UI componenten
│   │   │   ├── InvoerKolom.tsx       # Invoer (woning, kosten, woonlasten)
│   │   │   ├── CarriereKolom.tsx     # Inkomen & scenario's
│   │   │   ├── ResultatenKolom.tsx   # Berekende resultaten
│   │   │   ├── JaarlijkseTabel.tsx   # 30-jaar overzicht
│   │   │   ├── Tooltip.tsx           # Info-tooltips
│   │   │   └── ConfigOnboarding.tsx  # Welkomstscherm
│   │   ├── lib/                  # Berekeningen & hulpfuncties
│   │   │   ├── berekeningen.ts       # Financiele berekeningen
│   │   │   ├── formatters.ts         # Geld/percentage formatting
│   │   │   ├── config-loader.ts      # Configuratie laden
│   │   │   ├── staleness.ts          # Verouderingsdetectie
│   │   │   └── woordenlijst.ts       # Uitleg vaktermen
│   │   └── providers/            # Hypotheekverstrekker data
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   └── fetch-rentes.ts           # Script om rentetarieven bij te werken
├── CONTRIBUTING.md               # Bijdrage-instructies
├── LICENSE
└── README.md
```

## Licentie

MIT - zie [LICENSE](LICENSE) voor details.
