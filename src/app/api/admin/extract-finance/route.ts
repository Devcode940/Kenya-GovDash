import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { db } from '@/lib/db';
import { extractFinanceFromPdf } from '@/lib/finance-extractor';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export const maxDuration = 300; // 5 min for batch extraction

// POST /api/admin/extract-finance
// Body: { fileName?: string } — if omitted, scans all PDFs in /upload
// Returns extraction results + optionally creates FinanceAuditSnapshot records
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json().catch(() => ({}));
    const { fileName, saveToDb = false } = body;

    const uploadDir = path.join(process.cwd(), 'upload');
    let pdfFiles: string[] = [];

    if (fileName) {
      // Single file
      const filePath = path.join(uploadDir, fileName);
      try {
        const s = await stat(filePath);
        if (s.isFile() && fileName.toLowerCase().endsWith('.pdf')) {
          pdfFiles = [filePath];
        } else {
          return NextResponse.json({ error: 'File not found or not a PDF' }, { status: 404 });
        }
      } catch {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    } else {
      // Scan all PDFs in /upload
      try {
        const entries = await readdir(uploadDir);
        pdfFiles = entries
          .filter(f => f.toLowerCase().endsWith('.pdf'))
          .map(f => path.join(uploadDir, f));
      } catch {
        return NextResponse.json({ error: 'Upload directory not found' }, { status: 500 });
      }
    }

    const allResults: Array<{
      fileName: string;
      detectedFiscalYear: string | null;
      detectedSource: string | null;
      recordCount: number;
      records: any[];
      errors: string[];
    }> = [];
    let totalRecords = 0;
    let savedToDb = 0;
    const errors: string[] = [];

    for (const filePath of pdfFiles.slice(0, 30)) { // cap to 30 PDFs per run
      try {
        const result = await extractFinanceFromPdf(filePath);
        allResults.push({
          fileName: result.fileName,
          detectedFiscalYear: result.detectedFiscalYear,
          detectedSource: result.detectedSource,
          recordCount: result.totalRecords,
          records: result.records,
          errors: result.errors,
        });
        totalRecords += result.totalRecords;

        // Optionally save to DB
        if (saveToDb && result.records.length > 0 && result.detectedFiscalYear) {
          for (const record of result.records) {
            // Skip low-confidence records
            if (record.confidence === 'low') continue;

            try {
              await db.financeAuditSnapshot.upsert({
                where: {
                  fiscalYear_level_countyName_source: {
                    fiscalYear: result.detectedFiscalYear,
                    level: record.countyName ? 'county' : 'national',
                    countyName: record.countyName || '',
                    source: record.source,
                  },
                },
                update: {
                  approvedBudget: record.approvedBudget || null,
                  supplementaryBudget: record.supplementaryBudget || null,
                  actualExpenditure: record.actualExpenditure || null,
                  recurrentExpenditure: record.recurrentExpenditure || null,
                  developmentExpenditure: record.developmentExpenditure || null,
                  equitableShare: record.equitableShare || null,
                  ownSourceRevenue: record.ownSourceRevenue || null,
                  osrTarget: record.osrTarget || null,
                  overallAbsorption: record.overallAbsorption || null,
                  recurrentAbsorption: record.recurrentAbsorption || null,
                  developmentAbsorption: record.developmentAbsorption || null,
                  auditOpinion: record.auditOpinion || null,
                  pendingBills: record.pendingBills || null,
                  totalDebt: record.totalDebt || null,
                  notes: `Auto-extracted from ${result.fileName} (confidence: ${record.confidence})`,
                },
                create: {
                  fiscalYear: result.detectedFiscalYear,
                  level: record.countyName ? 'county' : 'national',
                  countyName: record.countyName || null,
                  source: record.source,
                  approvedBudget: record.approvedBudget || null,
                  supplementaryBudget: record.supplementaryBudget || null,
                  actualExpenditure: record.actualExpenditure || null,
                  recurrentExpenditure: record.recurrentExpenditure || null,
                  developmentExpenditure: record.developmentExpenditure || null,
                  equitableShare: record.equitableShare || null,
                  ownSourceRevenue: record.ownSourceRevenue || null,
                  osrTarget: record.osrTarget || null,
                  overallAbsorption: record.overallAbsorption || null,
                  recurrentAbsorption: record.recurrentAbsorption || null,
                  developmentAbsorption: record.developmentAbsorption || null,
                  auditOpinion: record.auditOpinion || null,
                  pendingBills: record.pendingBills || null,
                  totalDebt: record.totalDebt || null,
                  notes: `Auto-extracted from ${result.fileName} (confidence: ${record.confidence})`,
                  published: false, // Default unpublished — admin reviews before publishing
                },
              });
              savedToDb++;
            } catch (dbErr) {
              // SQLite unique constraint may fire if the same key already exists with different casing
              errors.push(`DB save failed for ${record.countyName || 'national'}: ${dbErr instanceof Error ? dbErr.message : 'unknown'}`);
            }
          }
        }
      } catch (err) {
        errors.push(`${path.basename(filePath)}: ${err instanceof Error ? err.message : 'extraction failed'}`);
      }
    }

    return NextResponse.json({
      filesProcessed: allResults.length,
      totalRecords,
      savedToDb,
      results: allResults,
      errors: errors.slice(0, 20),
      message: `Extracted ${totalRecords} finance records from ${allResults.length} PDF(s)` +
        (saveToDb ? ` · saved ${savedToDb} to DB (unpublished)` : ''),
    });
  } catch (err) {
    console.error('Finance extraction error:', err);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
