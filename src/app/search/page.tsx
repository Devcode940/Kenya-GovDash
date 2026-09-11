// Public site-wide search page

import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteSearch } from '@/components/kenya/SiteSearch';
import { ChevronLeft, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Search — Kenya GovDash',
  description: 'Search across counties, representatives, finance data, feedback, and reports.',
};

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-background to-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />Back to dashboard
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Search className="h-4 w-4 text-emerald-600" />
            <h1 className="text-base font-semibold">Search</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 pb-20 md:pb-6">
        <SiteSearch />
      </main>
    </div>
  );
}
