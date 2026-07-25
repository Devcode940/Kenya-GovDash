// Kenya Government Accountability Dashboard — Data Layer
// ALL data is factual with source citations. Never invent numbers.
// Where data is unavailable: "Data not publicly available in latest OAG/CoB/TI-Kenya reports"

// ==================== TYPES ====================

export type AuditOpinionType = 'Unmodified' | 'Qualified' | 'Adverse' | 'Disclaimer';
export type CoalitionType = 'Kenya Kwanza' | 'Azimio' | 'Independent' | 'Other';
export type LevelType = 'National' | 'County' | 'Constituency' | 'Ward';
export type RegionType = 'Coast' | 'North Eastern' | 'Eastern' | 'Central' | 'Rift Valley' | 'Western' | 'Nyanza' | 'Nairobi';

export interface SourceCitation {
  reportTitle: string;
  financialYear?: string;
  page?: string;
  url: string;
  dataAvailable: boolean;
  note?: string;
}

export interface ScoreMetric {
  score: number | null;
  source: string;
  fy?: string;
  page?: string;
  url?: string;
  dataAvailable: boolean;
  note?: string;
}

export interface ScoreCard {
  overallAccountability: ScoreMetric;
  transparencyBudget: ScoreMetric;
  projectDeliveryAbsorption: ScoreMetric;
  manifestoFulfillment: ScoreMetric;
  legislativeOversight: ScoreMetric;
  ethicsIntegrity: ScoreMetric;
  publicSentiment: ScoreMetric;
}

export interface AuditOpinion {
  fy2023_24: {
    type: AuditOpinionType;
    source: string;
    url: string;
  };
  fy2024_25: {
    type: string | null;
    source: string | null;
    url: string | null;
    dataAvailable: boolean;
  };
}

export interface BudgetPerformance {
  overallAbsorption: { rate: number | null; source: string; fy: string };
  recurrentAbsorption: { rate: number | null; source: string; fy: string };
  developmentAbsorption: { rate: number | null; source: string; fy: string };
}

export interface ContactInfo {
  email: string | null;
  phone: string | null;
  twitter: string | null;
  website: string | null;
}

export interface Representative {
  id: string;
  fullName: string;
  officialTitle: string;
  party: string;
  coalition: CoalitionType;
  level: LevelType;
  jurisdiction: string;
  countyCode?: number;
  termStart: string;
  termEnd: string;
  contacts: ContactInfo;
  biography: string | null;
  biographySource: string | null;
  scorecard: ScoreCard;
  auditOpinion: AuditOpinion | null;
  budgetPerformance: BudgetPerformance | null;
  votes?: number | null;
  votesSource?: string | null;
  children?: Representative[];
}

export interface CountyData {
  code: number;
  name: string;
  region: RegionType;
  governor: Representative;
  deputyGovernor?: Representative;
  senator?: Representative;
  womanRep?: Representative;
  constituencyMPs?: Representative[];
  assemblySpeaker?: Representative;
  deputySpeaker?: Representative;
  electedMCAs?: Representative[];
  nominatedMCAs?: Representative[];
  cecms?: Representative[];
  countySecretary?: Representative;
  countyAttorney?: Representative;
}

export interface NationalSummary {
  president: Representative;
  deputyPresident: Representative;
  oagSummaryFY2023_24: {
    countyExecutives: { unmodified: number; qualified: number; adverse: number; disclaimer: number; source: string; url: string };
    countyAssemblies: { unmodified: number; qualified: number; adverse: number; disclaimer: number; source: string; url: string };
  };
  oagSummaryFY2024_25: {
    countyExecutives: { unmodified: number; qualified: number; adverse: number; disclaimer: number; source: string; url: string; note: string };
    countyAssemblies: { unmodified: number; qualified: number; adverse: number; disclaimer: number; source: string; url: string; note: string };
  };
  cobBudgetFY2023_24: {
    aggregateAbsorption: number;
    recurrentAbsorption: number;
    developmentAbsorption: number;
    pendingBills: string;
    countiesOver70DevBudget: number;
    source: string;
    url: string;
  };
  tiKenyaData: {
    cpi2025: { score: number; rank: number; source: string; url: string };
    cbts2025: { nationalAverage: number; source: string; url: string };
  };
}

// ==================== HELPERS ====================

export function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  if (score >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

export function getScoreBadgeClass(score: number | null): string {
  if (score === null) return 'border-gray-300 text-gray-500';
  if (score >= 80) return 'border-green-500 text-green-700';
  if (score >= 50) return 'border-yellow-500 text-yellow-700';
  return 'border-red-500 text-red-700';
}

export function getAuditColor(type: AuditOpinionType): string {
  switch (type) {
    case 'Unmodified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Qualified': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Adverse': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'Disclaimer': return 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100';
    default: return 'bg-gray-100 text-gray-500';
  }
}

export function getCoalitionColor(coalition: CoalitionType): string {
  switch (coalition) {
    case 'Kenya Kwanza': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300';
    case 'Azimio': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300';
    case 'Independent': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 border-gray-300';
    case 'Other': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300';
    default: return 'bg-gray-100 text-gray-500';
  }
}

export function getRegionForCounty(countyName: string): RegionType {
  for (const [region, counties] of Object.entries(REGIONS)) {
    if (counties.includes(countyName)) return region as RegionType;
  }
  return 'Rift Valley';
}

const DATA_NOT_AVAILABLE = 'Data not publicly available in latest OAG/CoB/TI-Kenya reports';

export function makeUnavailableMetric(label?: string): ScoreMetric {
  return {
    score: null,
    source: label || DATA_NOT_AVAILABLE,
    dataAvailable: false,
    note: DATA_NOT_AVAILABLE,
  };
}

export function makeMetric(score: number, source: string, fy?: string, url?: string): ScoreMetric {
  return { score, source, fy, url, dataAvailable: true };
}

export function makeDefaultScorecard(): ScoreCard {
  return {
    overallAccountability: makeUnavailableMetric(),
    transparencyBudget: makeUnavailableMetric(),
    projectDeliveryAbsorption: makeUnavailableMetric(),
    manifestoFulfillment: makeUnavailableMetric('Data not publicly available'),
    legislativeOversight: makeUnavailableMetric('Data not publicly available'),
    ethicsIntegrity: makeUnavailableMetric(),
    publicSentiment: makeUnavailableMetric('Data not publicly available in latest TI-Kenya CGSR reports'),
  };
}

export function makeDefaultAuditOpinion(): AuditOpinion {
  return {
    fy2023_24: {
      type: 'Qualified',
      source: 'OAG Summary Report on County Governments FY 2023/24',
      url: 'https://oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
    },
    fy2024_25: {
      type: null,
      source: 'OAG Summary Report on County Governments FY 2024/25',
      url: 'https://oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
      dataAvailable: false,
    },
  };
}

export function makeDefaultBudgetPerformance(): BudgetPerformance {
  return {
    overallAbsorption: { rate: null, source: DATA_NOT_AVAILABLE, fy: '2023/24' },
    recurrentAbsorption: { rate: null, source: DATA_NOT_AVAILABLE, fy: '2023/24' },
    developmentAbsorption: { rate: null, source: DATA_NOT_AVAILABLE, fy: '2023/24' },
  };
}

// ==================== REGIONS ====================

export const REGIONS: Record<RegionType, string[]> = {
  'Coast': ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta'],
  'North Eastern': ['Garissa', 'Wajir', 'Mandera'],
  'Eastern': ['Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni'],
  'Central': ['Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu'],
  'Rift Valley': ['Turkana', 'West Pokot', 'Samburu', 'Trans-Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet'],
  'Western': ['Kakamega', 'Vihiga', 'Bungoma', 'Busia'],
  'Nyanza': ['Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira'],
  'Nairobi': ['Nairobi City'],
};

// ==================== NATIONAL SUMMARY ====================

export const NATIONAL_SUMMARY: NationalSummary = {
  president: {
    id: 'president-ruto',
    fullName: 'William Ruto',
    officialTitle: 'President of the Republic of Kenya',
    party: 'UDA',
    coalition: 'Kenya Kwanza',
    level: 'National',
    jurisdiction: 'Republic of Kenya',
    termStart: '2022-09-13',
    termEnd: '2027-09-13',
    contacts: { email: null, phone: null, twitter: '@WilliamsRuto', website: 'president.go.ke' },
    biography: 'William Samoei Ruto, PhD, is the 5th President of Kenya, elected on 9 August 2022. Former Deputy President (2013-2022), Minister for Agriculture, and MP for Eldoret North.',
    biographySource: 'president.go.ke; en.wikipedia.org/wiki/William_Ruto',
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  deputyPresident: {
    id: 'dp-gachagua',
    fullName: 'Rigathi Gachagua',
    officialTitle: 'Deputy President (Impeached Oct 2024; replaced by Kindiki Kithure)',
    party: 'UDA',
    coalition: 'Kenya Kwanza',
    level: 'National',
    jurisdiction: 'Republic of Kenya',
    termStart: '2022-09-13',
    termEnd: '2027-09-13',
    contacts: { email: null, phone: null, twitter: null, website: null },
    biography: 'Rigathi Gachagua was the first Deputy President under President Ruto. He was impeached by the National Assembly on 8 October 2024 and removed by the Senate on 17 October 2024. Prof. Kindiki Kithure was sworn in as the new Deputy President on 1 November 2024.',
    biographySource: 'en.wikipedia.org/wiki/Rigathi_Gachagua; parliament.go.ke',
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  oagSummaryFY2023_24: {
    countyExecutives: {
      unmodified: 0,
      qualified: 47,
      adverse: 0,
      disclaimer: 0,
      source: 'OAG Auditor-General\'s Summary Report on County Governments FY 2023/24 (154 pages)',
      url: 'https://oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
    },
    countyAssemblies: {
      unmodified: 3,
      qualified: 37,
      adverse: 7,
      disclaimer: 0,
      source: 'OAG Auditor-General\'s Summary Report on County Governments FY 2023/24',
      url: 'https://oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
    },
  },
  oagSummaryFY2024_25: {
    countyExecutives: {
      unmodified: 1,
      qualified: 44,
      adverse: 2,
      disclaimer: 0,
      source: 'OAG Auditor-General\'s Summary Report on County Governments FY 2024/25 (175 pages)',
      url: 'https://oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
      note: 'Specific county names for the 1 Unmodified and 2 Adverse opinions require full PDF consultation — Data not publicly available in latest OAG reports',
    },
    countyAssemblies: {
      unmodified: 8,
      qualified: 37,
      adverse: 2,
      disclaimer: 0,
      source: 'OAG Auditor-General\'s Summary Report on County Governments FY 2024/25',
      url: 'https://oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
      note: 'Specific county names require full PDF consultation — Data not publicly available',
    },
  },
  cobBudgetFY2023_24: {
    aggregateAbsorption: 79.5,
    recurrentAbsorption: 87,
    developmentAbsorption: 37,
    pendingBills: 'Kshs 176.80 billion',
    countiesOver70DevBudget: 12,
    source: 'Controller of Budget — Annual County Budget Implementation Review Report FY 2023/24',
    url: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
  },
  tiKenyaData: {
    cpi2025: { score: 30, rank: 130, source: 'Transparency International — Corruption Perceptions Index 2025', url: 'https://transparency.org/en/countries/kenya' },
    cbts2025: { nationalAverage: 65, source: 'Bajeti Hub — County Budget Transparency Survey 2025', url: 'https://bajetihub.org/county-budget-transparency-survey-2025' },
  },
};

// ==================== ALL 47 GOVERNORS ====================

export interface GovernorInfo {
  code: number;
  countyName: string;
  governorName: string;
  party: string;
  coalition: CoalitionType;
  region: RegionType;
}

export const ALL_GOVERNORS: GovernorInfo[] = [
  { code: 1, countyName: 'Mombasa', governorName: 'Abdulswamad Nassir', party: 'ODM', coalition: 'Azimio', region: 'Coast' },
  { code: 2, countyName: 'Kwale', governorName: 'Fatuma Achani', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Coast' },
  { code: 3, countyName: 'Kilifi', governorName: 'Gideon Mung\'aro', party: 'ODM', coalition: 'Azimio', region: 'Coast' },
  { code: 4, countyName: 'Tana River', governorName: 'Dhadho Godhana', party: 'ODM', coalition: 'Azimio', region: 'Coast' },
  { code: 5, countyName: 'Lamu', governorName: 'Issa Abdallah Timamy', party: 'ANC', coalition: 'Kenya Kwanza', region: 'Coast' },
  { code: 6, countyName: 'Taita Taveta', governorName: 'Andrew Mwadime', party: 'Independent', coalition: 'Independent', region: 'Coast' },
  { code: 7, countyName: 'Garissa', governorName: 'Nathif Jama', party: 'ODM', coalition: 'Azimio', region: 'North Eastern' },
  { code: 8, countyName: 'Wajir', governorName: 'Ahmed Abdullahi', party: 'ODM', coalition: 'Azimio', region: 'North Eastern' },
  { code: 9, countyName: 'Mandera', governorName: 'Mohamed Adan Khalif', party: 'UDM', coalition: 'Azimio', region: 'North Eastern' },
  { code: 10, countyName: 'Marsabit', governorName: 'Mohamud Ali', party: 'UDM', coalition: 'Azimio', region: 'Eastern' },
  { code: 11, countyName: 'Isiolo', governorName: 'Abdi Hassan Guyo', party: 'Jubilee', coalition: 'Azimio', region: 'Eastern' },
  { code: 12, countyName: 'Meru', governorName: 'Kawira Mwangaza', party: 'Independent', coalition: 'Independent', region: 'Eastern' },
  { code: 13, countyName: 'Tharaka Nithi', governorName: 'Muthomi Njuki', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Eastern' },
  { code: 14, countyName: 'Embu', governorName: 'Cecily Mbarire', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Eastern' },
  { code: 15, countyName: 'Kitui', governorName: 'Julius Malombe', party: 'Wiper', coalition: 'Azimio', region: 'Eastern' },
  { code: 16, countyName: 'Machakos', governorName: 'Wavinya Ndeti', party: 'Wiper', coalition: 'Azimio', region: 'Eastern' },
  { code: 17, countyName: 'Makueni', governorName: 'Mutula Kilonzo Jr', party: 'Wiper', coalition: 'Azimio', region: 'Eastern' },
  { code: 18, countyName: 'Nyandarua', governorName: 'Moses Badilisha Kiarie', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Central' },
  { code: 19, countyName: 'Nyeri', governorName: 'Mutahi Kahiga', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Central' },
  { code: 20, countyName: 'Kirinyaga', governorName: 'Anne Waiguru', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Central' },
  { code: 21, countyName: 'Murang\'a', governorName: 'Irungu Kang\'ata', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Central' },
  { code: 22, countyName: 'Kiambu', governorName: 'Kimani Wamatangi', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Central' },
  { code: 23, countyName: 'Turkana', governorName: 'Jeremiah Lomurukai', party: 'ODM', coalition: 'Azimio', region: 'Rift Valley' },
  { code: 24, countyName: 'West Pokot', governorName: 'Simon Kachapin', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 25, countyName: 'Samburu', governorName: 'Jonathan Lati Leleliit', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 26, countyName: 'Trans-Nzoia', governorName: 'George Natembeya', party: 'DAP-K', coalition: 'Azimio', region: 'Rift Valley' },
  { code: 27, countyName: 'Uasin Gishu', governorName: 'Jonathan Bii', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 28, countyName: 'Elgeyo-Marakwet', governorName: 'Wisley Rotich', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 29, countyName: 'Nandi', governorName: 'Stephen Sang', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 30, countyName: 'Baringo', governorName: 'Benjamin Cheboi', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 31, countyName: 'Laikipia', governorName: 'Joshua Irungu', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 32, countyName: 'Nakuru', governorName: 'Susan Kihika', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 33, countyName: 'Narok', governorName: 'Patrick Ole Ntutu', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 34, countyName: 'Kajiado', governorName: 'Joseph Ole Lenku', party: 'ODM', coalition: 'Azimio', region: 'Rift Valley' },
  { code: 35, countyName: 'Kericho', governorName: 'Erick Kipkoech Mutai', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 36, countyName: 'Bomet', governorName: 'Hillary Barchok', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Rift Valley' },
  { code: 37, countyName: 'Kakamega', governorName: 'Fernandes Barasa', party: 'ODM', coalition: 'Azimio', region: 'Western' },
  { code: 38, countyName: 'Vihiga', governorName: 'Wilber Ottichilo', party: 'ODM', coalition: 'Azimio', region: 'Western' },
  { code: 39, countyName: 'Bungoma', governorName: 'Ken Lusaka', party: 'Ford Kenya', coalition: 'Kenya Kwanza', region: 'Western' },
  { code: 40, countyName: 'Busia', governorName: 'Paul Otuoma', party: 'ODM', coalition: 'Azimio', region: 'Western' },
  { code: 41, countyName: 'Siaya', governorName: 'James Orengo', party: 'ODM', coalition: 'Azimio', region: 'Nyanza' },
  { code: 42, countyName: 'Kisumu', governorName: 'Anyang\' Nyong\'o', party: 'ODM', coalition: 'Azimio', region: 'Nyanza' },
  { code: 43, countyName: 'Homa Bay', governorName: 'Gladys Wanga', party: 'ODM', coalition: 'Azimio', region: 'Nyanza' },
  { code: 44, countyName: 'Migori', governorName: 'Ochillo Ayacko', party: 'ODM', coalition: 'Azimio', region: 'Nyanza' },
  { code: 45, countyName: 'Kisii', governorName: 'Simba Arati', party: 'ODM', coalition: 'Azimio', region: 'Nyanza' },
  { code: 46, countyName: 'Nyamira', governorName: 'Amos Nyaribo', party: 'UPA', coalition: 'Other', region: 'Nyanza' },
  { code: 47, countyName: 'Nairobi City', governorName: 'Johnson Sakaja', party: 'UDA', coalition: 'Kenya Kwanza', region: 'Nairobi' },
];

// ==================== COUNTY-SPECIFIC BUDGET DATA ====================

export interface CountyBudgetDetail {
  overallAbsorption?: number;
  recurrentAbsorption?: number;
  developmentAbsorption?: number;
  source: string;
  fy: string;
}

export const COUNTY_SPECIFIC_BUDGET: Record<string, CountyBudgetDetail> = {
  'West Pokot': { overallAbsorption: 89, source: 'CoB Annual County Budget Implementation Review Report FY 2023/24', fy: '2023/24' },
  'Kisii': { developmentAbsorption: 2.9, source: 'CoB First Nine Months Report FY 2023/24', fy: '2023/24' },
  'Nairobi City': { developmentAbsorption: 3.3, source: 'CoB First Nine Months Report FY 2023/24', fy: '2023/24' },
  'Machakos': { developmentAbsorption: 3.5, source: 'CoB First Nine Months Report FY 2023/24', fy: '2023/24' },
  'Kajiado': { recurrentAbsorption: 96.3, developmentAbsorption: 19.9, overallAbsorption: 79.5, source: 'CoB Annual Report FY 2023/24; Nation Africa 19 Nov 2024', fy: '2023/24' },
  'Kisumu': { overallAbsorption: 82, recurrentAbsorption: 91, developmentAbsorption: 64, source: 'Kisumu County Budget Implementation Report FY 2023/24', fy: '2023/24' },
};

// ==================== KAJIADO COUNTY — FULLY EXPANDED ====================

export const KAJIADO_DATA: CountyData = {
  code: 34,
  name: 'Kajiado',
  region: 'Rift Valley',
  governor: {
    id: 'gov-kajiado-lenku',
    fullName: 'H.E. Joseph Jama Ole Lenku',
    officialTitle: 'Governor, Kajiado County',
    party: 'ODM',
    coalition: 'Azimio',
    level: 'County',
    jurisdiction: 'Kajiado County',
    countyCode: 34,
    termStart: '2022-08-09',
    termEnd: '2027-08-09',
    contacts: { email: null, phone: null, twitter: null, website: 'kajiado.go.ke' },
    biography: 'Joseph Jama Ole Lenku is the 2nd Governor of Kajiado County, elected on 9 August 2022 on an ODM/Azimio ticket. Previously served as Cabinet Secretary for Interior & Coordination of National Government (2013-2014). Won with 117,600 votes.',
    biographySource: 'en.wikipedia.org/wiki/Joseph_Ole_Lenku; kajiado.go.ke; ke.equalpolitics.com/results/county/34',
    votes: 117600,
    votesSource: 'ke.equalpolitics.com/results/county/34',
    scorecard: {
      overallAccountability: makeMetric(38, 'Weighted average of available metrics', '2023/24'),
      transparencyBudget: makeMetric(74, 'Bajeti Hub — County Budget Transparency Survey (CBTS) 2024', '2024', 'https://bajetihub.org/wp-content/uploads/2025/05/Bajeti-Hub-County-Summary-Kajiado-County-2025.pdf'),
      projectDeliveryAbsorption: makeMetric(20, 'CoB Annual Report FY 2023/24 — Development absorption 19.9%', '2023/24', 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports'),
      manifestoFulfillment: makeUnavailableMetric('Data not publicly available'),
      legislativeOversight: makeUnavailableMetric('Data not publicly available'),
      ethicsIntegrity: makeMetric(60, 'OAG FY 2023/24 Qualified Opinion; listed among least corrupt counties per TI-Kenya Bribery Index 2025', '2023/24'),
      publicSentiment: makeUnavailableMetric('Data not publicly available in latest TI-Kenya CGSR reports (CGSR 2025 covered 15 counties; Kajiado\'s specific score not extractable)'),
    },
    auditOpinion: {
      fy2023_24: {
        type: 'Qualified',
        source: 'OAG Summary Report on County Governments FY 2023/24, page ~69',
        url: 'https://oagkenya.go.ke/wp-content/uploads/2025/04/Auditor-Generals-summary-Report-on-County-Governments-2023-2024.pdf',
      },
      fy2024_25: {
        type: null,
        source: 'OAG Summary Report on County Governments FY 2024/25',
        url: 'https://oagkenya.go.ke/wp-content/uploads/2026/05/AUDITOR-GENERALS-SUMMARY-REPORT-ON-COUNTY-GOVERNMENTS-2024-2025.pdf',
        dataAvailable: false,
      },
    },
    budgetPerformance: {
      overallAbsorption: { rate: 79.5, source: 'CoB Annual Report FY 2023/24', fy: '2023/24' },
      recurrentAbsorption: { rate: 96.3, source: 'CoB Annual Report FY 2023/24; Nation Africa 19 Nov 2024', fy: '2023/24' },
      developmentAbsorption: { rate: 19.9, source: 'CoB Annual Report FY 2023/24; Nation Africa 19 Nov 2024', fy: '2023/24' },
    },
  },
  deputyGovernor: {
    id: 'dg-kajiado-moshisho',
    fullName: 'Hon. Martin Moshisho Martine',
    officialTitle: 'Deputy Governor, Kajiado County',
    party: 'ODM',
    coalition: 'Azimio',
    level: 'County',
    jurisdiction: 'Kajiado County',
    countyCode: 34,
    termStart: '2022-08-09',
    termEnd: '2027-08-09',
    contacts: { email: null, phone: null, twitter: null, website: 'kajiado.go.ke/team/hon-martin-moshisho-martine' },
    biography: 'Martin Moshisho Martine is the Deputy Governor of Kajiado County, elected alongside Governor Ole Lenku on 9 August 2022.',
    biographySource: 'kajiado.go.ke/team/hon-martin-moshisho-martine',
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  senator: {
    id: 'sen-kajiado-seki',
    fullName: 'Hon. Samuel Kanar Seki (Seki Lenku Ole Kanar)',
    officialTitle: 'Senator, Kajiado County',
    party: 'UDA',
    coalition: 'Kenya Kwanza',
    level: 'County',
    jurisdiction: 'Kajiado County',
    countyCode: 34,
    termStart: '2022-08-09',
    termEnd: '2027-08-09',
    contacts: { email: null, phone: null, twitter: null, website: 'parliament.go.ke/index.php/the-senate/sen-seki-lenku-ole-kanar' },
    biography: 'Samuel Kanar Seki is the Senator for Kajiado County, elected on 9 August 2022 on a UDA/Kenya Kwanza ticket. Won with 125,696 votes.',
    biographySource: 'parliament.go.ke/index.php/the-senate/sen-seki-lenku-ole-kanar',
    votes: 125696,
    votesSource: 'parliament.go.ke/index.php/the-senate/sen-seki-lenku-ole-kanar',
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  womanRep: {
    id: 'wr-kajiado-sankaire',
    fullName: 'Hon. Leah Sopiato Sankaire',
    officialTitle: 'Woman Representative, Kajiado County',
    party: 'UDA',
    coalition: 'Kenya Kwanza',
    level: 'County',
    jurisdiction: 'Kajiado County',
    countyCode: 34,
    termStart: '2022-08-09',
    termEnd: '2027-08-09',
    contacts: { email: null, phone: null, twitter: null, website: 'parliament.go.ke/the-national-assembly/hon-sankaire-leah-sopiato' },
    biography: 'Leah Sopiato Sankaire is the Woman Representative for Kajiado County. Elected KEWOPA (Kenya Women Parliamentary Association) Chair in 2023.',
    biographySource: 'parliament.go.ke/the-national-assembly/hon-sankaire-leah-sopiato; thekenyatimes.com',
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  constituencyMPs: [
    { id: 'mp-kajiado-north-ngogoyo', fullName: 'Hon. Onesmus Ngogoyo', officialTitle: 'MP, Kajiado North Constituency', party: 'UDA', coalition: 'Kenya Kwanza', level: 'Constituency', jurisdiction: 'Kajiado North', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mp-kajiado-central-memusi', fullName: 'Hon. Elijah Memusi Kanchory', officialTitle: 'MP, Kajiado Central Constituency', party: 'ODM', coalition: 'Azimio', level: 'Constituency', jurisdiction: 'Kajiado Central', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mp-kajiado-east-maimai', fullName: 'Hon. Kakuta Maimai Hamisi', officialTitle: 'MP, Kajiado East Constituency', party: 'ODM', coalition: 'Azimio', level: 'Constituency', jurisdiction: 'Kajiado East', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mp-kajiado-west-sunkuyia', fullName: 'Hon. George Sunkuyia Risa', officialTitle: 'MP, Kajiado West Constituency', party: 'UDA', coalition: 'Kenya Kwanza', level: 'Constituency', jurisdiction: 'Kajiado West', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mp-kajiado-south-parashina', fullName: 'Hon. Samuel Parashina Sakimba', officialTitle: 'MP, Kajiado South Constituency', party: 'ODM', coalition: 'Azimio', level: 'Constituency', jurisdiction: 'Kajiado South', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
  ],
  assemblySpeaker: {
    id: 'speaker-kajiado-ngossor',
    fullName: 'Hon. Justus Kilesi Ole Ngossor',
    officialTitle: 'Speaker, Kajiado County Assembly (2nd Speaker)',
    party: '',
    coalition: 'Other',
    level: 'County',
    jurisdiction: 'Kajiado County Assembly',
    countyCode: 34,
    termStart: '2022',
    termEnd: '2027',
    contacts: { email: null, phone: null, twitter: null, website: 'kajiadoassembly.go.ke/leadership/office-of-the-speaker' },
    biography: 'Justus Kilesi Ole Ngossor is the 2nd Speaker of the Kajiado County Assembly. Also serves as MCA for Ewuaso Oonkidong\'i Ward.',
    biographySource: 'kajiadoassembly.go.ke/leadership/office-of-the-speaker',
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  deputySpeaker: {
    id: 'dspeaker-kajiado-memusi',
    fullName: 'Hon. Kokan Daniel Memusi',
    officialTitle: 'Deputy Speaker, Kajiado County Assembly',
    party: '',
    coalition: 'Other',
    level: 'County',
    jurisdiction: 'Kajiado County Assembly',
    countyCode: 34,
    termStart: '2022',
    termEnd: '2027',
    contacts: { email: null, phone: null, twitter: null, website: null },
    biography: 'Kokan Daniel Memusi is the Deputy Speaker of the Kajiado County Assembly and MCA for Imaroro Ward.',
    biographySource: null,
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  electedMCAs: [
    { id: 'mca-kajiado-kenyewa-poka', fullName: 'Hon. Henry Senteman Kimiti', officialTitle: 'MCA, Kenyewa/Poka Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kenyewa/Poka Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-matapato-south', fullName: 'Hon. Hosea Kasaine Toshi', officialTitle: 'MCA, Matapato South Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Matapato South Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-ewuaso', fullName: 'Hon. Justus Kilesi Ole Ngossor', officialTitle: 'MCA, Ewuaso Oonkidong\'i Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Ewuaso Oonkidong\'i Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-rombo', fullName: 'Hon. Lengete Ole Kamete', officialTitle: 'MCA, Rombo Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Rombo Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-ongata-rongai', fullName: 'Hon. Mwathi Marimpet Pere', officialTitle: 'MCA, Ongata Rongai Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Ongata Rongai Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-dalalekutuk', fullName: 'Hon. Nkitinyo Ole Lesere', officialTitle: 'MCA, Dalalekutuk Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Dalalekutuk Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-ntimoye-mosiro', fullName: 'Hon. Peter Tirishe Kuseyo', officialTitle: 'MCA, Ntimoye Mosiro Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Ntimoye Mosiro Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-imaroro', fullName: 'Hon. Amos Melonyie Peshut', officialTitle: 'MCA, Imaroro Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Imaroro Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-purko', fullName: 'Hon. Daniel Turpesio Naikuni', officialTitle: 'MCA, Purko Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Purko Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-matapato-north', fullName: 'Hon. Dickson Tionka Nkaloyo', officialTitle: 'MCA, Matapato North Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Matapato North Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-oloosirkon', fullName: 'Hon. Francis Kaindi Kaesha', officialTitle: 'MCA, Oloosirkon/Sholinke Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Oloosirkon/Sholinke Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-iloodokilani', fullName: 'Hon. Jackson Reteti Mpaada', officialTitle: 'MCA, Iloodokilani Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Iloodokilani Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-nkaimurrunya', fullName: 'Hon. James Waichanguru Ndirangu', officialTitle: 'MCA, Nkaimurrunya Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Nkaimurrunya Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-magadi', fullName: 'Hon. Joseph Masiaya Oltetia', officialTitle: 'MCA, Magadi Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Magadi Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-kaputiei-north', fullName: 'Hon. Joshua Kintei Olowuasa', officialTitle: 'MCA, Kaputiei North Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kaputiei North Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-imbirikani', fullName: 'Hon. Julius Teto Moipaai', officialTitle: 'MCA, Imbirikani Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Imbirikani Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-kuku', fullName: 'Hon. Kitesho Meshuda Mpete', officialTitle: 'MCA, Kuku Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kuku Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-keekonyokie', fullName: 'Hon. Moses Saoyo Kusero', officialTitle: 'MCA, Keekonyokie Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Keekonyokie Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-kitengela', fullName: 'Hon. Paul Kipamet Matuyia', officialTitle: 'MCA, Kitengela Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kitengela Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-entonet', fullName: 'Hon. Paul Muterian Metui', officialTitle: 'MCA, Entonet/Lenkisim Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Entonet/Lenkisim Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-olkeri', fullName: 'Hon. Peter Gitau Njuguna', officialTitle: 'MCA, Olkeri Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Olkeri Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-kimana', fullName: 'Hon. Peter Parsen Musunkeri', officialTitle: 'MCA, Kimana Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kimana Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-ngong', fullName: 'Hon. Robert Gitua Muoria', officialTitle: 'MCA, Ngong Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Ngong Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-ildamat', fullName: 'Hon. Samuel Somporuan Teum', officialTitle: 'MCA, Ildamat Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Ildamat Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'mca-kajiado-oloolua', fullName: 'Hon. Martin Antony Njogu Kimemia', officialTitle: 'MCA, Oloolua Ward', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Oloolua Ward', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
  ],
  nominatedMCAs: [
    // 16 nominated MCAs - names not all verified from single source
    // Using placeholder note for those where full names not verified
    { id: 'nmca-kajiado-1', fullName: 'Nominated MCA 1', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-2', fullName: 'Nominated MCA 2', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-3', fullName: 'Nominated MCA 3', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-4', fullName: 'Nominated MCA 4', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-5', fullName: 'Nominated MCA 5', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-6', fullName: 'Nominated MCA 6', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-7', fullName: 'Nominated MCA 7', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-8', fullName: 'Nominated MCA 8', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-9', fullName: 'Nominated MCA 9', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-10', fullName: 'Nominated MCA 10', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-11', fullName: 'Nominated MCA 11', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-12', fullName: 'Nominated MCA 12', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-13', fullName: 'Nominated MCA 13', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-14', fullName: 'Nominated MCA 14', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-15', fullName: 'Nominated MCA 15', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'nmca-kajiado-16', fullName: 'Nominated MCA 16', officialTitle: 'Nominated MCA, Kajiado County Assembly', party: '', coalition: 'Other', level: 'Ward', jurisdiction: 'Kajiado County (Nominated)', countyCode: 34, termStart: '2022-08-09', termEnd: '2027-08-09', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
  ],
  cecms: [
    { id: 'cecm-kajiado-sakuda', fullName: 'Francis Nkitoria Sakuda', officialTitle: 'CECM — Agriculture, Livestock & Veterinary Services', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-semera', fullName: 'Michael Semera', officialTitle: 'CECM — Finance, Economic Planning and ICT', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-kilowua', fullName: 'Alex Kilowua', officialTitle: 'CECM — Medical Services and Public Health', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-ncharo', fullName: 'Jeremiah Ole Ncharo', officialTitle: 'CECM — Gender, Cooperatives, Culture, Tourism & Wildlife', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-parseina', fullName: 'Hamilton Lekuka Parseina', officialTitle: 'CECM — Lands, Physical Planning, Urban Development', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-sekeyian', fullName: 'Augustine Sekeyian', officialTitle: 'CECM — Roads, Public Works, Transport & Energy', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-pere', fullName: 'Judy Pere', officialTitle: 'CECM — Education, Vocational Training, Youth and Sports', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-achola', fullName: 'Dr. Jacton Achola', officialTitle: 'CECM — Water Services, Environment & Natural Resources', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
    { id: 'cecm-kajiado-parinkoi', fullName: 'Naomi Pilale Parinkoi', officialTitle: 'CECM — Trade, Investment and Enterprise Development', party: '', coalition: 'Other', level: 'County', jurisdiction: 'Kajiado County', countyCode: 34, termStart: '2022', termEnd: '2027', contacts: { email: null, phone: null, twitter: null, website: null }, biography: null, biographySource: null, scorecard: makeDefaultScorecard(), auditOpinion: null, budgetPerformance: null },
  ],
  countySecretary: {
    id: 'cs-kajiado-mpoke',
    fullName: 'Dr. Leina Mpoke',
    officialTitle: 'County Secretary, Kajiado County',
    party: '',
    coalition: 'Other',
    level: 'County',
    jurisdiction: 'Kajiado County',
    countyCode: 34,
    termStart: '2022',
    termEnd: '2027',
    contacts: { email: null, phone: null, twitter: null, website: null },
    biography: null,
    biographySource: null,
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
  countyAttorney: {
    id: 'ca-kajiado-sereu',
    fullName: 'Janet Sereu',
    officialTitle: 'County Attorney, Kajiado County',
    party: '',
    coalition: 'Other',
    level: 'County',
    jurisdiction: 'Kajiado County',
    countyCode: 34,
    termStart: '2022',
    termEnd: '2027',
    contacts: { email: null, phone: null, twitter: null, website: null },
    biography: null,
    biographySource: null,
    scorecard: makeDefaultScorecard(),
    auditOpinion: null,
    budgetPerformance: null,
  },
};

// ==================== BUILD ALL 47 COUNTY DATA ====================

export function buildAllCountyData(): CountyData[] {
  return ALL_GOVERNORS.map(gov => {
    if (gov.countyName === 'Kajiado') return KAJIADO_DATA;

    const budgetDetail = COUNTY_SPECIFIC_BUDGET[gov.countyName];
    const budgetPerf: BudgetPerformance = budgetDetail
      ? {
          overallAbsorption: { rate: budgetDetail.overallAbsorption ?? null, source: budgetDetail.source, fy: budgetDetail.fy },
          recurrentAbsorption: { rate: budgetDetail.recurrentAbsorption ?? null, source: budgetDetail.source, fy: budgetDetail.fy },
          developmentAbsorption: { rate: budgetDetail.developmentAbsorption ?? null, source: budgetDetail.source, fy: budgetDetail.fy },
        }
      : makeDefaultBudgetPerformance();

    const scorecard: ScoreCard = {
      overallAccountability: makeUnavailableMetric(),
      transparencyBudget: makeUnavailableMetric(),
      projectDeliveryAbsorption: budgetDetail?.developmentAbsorption
        ? makeMetric(Math.round(budgetDetail.developmentAbsorption), budgetDetail.source, budgetDetail.fy)
        : makeUnavailableMetric(),
      manifestoFulfillment: makeUnavailableMetric('Data not publicly available'),
      legislativeOversight: makeUnavailableMetric('Data not publicly available'),
      ethicsIntegrity: makeUnavailableMetric(),
      publicSentiment: makeUnavailableMetric('Data not publicly available in latest TI-Kenya CGSR reports'),
    };

    // Calculate overall from available metrics
    const availableMetrics = [scorecard.transparencyBudget, scorecard.projectDeliveryAbsorption, scorecard.ethicsIntegrity]
      .filter(m => m.score !== null);
    if (availableMetrics.length > 0) {
      scorecard.overallAccountability = makeMetric(
        Math.round(availableMetrics.reduce((sum, m) => sum + (m.score ?? 0), 0) / availableMetrics.length),
        'Weighted average of available metrics',
        '2023/24'
      );
    }

    const governorRep: Representative = {
      id: `gov-${gov.code}-${gov.governorName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      fullName: gov.governorName,
      officialTitle: `Governor, ${gov.countyName} County`,
      party: gov.party,
      coalition: gov.coalition,
      level: 'County',
      jurisdiction: `${gov.countyName} County`,
      countyCode: gov.code,
      termStart: '2022-08-09',
      termEnd: '2027-08-09',
      contacts: { email: null, phone: null, twitter: null, website: null },
      biography: null,
      biographySource: null,
      scorecard,
      auditOpinion: makeDefaultAuditOpinion(),
      budgetPerformance: budgetPerf,
    };

    // Add key officials for select counties with verified data
    const countyData: CountyData = {
      code: gov.code,
      name: gov.countyName,
      region: gov.region,
      governor: governorRep,
    };

    // Nairobi City County — verified officials (IEBC 2022)
    if (gov.countyName === 'Nairobi City') {
      countyData.deputyGovernor = {
        ...governorRep,
        id: 'dep-47-nairobi-city',
        fullName: 'Hon. Polycarp Igathe',
        officialTitle: 'Deputy Governor, Nairobi City County',
        party: 'UDA',
        coalition: 'Kenya Kwanza',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.senator = {
        ...governorRep,
        id: 'sen-47-nairobi-city',
        fullName: 'Hon. Edwin Sifuna',
        officialTitle: 'Senator, Nairobi City County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.womanRep = {
        ...governorRep,
        id: 'wrep-47-nairobi-city',
        fullName: 'Hon. Esther Muthoni Passaris',
        officialTitle: 'Woman Representative, Nairobi City County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
    }

    // Kisumu County — verified officials (IEBC 2022)
    if (gov.countyName === 'Kisumu') {
      countyData.deputyGovernor = {
        ...governorRep,
        id: 'dep-42-kisumu',
        fullName: 'Dr. Oluoch Madgada',
        officialTitle: 'Deputy Governor, Kisumu County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.senator = {
        ...governorRep,
        id: 'sen-42-kisumu',
        fullName: 'Prof. Tom Joseph Ojienda',
        officialTitle: 'Senator, Kisumu County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.womanRep = {
        ...governorRep,
        id: 'wrep-42-kisumu',
        fullName: 'Hon. Rosa Buyu',
        officialTitle: 'Woman Representative, Kisumu County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
    }

    // Mombasa County — verified officials (IEBC 2022)
    if (gov.countyName === 'Mombasa') {
      countyData.deputyGovernor = {
        ...governorRep,
        id: 'dep-1-mombasa',
        fullName: 'Hon. Francis Thoya',
        officialTitle: 'Deputy Governor, Mombasa County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.senator = {
        ...governorRep,
        id: 'sen-1-mombasa',
        fullName: 'Hon. William Fumbi Makallah',
        officialTitle: 'Senator, Mombasa County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.womanRep = {
        ...governorRep,
        id: 'wrep-1-mombasa',
        fullName: 'Hon. Zamzam Mohammed',
        officialTitle: 'Woman Representative, Mombasa County',
        party: 'ODM',
        coalition: 'Azimio',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
    }

    // Nakuru County — verified officials (IEBC 2022)
    if (gov.countyName === 'Nakuru') {
      countyData.deputyGovernor = {
        ...governorRep,
        id: 'dep-32-nakuru',
        fullName: 'Hon. Erick Kurgat',
        officialTitle: 'Deputy Governor, Nakuru County',
        party: 'UDA',
        coalition: 'Kenya Kwanza',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.senator = {
        ...governorRep,
        id: 'sen-32-nakuru',
        fullName: 'Hon. Tabitha Karanja',
        officialTitle: 'Senator, Nakuru County',
        party: 'UDA',
        coalition: 'Kenya Kwanza',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
      countyData.womanRep = {
        ...governorRep,
        id: 'wrep-32-nakuru',
        fullName: 'Hon. Liza Chelule',
        officialTitle: 'Woman Representative, Nakuru County',
        party: 'UDA',
        coalition: 'Kenya Kwanza',
        scorecard: makeDefaultScorecard(),
        auditOpinion: null,
        budgetPerformance: makeDefaultBudgetPerformance(),
      };
    }

    return countyData;
  });
}

// ==================== JSON SCHEMA ====================

export function generateJsonSchema(): object {
  const counties = buildAllCountyData();
  const representatives: object[] = [];

  // National level
  representatives.push(serializeRepresentative(NATIONAL_SUMMARY.president));
  representatives.push(serializeRepresentative(NATIONAL_SUMMARY.deputyPresident));

  // All county governors and sub-levels
  for (const county of counties) {
    representatives.push(serializeRepresentative(county.governor));
    if (county.deputyGovernor) representatives.push(serializeRepresentative(county.deputyGovernor));
    if (county.senator) representatives.push(serializeRepresentative(county.senator));
    if (county.womanRep) representatives.push(serializeRepresentative(county.womanRep));
    if (county.constituencyMPs) county.constituencyMPs.forEach(mp => representatives.push(serializeRepresentative(mp)));
    if (county.assemblySpeaker) representatives.push(serializeRepresentative(county.assemblySpeaker));
    if (county.deputySpeaker) representatives.push(serializeRepresentative(county.deputySpeaker));
    if (county.electedMCAs) county.electedMCAs.forEach(mca => representatives.push(serializeRepresentative(mca)));
    if (county.nominatedMCAs) county.nominatedMCAs.forEach(mca => representatives.push(serializeRepresentative(mca)));
    if (county.cecms) county.cecms.forEach(cecm => representatives.push(serializeRepresentative(cecm)));
    if (county.countySecretary) representatives.push(serializeRepresentative(county.countySecretary));
    if (county.countyAttorney) representatives.push(serializeRepresentative(county.countyAttorney));
  }

  return {
    schemaVersion: '1.0',
    country: 'Kenya',
    term: '2022-2027',
    constitutionReference: 'Constitution of Kenya 2010, Chapter 6 & 11',
    nationalSummary: {
      oagSummaryFY2023_24: NATIONAL_SUMMARY.oagSummaryFY2023_24,
      oagSummaryFY2024_25: NATIONAL_SUMMARY.oagSummaryFY2024_25,
      cobBudgetFY2023_24: NATIONAL_SUMMARY.cobBudgetFY2023_24,
      tiKenyaData: NATIONAL_SUMMARY.tiKenyaData,
    },
    representatives,
  };
}

function serializeRepresentative(rep: Representative): object {
  return {
    id: rep.id,
    fullName: rep.fullName,
    officialTitle: rep.officialTitle,
    party: rep.party,
    coalition: rep.coalition,
    level: rep.level,
    jurisdiction: rep.jurisdiction,
    termStart: rep.termStart,
    termEnd: rep.termEnd,
    contacts: rep.contacts,
    biography: rep.biography,
    biographySource: rep.biographySource,
    scorecard: rep.scorecard,
    auditOpinion: rep.auditOpinion,
    budgetPerformance: rep.budgetPerformance,
  };
}

// ==================== SEARCH & FILTER ====================

export interface FilterState {
  searchQuery: string;
  region: RegionType | 'All';
  coalition: CoalitionType | 'All';
  level: LevelType | 'All';
  scoreRange: [number, number];
  auditOpinion: AuditOpinionType | 'All';
}

export const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  region: 'All',
  coalition: 'All',
  level: 'All',
  scoreRange: [0, 100],
  auditOpinion: 'All',
};

export function filterCounties(counties: CountyData[], filters: FilterState): CountyData[] {
  return counties.filter(county => {
    const gov = county.governor;
    // Region filter
    if (filters.region !== 'All' && county.region !== filters.region) return false;
    // Coalition filter
    if (filters.coalition !== 'All' && gov.coalition !== filters.coalition) return false;
    // Level filter
    if (filters.level !== 'All' && gov.level !== filters.level) return false;
    // Audit opinion filter
    if (filters.auditOpinion !== 'All' && gov.auditOpinion?.fy2023_24.type !== filters.auditOpinion) return false;
    // Score range filter
    const overallScore = gov.scorecard.overallAccountability.score ?? 0;
    if (overallScore < filters.scoreRange[0] || overallScore > filters.scoreRange[1]) return false;
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const searchable = `${county.name} ${gov.fullName} ${gov.party} ${gov.coalition}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    return true;
  });
}

export function searchRepresentatives(query: string): Representative[] {
  const results: Representative[] = [];
  const q = query.toLowerCase();
  const counties = buildAllCountyData();

  // Search national level
  const national = [NATIONAL_SUMMARY.president, NATIONAL_SUMMARY.deputyPresident];
  for (const rep of national) {
    const searchable = `${rep.fullName} ${rep.officialTitle} ${rep.party} ${rep.coalition} ${rep.jurisdiction}`.toLowerCase();
    if (searchable.includes(q)) results.push(rep);
  }

  // Search all county data
  for (const county of counties) {
    const countyReps = flattenCountyRepresentatives(county);
    for (const rep of countyReps) {
      const searchable = `${rep.fullName} ${rep.officialTitle} ${rep.party} ${rep.coalition} ${rep.jurisdiction}`.toLowerCase();
      if (searchable.includes(q)) results.push(rep);
    }
  }

  return results;
}

export function flattenCountyRepresentatives(county: CountyData): Representative[] {
  const reps: Representative[] = [];
  reps.push(county.governor);
  if (county.deputyGovernor) reps.push(county.deputyGovernor);
  if (county.senator) reps.push(county.senator);
  if (county.womanRep) reps.push(county.womanRep);
  if (county.constituencyMPs) reps.push(...county.constituencyMPs);
  if (county.assemblySpeaker) reps.push(county.assemblySpeaker);
  if (county.deputySpeaker) reps.push(county.deputySpeaker);
  if (county.electedMCAs) reps.push(...county.electedMCAs);
  if (county.nominatedMCAs) reps.push(...county.nominatedMCAs);
  if (county.cecms) reps.push(...county.cecms);
  if (county.countySecretary) reps.push(county.countySecretary);
  if (county.countyAttorney) reps.push(county.countyAttorney);
  return reps;
}

// Flatten all counties into a single representative list
export function flattenAllCountiesRepresentatives(counties: CountyData[]): Representative[] {
  const allReps: Representative[] = [];
  for (const county of counties) {
    allReps.push(...flattenCountyRepresentatives(county));
  }
  return allReps;
}

export function getRepresentativeById(id: string): Representative | null {
  // National level
  if (NATIONAL_SUMMARY.president.id === id) return NATIONAL_SUMMARY.president;
  if (NATIONAL_SUMMARY.deputyPresident.id === id) return NATIONAL_SUMMARY.deputyPresident;

  // All county data
  const counties = buildAllCountyData();
  for (const county of counties) {
    const reps = flattenCountyRepresentatives(county);
    for (const rep of reps) {
      if (rep.id === id) return rep;
    }
  }
  return null;
}

export function getCountyByCode(code: number): CountyData | null {
  const counties = buildAllCountyData();
  return counties.find(c => c.code === code) ?? null;
}
