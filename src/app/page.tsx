'use client';

import React, { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { Sun, Moon, Shield, Landmark, Search, Menu, X, MapPin, FileText, Activity, Settings, MessageSquare } from 'lucide-react';
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
  filterCounties,
  DEFAULT_FILTERS,
  type Representative,
  type CountyData,
  type FilterState,
} from '@/lib/kenya-data';

import { KenyaFilters } from '@/components/kenya/KenyaFilters';
import { KenyaNationalSummary } from '@/components/kenya/KenyaNationalSummary';
import { KenyaTree } from '@/components/kenya/KenyaTree';
import { KenyaDetailsPanel } from '@/components/kenya/KenyaDetailsPanel';
import { KenyaCountyOverview } from '@/components/kenya/KenyaCountyOverview';
import { KenyaScoreCard } from '@/components/kenya/KenyaScoreCard';
import { KenyaAccountabilityPanel } from '@/components/kenya/KenyaAccountabilityPanel';
import { KenyaComparison } from '@/components/kenya/KenyaComparison';
import { KenyaJsonExport } from '@/components/kenya/KenyaJsonExport';
import { KenyaLiveFeedsPanel } from '@/components/kenya/KenyaLiveFeedsPanel';
import { KenyaFeedStatusBar } from '@/components/kenya/KenyaFeedStatus';

// Feature 1: Performance Optimization
import { useLazyCountyData } from '@/hooks/use-lazy-county-data';
import {
  KenyaTreeSkeleton,
  KenyaDetailsSkeleton,
  KenyaScoreCardSkeleton,
  KenyaAccountabilitySkeleton,
} from '@/components/kenya/KenyaDashboardSkeleton';

// Feature 2: Dashboard Personalization
import { usePersonalization } from '@/hooks/use-personalization';
import {
  KenyaSettingsDialog,
  KenyaPinnedPanel,
  PinButton,
} from '@/components/kenya/KenyaPersonalization';

// Feature 3: Public Feedback Submission
import { KenyaFeedbackPortal, type FeedbackInitialValues } from '@/components/kenya/KenyaFeedbackPortal';

// Feature 4: Advanced Search with Autocomplete
import { KenyaSearchAutocomplete } from '@/components/kenya/KenyaSearchAutocomplete';

// New: Bottom Nav + Top Tab Bar + Sidebar + Constitution + Constituency Development
import { KenyaBottomNav, KenyaTopTabBar, type BottomNavTab, type TopTab } from '@/components/kenya/KenyaBottomNav';
import { KenyaSidebar } from '@/components/kenya/KenyaSidebar';
import { KenyaConstitutionFull } from '@/components/kenya/KenyaConstitutionFull';
import { KenyaConstituencyDevelopment } from '@/components/kenya/KenyaConstituencyDevelopment';
import { KenyaWhistleblower } from '@/components/kenya/KenyaWhistleblower';
import { KenyaPendingBillsHeatmap } from '@/components/kenya/KenyaPendingBillsHeatmap';
import { KenyaProjectTracker } from '@/components/kenya/KenyaProjectTracker';
import { KenyaWealthDeclaration } from '@/components/kenya/KenyaWealthDeclaration';
import { KenyaRedFlagScanner } from '@/components/kenya/KenyaRedFlagScanner';

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
type MobileTab = BottomNavTab | TopTab | 'tree' | 'details' | 'score' | 'accountability' | 'summary' | 'compare' | 'feedback' | 'pending_bills' | 'projects' | 'wealth' | 'red_flags';

function MobileTabNav({ activeTab, onTabChange }: { activeTab: MobileTab; onTabChange: (tab: MobileTab) => void }) {
  const tabs: { id: MobileTab; label: string; icon: React.ReactNode }[] = [
    { id: 'summary', label: 'Summary', icon: <Landmark className="h-4 w-4" /> },
    { id: 'tree', label: 'Tree', icon: <MapPin className="h-4 w-4" /> },
    { id: 'feeds', label: 'Feeds', icon: <Activity className="h-4 w-4" /> },
    { id: 'details', label: 'Details', icon: <FileText className="h-4 w-4" /> },
    { id: 'score', label: 'Score', icon: <Shield className="h-4 w-4" /> },
    { id: 'accountability', label: 'Audit', icon: <Shield className="h-4 w-4" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-4 w-4" /> },
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
  const [viewMode, setViewMode] = useState<'county-overview' | 'rep-details' | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('summary');
  const [compareMode, setCompareMode] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [pendingExpansionRequest, setPendingExpansionRequest] = useState<FeedbackInitialValues | null>(null);

  // Handle "Request County Expansion" — opens feedback, prefills form for the county
  const handleRequestExpansion = useCallback((countyName: string, sectionLabel: string) => {
    const request: FeedbackInitialValues = {
      category: 'Suggestion',
      title: `Request data expansion: ${countyName} County — ${sectionLabel}`,
      description: `I would like to request priority data expansion for ${countyName} County, specifically for: ${sectionLabel}.\n\nCurrent data coverage for ${countyName} County is incomplete, and additional sub-county / ward-level detail would significantly improve accountability visibility.\n\nSuggested priority sources to consult:\n- IEBC 2022 gazette notices (official election results)\n- ${countyName} County Assembly registry\n- ${countyName} County Government official publications\n- Parliament of Kenya records\n\nThank you for considering this expansion request.`,
      countyName,
    };
    setPendingExpansionRequest(request);
    setFeedbackOpen(true);
    // On mobile, switch to feedback tab
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileTab('feedback');
    }
  }, []);

  // Feature 1: Lazy-loaded county data with skeleton states
  const { allCounties, filteredCounties, isLoading: dataLoading } = useLazyCountyData(filters);

  // Feature 2: Personalization
  const {
    preferences,
    isLoaded: prefsLoaded,
    pinRepresentative,
    unpinRepresentative,
    isPinned,
    addPreferredCounty,
    removePreferredCounty,
    toggleMetricVisibility,
    trackVisit,
    updatePreference,
    resetPreferences,
    visibleMetrics,
  } = usePersonalization();

  // Track visits when selecting a representative
  const handleSelectRepresentative = useCallback((rep: Representative) => {
    setSelectedRep(rep);
    setViewMode('rep-details');
    setMobileTab('details');
    trackVisit(rep.id);
  }, [trackVisit]);

  const handleSelectCounty = useCallback((county: CountyData) => {
    setSelectedCounty(county);
    setViewMode('county-overview');
    setMobileTab('details');
    addPreferredCounty(county.name);
  }, [addPreferredCounty]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Use personalization default tab
  const effectiveMobileTab = useMemo(() => {
    if (prefsLoaded && preferences.defaultMobileTab && mobileTab === 'summary') {
      return preferences.defaultMobileTab as MobileTab;
    }
    return mobileTab;
  }, [prefsLoaded, preferences.defaultMobileTab, mobileTab]);

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

          {/* Live Feed Status Bar */}
          <KenyaFeedStatusBar />

          <div className="flex-1" />

          {/* Feature 4: Search Autocomplete (desktop) */}
          <div className="hidden lg:block w-[280px]">
            <KenyaSearchAutocomplete
              searchQuery={filters.searchQuery}
              onSearchChange={(q) => handleFiltersChange({ ...filters, searchQuery: q })}
              onSelectRepresentative={handleSelectRepresentative}
              onSelectCounty={handleSelectCounty}
              pinnedIds={preferences.pinnedRepresentatives}
              onPin={pinRepresentative}
              onUnpin={unpinRepresentative}
            />
          </div>

          {/* Mobile filter sheet */}
          <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden gap-1">
                <Search className="h-4 w-4" />
                <span className="text-xs">Search</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px]">
              <div className="p-4 space-y-4">
                <h3 className="text-sm font-semibold mb-3">Search & Filters</h3>
                {/* Feature 4: Mobile autocomplete */}
                <KenyaSearchAutocomplete
                  searchQuery={filters.searchQuery}
                  onSearchChange={(q) => handleFiltersChange({ ...filters, searchQuery: q })}
                  onSelectRepresentative={(entry) => {
                    handleSelectRepresentative(entry.rep);
                    setFiltersSheetOpen(false);
                  }}
                  onSelectCounty={(county) => {
                    handleSelectCounty(county);
                    setFiltersSheetOpen(false);
                  }}
                  pinnedIds={preferences.pinnedRepresentatives}
                  onPin={pinRepresentative}
                  onUnpin={unpinRepresentative}
                />
                <KenyaFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  resultCount={filteredCounties.length}
                  totalCount={allCounties.length}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Feature 3: Feedback button */}
          <Button
            variant="outline"
            size="sm"
            className="hidden lg:flex gap-1 text-xs"
            onClick={() => setFeedbackOpen(!feedbackOpen)}
          >
            <MessageSquare className="h-3 w-3" />
            Feedback
          </Button>

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

          {/* Feature 2: Settings */}
          <KenyaSettingsDialog
            preferences={preferences}
            onToggleMetric={toggleMetricVisibility}
            onUpdatePreference={updatePreference}
            onReset={resetPreferences}
            isPinned={isPinned}
            onPin={pinRepresentative}
            onUnpin={unpinRepresentative}
          />

          <ThemeToggle />
        </div>

        {/* Desktop filters bar (without search — search is in header now) */}
        <div className="hidden lg:block border-t px-4 py-2 bg-muted/30">
          <KenyaFilters
            filters={{ ...filters, searchQuery: '' }} // search handled by autocomplete
            onFiltersChange={(f) => handleFiltersChange({ ...f, searchQuery: filters.searchQuery })}
            resultCount={filteredCounties.length}
            totalCount={allCounties.length}
          />
        </div>
      </header>

      {/* Mobile Top Tab Bar */}
      <KenyaTopTabBar
        activeTab={mobileTab as TopTab}
        onTabChange={(tab) => setMobileTab(tab)}
        visible={true}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden has-bottom-nav lg:has-bottom-nav-none">
        {/* Desktop Sidebar */}
        <KenyaSidebar
          activeSection={mobileTab as string}
          onNavigate={(section) => setMobileTab(section as MobileTab)}
        />
        {/* LEFT: Tree Panel (desktop) */}
        <div className="hidden lg:block w-[300px] shrink-0 border-r bg-card/50">
          <div className="flex h-full flex-col">
            <div className="border-b px-3 py-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Representative Tree — 47 Counties
              </h2>
            </div>
            {/* Feature 1: Skeleton loading for tree */}
            {dataLoading ? (
              <KenyaTreeSkeleton />
            ) : (
              <KenyaTree
                filters={filters}
                onSelectRepresentative={handleSelectRepresentative}
                onSelectCounty={handleSelectCounty}
                selectedId={selectedRep?.id ?? null}
                selectedCountyName={selectedCounty?.name ?? null}
              />
            )}
          </div>
        </div>

        {/* Mobile: Tree view */}
        <div className={`flex-1 overflow-y-auto lg:hidden ${effectiveMobileTab === 'tree' ? 'block' : 'hidden'}`}>
          <div className="p-4">
            {dataLoading ? (
              <KenyaTreeSkeleton />
            ) : (
              <KenyaTree
                filters={filters}
                onSelectRepresentative={handleSelectRepresentative}
                onSelectCounty={handleSelectCounty}
                selectedId={selectedRep?.id ?? null}
                selectedCountyName={selectedCounty?.name ?? null}
              />
            )}
          </div>
        </div>

        {/* CENTER: Details + Score + Summary + Pinned */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-4 lg:p-6 space-y-4">
            {/* Feature 2: Pinned Representatives Quick Access */}
            {preferences.pinnedRepresentatives.length > 0 && (
              <div className="block">
                <KenyaPinnedPanel
                  pinnedIds={preferences.pinnedRepresentatives}
                  onSelectRepresentative={handleSelectRepresentative}
                  onUnpin={unpinRepresentative}
                />
              </div>
            )}

            {/* National Summary */}
            <div className={`block ${effectiveMobileTab !== 'summary' && effectiveMobileTab !== 'feeds' ? 'hidden lg:block' : ''} lg:block ${effectiveMobileTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
              <KenyaNationalSummary />
            </div>

            {/* Live Feeds Panel */}
            <div className={`${effectiveMobileTab === 'feeds' ? 'block' : 'hidden lg:block'}`}>
              <KenyaLiveFeedsPanel />
            </div>

            {/* Constitution Panel — Full text */}
            <div className={`${mobileTab === 'constitution' ? 'block' : 'hidden'} lg:hidden`}>
              <KenyaConstitutionFull />
            </div>

            {/* Constituency Development — Citizen Feedback */}
            <div className={`${mobileTab === 'development' ? 'block' : 'hidden'} lg:hidden`}>
              <KenyaConstituencyDevelopment />
            </div>

            {/* Whistleblower Portal */}
            <div className={`${mobileTab === 'whistleblower' ? 'block' : 'hidden'} lg:hidden`}>
              <KenyaWhistleblower />
            </div>

            {/* Pending Bills Heatmap */}
            <div className={`${mobileTab === 'pending_bills' ? 'block' : 'hidden'} lg:hidden`}>
              <KenyaPendingBillsHeatmap />
            </div>

            {/* Project Tracker */}
            <div className={`${mobileTab === 'projects' ? 'block' : 'hidden'} lg:hidden`}>
              <KenyaProjectTracker />
            </div>

            {/* Wealth Declaration Tracker */}
            <div className={`${mobileTab === 'wealth' ? 'block' : 'hidden'} lg:hidden`}>
              <KenyaWealthDeclaration />
            </div>

            {/* AI Red Flag Scanner */}
            <div className={`${mobileTab === 'red_flags' ? 'block' : 'hidden'} lg:hidden`}>
              <KenyaRedFlagScanner />
            </div>

            {/* Compare Mode */}
            {compareMode && (
              <KenyaComparison
                selectedRep={selectedRep}
                onSelectRepresentative={handleSelectRepresentative}
              />
            )}

            {/* County Overview OR Individual Representative Details */}
            <div className={`${effectiveMobileTab === 'details' ? 'block' : 'hidden lg:block'}`}>
              {dataLoading && !selectedCounty && !selectedRep ? (
                <KenyaDetailsSkeleton />
              ) : viewMode === 'county-overview' && selectedCounty ? (
                <KenyaCountyOverview
                  county={selectedCounty}
                  onSelectRepresentative={handleSelectRepresentative}
                  onPin={pinRepresentative}
                  onUnpin={unpinRepresentative}
                  isPinned={isPinned}
                  onRequestExpansion={handleRequestExpansion}
                />
              ) : (
                <div>
                  {selectedRep && viewMode === 'rep-details' && (
                    <div className="flex items-center gap-2 mb-2">
                      {/* Back to county button */}
                      {selectedCounty && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => setViewMode('county-overview')}
                        >
                          <MapPin className="h-3 w-3" />
                          Back to {selectedCounty.name}
                        </Button>
                      )}
                      <PinButton
                        repId={selectedRep.id}
                        isPinned={isPinned(selectedRep.id)}
                        onPin={pinRepresentative}
                        onUnpin={unpinRepresentative}
                      />
                    </div>
                  )}
                  <KenyaDetailsPanel representative={selectedRep} />
                </div>
              )}
            </div>

            {/* Score Card with visible metrics from personalization */}
            <div className={`${effectiveMobileTab === 'score' ? 'block' : 'hidden lg:block'}`}>
              {dataLoading && !selectedRep ? (
                <KenyaScoreCardSkeleton />
              ) : (
                <KenyaScoreCard representative={selectedRep ?? (selectedCounty ? selectedCounty.governor : null)} visibleMetrics={visibleMetrics} />
              )}
            </div>

            {/* Feature 3: Feedback Portal */}
            {(feedbackOpen || effectiveMobileTab === 'feedback') && (
              <div className={`${effectiveMobileTab === 'feedback' ? 'block' : 'hidden lg:block'}`}>
                <KenyaFeedbackPortal
                  representative={selectedRep}
                  pendingExpansionRequest={pendingExpansionRequest}
                  onPendingRequestConsumed={() => setPendingExpansionRequest(null)}
                />
              </div>
            )}
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
                {dataLoading && !selectedRep && !selectedCounty ? (
                  <KenyaAccountabilitySkeleton />
                ) : (
                  <KenyaAccountabilityPanel representative={selectedRep ?? (selectedCounty ? selectedCounty.governor : null)} />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Mobile: Accountability view */}
        <div className={`flex-1 overflow-y-auto lg:hidden ${effectiveMobileTab === 'accountability' ? 'block' : 'hidden'}`}>
          <div className="p-4">
            {dataLoading && !selectedRep && !selectedCounty ? (
              <KenyaAccountabilitySkeleton />
            ) : (
              <KenyaAccountabilityPanel representative={selectedRep ?? (selectedCounty ? selectedCounty.governor : null)} />
            )}
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
              Live Sources: OAG · CoB · TI-Kenya · EACC · Bajeti Hub
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <KenyaBottomNav
        activeTab={mobileTab as BottomNavTab}
        onTabChange={(tab) => setMobileTab(tab)}
        visible={true}
      />
    </div>
  );
}

// ==================== ENTRY POINT ====================
export default function Home() {
  return <Dashboard />;
}
