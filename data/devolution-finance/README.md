# Devolution finance data

Versioned, source-cited national aggregates and a CoB/OAG report index for Kenya county finance.

## Files

| File | Contents |
|------|----------|
| `national-series.json` | Equitable share FY 2013/14→2025/26 + pre-devolution context (2010/11–2012/13) + aggregate county budget trends |
| `report-catalog.json` | Index of County BIRR (CoB) and OAG summary reports |

## Important scope note

**County governments began in FY 2013/14.** There is no county equitable-share series for FY 2010/11–2011/12. Those years are recorded as context only (`dataAvailable: false`). FY 2012/13 has transition transfers only.

## Primary sources

- [CoB Consolidated County BIRR](https://cob.go.ke/publications/consolidated-county-budget-implementation-review-reports/)
- [CoB National BIRR](https://cob.go.ke/publications/national-government-budget-implementation-review-reports/)
- [OAG Kenya](https://www.oagkenya.go.ke/)
- CRA / DORA / CARA (equitable share legislation)

## Usage

```ts
import {
  getEquitableShareSeries,
  getReportCatalog,
  getFullDevolutionTimeline,
} from '@/lib/devolution-finance';
```

Do not invent county-level line items. Prefer ingesting CoB/OAG PDFs via the admin extractor and storing snapshots in `FinanceAuditSnapshot`.
