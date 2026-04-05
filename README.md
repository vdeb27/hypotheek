# Hypotheek Calculator

Een interactieve calculator voor het doorrekenen van hypotheekscenario's bij de aankoop van je eerste huis.

## Features

- **Actuele rentetarieven** van Nederlandse hypotheekverstrekkers (via Hypotheekbond)
- **NHG-premie** (0.4%) berekening
- **HRA-afbouw** scenario's
- **Woningindexatie** (3% per jaar)
- **Scheidingsscenario** met vorderingenberekening
- **Nibud-norm** vergelijking
- **Gemeentelijke lasten** (OZB, waterschap, rioolheffing, afvalstoffenheffing)
- **Kosten koper** uitsplitsing met belastingvoordeel

## Starten

### 1. Dependencies installeren
```bash
cd app
npm install
```

### 2. Persoonlijke configuratie aanmaken
```bash
cp src/user-config.example.ts src/user-config.ts
```
Pas `src/user-config.ts` aan met je eigen gegevens (woningwaarde, inkomen, etc.). Dit bestand wordt **niet** meegenomen in git.

### 3. Calculator starten
```bash
npm run dev
```

De calculator is dan beschikbaar op: **http://localhost:5173**

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

### Rentetarieven bijwerken
```bash
npm run update-rentes
```

## Project structuur

```
hypotheek-calculator/
├── app/                          # React applicatie
│   ├── src/
│   │   ├── HypotheekCalculator.tsx   # Hoofdcomponent
│   │   ├── App.tsx               # App wrapper
│   │   ├── types.ts              # Gedeelde TypeScript types
│   │   ├── belasting.ts          # Inkomstenbelasting berekening
│   │   ├── gemeente-tarieven.ts  # Gemeentelijke belastingtarieven
│   │   ├── user-config.ts        # Persoonlijke configuratie (gitignored)
│   │   ├── user-config.example.ts # Configuratie template
│   │   ├── index.css             # Tailwind CSS
│   │   └── providers/            # Hypotheekverstrekker data
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   └── fetch-rentes.ts           # Script om rentetarieven bij te werken
├── LICENSE
└── README.md
```

## Licentie

MIT - zie [LICENSE](LICENSE) voor details.
