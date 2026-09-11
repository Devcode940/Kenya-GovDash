// CECMs (County Executive Committee Members) for ALL 47 Kenya counties.
// Each county has ~10 CECM portfolios based on standard county government structures.
//
// Source: Constitution of Kenya 2010 Article 179; county government organograms.
// Individual office-holder names are marked "verification pending" where the
// current CECM name cannot be confirmed from official county publications.
// Portfolios reflect standard county departmental structures per the
// County Governments Act 2012.

import { buildCecms } from './kenya-detailed-counties';

// Standard portfolio set used across most counties
const STANDARD_PORTFOLIOS = [
  'finance', 'health', 'education', 'lands', 'transport',
  'water', 'environment', 'trade', 'agriculture', 'social',
] as const;

interface CountyCecmConfig {
  countyName: string;
  countyCode: number;
  // Optional: override portfolio labels per county
  portfolios?: Record<string, string>;
  // Optional: known CECM names
  names?: Record<string, string>;
}

const COUNTIES: CountyCecmConfig[] = [
  { countyName: 'Mombasa', countyCode: 1 }, // already exists, skipped in export
  { countyName: 'Kwale', countyCode: 2 },
  { countyName: 'Kilifi', countyCode: 3 },
  { countyName: 'Tana River', countyCode: 4 },
  { countyName: 'Lamu', countyCode: 5 },
  { countyName: 'Taita Taveta', countyCode: 6 },
  { countyName: 'Garissa', countyCode: 7 },
  { countyName: 'Wajir', countyCode: 8 },
  { countyName: 'Mandera', countyCode: 9 },
  { countyName: 'Marsabit', countyCode: 10 },
  { countyName: 'Isiolo', countyCode: 11 },
  { countyName: 'Meru', countyCode: 12 },
  { countyName: 'Tharaka Nithi', countyCode: 13 },
  { countyName: 'Embu', countyCode: 14 },
  { countyName: 'Kitui', countyCode: 15 },
  { countyName: 'Machakos', countyCode: 16 },
  { countyName: 'Makueni', countyCode: 17 },
  { countyName: 'Nyandarua', countyCode: 18 },
  { countyName: 'Nyeri', countyCode: 19 },
  { countyName: 'Kirinyaga', countyCode: 20 },
  { countyName: "Murang'a", countyCode: 21 },
  { countyName: 'Kiambu', countyCode: 22 },
  { countyName: 'Turkana', countyCode: 23 },
  { countyName: 'West Pokot', countyCode: 24 },
  { countyName: 'Samburu', countyCode: 25 },
  { countyName: 'Trans Nzoia', countyCode: 26 },
  { countyName: 'Uasin Gishu', countyCode: 27 },
  { countyName: 'Elgeyo-Marakwet', countyCode: 28 },
  { countyName: 'Nandi', countyCode: 29 },
  { countyName: 'Baringo', countyCode: 30 },
  { countyName: 'Laikipia', countyCode: 31 },
  { countyName: 'Nakuru', countyCode: 32 },
  { countyName: 'Narok', countyCode: 33 },
  { countyName: 'Kajiado', countyCode: 34 },
  { countyName: 'Kericho', countyCode: 35 },
  { countyName: 'Bomet', countyCode: 36 },
  { countyName: 'Kakamega', countyCode: 37 },
  { countyName: 'Vihiga', countyCode: 38 },
  { countyName: 'Bungoma', countyCode: 39 },
  { countyName: 'Busia', countyCode: 40 },
  { countyName: 'Siaya', countyCode: 41 },
  { countyName: 'Kisumu', countyCode: 42 }, // already exists, skipped in export
  { countyName: 'Homa Bay', countyCode: 43 },
  { countyName: 'Migori', countyCode: 44 },
  { countyName: 'Kisii', countyCode: 45 },
  { countyName: 'Nyamira', countyCode: 46 },
  { countyName: 'Nairobi City', countyCode: 47 }, // already exists, skipped in export
];

const DEFAULT_PORTFOLIO_LABELS: Record<string, string> = {
  finance: 'Finance & Economic Planning',
  health: 'Health Services',
  education: 'Education, Youth, Sports, Culture & Arts',
  lands: 'Lands, Housing & Urban Planning',
  transport: 'Roads, Transport & Public Works',
  water: 'Water, Sanitation & Energy',
  environment: 'Environment & Natural Resources',
  trade: 'Trade, Industry & Cooperatives',
  agriculture: 'Agriculture, Livestock Development & Fisheries',
  social: 'Social Services, Gender & Public Service Administration',
};

// Generate a slug from county name for CECM IDs
function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Build CECMs for a single county
function buildCountyCecms(config: CountyCecmConfig) {
  const specs = STANDARD_PORTFOLIOS.map(portfolio => {
    const label = (config.portfolios?.[portfolio] || DEFAULT_PORTFOLIO_LABELS[portfolio]);
    const name = config.names?.[portfolio];
    return {
      id: `cecm-${slug(config.countyName)}-${portfolio}`,
      portfolio: label,
      fullName: name,
      countyName: config.countyName,
      countyCode: config.countyCode,
    };
  });
  return buildCecms(specs);
}

// Skip Mombasa (1), Kisumu (42), Nairobi City (47) — already defined in kenya-detailed-counties.ts
const SKIP_COUNTIES = new Set(['Mombasa', 'Kisumu', 'Nairobi City']);

// Generate all CECM exports
const exports: Record<string, any> = {};
for (const config of COUNTIES) {
  if (SKIP_COUNTIES.has(config.countyName)) continue;
  const exportName = `${config.countyName.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '')}_CECMS`;
  exports[exportName] = buildCountyCecms(config);
}

// Export all
export const KWALE_CECMS = exports.KWALE_CECMS;
export const KILIFI_CECMS = exports.KILIFI_CECMS;
export const TANA_RIVER_CECMS = exports.TANA_RIVER_CECMS;
export const LAMU_CECMS = exports.LAMU_CECMS;
export const TAITA_TAVETA_CECMS = exports.TAITA_TAVETA_CECMS;
export const GARISSA_CECMS = exports.GARISSA_CECMS;
export const WAJIR_CECMS = exports.WAJIR_CECMS;
export const MANDERA_CECMS = exports.MANDERA_CECMS;
export const MARSABIT_CECMS = exports.MARSABIT_CECMS;
export const ISIOLO_CECMS = exports.ISIOLO_CECMS;
export const MERU_CECMS = exports.MERU_CECMS;
export const THARAKA_NITHI_CECMS = exports.THARAKA_NITHI_CECMS;
export const EMBU_CECMS = exports.EMBU_CECMS;
export const KITUI_CECMS = exports.KITUI_CECMS;
export const MACHAKOS_CECMS = exports.MACHAKOS_CECMS;
export const MAKUENI_CECMS = exports.MAKUENI_CECMS;
export const NYANDARUA_CECMS = exports.NYANDARUA_CECMS;
export const NYERI_CECMS = exports.NYERI_CECMS;
export const KIRINYAGA_CECMS = exports.KIRINYAGA_CECMS;
export const MURANG_A_CECMS = exports["MURANG'A_CECMS"];
export const KIAMBU_CECMS = exports.KIAMBU_CECMS;
export const TURKANA_CECMS = exports.TURKANA_CECMS;
export const WEST_POKOT_CECMS = exports.WEST_POKOT_CECMS;
export const SAMBURU_CECMS = exports.SAMBURU_CECMS;
export const TRANS_NZOIA_CECMS = exports.TRANS_NZOIA_CECMS;
export const UASIN_GISHU_CECMS = exports.UASIN_GISHU_CECMS;
export const ELGEYO_MARAKWET_CECMS = exports.ELGEYO_MARAKWET_CECMS;
export const NANDI_CECMS = exports.NANDI_CECMS;
export const BARINGO_CECMS = exports.BARINGO_CECMS;
export const LAIKIPIA_CECMS = exports.LAIKIPIA_CECMS;
export const NAKURU_CECMS = exports.NAKURU_CECMS;
export const NAROK_CECMS = exports.NAROK_CECMS;
export const KAJIADO_CECMS = exports.KAJIADO_CECMS;
export const KERICHO_CECMS = exports.KERICHO_CECMS;
export const BOMET_CECMS = exports.BOMET_CECMS;
export const KAKAMEGA_CECMS = exports.KAKAMEGA_CECMS;
export const VIHIGA_CECMS = exports.VIHIGA_CECMS;
export const BUNGOMA_CECMS = exports.BUNGOMA_CECMS;
export const BUSIA_CECMS = exports.BUSIA_CECMS;
export const SIAYA_CECMS = exports.SIAYA_CECMS;
export const HOMA_BAY_CECMS = exports.HOMA_BAY_CECMS;
export const MIGORI_CECMS = exports.MIGORI_CECMS;
export const KISII_CECMS = exports.KISII_CECMS;
export const NYAMIRA_CECMS = exports.NYAMIRA_CECMS;

// Map of county name → CECMs (for runtime lookup)
export const ALL_COUNTY_CECMS: Record<string, any> = {
  'Mombasa': null, // use MOMBASA_CECMS from kenya-detailed-counties.ts
  'Kwale': KWALE_CECMS,
  'Kilifi': KILIFI_CECMS,
  'Tana River': TANA_RIVER_CECMS,
  'Lamu': LAMU_CECMS,
  'Taita Taveta': TAITA_TAVETA_CECMS,
  'Garissa': GARISSA_CECMS,
  'Wajir': WAJIR_CECMS,
  'Mandera': MANDERA_CECMS,
  'Marsabit': MARSABIT_CECMS,
  'Isiolo': ISIOLO_CECMS,
  'Meru': MERU_CECMS,
  'Tharaka Nithi': THARAKA_NITHI_CECMS,
  'Embu': EMBU_CECMS,
  'Kitui': KITUI_CECMS,
  'Machakos': MACHAKOS_CECMS,
  'Makueni': MAKUENI_CECMS,
  'Nyandarua': NYANDARUA_CECMS,
  'Nyeri': NYERI_CECMS,
  'Kirinyaga': KIRINYAGA_CECMS,
  "Murang'a": MURANG_A_CECMS,
  'Kiambu': KIAMBU_CECMS,
  'Turkana': TURKANA_CECMS,
  'West Pokot': WEST_POKOT_CECMS,
  'Samburu': SAMBURU_CECMS,
  'Trans Nzoia': TRANS_NZOIA_CECMS,
  'Uasin Gishu': UASIN_GISHU_CECMS,
  'Elgeyo-Marakwet': ELGEYO_MARAKWET_CECMS,
  'Nandi': NANDI_CECMS,
  'Baringo': BARINGO_CECMS,
  'Laikipia': LAIKIPIA_CECMS,
  'Nakuru': NAKURU_CECMS,
  'Narok': NAROK_CECMS,
  'Kajiado': KAJIADO_CECMS,
  'Kericho': KERICHO_CECMS,
  'Bomet': BOMET_CECMS,
  'Kakamega': KAKAMEGA_CECMS,
  'Vihiga': VIHIGA_CECMS,
  'Bungoma': BUNGOMA_CECMS,
  'Busia': BUSIA_CECMS,
  'Siaya': SIAYA_CECMS,
  'Kisumu': null, // use KISUMU_CECMS
  'Homa Bay': HOMA_BAY_CECMS,
  'Migori': MIGORI_CECMS,
  'Kisii': KISII_CECMS,
  'Nyamira': NYAMIRA_CECMS,
  'Nairobi City': null, // use NAIROBI_CECMS
};
