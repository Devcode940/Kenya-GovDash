// Auto-extract structured finance + audit data from CoB BIRR + OAG audit PDFs.
//
// Strategy:
//   1. Extract full text from the PDF (page-by-page, with page markers)
//   2. Identify county sections by scanning for "County Name" headers
//   3. For each county section, use regex patterns to find:
//      - Approved Budget / Supplementary Budget
//      - Equitable Share allocation
//      - Own Source Revenue (target + actual)
//      - Absorption rates (overall / recurrent / development)
//      - Pending Bills
//      - Audit Opinion (OAG reports only)
//   4. Return structured records ready for FinanceAuditSnapshot creation
//
// The parser is heuristic — it looks for known column headers in CoB BIRR
// tables and captures the numeric values that follow. Numbers are normalized
// to Kshs millions.

import { readFile } from 'fs/promises';

export interface ExtractedFinanceRecord {
  countyName: string | null; // null = national summary
  fiscalYear: string | null;
  source: string; // 'CoB' | 'OAG' | 'CoG' | 'Other'
  approvedBudget?: number;
  supplementaryBudget?: number;
  actualExpenditure?: number;
  recurrentExpenditure?: number;
  developmentExpenditure?: number;
  equitableShare?: number;
  ownSourceRevenue?: number;
  osrTarget?: number;
  overallAbsorption?: number;
  recurrentAbsorption?: number;
  developmentAbsorption?: number;
  auditOpinion?: string;
  pendingBills?: number;
  totalDebt?: number;
  notes?: string;
  pageNumbers: number[]; // pages where data was found
  confidence: 'high' | 'medium' | 'low';
}

export interface ExtractionResult {
  records: ExtractedFinanceRecord[];
  errors: string[];
  fileName: string;
  detectedFiscalYear: string | null;
  detectedSource: string | null;
  totalRecords: number;
}

// ============ TEXT EXTRACTION ============

interface TextItem {
  str: string;
  transform: number[]; // [a, b, c, d, e, f] where e=x, f=y
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PageContent {
  text: string;          // plain text (concatenated items)
  items: TextItem[];     // structured items with positions
  pageNum: number;
}

async function extractPdfPages(filePath: string): Promise<{ pages: PageContent[]; pageCount: number }> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = await readFile(filePath);
  const loadingTask = await (pdfjs as any).getDocument({ data: new Uint8Array(data) });
  const doc = await loadingTask.promise;
  const pageCount = doc.numPages;
  const pages: PageContent[] = [];
  for (let i = 1; i <= pageCount; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const items: TextItem[] = (content.items as any[])
      .filter((item: any) => 'str' in item && item.str)
      .map((item: any) => ({
        str: item.str,
        transform: item.transform,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || 0,
        height: item.height || 0,
      }));
    const text = items.map(i => i.str).join(' ');
    pages.push({ text, items, pageNum: i });
  }
  return { pages, pageCount };
}

// Backwards-compat wrapper
async function extractPdfText(filePath: string): Promise<{ text: string; pageCount: number }> {
  const { pages, pageCount } = await extractPdfPages(filePath);
  const text = pages.map(p => `\n--- Page ${p.pageNum} ---\n${p.text}`).join('');
  return { text: text.trim(), pageCount };
}

// ============ TABLE DETECTION ============
// Group text items into rows by y-position, then into columns by x-position.
// Returns rows of cells, suitable for matching against known table layouts.

interface TableRow {
  y: number;
  cells: { text: string; x: number; xEnd: number }[];
}

interface DetectedTable {
  pageNum: number;
  rows: TableRow[];
  headerRow?: TableRow;
  score: number; // higher = more likely a real table
}

function detectTablesOnPage(page: PageContent): DetectedTable[] {
  if (page.items.length < 10) return [];

  // Group items into rows by y-position (within 3px tolerance)
  const yMap = new Map<number, TextItem[]>();
  for (const item of page.items) {
    const yKey = Math.round(item.y / 3) * 3;
    if (!yMap.has(yKey)) yMap.set(yKey, []);
    yMap.get(yKey)!.push(item);
  }

  // Sort rows top-to-bottom (PDF y increases upward, so reverse)
  const sortedYs = Array.from(yMap.keys()).sort((a, b) => b - a);

  // Build rows: each row has cells, sorted left-to-right
  const rows: TableRow[] = sortedYs.map(y => {
    const items = yMap.get(y)!.sort((a, b) => a.x - b.x);
    // Merge adjacent items in same cell (within 5px gap)
    const cells: { text: string; x: number; xEnd: number }[] = [];
    for (const item of items) {
      const lastCell = cells[cells.length - 1];
      if (lastCell && item.x - lastCell.xEnd < 8) {
        // Same cell — append
        lastCell.text += ' ' + item.str;
        lastCell.xEnd = Math.max(lastCell.xEnd, item.x + item.width);
      } else {
        cells.push({ text: item.str, x: item.x, xEnd: item.x + item.width });
      }
    }
    return { y, cells };
  });

  // Find tables: consecutive rows with 3+ cells each
  const tables: DetectedTable[] = [];
  let currentRows: TableRow[] = [];
  for (const row of rows) {
    if (row.cells.length >= 3) {
      currentRows.push(row);
    } else {
      if (currentRows.length >= 3) {
        // Heuristic: header is the first row containing words like "county", "budget", "absorption"
        const header = currentRows[0];
        const headerText = header.cells.map(c => c.text.toLowerCase()).join(' ');
        const isHeader = /county|budget|absorption|expenditure|revenue|opinion|approved/i.test(headerText);
        tables.push({
          pageNum: page.pageNum,
          rows: currentRows,
          headerRow: isHeader ? header : undefined,
          score: currentRows.length + (isHeader ? 10 : 0),
        });
      }
      currentRows = [];
    }
  }
  // Flush
  if (currentRows.length >= 3) {
    const header = currentRows[0];
    const headerText = header.cells.map(c => c.text.toLowerCase()).join(' ');
    const isHeader = /county|budget|absorption|expenditure|revenue|opinion|approved/i.test(headerText);
    tables.push({
      pageNum: page.pageNum,
      rows: currentRows,
      headerRow: isHeader ? header : undefined,
      score: currentRows.length + (isHeader ? 10 : 0),
    });
  }

  return tables;
}

// Match a table row to a county finance record based on the first cell
// (county name) and the header row's column labels.
function parseRowByHeader(
  row: TableRow,
  header: TableRow,
): Partial<ExtractedFinanceRecord> | null {
  const result: Partial<ExtractedFinanceRecord> = {};
  const headerCells = header.cells.map(c => c.text.toLowerCase());
  const rowCells = row.cells;

  // Identify which column is which metric
  for (let i = 0; i < headerCells.length && i < rowCells.length; i++) {
    const h = headerCells[i];
    const val = rowCells[i].text.trim();
    if (!val) continue;

    // Skip header cells that are clearly not numeric
    const num = parseAmount(val);

    if (h.includes('county') || h.includes('name')) {
      result.countyName = val;
    } else if (h.includes('approved') && h.includes('budget')) {
      if (num !== undefined) result.approvedBudget = num;
    } else if (h.includes('supplementary')) {
      if (num !== undefined) result.supplementaryBudget = num;
    } else if (h.includes('actual') && h.includes('expend')) {
      if (num !== undefined) result.actualExpenditure = num;
    } else if (h.includes('recurrent') && h.includes('expend')) {
      if (num !== undefined) result.recurrentExpenditure = num;
    } else if (h.includes('development') && h.includes('expend')) {
      if (num !== undefined) result.developmentExpenditure = num;
    } else if (h.includes('equitable')) {
      if (num !== undefined) result.equitableShare = num;
    } else if (h.includes('own source') || h.includes('osr')) {
      if (num !== undefined) result.ownSourceRevenue = num;
    } else if (h.includes('osr') && h.includes('target')) {
      if (num !== undefined) result.osrTarget = num;
    } else if (h.includes('absorption') && (h.includes('overall') || (!h.includes('recurrent') && !h.includes('development')))) {
      if (num !== undefined) {
        result.overallAbsorption = num > 1 ? num : num * 100;
      }
    } else if (h.includes('recurrent') && h.includes('absorption')) {
      if (num !== undefined) {
        result.recurrentAbsorption = num > 1 ? num : num * 100;
      }
    } else if (h.includes('development') && h.includes('absorption')) {
      if (num !== undefined) {
        result.developmentAbsorption = num > 1 ? num : num * 100;
      }
    } else if (h.includes('pending') && h.includes('bill')) {
      if (num !== undefined) result.pendingBills = num;
    } else if (h.includes('debt')) {
      if (num !== undefined) result.totalDebt = num;
    } else if (h.includes('audit') && h.includes('opinion')) {
      result.auditOpinion = val;
    }
  }

  return result;
}

// ============ HELPERS ============

// Parse "Kshs 1,234.56 million" or "1,234.56" or "Kshs 12.5B" → millions
function parseAmount(raw: string): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[,\s]/g, '').replace(/Kshs?/gi, '').trim();
  // Billions
  const bnMatch = cleaned.match(/^([\d.]+)B/i);
  if (bnMatch) return parseFloat(bnMatch[1]) * 1000;
  // Trillions
  const tnMatch = cleaned.match(/^([\d.]+)T/i);
  if (tnMatch) return parseFloat(tnMatch[1]) * 1_000_000;
  // Millions (default)
  const mnMatch = cleaned.match(/^([\d.]+)M?$/i);
  if (mnMatch) return parseFloat(mnMatch[1]);
  // Plain number
  const num = parseFloat(cleaned);
  if (!isNaN(num)) return num;
  return undefined;
}

// Extract the first number following a label in text
function findNumberAfterLabel(text: string, labelPattern: RegExp, windowChars = 200): number | undefined {
  const match = text.match(labelPattern);
  if (!match) return undefined;
  const after = text.slice(match.index! + match[0].length, match.index! + match[0].length + windowChars);
  // Find first numeric token (may include commas, decimals, Kshs prefix)
  const numMatch = after.match(/(Kshs?\s*)?([\d,]+\.?\d*)\s*(B|M|million|billion)?/i);
  if (!numMatch) return undefined;
  return parseAmount(numMatch[0]);
}

// Detect fiscal year from text
function detectFiscalYear(text: string, fileName: string): string | null {
  // Try filename first
  const fyFromName = fileName.match(/(?:FY\s*)?(\d{4})[-_](\d{2,4})/i);
  if (fyFromName) return `${fyFromName[1]}/${fyFromName[2]}`;
  // Then text
  const fyMatch = text.match(/(?:FY|Financial Year)\s*(\d{4})[-/](\d{2,4})/i);
  if (fyMatch) return `${fyMatch[1]}/${fyMatch[2]}`;
  // Common CoB pattern: "2023/24"
  const cobMatch = text.match(/\b(20\d{2})\/(\d{2})\b/);
  if (cobMatch) return `${cobMatch[1]}/${cobMatch[2]}`;
  return null;
}

// Detect source from filename + text
function detectSource(fileName: string, text: string): string {
  const lower = (fileName + ' ' + text.slice(0, 5000)).toLowerCase();
  if (lower.includes('oag') || lower.includes('auditor-general') || lower.includes('audit report')) return 'OAG';
  if (lower.includes('cob') || lower.includes('controller of budget') || lower.includes('birr') || lower.includes('budget implementation')) return 'CoB';
  if (lower.includes('cog') || lower.includes('council of governors')) return 'CoG';
  if (lower.includes('knbs') || lower.includes('bureau of statistics')) return 'KNBS';
  return 'Other';
}

// Known county names for matching
const COUNTY_NAMES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita Taveta',
  'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka Nithi',
  'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
  "Murang'a", 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia',
  'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru',
  'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
  'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
  'Nairobi City', 'Nairobi',
];

// Detect audit opinion from text
function detectAuditOpinion(text: string): string | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('unmodified opinion') || lower.includes('unqualified opinion')) return 'Unmodified';
  if (lower.includes('qualified opinion')) return 'Qualified';
  if (lower.includes('adverse opinion')) return 'Adverse';
  if (lower.includes('disclaimer of opinion')) return 'Disclaimer';
  return undefined;
}

// ============ MAIN EXTRACTION ============

export async function extractFinanceFromPdf(filePath: string): Promise<ExtractionResult> {
  const fileName = filePath.split('/').pop() || filePath;
  const result: ExtractionResult = {
    records: [],
    errors: [],
    fileName,
    detectedFiscalYear: null,
    detectedSource: null,
    totalRecords: 0,
  };

  let pages: PageContent[];
  let text: string;
  try {
    const extraction = await extractPdfPages(filePath);
    pages = extraction.pages;
    text = pages.map(p => p.text).join('\n');
  } catch (err) {
    result.errors.push(`PDF parse failed: ${err instanceof Error ? err.message : 'unknown'}`);
    return result;
  }

  result.detectedFiscalYear = detectFiscalYear(text, fileName);
  result.detectedSource = detectSource(fileName, text);

  if (!result.detectedFiscalYear) {
    result.errors.push('Could not detect fiscal year from PDF');
  }

  // === TABLE-BASED EXTRACTION (new, more accurate) ===
  // First try to detect structured tables and parse them by header.
  // This is much more reliable than regex for CoB BIRR tables.
  const tableRecords = new Map<string, ExtractedFinanceRecord>();

  for (const page of pages) {
    const tables = detectTablesOnPage(page);
    for (const table of tables) {
      if (!table.headerRow) continue;
      const headerText = table.headerRow.cells.map(c => c.text.toLowerCase()).join(' ');
      // Only parse tables that look like finance tables
      if (!/(budget|absorption|expenditure|revenue|opinion|approved)/i.test(headerText)) continue;

      for (const row of table.rows) {
        if (row === table.headerRow) continue;
        const firstCell = row.cells[0]?.text || '';
        // Try to match first cell to a county name OR "National"
        const matchedCounty = COUNTY_NAMES.find(c =>
          firstCell.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(firstCell.toLowerCase())
        );
        const isNational = /national\s+government|national\s+total/i.test(firstCell);
        if (!matchedCounty && !isNational) continue;

        const parsed = parseRowByHeader(row, table.headerRow);
        if (!parsed) continue;

        const countyName = matchedCounty === 'Nairobi' ? 'Nairobi City' : (matchedCounty || null);
        const key = `${countyName || 'national'}|${result.detectedFiscalYear || ''}|${result.detectedSource || ''}`;

        const existing = tableRecords.get(key);
        if (existing) {
          // Merge — fill in any missing fields
          Object.assign(existing, { ...parsed, ...Object.fromEntries(Object.entries(existing).filter(([_, v]) => v != null)) });
        } else {
          tableRecords.set(key, {
            countyName,
            fiscalYear: result.detectedFiscalYear,
            source: result.detectedSource || 'Other',
            pageNumbers: [page.pageNum],
            confidence: 'medium',
            ...parsed,
          } as ExtractedFinanceRecord);
        }
      }
    }
  }

  // Convert table records to array + score confidence
  for (const rec of tableRecords.values()) {
    const fieldCount = [
      rec.approvedBudget, rec.actualExpenditure, rec.equitableShare,
      rec.ownSourceRevenue, rec.overallAbsorption, rec.pendingBills,
    ].filter(v => v !== undefined).length;
    rec.confidence = fieldCount >= 4 ? 'high' : fieldCount >= 2 ? 'medium' : 'low';
    if (fieldCount >= 2) result.records.push(rec);
  }

  // === FALLBACK: regex-based extraction ===
  // If table extraction found nothing, fall back to the original regex approach.
  if (result.records.length === 0) {
    const countySections = new Map<string, { text: string; pages: number[] }>();
    const pageParts = text.split(/\n--- Page (\d+) ---\n/);
    // Note: pages already joined without page markers above; reconstruct using pages array
    for (const page of pages) {
      for (const countyName of COUNTY_NAMES) {
        const countyRegex = new RegExp(`\\b${countyName.replace(/'/g, "[''")}(\\s+County)?\\b`, 'i');
        if (countyRegex.test(page.text)) {
          if (!countySections.has(countyName)) {
            countySections.set(countyName, { text: '', pages: [] });
          }
          const existing = countySections.get(countyName)!;
          existing.text += '\n' + page.text;
          if (!existing.pages.includes(page.pageNum)) existing.pages.push(page.pageNum);
        }
      }
    }

    for (const [countyName, section] of countySections.entries()) {
      const record: ExtractedFinanceRecord = {
        countyName,
        fiscalYear: result.detectedFiscalYear,
        source: result.detectedSource || 'Other',
        pageNumbers: section.pages,
        confidence: 'medium',
      };

      if (record.countyName === 'Nairobi') record.countyName = 'Nairobi City';

      const sectionText = section.text;

      const approved = findNumberAfterLabel(sectionText, /approved\s+budget[^\d]{0,30}/i);
      if (approved !== undefined) record.approvedBudget = approved;

      const suppl = findNumberAfterLabel(sectionText, /supplementary\s+budget[^\d]{0,30}/i);
      if (suppl !== undefined) record.supplementaryBudget = suppl;

      const actual = findNumberAfterLabel(sectionText, /actual\s+(expenditure|spend)[^\d]{0,30}/i);
      if (actual !== undefined) record.actualExpenditure = actual;

      const recurrent = findNumberAfterLabel(sectionText, /recurrent\s+expenditure[^\d]{0,30}/i);
      if (recurrent !== undefined) record.recurrentExpenditure = recurrent;

      const development = findNumberAfterLabel(sectionText, /development\s+expenditure[^\d]{0,30}/i);
      if (development !== undefined) record.developmentExpenditure = development;

      const equitable = findNumberAfterLabel(sectionText, /equitable\s+share[^\d]{0,30}/i);
      if (equitable !== undefined) record.equitableShare = equitable;

      const osr = findNumberAfterLabel(sectionText, /own\s+source\s+revenue[^\d]{0,30}(?:collected|actual|realized)?[^\d]{0,15}/i);
      if (osr !== undefined) record.ownSourceRevenue = osr;

      const osrTarget = findNumberAfterLabel(sectionText, /osr\s+target|own\s+source\s+revenue\s+target|revenue\s+target[^\d]{0,30}/i);
      if (osrTarget !== undefined) record.osrTarget = osrTarget;

      const overallAbs = findNumberAfterLabel(sectionText, /overall\s+absorption[^\d]{0,15}/i);
      if (overallAbs !== undefined) {
        record.overallAbsorption = overallAbs > 1 ? overallAbs : overallAbs * 100;
      }

      const recurrentAbs = findNumberAfterLabel(sectionText, /recurrent\s+absorption[^\d]{0,15}/i);
      if (recurrentAbs !== undefined) {
        record.recurrentAbsorption = recurrentAbs > 1 ? recurrentAbs : recurrentAbs * 100;
      }

      const devAbs = findNumberAfterLabel(sectionText, /development\s+absorption[^\d]{0,15}/i);
      if (devAbs !== undefined) {
        record.developmentAbsorption = devAbs > 1 ? devAbs : devAbs * 100;
      }

      const pending = findNumberAfterLabel(sectionText, /pending\s+bills[^\d]{0,30}/i);
      if (pending !== undefined) record.pendingBills = pending;

      const debt = findNumberAfterLabel(sectionText, /total\s+debt|public\s+debt|outstanding\s+debt[^\d]{0,30}/i);
      if (debt !== undefined) record.totalDebt = debt;

      const opinion = detectAuditOpinion(sectionText);
      if (opinion) record.auditOpinion = opinion;

      const fieldCount = [
        record.approvedBudget, record.actualExpenditure, record.equitableShare,
        record.ownSourceRevenue, record.overallAbsorption, record.pendingBills,
      ].filter(v => v !== undefined).length;
      record.confidence = fieldCount >= 4 ? 'high' : fieldCount >= 2 ? 'medium' : 'low';

      if (fieldCount >= 2) {
        result.records.push(record);
      }
    }
  }

  result.totalRecords = result.records.length;
  return result;
}
