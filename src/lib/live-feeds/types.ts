// Live Feeds — Type Definitions
// All types for the OAG, CoB, TI-Kenya, and EACC live data integration layer

export type FeedSource = 'oag' | 'cob' | 'ti-kenya' | 'eacc';

export type FeedStatus = 'live' | 'cached' | 'static' | 'unavailable' | 'error';

export type FeedCategory = 'audit-opinion' | 'budget-absorption' | 'corruption-index' | 'asset-declaration' | 'compliance-report' | 'county-budget' | 'procurement' | 'general';

export interface FeedSourceConfig {
  id: FeedSource;
  name: string;
  baseUrl: string;
  reportsUrl: string;
  logoUrl: string;
  description: string;
  refreshIntervalMs: number;  // How often to attempt live fetch
  cacheTtlMs: number;         // How long cached data is valid
  rateLimitPerMinute: number;
  color: string;              // Brand color for UI
  iconEmoji: string;
}

export interface FeedDataFreshness {
  lastFetchedAt: string | null;    // ISO timestamp of last successful fetch
  lastSuccessfulAt: string | null; // ISO timestamp
  nextFetchAt: string | null;      // ISO timestamp of planned next fetch
  status: FeedStatus;
  errorMessage?: string;
  cacheExpiryAt: string | null;
  sourceUrl: string;
  isLiveApiAvailable: boolean;     // Whether the source has a real REST API
}

// ==================== OAG SPECIFIC TYPES ====================

export interface OagCountyAudit {
  countyName: string;
  countyCode: number;
  fy: string;
  executiveOpinion: 'Unmodified' | 'Qualified' | 'Adverse' | 'Disclaimer';
  assemblyOpinion: 'Unmodified' | 'Qualified' | 'Adverse' | 'Disclaimer';
  reportUrl: string;
  reportPage?: string;
  source: string;
}

export interface OagNationalSummary {
  fy: string;
  executiveOpinions: {
    unmodified: number;
    qualified: number;
    adverse: number;
    disclaimer: number;
  };
  assemblyOpinions: {
    unmodified: number;
    qualified: number;
    adverse: number;
    disclaimer: number;
  };
  source: string;
  url: string;
  reportTitle: string;
  totalPages?: number;
  publishedDate?: string;
}

export interface OagFeedPayload {
  freshness: FeedDataFreshness;
  nationalSummaries: OagNationalSummary[];
  countyAudits: OagCountyAudit[];
}

// ==================== CoB SPECIFIC TYPES ====================

export interface CobCountyBudget {
  countyName: string;
  countyCode: number;
  fy: string;
  overallAbsorption: number | null;
  recurrentAbsorption: number | null;
  developmentAbsorption: number | null;
  totalBudget: string | null;
  pendingBills: string | null;
  source: string;
  reportUrl: string;
}

export interface CobNationalBudget {
  fy: string;
  aggregateAbsorption: number;
  recurrentAbsorption: number;
  developmentAbsorption: number;
  totalPendingBills: string;
  countiesOver70DevBudget: number;
  equitableShareReleased: string | null;
  source: string;
  url: string;
  reportTitle: string;
}

export interface CobFeedPayload {
  freshness: FeedDataFreshness;
  nationalBudgets: CobNationalBudget[];
  countyBudgets: CobCountyBudget[];
}

// ==================== TI-KENYA SPECIFIC TYPES ====================

export interface TiKenyaCPI {
  year: string;
  score: number;
  rank: number;
  countriesTotal: number;
  source: string;
  url: string;
}

export interface TiKenyaCBTS {
  year: string;
  nationalAverage: number;
  countiesCovered: number;
  topCounty: string | null;
  bottomCounty: string | null;
  source: string;
  url: string;
}

export interface TiKenyaCountyGovernanceScore {
  countyName: string;
  year: string;
  overallScore: number | null;
  serviceDelivery: number | null;
  transparency: number | null;
  accountability: number | null;
  participation: number | null;
  source: string;
  url: string;
}

export interface TiKenyaFeedPayload {
  freshness: FeedDataFreshness;
  cpi: TiKenyaCPI[];
  cbts: TiKenyaCBTS[];
  countyScores: TiKenyaCountyGovernanceScore[];
}

// ==================== EACC SPECIFIC TYPES ====================

export type EaccDeclarationStatus = 'Submitted' | 'Pending' | 'Overdue' | 'Under Investigation' | 'Cleared';

export interface EaccAssetDeclaration {
  representativeId: string;
  representativeName: string;
  officialTitle: string;
  county: string;
  declarationYear: string;
  submissionDate: string | null;
  declaredAssets: string | null;      // Formatted amount (e.g., "Kshs 25M")
  declaredIncome: string | null;
  liabilities: string | null;
  netWorth: string | null;
  status: EaccDeclarationStatus;
  flagReason?: string;
  investigationStatus?: string;
  sourceUrl: string;
  source: string;
  fy: string;
}

export interface EaccComplianceSummary {
  fy: string;
  totalRequired: number;
  submittedOnTime: number;
  submittedLate: number;
  overdue: number;
  underInvestigation: number;
  complianceRate: number;
  source: string;
  url: string;
}

export interface EaccInvestigation {
  caseNumber: string;
  representativeName: string;
  officialTitle: string;
  county: string;
  allegationType: string;
  status: 'Under Investigation' | 'Prosecuted' | 'Acquitted' | 'Convicted' | 'Withdrawn';
  initiatedDate: string | null;
  conclusionDate: string | null;
  sourceUrl: string;
  source: string;
}

export interface EaccFeedPayload {
  freshness: FeedDataFreshness;
  complianceSummary: EaccComplianceSummary[];
  assetDeclarations: EaccAssetDeclaration[];
  investigations: EaccInvestigation[];
}

// ==================== AGGREGATED LIVE FEED ====================

export interface LiveFeedAggregation {
  oag: OagFeedPayload;
  cob: CobFeedPayload;
  tiKenya: TiKenyaFeedPayload;
  eacc: EaccFeedPayload;
  lastRefreshedAt: string;
  overallStatus: FeedStatus;
}

export interface FeedRefreshRequest {
  source?: FeedSource;  // If omitted, refresh all sources
  force?: boolean;      // Force refresh even if cache is still valid
}

export interface FeedRefreshResult {
  source: FeedSource;
  status: FeedStatus;
  dataFetched: boolean;
  itemsCount: number;
  timestamp: string;
  errorMessage?: string;
}
