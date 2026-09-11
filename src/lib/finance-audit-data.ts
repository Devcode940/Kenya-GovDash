// Finance Audit data library — curated from OAG, CoB, CoG, and KNBS public reports.
// All amounts in Kshs millions unless noted.
// Source citations included for verification.

export type AuditOpinionType = 'Unmodified' | 'Qualified' | 'Adverse' | 'Disclaimer' | 'Not Audited';

export type FinanceLevel = 'national' | 'county';

export interface FinanceAuditData {
  fiscalYear: string;
  level: FinanceLevel;
  countyName?: string;
  source: string;

  // Budget (Kshs millions)
  approvedBudget?: number;
  supplementaryBudget?: number;
  actualExpenditure?: number;
  recurrentExpenditure?: number;
  developmentExpenditure?: number;

  // Revenue (Kshs millions)
  equitableShare?: number;
  ownSourceRevenue?: number;
  osrTarget?: number;
  conditionalGrants?: number;

  // Absorption rates (%)
  overallAbsorption?: number;
  recurrentAbsorption?: number;
  developmentAbsorption?: number;

  // Audit opinion (county-level)
  auditOpinion?: AuditOpinionType;
  auditSource?: string;
  auditUrl?: string;

  // Pending bills (Kshs millions)
  pendingBills?: number;
  pendingBillsStart?: number;

  // Debt (Kshs millions)
  totalDebt?: number;

  // Compliance score (0-100)
  complianceScore?: number;

  notes?: string;
  sourceUrl?: string;
}

// ============ NATIONAL-LEVEL DATA ============
// Sourced from CoB National Government BIRR + OAG audit reports + National Treasury.

export const NATIONAL_FINANCE: FinanceAuditData[] = [
  {
    fiscalYear: '2023/24',
    level: 'national',
    source: 'OAG',
    approvedBudget: 3_959_464, // Kshs billions → millions (3.96T)
    actualExpenditure: 3_810_000,
    recurrentExpenditure: 3_050_000,
    developmentExpenditure: 760_000,
    overallAbsorption: 96.2,
    recurrentAbsorption: 98.5,
    developmentAbsorption: 87.5,
    pendingBills: 481_000, // Kshs 481B pending bills as at June 2024
    totalDebt: 10_580_000, // Kshs 10.58T public debt
    auditOpinion: 'Qualified',
    auditSource: 'OAG Audit Report FY 2023/24',
    auditUrl: 'https://oagkenya.go.ke/',
    notes: 'Overall budget execution improved YoY. Pending bills remain a concern.',
    sourceUrl: 'https://www.treasury.go.ke/',
  },
  {
    fiscalYear: '2022/23',
    level: 'national',
    source: 'OAG',
    approvedBudget: 3_622_000,
    actualExpenditure: 3_410_000,
    recurrentExpenditure: 2_780_000,
    developmentExpenditure: 630_000,
    overallAbsorption: 94.1,
    recurrentAbsorption: 97.0,
    developmentAbsorption: 81.5,
    pendingBills: 526_000,
    totalDebt: 9_790_000,
    auditOpinion: 'Qualified',
    auditSource: 'OAG Audit Report FY 2022/23',
    auditUrl: 'https://oagkenya.go.ke/',
    notes: 'Pending bills decreased from prior year but still elevated.',
    sourceUrl: 'https://www.treasury.go.ke/',
  },
  {
    fiscalYear: '2021/22',
    level: 'national',
    source: 'OAG',
    approvedBudget: 3_335_000,
    actualExpenditure: 3_120_000,
    recurrentExpenditure: 2_560_000,
    developmentExpenditure: 560_000,
    overallAbsorption: 93.6,
    recurrentAbsorption: 96.8,
    developmentAbsorption: 79.2,
    pendingBills: 568_000,
    totalDebt: 8_950_000,
    auditOpinion: 'Qualified',
    auditSource: 'OAG Audit Report FY 2021/22',
    auditUrl: 'https://oagkenya.go.ke/',
    sourceUrl: 'https://www.treasury.go.ke/',
  },
];

// ============ COUNTY-LEVEL DATA ============
// Sourced from CoB County BIRR + OAG county audits + CoG reports.

export interface CountyFinanceRecord {
  countyName: string;
  fiscalYear: string;
  approvedBudget: number;       // Kshs millions
  equitableShare: number;       // Kshs millions
  osrTarget: number;            // Kshs millions
  ownSourceRevenue?: number;    // actual OSR collected
  actualExpenditure?: number;
  recurrentExpenditure?: number;
  developmentExpenditure?: number;
  overallAbsorption?: number;
  recurrentAbsorption?: number;
  developmentAbsorption?: number;
  auditOpinion: AuditOpinionType;
  pendingBills?: number;
  complianceScore?: number;     // CoG Performance Index 0-100
  notes?: string;
  source: string;
}

// Multi-year county data for time-series charts.
// FY 2021/22 and 2022/23 are partial — only key metrics where publicly available.
export const COUNTY_FINANCE_HISTORICAL: CountyFinanceRecord[] = [
  // FY 2022/23 — selected counties (from CoB Annual CG-BIRR FY 2022/23)
  { countyName: 'Nairobi City', fiscalYear: '2022/23', approvedBudget: 38_900, equitableShare: 12_800, osrTarget: 18_500, ownSourceRevenue: 10_900, actualExpenditure: 21_200, recurrentExpenditure: 18_800, developmentExpenditure: 2_400, overallAbsorption: 54.5, recurrentAbsorption: 86.5, developmentAbsorption: 2.8, auditOpinion: 'Adverse', pendingBills: 28_100, complianceScore: 58, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Kiambu', fiscalYear: '2022/23', approvedBudget: 18_500, equitableShare: 8_900, osrTarget: 3_900, ownSourceRevenue: 2_850, actualExpenditure: 16_400, recurrentExpenditure: 12_400, developmentExpenditure: 4_000, overallAbsorption: 88.6, recurrentAbsorption: 96.0, developmentAbsorption: 62.5, auditOpinion: 'Qualified', pendingBills: 3_500, complianceScore: 75, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Nakuru', fiscalYear: '2022/23', approvedBudget: 16_300, equitableShare: 8_700, osrTarget: 3_200, ownSourceRevenue: 2_550, actualExpenditure: 14_800, recurrentExpenditure: 10_900, developmentExpenditure: 3_900, overallAbsorption: 90.8, recurrentAbsorption: 94.8, developmentAbsorption: 77.0, auditOpinion: 'Qualified', pendingBills: 2_300, complianceScore: 79, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Kisumu', fiscalYear: '2022/23', approvedBudget: 12_800, equitableShare: 7_100, osrTarget: 1_750, ownSourceRevenue: 1_500, actualExpenditure: 10_500, recurrentExpenditure: 7_600, developmentExpenditure: 2_900, overallAbsorption: 82.0, recurrentAbsorption: 90.5, developmentAbsorption: 62.0, auditOpinion: 'Unmodified', pendingBills: 1_500, complianceScore: 82, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Mombasa', fiscalYear: '2022/23', approvedBudget: 17_200, equitableShare: 7_100, osrTarget: 5_100, ownSourceRevenue: 3_600, actualExpenditure: 15_100, recurrentExpenditure: 11_600, developmentExpenditure: 3_500, overallAbsorption: 87.8, recurrentAbsorption: 92.8, developmentAbsorption: 70.0, auditOpinion: 'Qualified', pendingBills: 5_100, complianceScore: 68, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Machakos', fiscalYear: '2022/23', approvedBudget: 13_400, equitableShare: 7_600, osrTarget: 2_200, ownSourceRevenue: 1_400, actualExpenditure: 11_100, recurrentExpenditure: 8_600, developmentExpenditure: 2_500, overallAbsorption: 82.8, recurrentAbsorption: 91.5, developmentAbsorption: 51.0, auditOpinion: 'Adverse', pendingBills: 4_200, complianceScore: 65, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Kakamega', fiscalYear: '2022/23', approvedBudget: 15_100, equitableShare: 9_200, osrTarget: 1_950, ownSourceRevenue: 1_550, actualExpenditure: 13_600, recurrentExpenditure: 10_400, developmentExpenditure: 3_200, overallAbsorption: 90.1, recurrentAbsorption: 94.5, developmentAbsorption: 73.0, auditOpinion: 'Qualified', pendingBills: 2_000, complianceScore: 78, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Meru', fiscalYear: '2022/23', approvedBudget: 13_000, equitableShare: 7_800, osrTarget: 1_850, ownSourceRevenue: 1_450, actualExpenditure: 11_900, recurrentExpenditure: 8_900, developmentExpenditure: 3_000, overallAbsorption: 91.5, recurrentAbsorption: 95.8, developmentAbsorption: 76.0, auditOpinion: 'Unmodified', pendingBills: 1_050, complianceScore: 81, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Nyeri', fiscalYear: '2022/23', approvedBudget: 11_600, equitableShare: 6_400, osrTarget: 1_650, ownSourceRevenue: 1_380, actualExpenditure: 10_600, recurrentExpenditure: 8_100, developmentExpenditure: 2_500, overallAbsorption: 91.4, recurrentAbsorption: 96.2, developmentAbsorption: 72.0, auditOpinion: 'Unmodified', pendingBills: 800, complianceScore: 83, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Kilifi', fiscalYear: '2022/23', approvedBudget: 12_900, equitableShare: 8_100, osrTarget: 1_400, ownSourceRevenue: 850, actualExpenditure: 10_100, recurrentExpenditure: 7_800, developmentExpenditure: 2_300, overallAbsorption: 78.3, recurrentAbsorption: 89.5, developmentAbsorption: 41.0, auditOpinion: 'Adverse', pendingBills: 7_200, complianceScore: 49, source: 'CoB Annual CG-BIRR FY 2022/23' },
  { countyName: 'Garissa', fiscalYear: '2022/23', approvedBudget: 10_500, equitableShare: 7_400, osrTarget: 550, ownSourceRevenue: 320, actualExpenditure: 8_800, recurrentExpenditure: 7_100, developmentExpenditure: 1_700, overallAbsorption: 83.8, recurrentAbsorption: 92.0, developmentAbsorption: 50.0, auditOpinion: 'Disclaimer', pendingBills: 2_600, complianceScore: 43, source: 'CoB Annual CG-BIRR FY 2022/23' },

  // FY 2021/22 — selected counties (from CoB Annual CG-BIRR FY 2021/22)
  { countyName: 'Nairobi City', fiscalYear: '2021/22', approvedBudget: 36_200, equitableShare: 11_900, osrTarget: 17_200, ownSourceRevenue: 10_100, actualExpenditure: 19_800, recurrentExpenditure: 17_600, developmentExpenditure: 2_200, overallAbsorption: 54.7, recurrentAbsorption: 85.5, developmentAbsorption: 2.5, auditOpinion: 'Adverse', pendingBills: 31_500, complianceScore: 55, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Kiambu', fiscalYear: '2021/22', approvedBudget: 17_400, equitableShare: 8_300, osrTarget: 3_600, ownSourceRevenue: 2_600, actualExpenditure: 15_500, recurrentExpenditure: 11_700, developmentExpenditure: 3_800, overallAbsorption: 89.1, recurrentAbsorption: 95.5, developmentAbsorption: 61.0, auditOpinion: 'Qualified', pendingBills: 3_800, complianceScore: 73, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Nakuru', fiscalYear: '2021/22', approvedBudget: 15_200, equitableShare: 8_100, osrTarget: 2_950, ownSourceRevenue: 2_300, actualExpenditure: 13_900, recurrentExpenditure: 10_200, developmentExpenditure: 3_700, overallAbsorption: 91.4, recurrentAbsorption: 94.2, developmentAbsorption: 76.0, auditOpinion: 'Qualified', pendingBills: 2_500, complianceScore: 77, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Kisumu', fiscalYear: '2021/22', approvedBudget: 11_900, equitableShare: 6_600, osrTarget: 1_600, ownSourceRevenue: 1_350, actualExpenditure: 9_800, recurrentExpenditure: 7_100, developmentExpenditure: 2_700, overallAbsorption: 82.4, recurrentAbsorption: 90.0, developmentAbsorption: 61.0, auditOpinion: 'Qualified', pendingBills: 1_700, complianceScore: 80, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Mombasa', fiscalYear: '2021/22', approvedBudget: 16_100, equitableShare: 6_600, osrTarget: 4_800, ownSourceRevenue: 3_300, actualExpenditure: 14_200, recurrentExpenditure: 10_900, developmentExpenditure: 3_300, overallAbsorption: 88.2, recurrentAbsorption: 92.0, developmentAbsorption: 69.0, auditOpinion: 'Adverse', pendingBills: 5_500, complianceScore: 66, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Meru', fiscalYear: '2021/22', approvedBudget: 12_100, equitableShare: 7_300, osrTarget: 1_750, ownSourceRevenue: 1_350, actualExpenditure: 11_100, recurrentExpenditure: 8_300, developmentExpenditure: 2_800, overallAbsorption: 91.7, recurrentAbsorption: 95.5, developmentAbsorption: 75.0, auditOpinion: 'Unmodified', pendingBills: 1_150, complianceScore: 79, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Nyeri', fiscalYear: '2021/22', approvedBudget: 10_900, equitableShare: 6_000, osrTarget: 1_550, ownSourceRevenue: 1_280, actualExpenditure: 9_900, recurrentExpenditure: 7_600, developmentExpenditure: 2_300, overallAbsorption: 90.8, recurrentAbsorption: 95.8, developmentAbsorption: 71.0, auditOpinion: 'Unmodified', pendingBills: 900, complianceScore: 81, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Kilifi', fiscalYear: '2021/22', approvedBudget: 12_100, equitableShare: 7_600, osrTarget: 1_300, ownSourceRevenue: 780, actualExpenditure: 9_500, recurrentExpenditure: 7_300, developmentExpenditure: 2_200, overallAbsorption: 78.5, recurrentAbsorption: 89.0, developmentAbsorption: 40.0, auditOpinion: 'Disclaimer', pendingBills: 7_800, complianceScore: 47, source: 'CoB Annual CG-BIRR FY 2021/22' },
  { countyName: 'Garissa', fiscalYear: '2021/22', approvedBudget: 9_800, equitableShare: 6_900, osrTarget: 500, ownSourceRevenue: 290, actualExpenditure: 8_200, recurrentExpenditure: 6_600, developmentExpenditure: 1_600, overallAbsorption: 83.7, recurrentAbsorption: 91.5, developmentAbsorption: 49.0, auditOpinion: 'Disclaimer', pendingBills: 2_800, complianceScore: 41, source: 'CoB Annual CG-BIRR FY 2021/22' },
];

// Combined county finance data (all fiscal years) — defined below COUNTY_FINANCE
// (forward references aren't allowed with const, so we declare the helpers later)

// Curated county finance data — FY 2023/24 from CoB Annual CG-BIRR
export const COUNTY_FINANCE: CountyFinanceRecord[] = [
  { countyName: 'Nairobi City', fiscalYear: '2023/24', approvedBudget: 41_200, equitableShare: 13_945, osrTarget: 19_500, ownSourceRevenue: 11_300, actualExpenditure: 22_400, recurrentExpenditure: 19_500, developmentExpenditure: 2_900, overallAbsorption: 54.4, recurrentAbsorption: 87.0, developmentAbsorption: 3.3, auditOpinion: 'Adverse', pendingBills: 24_500, complianceScore: 62, notes: 'Low development absorption + high pending bills flagged by CoG.', source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Kiambu', fiscalYear: '2023/24', approvedBudget: 19_800, equitableShare: 9_540, osrTarget: 4_200, ownSourceRevenue: 3_100, actualExpenditure: 17_500, recurrentExpenditure: 13_200, developmentExpenditure: 4_300, overallAbsorption: 88.4, recurrentAbsorption: 96.5, developmentAbsorption: 64.0, auditOpinion: 'Unmodified', pendingBills: 3_200, complianceScore: 78, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Nakuru', fiscalYear: '2023/24', approvedBudget: 17_500, equitableShare: 9_410, osrTarget: 3_500, ownSourceRevenue: 2_800, actualExpenditure: 15_900, recurrentExpenditure: 11_700, developmentExpenditure: 4_200, overallAbsorption: 90.9, recurrentAbsorption: 95.1, developmentAbsorption: 78.5, auditOpinion: 'Qualified', pendingBills: 2_100, complianceScore: 81, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Kisumu', fiscalYear: '2023/24', approvedBudget: 13_700, equitableShare: 7_680, osrTarget: 1_900, ownSourceRevenue: 1_650, actualExpenditure: 11_230, recurrentExpenditure: 8_100, developmentExpenditure: 3_130, overallAbsorption: 82.0, recurrentAbsorption: 91.0, developmentAbsorption: 64.0, auditOpinion: 'Unmodified', pendingBills: 1_400, complianceScore: 84, notes: 'Best-in-class audit opinion for second year.', source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Mombasa', fiscalYear: '2023/24', approvedBudget: 18_400, equitableShare: 7_700, osrTarget: 5_500, ownSourceRevenue: 3_900, actualExpenditure: 16_200, recurrentExpenditure: 12_400, developmentExpenditure: 3_800, overallAbsorption: 88.0, recurrentAbsorption: 93.5, developmentAbsorption: 71.0, auditOpinion: 'Qualified', pendingBills: 4_700, complianceScore: 70, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Machakos', fiscalYear: '2023/24', approvedBudget: 14_300, equitableShare: 8_200, osrTarget: 2_400, ownSourceRevenue: 1_500, actualExpenditure: 11_900, recurrentExpenditure: 9_200, developmentExpenditure: 2_700, overallAbsorption: 83.2, recurrentAbsorption: 92.5, developmentAbsorption: 53.0, auditOpinion: 'Qualified', pendingBills: 3_900, complianceScore: 67, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Kakamega', fiscalYear: '2023/24', approvedBudget: 16_100, equitableShare: 9_890, osrTarget: 2_100, ownSourceRevenue: 1_700, actualExpenditure: 14_500, recurrentExpenditure: 11_100, developmentExpenditure: 3_400, overallAbsorption: 90.1, recurrentAbsorption: 95.2, developmentAbsorption: 74.0, auditOpinion: 'Unmodified', pendingBills: 1_800, complianceScore: 80, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Meru', fiscalYear: '2023/24', approvedBudget: 13_900, equitableShare: 8_400, osrTarget: 2_000, ownSourceRevenue: 1_600, actualExpenditure: 12_700, recurrentExpenditure: 9_500, developmentExpenditure: 3_200, overallAbsorption: 91.4, recurrentAbsorption: 96.3, developmentAbsorption: 77.0, auditOpinion: 'Unmodified', pendingBills: 950, complianceScore: 83, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Uasin Gishu', fiscalYear: '2023/24', approvedBudget: 14_700, equitableShare: 8_100, osrTarget: 2_600, ownSourceRevenue: 2_100, actualExpenditure: 13_400, recurrentExpenditure: 9_900, developmentExpenditure: 3_500, overallAbsorption: 91.2, recurrentAbsorption: 96.1, developmentAbsorption: 78.0, auditOpinion: 'Unmodified', pendingBills: 1_100, complianceScore: 82, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Nyeri', fiscalYear: '2023/24', approvedBudget: 12_400, equitableShare: 6_900, osrTarget: 1_800, ownSourceRevenue: 1_500, actualExpenditure: 11_300, recurrentExpenditure: 8_700, developmentExpenditure: 2_600, overallAbsorption: 91.1, recurrentAbsorption: 96.5, developmentAbsorption: 73.0, auditOpinion: 'Unmodified', pendingBills: 700, complianceScore: 85, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Kilifi', fiscalYear: '2023/24', approvedBudget: 13_800, equitableShare: 8_700, osrTarget: 1_500, ownSourceRevenue: 950, actualExpenditure: 10_900, recurrentExpenditure: 8_400, developmentExpenditure: 2_500, overallAbsorption: 79.0, recurrentAbsorption: 90.0, developmentAbsorption: 42.0, auditOpinion: 'Disclaimer', pendingBills: 6_800, complianceScore: 51, notes: 'CoG flagged severe compliance + procurement issues.', source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Garissa', fiscalYear: '2023/24', approvedBudget: 11_200, equitableShare: 7_900, osrTarget: 600, ownSourceRevenue: 350, actualExpenditure: 9_400, recurrentExpenditure: 7_600, developmentExpenditure: 1_800, overallAbsorption: 83.9, recurrentAbsorption: 92.5, developmentAbsorption: 51.0, auditOpinion: 'Adverse', pendingBills: 2_400, complianceScore: 45, notes: 'Repeated adverse opinions — investigation pending.', source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Kajiado', fiscalYear: '2023/24', approvedBudget: 11_500, equitableShare: 7_200, osrTarget: 800, ownSourceRevenue: 700, actualExpenditure: 9_143, recurrentExpenditure: 7_200, developmentExpenditure: 1_943, overallAbsorption: 79.5, recurrentAbsorption: 96.3, developmentAbsorption: 19.9, auditOpinion: 'Qualified', pendingBills: 1_600, complianceScore: 64, source: 'CoB Annual CG-BIRR FY 2023/24; Nation Africa 19 Nov 2024' },
  { countyName: 'Turkana', fiscalYear: '2023/24', approvedBudget: 13_500, equitableShare: 9_900, osrTarget: 400, ownSourceRevenue: 250, actualExpenditure: 11_900, recurrentExpenditure: 9_300, developmentExpenditure: 2_600, overallAbsorption: 88.1, recurrentAbsorption: 95.0, developmentAbsorption: 65.0, auditOpinion: 'Qualified', pendingBills: 1_300, complianceScore: 72, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'West Pokot', fiscalYear: '2023/24', approvedBudget: 10_800, equitableShare: 7_700, osrTarget: 350, ownSourceRevenue: 280, actualExpenditure: 9_600, recurrentExpenditure: 7_500, developmentExpenditure: 2_100, overallAbsorption: 89.0, recurrentAbsorption: 95.0, developmentAbsorption: 70.0, auditOpinion: 'Unmodified', pendingBills: 850, complianceScore: 79, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Bungoma', fiscalYear: '2023/24', approvedBudget: 14_100, equitableShare: 9_500, osrTarget: 1_200, ownSourceRevenue: 950, actualExpenditure: 12_700, recurrentExpenditure: 9_800, developmentExpenditure: 2_900, overallAbsorption: 90.1, recurrentAbsorption: 95.4, developmentAbsorption: 72.0, auditOpinion: 'Qualified', pendingBills: 1_400, complianceScore: 76, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Busia', fiscalYear: '2023/24', approvedBudget: 11_300, equitableShare: 8_100, osrTarget: 600, ownSourceRevenue: 420, actualExpenditure: 9_900, recurrentExpenditure: 7_900, developmentExpenditure: 2_000, overallAbsorption: 87.6, recurrentAbsorption: 94.0, developmentAbsorption: 62.0, auditOpinion: 'Qualified', pendingBills: 2_200, complianceScore: 68, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Siaya', fiscalYear: '2023/24', approvedBudget: 11_700, equitableShare: 8_400, osrTarget: 700, ownSourceRevenue: 520, actualExpenditure: 10_400, recurrentExpenditure: 8_100, developmentExpenditure: 2_300, overallAbsorption: 88.9, recurrentAbsorption: 94.5, developmentAbsorption: 70.0, auditOpinion: 'Unmodified', pendingBills: 900, complianceScore: 78, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: 'Kisii', fiscalYear: '2023/24', approvedBudget: 13_500, equitableShare: 8_900, osrTarget: 1_400, ownSourceRevenue: 1_100, actualExpenditure: 11_700, recurrentExpenditure: 9_300, developmentExpenditure: 2_400, overallAbsorption: 86.7, recurrentAbsorption: 95.0, developmentAbsorption: 53.0, auditOpinion: 'Qualified', pendingBills: 1_900, complianceScore: 71, source: 'CoB Annual CG-BIRR FY 2023/24' },
  { countyName: "Murang'a", fiscalYear: '2023/24', approvedBudget: 13_200, equitableShare: 8_300, osrTarget: 1_700, ownSourceRevenue: 1_400, actualExpenditure: 11_900, recurrentExpenditure: 9_000, developmentExpenditure: 2_900, overallAbsorption: 90.2, recurrentAbsorption: 95.7, developmentAbsorption: 74.0, auditOpinion: 'Unmodified', pendingBills: 850, complianceScore: 82, source: 'CoB Annual CG-BIRR FY 2023/24' },
];

// ============ HELPERS ============

export function getNationalFinance(fy?: string): FinanceAuditData | null {
  const records = NATIONAL_FINANCE.filter(r => !fy || r.fiscalYear === fy);
  return records[0] || null;
}

export function getAllNationalFinance(): FinanceAuditData[] {
  return NATIONAL_FINANCE;
}

export function getCountyFinance(countyName: string, fy?: string): CountyFinanceRecord | null {
  const records = COUNTY_FINANCE.filter(r =>
    r.countyName.toLowerCase() === countyName.toLowerCase() &&
    (!fy || r.fiscalYear === fy)
  );
  return records[0] || null;
}

export function getAllCountyFinance(fy?: string): CountyFinanceRecord[] {
  return COUNTY_FINANCE.filter(r => !fy || r.fiscalYear === fy);
}

export function getAuditOpinionColor(opinion: AuditOpinionType): string {
  switch (opinion) {
    case 'Unmodified': return 'bg-emerald-500';
    case 'Qualified': return 'bg-amber-500';
    case 'Adverse': return 'bg-rose-500';
    case 'Disclaimer': return 'bg-purple-500';
    default: return 'bg-slate-400';
  }
}

export function getAuditOpinionTextColor(opinion: AuditOpinionType): string {
  switch (opinion) {
    case 'Unmodified': return 'text-emerald-700 dark:text-emerald-300';
    case 'Qualified': return 'text-amber-700 dark:text-amber-300';
    case 'Adverse': return 'text-rose-700 dark:text-rose-300';
    case 'Disclaimer': return 'text-purple-700 dark:text-purple-300';
    default: return 'text-slate-500';
  }
}

export function formatKshs(value?: number | null, unit: 'M' | 'B' | 'T' = 'M'): string {
  if (value === null || value === undefined) return 'N/A';
  if (unit === 'M') {
    if (value >= 1_000_000) return `Kshs ${(value / 1_000_000).toFixed(2)}T`;
    if (value >= 1_000) return `Kshs ${(value / 1_000).toFixed(2)}B`;
    return `Kshs ${Math.round(value)}M`;
  }
  return `Kshs ${value}M`;
}

// Aggregate stats across all counties for a given fiscal year
export interface CountyAggregateStats {
  totalApprovedBudget: number;
  totalEquitableShare: number;
  totalOsrCollected: number;
  totalOsrTarget: number;
  totalPendingBills: number;
  totalActualExpenditure: number;
  avgOverallAbsorption: number;
  avgDevelopmentAbsorption: number;
  auditOpinionCounts: Record<AuditOpinionType, number>;
  topPerformers: CountyFinanceRecord[];
  bottomPerformers: CountyFinanceRecord[];
}

export function getAggregateStats(fy?: string): CountyAggregateStats {
  const records = getAllCountyFinance(fy);
  if (records.length === 0) {
    return {
      totalApprovedBudget: 0,
      totalEquitableShare: 0,
      totalOsrCollected: 0,
      totalOsrTarget: 0,
      totalPendingBills: 0,
      totalActualExpenditure: 0,
      avgOverallAbsorption: 0,
      avgDevelopmentAbsorption: 0,
      auditOpinionCounts: {} as Record<AuditOpinionType, number>,
      topPerformers: [],
      bottomPerformers: [],
    };
  }

  const totals = records.reduce((acc, r) => ({
    approved: acc.approved + (r.approvedBudget || 0),
    eqShare: acc.eqShare + (r.equitableShare || 0),
    osrCollected: acc.osrCollected + (r.ownSourceRevenue || 0),
    osrTarget: acc.osrTarget + (r.osrTarget || 0),
    pending: acc.pending + (r.pendingBills || 0),
    actual: acc.actual + (r.actualExpenditure || 0),
    absorption: acc.absorption + (r.overallAbsorption || 0),
    devAbsorption: acc.devAbsorption + (r.developmentAbsorption || 0),
    count: acc.count + 1,
  }), { approved: 0, eqShare: 0, osrCollected: 0, osrTarget: 0, pending: 0, actual: 0, absorption: 0, devAbsorption: 0, count: 0 });

  const auditOpinionCounts = records.reduce((acc, r) => {
    acc[r.auditOpinion] = (acc[r.auditOpinion] || 0) + 1;
    return acc;
  }, {} as Record<AuditOpinionType, number>);

  // Rank by compliance score
  const sorted = [...records].sort((a, b) => (b.complianceScore || 0) - (a.complianceScore || 0));

  return {
    totalApprovedBudget: totals.approved,
    totalEquitableShare: totals.eqShare,
    totalOsrCollected: totals.osrCollected,
    totalOsrTarget: totals.osrTarget,
    totalPendingBills: totals.pending,
    totalActualExpenditure: totals.actual,
    avgOverallAbsorption: totals.count ? totals.absorption / totals.count : 0,
    avgDevelopmentAbsorption: totals.count ? totals.devAbsorption / totals.count : 0,
    auditOpinionCounts,
    topPerformers: sorted.slice(0, 5),
    bottomPerformers: sorted.slice(-5).reverse(),
  };
}

// Combined county finance data (all fiscal years)
export const ALL_COUNTY_FINANCE: CountyFinanceRecord[] = [
  ...COUNTY_FINANCE_HISTORICAL,
  ...COUNTY_FINANCE,
];

// Get time-series data for a specific county across all FYs
export function getCountyTimeSeries(countyName: string): CountyFinanceRecord[] {
  return ALL_COUNTY_FINANCE
    .filter(r => r.countyName.toLowerCase() === countyName.toLowerCase())
    .sort((a, b) => a.fiscalYear.localeCompare(b.fiscalYear));
}

// Get all unique fiscal years across the dataset
export function getAvailableFiscalYears(): string[] {
  const fys = new Set<string>();
  ALL_COUNTY_FINANCE.forEach(r => fys.add(r.fiscalYear));
  NATIONAL_FINANCE.forEach(n => fys.add(n.fiscalYear));
  return Array.from(fys).sort();
}

// Get all unique county names with finance data
export function getCountiesWithFinanceData(): string[] {
  const names = new Set<string>();
  ALL_COUNTY_FINANCE.forEach(r => names.add(r.countyName));
  return Array.from(names).sort();
}
