// Comparative Analytics Dashboard — side-by-side comparison of 2-5 counties
// across finance, audit, demographics, CECMs, OSR performance, pending bills.

import Link from 'next/link';
import type { Metadata } from 'next';
import { buildAllCountyData, getCountyDemographics, type CountyData } from '@/lib/kenya-data';
import { ALL_COUNTY_FINANCE, formatKshs, getAuditOpinionColor } from '@/lib/finance-audit-data';
import { CountyComparison } from '@/components/kenya/CountyComparison';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, GitCompare } from 'lucide-react';

export const metadata: Metadata = {
  title: 'County Comparison — Kenya GovDash',
  description: 'Side-by-side comparison of 2-5 Kenya counties across finance, audit, demographics, and CECM data.',
};

export const dynamic = 'force-dynamic';

export default function ComparePage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Back to dashboard
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-emerald-600" />
            <h1 className="text-base font-semibold">County Comparison</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6 pb-20 md:pb-6">
        <Card>
          <CardContent className="py-3 text-xs text-muted-foreground">
            <p>
              Compare 2-5 counties across 15+ metrics: finance (budget, absorption, OSR), audit opinions,
              pending bills, demographics (population, area, density), CECM count, and CoG compliance score.
              Includes radar chart + CSV export.
            </p>
          </CardContent>
        </Card>

        <CountyComparison />
      </main>
    </div>
  );
}
