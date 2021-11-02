const KPI_NAMES = new Map([
  [
    'EC: ICT: ICT: 1C',
    {
      eng: 'Household Internet Access',
      nor: 'Husholdning Internett-tilgang',
    },
  ],
  [
    'EC: ICT: ICT: 2C',
    {
      eng: 'Fixed Broadband Subscriptions',
      nor: 'Fast bredb\u00e5ndsabonnement',
    },
  ],
  [
    'EC: ICT: ICT: 3C',
    {
      eng: 'Wireless Broadband Subscriptions',
      nor: 'Tr\u00e5dl\u00f8se bredb\u00e5ndsabonnement',
    },
  ],
  [
    'EC: ICT: ICT: 4C',
    {
      eng: 'Wireless Broadband Coverage',
      nor: 'Tr\u00e5dl\u00f8st bredb\u00e5ndsdekning',
    },
  ],
  [
    'EC: ICT: ICT: 4C - 3g',
    {
      eng: 'Wireless Broadband Coverage - 3G',
      nor: 'Tr\u00e5dl\u00f8st bredb\u00e5ndsdekning - 3G',
    },
  ],
  [
    'EC: ICT: ICT: 4C - 4g',
    {
      eng: 'Wireless Broadband Coverage - 4G',
      nor: 'Tr\u00e5dl\u00f8st bredb\u00e5ndsdekning - 4G',
    },
  ],
  [
    'EC: ICT: ICT: 5C',
    {
      eng: 'Availability of WIFI in Public Areas',
      nor: 'WIFI i offentlige omr\u00e5der',
    },
  ],
  [
    'EC: ICT: WS: 1C',
    {
      eng: 'Smart Water Meters',
      nor: 'Smarte vannm\u00e5lere',
    },
  ],
  [
    'EC: ICT: WS: 2A',
    {
      eng: 'Water Supply ICT Monitoring',
      nor: 'Vannforsyning IKT-overv\u00e5king',
    },
  ],
  [
    'EC: ICT: D: 1A',
    {
      eng: 'Drainage / Storm Water System ICT Monitoring',
      nor: 'Drenering / overvannssystem IKT-overv\u00e5king',
    },
  ],
  [
    'EC: ICT: ES: 1C',
    {
      eng: 'Smart Electricity Meters',
      nor: 'Smarte elektrisitetsm\u00e5lere',
    },
  ],
  [
    'EC: ICT: ES: 2A',
    {
      eng: 'Electricity Supply ICT Monitoring',
      nor: 'Elektrisitetsforsyning IKT-overv\u00e5king',
    },
  ],
  [
    'EC: ICT: ES: 3A',
    {
      eng: 'Demand Response Penetration',
      nor: 'Inntrengning av ettersp\u00f8rselssvar',
    },
  ],
  [
    'EC: ICT: T: 1C',
    {
      eng: 'Dynamic Public Transport Information',
      nor: 'Dynamisk informasjon om offentlig transport',
    },
  ],
  [
    'EC: ICT: T: 2C',
    {
      eng: 'Traffic Monitoring',
      nor: 'Trafikkoverv\u00e5king',
    },
  ],
  [
    'EC: ICT: T: 3A',
    {
      eng: 'Intersection Control',
      nor: 'Kryssingskontroll',
    },
  ],
  [
    'EC: ICT: PS: 1A',
    {
      eng: 'Open Data',
      nor: '\u00c5pne data',
    },
  ],
  [
    'EC: ICT: PS: 1A - number',
    {
      eng: 'Open Data - Number',
      nor: '\u00c5pne data - Antall',
    },
  ],
  [
    'EC: ICT: PS: 1A - percent',
    {
      eng: 'Open Data - Percent',
      nor: '\u00c5pne data - Prosent',
    },
  ],
  [
    'EC: ICT: PS: 2A',
    {
      eng: 'e- Government',
      nor: 'e-regjering',
    },
  ],
  [
    'EC: ICT: PS: 3A',
    {
      eng: 'Public Sector e-procurement',
      nor: 'Offentlig sektor e-anskaffelser',
    },
  ],
  [
    'EC: P: IN: 1C',
    {
      eng: 'R&D expenditure',
      nor: 'Forsknings- og utviklingsutgifter',
    },
  ],
  [
    'EC: P: IN: 2C',
    {
      eng: 'Patents',
      nor: 'patenter',
    },
  ],
  [
    'EC: P: IN: 3A',
    {
      eng: 'Small and Medium-Sized Enterprises',
      nor: 'Sm\u00e5 og mellomstore bedrifter',
    },
  ],
  [
    'EC: P: EM: 1C',
    {
      eng: 'Unemployment Rate',
      nor: 'Arbeidsledighet',
    },
  ],
  [
    'EC: P: EM: 2C',
    {
      eng: 'Youth Unemployment Rate',
      nor: 'ungdom Arbeidsledighet',
    },
  ],
  [
    'EC: P: EM: 3A',
    {
      eng: 'Tourism Sector Employment',
      nor: 'Reiselivssektor sysselsetting',
    },
  ],
  [
    'EC: P: EM: 4A',
    {
      eng: 'ICT Sector Employment',
      nor: 'IKT-sektor sysselsetting',
    },
  ],
  [
    'EC: I: WS: 1C',
    {
      eng: 'Basic Water Supply',
      nor: 'Grunnleggende vannforsyning',
    },
  ],
  [
    'EC: I: WS: 2C',
    {
      eng: 'Potable Water Supply',
      nor: 'Drikkevannsforsyning',
    },
  ],
  [
    'EC: I: WS: 3C',
    {
      eng: 'Water Supply Loss',
      nor: 'Tap av vannforsyning',
    },
  ],
  [
    'EC: I: WS: 4C',
    {
      eng: 'Wastewater Collection',
      nor: 'Avl\u00f8pssamling',
    },
  ],
  [
    'EC: I: WS: 5C',
    {
      eng: 'Household Sanitation',
      nor: 'Husholdning Sanitet',
    },
  ],
  [
    'EC: I: WA: 1C',
    {
      eng: 'Solid Waste Collection',
      nor: 'innsamling av fast avfall',
    },
  ],
  [
    'EC: I: ES: 1C',
    {
      eng: 'Electricity System Outage Frequency',
      nor: 'Str\u00f8mfrekvens for elektrisitetssystem',
    },
  ],
  [
    'EC: I: ES: 2C',
    {
      eng: 'Electricity System Outage Time',
      nor: 'Driftsstans for elektrisitetssystemet',
    },
  ],
  [
    'EC: I: ES: 3C',
    {
      eng: 'Access to Electricity',
      nor: 'Tilgang til elektrisitet',
    },
  ],
  [
    'EC: I: T: 1C',
    {
      eng: 'Public Transport Network',
      nor: 'Offentlig transportnett',
    },
  ],
  [
    'EC: I: T: 2A',
    {
      eng: 'Public Transport Network Convenience',
      nor: 'Bekvemmeligheter for offentlig transportnett',
    },
  ],
  [
    'EC: I: T: 3C',
    {
      eng: 'Bicycle Network',
      nor: 'Sykkelnettverk',
    },
  ],
  [
    'EC: I: T: 4A',
    {
      eng: 'Transportation Mode Share',
      nor: 'Transportmodus Del',
    },
  ],
  [
    'EC: I: T: 4A - private',
    {
      eng: 'Transportation Mode Share - Private Vehicles',
      nor: 'Transportmodus Del - Private kj\u00f8ret\u00f8y',
    },
  ],
  [
    'EC: I: T: 4A - public',
    {
      eng: 'Transportation Mode Share - Public Transport',
      nor: 'Transportmodus Del - Offentlig transport',
    },
  ],
  [
    'EC: I: T: 4A - walking',
    {
      eng: 'Transportation Mode Share - Walking',
      nor: 'Transportmodus Del - Gang',
    },
  ],
  [
    'EC: I: T: 4A - cycling',
    {
      eng: 'Transportation Mode Share - Cycling',
      nor: 'Transportmodus Del - Sykling',
    },
  ],
  [
    'EC: I: T: 4A - para',
    {
      eng: 'Transportation Mode Share - Para Transport',
      nor: 'Transportmodus Del -',
    },
  ],
  [
    'EC: I: T: 5A',
    {
      eng: 'Travel Time Index',
      nor: 'Reisetidsindeks',
    },
  ],
  [
    'EC: I: T: 6A',
    {
      eng: 'Shared Bicycles',
      nor: 'Felles sykler',
    },
  ],
  [
    'EC: I: T: 7A',
    {
      eng: 'Shared Vehicles',
      nor: 'Felles kj\u00f8ret\u00f8y',
    },
  ],
  [
    'EC: I: T: 8A',
    {
      eng: 'Low-Carbon Emission Passenger Vehicles',
      nor: 'Kj\u00f8ret\u00f8y med lav utslipp',
    },
  ],
  [
    'EC: I: B: 1A',
    {
      eng: 'Public Building Sustainability',
      nor: 'Offentlig bygning - b\u00e6rekraftsertifisering',
    },
  ],
  [
    'EC: I: B: 2A',
    {
      eng: 'Integrated Building Management Systems in Public Buildings',
      nor: 'Offentlige bygninger - byggeledelsessystemer',
    },
  ],
  [
    'EC: I: UP: 1A',
    {
      eng: 'Pedestrian infrastructure',
      nor: 'Fotgjengerinfrastruktur',
    },
  ],
  [
    'EC: I: UP: 2A',
    {
      eng: 'Urban Development and Spatial Planning',
      nor: 'Urban planlegging',
    },
  ],
  [
    'EC: I: UP: 2A - compact',
    {
      eng: 'Urban Development and Spatial Planning - Compact',
      nor: 'Urban planlegging - Kompakt',
    },
  ],
  [
    'EC: I: UP: 2A - connected',
    {
      eng: 'Urban Development and Spatial Planning - Connected',
      nor: 'Urban planlegging - Tilkoblet',
    },
  ],
  [
    'EC: I: UP: 2A - integrated',
    {
      eng: 'Urban Development and Spatial Planning - Integrated',
      nor: 'Urban planlegging - Integrert',
    },
  ],
  [
    'EC: I: UP: 2A - inclusive',
    {
      eng: 'Urban Development and Spatial Planning - Inclusive',
      nor: 'Urban planlegging - Inklusive',
    },
  ],
  [
    'EC: I: UP: 2A - resilient',
    {
      eng: 'Urban Development and Spatial Planning - Resilient',
      nor: 'Urban planlegging - Motstandsdyktighet',
    },
  ],
  [
    'EN: EN: AQ: 1C',
    {
      eng: 'Air Pollution',
      nor: 'Luftkvalitet',
    },
  ],
  [
    'EN: EN: AQ: 1C - pm_2.5',
    {
      eng: 'Air Pollution - PM 2.5',
      nor: 'Luftkvalitet - PM 2.5',
    },
  ],
  [
    'EN: EN: AQ: 1C - pm_10',
    {
      eng: 'Air Pollution - PM 10',
      nor: 'Luftkvalitet - PM 10',
    },
  ],
  [
    'EN: EN: AQ: 1C - no2',
    {
      eng: 'Air Pollution - NO2',
      nor: 'Luftkvalitet - NO2',
    },
  ],
  [
    'EN: EN: AQ: 1C - so2',
    {
      eng: 'Air Pollution - SO2',
      nor: 'Luftkvalitet - SO2',
    },
  ],
  [
    'EN: EN: AQ: 1C - o3',
    {
      eng: 'Air Pollution - O3',
      nor: 'Luftkvalitet - O3',
    },
  ],
  [
    'EN: EN: AQ: 2C',
    {
      eng: 'GHG Emissions',
      nor: 'Klimagassutslipp',
    },
  ],
  [
    'EN: EN: WS: 1C',
    {
      eng: 'Drinking Water Quality',
      nor: 'Drikkevannskvalitet',
    },
  ],
  [
    'EN: EN: WS: 2C',
    {
      eng: 'Water Consumption',
      nor: 'Vannforbruk',
    },
  ],
  [
    'EN: EN: WS: 3C',
    {
      eng: 'Freshwater Consumption',
      nor: 'Ferskvannforbruk',
    },
  ],
  [
    'EN: EN: WS: 4C',
    {
      eng: 'Wastewater Treatment',
      nor: 'Avl\u00f8psrensing',
    },
  ],
  [
    'EN: EN: WS: 4C - primary',
    {
      eng: 'Wastewater Treatment - Primary',
      nor: 'Avl\u00f8psrensing - Hoved',
    },
  ],
  [
    'EN: EN: WS: 4C - secondary',
    {
      eng: 'Wastewater Treatment - Secondary',
      nor: 'Avl\u00f8psrensing - Sekund\u00e6r',
    },
  ],
  [
    'EN: EN: WS: 4C - tertiary',
    {
      eng: 'Wastewater Treatment - Tertiary',
      nor: 'Avl\u00f8psrensing -Terti\u00e6re',
    },
  ],
  [
    'EN: EN: WA: 1C',
    {
      eng: 'Solid Waste Treatment',
      nor: 'Fast avfallsbehandling',
    },
  ],
  [
    'EN: EN: WA: 1C - landfill',
    {
      eng: 'Solid Waste Treatment - Landfill',
      nor: 'Fast avfallsbehandling - Deponi',
    },
  ],
  [
    'EN: EN: WA: 1C - burnt',
    {
      eng: 'Solid Waste Treatment - Burnt',
      nor: 'Fast avfallsbehandling - Brent',
    },
  ],
  [
    'EN: EN: WA: 1C - incinerated',
    {
      eng: 'Solid Waste Treatment - Incinerated',
      nor: 'Fast avfallsbehandling - Forbrenningsovn',
    },
  ],
  [
    'EN: EN: WA: 1C - open_dump',
    {
      eng: 'Solid Waste Treatment - Open Dump',
      nor: 'Fast avfallsbehandling - \u00c5pne dumper',
    },
  ],
  [
    'EN: EN: WA: 1C - recycled',
    {
      eng: 'Solid Waste Treatment - Recycled',
      nor: 'Fast avfallsbehandling - Resirkulert',
    },
  ],
  [
    'EN: EN: WA: 1C - other',
    {
      eng: 'Solid Waste Treatment - Other',
      nor: 'Fast avfallsbehandling - Annen',
    },
  ],
  [
    'EN: EN: EQ: 1C',
    {
      eng: 'EMF Exposure',
      nor: 'EMF - Eksponering',
    },
  ],
  [
    'EN: EN: EQ: 2A',
    {
      eng: 'Noise Exposure',
      nor: 'St\u00f8yeksponering',
    },
  ],
  [
    'EN: EN: PSN: 1C',
    {
      eng: 'Green Areas',
      nor: 'Gr\u00f8nne omr\u00e5der',
    },
  ],
  [
    'EN: EN: PSN: 2A',
    {
      eng: 'Green Area Accessibility',
      nor: 'Gr\u00f8nne omr\u00e5der - Tilgjengelighet',
    },
  ],
  [
    'EN: EN: PSN: 3A',
    {
      eng: 'Protected Natural Areas',
      nor: 'Beskyttede naturomr\u00e5der',
    },
  ],
  [
    'EN: EN: PSN: 4A',
    {
      eng: 'Recreational  Facilities',
      nor: 'Fritidsfasiliteter',
    },
  ],
  [
    'EN: E: E: 1C',
    {
      eng: 'Renewable Energy Consumption',
      nor: 'Fornybart energiforbruk',
    },
  ],
  [
    'EN: E: E: 2C',
    {
      eng: 'Electricity Consumption',
      nor: 'Str\u00f8mforbruk',
    },
  ],
  [
    'EN: E: E: 3C',
    {
      eng: 'Residential Thermal Energy Consumption',
      nor: 'Residentialt termisk energiforbruk',
    },
  ],
  [
    'EN: E: E: 4A',
    {
      eng: 'Public Building Energy Consumption',
      nor: 'Offentlig bygningsenergiforbruk',
    },
  ],
  [
    'SC: EH: ED: 1C',
    {
      eng: 'Student ICT Access',
      nor: 'Student IKT-Tilgang',
    },
  ],
  [
    'SC: EH: ED: 2C',
    {
      eng: 'School Enrollment',
      nor: 'P\u00e5melding til skolen',
    },
  ],
  [
    'SC: EH: ED: 3C',
    {
      eng: 'Higher Education Degrees',
      nor: 'Grad av h\u00f8yere utdanning',
    },
  ],
  [
    'SC: EH: ED: 4C',
    {
      eng: 'Adult Literacy',
      nor: 'Voksen leseferdighet',
    },
  ],
  [
    'SC: EH: ED: 5A',
    {
      eng: 'Electronic Health Records',
      nor: 'Elektronisk helsejournal',
    },
  ],
  [
    'SC: EH: H: 1C',
    {
      eng: 'Life Expectancy',
      nor: 'Forventet levealder',
    },
  ],
  [
    'SC: EH: H: 2C',
    {
      eng: 'Maternal Mortality Rate',
      nor: 'M\u00f8dred\u00f8delighet',
    },
  ],
  [
    'SC: EH: H: 3C',
    {
      eng: 'Physicians',
      nor: 'Leger',
    },
  ],
  [
    'SC: EH: H: 4A',
    {
      eng: 'In-Patient Hospital Beds',
      nor: 'Pasienter p\u00e5 sykehus',
    },
  ],
  [
    'SC: EH: H: 5A',
    {
      eng: 'Health Insurance/Public Health Coverage',
      nor: 'Pasienter p\u00e5 sykehus',
    },
  ],
  [
    'SC: EH: C: 1C',
    {
      eng: 'Cultural Expenditure',
      nor: 'Kulturutgifter',
    },
  ],
  [
    'SC: EH: C: 2A',
    {
      eng: 'Cultural Infrastructure',
      nor: 'Kulturell infrastruktur',
    },
  ],
  [
    'SC: SH: HO: 1C',
    {
      eng: 'Informal Settlements',
      nor: 'Uformelle oppgj\u00f8r',
    },
  ],
  [
    'SC: SH: HO: 2A',
    {
      eng: 'Housing Expenditure',
      nor: 'Boligutgifter',
    },
  ],
  [
    'SC: SH: SI: 1C',
    {
      eng: 'Gender Income Equity',
      nor: 'Inntekts egenkapital',
    },
  ],
  [
    'SC: SH: SI: 2C',
    {
      eng: 'Gini Coefficient',
      nor: 'Gini-koeffisient',
    },
  ],
  [
    'SC: SH: SI: 3C',
    {
      eng: 'Poverty',
      nor: 'Fattigdom',
    },
  ],
  [
    'SC: SH: SI: 4C',
    {
      eng: 'Voter Participation',
      nor: 'Velgerdeltakelse',
    },
  ],
  [
    'SC: SH: SI: 5A',
    {
      eng: 'Child Care Availability',
      nor: 'Tilgjengelighet for barnepass',
    },
  ],
  [
    'SC: SH: SA: 1C',
    {
      eng: 'Natural Disaster Related Deaths',
      nor: 'Naturlige katastroferelaterte d\u00f8dsfall',
    },
  ],
  [
    'SC: SH: SA: 2C',
    {
      eng: 'Disaster Related Economic Losses',
      nor: 'Katastrofrelaterte \u00f8konomiske tap',
    },
  ],
  [
    'SC: SH: SA: 3A',
    {
      eng: 'Resilience Plans',
      nor: 'Motstandsplaner',
    },
  ],
  [
    'SC: SH: SA: 4A',
    {
      eng: 'Population Living in Disaster Prone Areas',
      nor: 'Befolkning som bor i katastrofeutsatte omr\u00e5der',
    },
  ],
  [
    'SC: SH: SA: 5A',
    {
      eng: 'Emergency Services Response Time',
      nor: 'N\u00f8detatens responstid',
    },
  ],
  [
    'SC: SH: SA: 6C',
    {
      eng: 'Police Service',
      nor: 'Polititjeneste',
    },
  ],
  [
    'SC: SH: SA: 7C',
    {
      eng: 'Fire Service',
      nor: 'Brannvesenet',
    },
  ],
  [
    'SC: SH: SA: 8C',
    {
      eng: 'Violent Crime Rate',
      nor: 'Voldelige kriminalitetsrater',
    },
  ],
  [
    'SC: SH: SA: 9C',
    {
      eng: 'Traffic Fatalities',
      nor: 'Trafikkdrepte',
    },
  ],
  [
    'SC: SH: FS: 1A',
    {
      eng: 'Local Food Production',
      nor: 'Lokal matforsyning',
    },
  ],
]);

export default KPI_NAMES;
