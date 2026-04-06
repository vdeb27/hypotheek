export interface WoordenlijstItem {
  titel: string;
  uitleg: string;
}

const woordenlijst: Record<string, WoordenlijstItem> = {
  nhg: {
    titel: 'Nationale Hypotheek Garantie (NHG)',
    uitleg:
      'Een vangnet als je je hypotheek niet meer kunt betalen, bijvoorbeeld door werkloosheid of scheiding. Je betaalt eenmalig een premie (0,4% van de hypotheek), maar krijgt daarvoor een lagere rente.',
  },
  ltv: {
    titel: 'Loan-to-Value (LTV)',
    uitleg:
      'Het percentage van de woningwaarde dat je leent. Hoe lager dit percentage, hoe minder risico voor de bank — en dus hoe lager je rente. Leen je bijv. €380.000 op een huis van €400.000, dan is je LTV 95%.',
  },
  woonquote: {
    titel: 'Financieringslastpercentage',
    uitleg:
      'Het percentage van je bruto-inkomen dat naar bruto hypotheeklasten gaat. Dit is de maatstaf die het Nibud gebruikt. Het maximale percentage hangt af van je inkomen én je rentepercentage.',
  },
  hra: {
    titel: 'Hypotheekrenteaftrek (HRA)',
    uitleg:
      'Belastingvoordeel op de rente die je betaalt. Je mag de hypotheekrente aftrekken van je belastbaar inkomen, waardoor je minder inkomstenbelasting betaalt. Het maximale aftrekpercentage is 37,48%.',
  },
  eigenwoningforfait: {
    titel: 'Eigenwoningforfait',
    uitleg:
      'Een fictief bedrag dat de Belastingdienst bij je inkomen optelt omdat je in je eigen huis woont. Het is 0,35% van de WOZ-waarde. Dit verlaagt het voordeel van de hypotheekrenteaftrek iets.',
  },
  hypotheektype: {
    titel: 'Annuïtair vs. lineair',
    uitleg:
      'Bij annuïtair blijft je bruto maandlast gelijk: je begint met veel rente en weinig aflossing, en dat draait geleidelijk om. Bij lineair los je elke maand hetzelfde bedrag af: je begint met hogere lasten die steeds dalen.',
  },
  startersvrijstelling: {
    titel: 'Startersvrijstelling',
    uitleg:
      'Als je tussen 18 en 35 bent en voor het eerst een huis koopt onder de grens (€510.000 in 2026), betaal je geen overdrachtsbelasting (2%). Dat scheelt duizenden euro\'s.',
  },
  nibudNorm: {
    titel: 'Nibud financieringslastnorm',
    uitleg:
      'Richtlijn van het Nibud voor verantwoorde hypotheeklasten. Het maximale percentage van je bruto-inkomen dat naar hypotheeklasten mag gaan, afgeleid uit de Nibud-tabel op basis van je toetsinkomen en rentepercentage. Bijkomende woonlasten (OZB, waterschap, etc.) vallen hier buiten.',
  },
  kostenKoper: {
    titel: 'Kosten koper (k.k.)',
    uitleg:
      'Eenmalige kosten bovenop de koopprijs: notaris, kadaster, taxatie, bankgarantie, en eventueel overdrachtsbelasting, bouwkundige keuring en makelaar. Deze kosten kun je niet meefinancieren in je hypotheek.',
  },
  overdrachtsbelasting: {
    titel: 'Overdrachtsbelasting',
    uitleg:
      'Belasting van 2% over de koopsom die je betaalt bij de overdracht van een woning. Starters tussen 18 en 35 zijn hiervan vrijgesteld als de woning onder de grens valt.',
  },
  rentevastePeriode: {
    titel: 'Rentevaste periode',
    uitleg:
      'De periode waarin je rente gegarandeerd gelijk blijft, bijv. 10 jaar. Een langere periode geeft meer zekerheid maar is meestal duurder. Na afloop wordt de rente opnieuw vastgesteld.',
  },
  ozb: {
    titel: 'Onroerendezaakbelasting (OZB)',
    uitleg:
      'Jaarlijkse gemeentelijke belasting op je woning, berekend als percentage van de WOZ-waarde. Het percentage verschilt per gemeente.',
  },
  boeterente: {
    titel: 'Boeterente',
    uitleg:
      'Kosten die de bank in rekening brengt als je meer aflost dan het boetevrije deel (vaak 10-20% per jaar) tijdens de rentevaste periode. De boete hangt af van het renteverschil en de resterende looptijd.',
  },
  toetsinkomen: {
    titel: 'Toetsinkomen',
    uitleg:
      'Het inkomen dat de bank gebruikt om te bepalen hoeveel je kunt lenen. Dit is je bruto jaarloon plus structurele extra\'s zoals vakantiegeld, 13e maand en vaste eindejaarsuitkering. Staat op je werkgeversverklaring.',
  },
  energielabel: {
    titel: 'Energielabel',
    uitleg:
      'Geeft aan hoe energiezuinig je woning is, van A (zeer zuinig) tot G (zeer onzuinig). Een beter label kan een lagere hypotheekrente opleveren, omdat energiezuinige woningen lagere energiekosten hebben.',
  },
  buffer: {
    titel: 'Buffer',
    uitleg:
      'Spaargeld dat je achter de hand houdt voor onverwachte kosten. Een buffer van 3-6 maanden aan vaste lasten wordt aangeraden. Dit bedrag gaat niet naar je eigen inleg.',
  },
};

export default woordenlijst;
