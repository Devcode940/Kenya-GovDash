'use client';

import React, { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { Sun, Moon, Shield, Landmark, Search, Menu, X, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  buildAllCountyData,
  filterCounties,
  DEFAULT_FILTERS,
  getRepresentativeById,
  type Representative,
  type CountyData,
  type FilterState,
  type CoalitionType,
  type AuditOpinionType,
  type RegionType,
  type LevelType,
  REGIONS,
  getCoalitionColor,
  getAuditColor,
  getScoreBadgeClass,
  NATIONAL_SUMMARY,
  KAJIADO_DATA,
  flattenCountyRepresentatives,
} from '@/lib/kenya-data';

import { KenyaFilters } from '@/components/kenya/KenyaFilters';
import { KenyaNationalSummary } from '@/components/kenya/KenyaNationalSummary';
import { KenyaTree } from '@/components/kenya/KenyaTree';
import { KenyaDetailsPanel } from '@/components/kenya/KenyaDetailsPanel';
import { KenyaScoreCard } from '@/components/kenya/KenyaScoreCard';
import { KenyaAccountabilityPanel } from '@/components/kenya/KenyaAccountabilityPanel';
import { KenyaComparison } from '@/components/kenya/KenyaComparison';
import { KenyaJsonExport } from '@/components/kenya/KenyaJsonExport';

// ==================== THEME TOGGLE ====================
function ThemeToggle() {
  const subscribe = useCallback((callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const getSnapshot = useCallback(() => document.documentElement.classList.contains('dark'), []);
  const getServerSnapshot = useCallback(() => false, []);

  const isDarkMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isMounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    useCallback(() => true, []),
    useCallback(() => false, []),
  );

  const toggleTheme = () => {
    const cls = document.documentElement.classList;
    if (cls.contains('dark')) {
      cls.remove('dark');
    } else {
      cls.add('dark');
    }
  };

  if (!isMounted) return <div className="h-9 w-9" />;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ==================== MOBILE TABS ====================
type MobileTab = 'tree' | 'details' | 'score' | 'accountability' | 'summary' | 'compare';

function MobileTabNav({ activeTab, onTabChange }: { activeTab: MobileTab; onTabChange: (tab: MobileTab) => void }) {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'summary', label: 'Summary', icon: <Landmark className="h-4 w-4" /> },
    { id: 'tree', label: 'Tree', icon: <MapPin className="h-4 w-4" /> },
    { id: 'details', label: 'Details', icon: <FileText className="h-4 w-4" /> },
    { id: 'score', label: 'Score', icon: <Shield className="h-4 w-4" /> },
    { id: 'accountability', label: 'Audit', icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="flex border-b bg-background lg:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
            activeTab === tab.id ? 'text-primary border-b-2 border-primary font-medium' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ==================== MAIN DASHBOARD ====================
function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('summary');
  const [compareMode, setCompareMode] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);

  const allCounties = useMemo(() => buildAllCountyData(), []);
  const filteredCounties = useMemo(() => filterCounties(allCounties, filters), [allCounties, filters]);

  const handleSelectRepresentative = useCallback((rep: Representative) => {
    setSelectedRep(rep);
    setMobileTab('details');
  }, []);

  const handleSelectCounty = useCallback((county: CountyData) => {
    setSelectedCounty(county);
  }, []);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-3 px-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight leading-tight">
                Kenya Government Accountability Dashboard
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Constitution of Kenya 2010 · Devolved Governance · 47 Counties
              </p>
            </div>
            <h1 className="sm:hidden text-sm font-bold tracking-tight">Kenya GovDash</h1>
          </div>

          {/* Non-partisan badge */}
          <Badge className="hidden md:flex text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 px-2 py-1">
            Factual · Source-Cited · Data-Gap Transparent
          </Badge>

          <div className="flex-1" />

          {/* Mobile filter sheet */}
          <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden gap-1">
                <Search className="h-4 w-4" />
                <span className="text-xs">Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px]">
              <div className="p-4">
                <h3 className="text-sm font-semibold mb-3">Filters & Search</h3>
                <KenyaFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  resultCount={filteredCounties.length}
                  totalCount={allCounties.length}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Compare toggle */}
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            className="hidden lg:flex gap-1 text-xs"
            onClick={() => setCompareMode(!compareMode)}
          >
            <Shield className="h-3 w-3" />
            {compareMode ? 'Exit Compare' : 'Compare'}
          </Button>

          {/* JSON Export */}
          <KenyaJsonExport />

          <ThemeToggle />
        </div>

        {/* Desktop filters bar */}
        <div className="hidden lg:block border-t px-4 py-2 bg-muted/30">
          <KenyaFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            resultCount={filteredCounties.length}
            totalCount={allCounties.length}
          />
        </div>
      </header>

      {/* Mobile Tab Nav */}
      <MobileTabNav activeTab={mobileTab} onTabChange={setMobileTab} />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: Tree Panel (desktop) */}
        <div className="hidden lg:block w-[300px] shrink-0 border-r bg-card/50">
          <div className="flex h-full flex-col">
            <div className="border-b px-3 py-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Representative Tree — 47 Counties
              </h2>
            </div>
            <KenyaTree
              filters={filters}
              onSelectRepresentative={handleSelectRepresentative}
              onSelectCounty={handleSelectCounty}
              selectedId={selectedRep?.id ?? null}
            />
          </div>
        </div>

        {/* Mobile: Tree view */}
        <div className={`flex-1 overflow-y-auto lg:hidden ${mobileTab === 'tree' ? 'block' : 'hidden'}`}>
          <div className="p-4">
            <KenyaTree
              filters={filters}
              onSelectRepresentative={handleSelectRepresentative}
              onSelectCounty={handleSelectCounty}
              selectedId={selectedRep?.id ?? null}
            />
          </div>
        </div>

        {/* CENTER: Details + Score + Summary */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-4 lg:p-6 space-y-4">
            {/* National Summary */}
            <div className={`block ${mobileTab !== 'summary' && mobileTab !== 'details' && mobileTab !== 'score' && mobileTab !== 'accountability' ? 'hidden lg:block' : ''} lg:block ${mobileTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
              <KenyaNationalSummary />
            </div>

            {/* Compare Mode */}
            {compareMode && (
              <KenyaComparison
                selectedRep={selectedRep}
                onSelectRepresentative={handleSelectRepresentative}
              />
            )}

            {/* Details Panel */}
            <div className={`${mobileTab === 'details' ? 'block' : 'hidden lg:block'}`}>
              <KenyaDetailsPanel representative={selectedRep} />
            </div>

            {/* Score Card */}
            <div className={`${mobileTab === 'score' ? 'block' : 'hidden lg:block'}`}>
              <KenyaScoreCard representative={selectedRep} />
            </div>
          </div>
        </div>

        {/* RIGHT: Accountability Panel (desktop) */}
        <div className="hidden lg:block w-[350px] shrink-0 border-l bg-card/50">
          <div className="flex h-full flex-col">
            <div className="border-b px-3 py-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Accountability Data
              </h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <KenyaAccountabilityPanel representative={selectedRep} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Mobile: Accountability view */}
        <div className={`flex-1 overflow-y-auto lg:hidden ${mobileTab === 'accountability' ? 'block' : 'hidden'}`}>
          <div className="p-4">
            <KenyaAccountabilityPanel representative={selectedRep} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-3 px-4 mt-auto">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            Kenya Government Accountability Dashboard — 2022–2027 · Constitution of Kenya 2010, Chapter 6 & 11
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300">
              Non-Partisan · Factual
            </Badge>
            <span className="text-xs text-muted-foreground">
              Sources: OAG · CoB · TI-Kenya · Bajeti Hub
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== ENTRY POINT ====================
export default function Home() {
  return <Dashboard />;
}
