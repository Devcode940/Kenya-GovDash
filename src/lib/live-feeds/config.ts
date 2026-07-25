// Live Feeds — Source Configuration
// Defines all feed sources with their URLs, refresh intervals, and capabilities

import { type FeedSourceConfig } from './types';

export const FEED_SOURCES: Record<string, FeedSourceConfig> = {
  oag: {
    id: 'oag',
    name: 'Office of the Auditor-General (OAG)',
    baseUrl: 'https://oagkenya.go.ke',
    reportsUrl: 'https://oagkenya.go.ke/category/reports/',
    logoUrl: 'https://oagkenya.go.ke/wp-content/uploads/2023/01/OAG-Logo.png',
    description: 'Constitutional mandate: audit all public bodies per Article 229. Publishes county audit reports annually with opinion types per county executive and assembly.',
    refreshIntervalMs: 24 * 60 * 60 * 1000,    // 24 hours (reports are annual)
    cacheTtlMs: 48 * 60 * 60 * 1000,            // 48 hours cache
    rateLimitPerMinute: 2,                        // Conservative rate limit
    color: '#1e3a5f',                             // Navy blue (government brand)
    iconEmoji: '🏛️',
  },
  cob: {
    id: 'cob',
    name: 'Controller of Budget (CoB)',
    baseUrl: 'https://cob.go.ke',
    reportsUrl: 'https://cob.go.ke/reports/consolidated-county-budget-implementation-review-reports',
    logoUrl: '',
    description: 'Constitutional mandate: oversee budget implementation per Article 228. Publishes consolidated county budget implementation review reports quarterly and annually.',
    refreshIntervalMs: 6 * 60 * 60 * 1000,       // 6 hours (quarterly updates)
    cacheTtlMs: 12 * 60 * 60 * 1000,              // 12 hours cache
    rateLimitPerMinute: 3,
    color: '#059669',                              // Green (fiscal transparency)
    iconEmoji: '💰',
  },
  'ti-kenya': {
    id: 'ti-kenya',
    name: 'Transparency International Kenya',
    baseUrl: 'https://tikenya.org',
    reportsUrl: 'https://tikenya.org/publications/',
    logoUrl: '',
    description: 'Civil society watchdog. Publishes CPI rankings, County Budget Transparency Survey (CBTS), and County Governance Score Report (CGSR) annually.',
    refreshIntervalMs: 7 * 24 * 60 * 60 * 1000,   // 7 days (annual publications)
    cacheTtlMs: 30 * 24 * 60 * 60 * 1000,          // 30 days cache
    rateLimitPerMinute: 5,
    color: '#dc2626',                                // Red (anti-corruption)
    iconEmoji: '🔍',
  },
  eacc: {
    id: 'eacc',
    name: 'Ethics and Anti-Corruption Commission (EACC)',
    baseUrl: 'https://eacc.go.ke',
    reportsUrl: 'https://eacc.go.ke/reports/',
    logoUrl: '',
    description: 'Constitutional mandate: enforce Chapter 6 (Leadership and Integrity) per Article 79. Manages asset declarations for state officers, investigates corruption, and publishes annual reports.',
    refreshIntervalMs: 12 * 60 * 60 * 1000,        // 12 hours
    cacheTtlMs: 24 * 60 * 60 * 1000,                // 24 hours cache
    rateLimitPerMinute: 2,
    color: '#7c3aed',                                // Purple (ethics/integrity)
    iconEmoji: '⚖️',
  },
};

// ==================== API CAPABILITY NOTES ====================
// OAG: No public REST API. Reports published as PDFs at oagkenya.go.ke.
//       Fetching reads the reports page and parses available links.
// CoB: No public REST API. Reports published as PDFs at cob.go.ke.
//       Budget data available in annual/quarterly review reports.
// TI-Kenya: No public REST API. Reports published as PDFs at tikenya.org.
//           CPI data available at transparency.org/en/countries/kenya.
// EACC: No public REST API. Annual reports published as PDFs at eacc.go.ke.
//       Asset declarations are NOT publicly published (Chapter 6 requires declaration
//       to EACC but data is not publicly accessible per LIA restrictions).
//       Investigation data is published in annual reports and press releases.

export const DATA_GAP_NOTES = {
  eaccAssetDeclarations: 'Chapter 6 of the Constitution (Article 79) requires all State Officers to declare their assets to EACC. However, EACC does not publicly publish individual asset declaration data — it is treated as confidential under the Leadership and Integrity Act and the Access to Information Act exemptions. Only aggregate compliance statistics (submission rates) are available in EACC annual reports.',
  oagCountySpecific: 'County-specific audit opinions for FY 2024/25 require consulting the full individual county audit PDFs. The summary report lists aggregate opinion counts but does not specify which county received which opinion.',
  cobCountySpecific: 'County-specific absorption rates for FY 2024/25 are not yet published. FY 2023/24 county-specific data is available in the consolidated annual report PDFs.',
  manifestoTracking: 'No centralized, verified manifesto tracking mechanism exists from any of the mandated sources (OAG, CoB, TI-Kenya, EACC). Individual county manifestos exist but are not systematically tracked.',
};
