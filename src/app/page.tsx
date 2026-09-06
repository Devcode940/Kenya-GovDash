'use client';

import React, { useState, useMemo, useCallback, useEffect, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { Sun, Moon, Shield, Landmark, Search, Menu, X, MapPin, FileText, Activity, Settings, MessageSquare, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, ChevronRight } from 'lucide-react';
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
import { KenyaCountyInfoPanel } from '@/components/kenya/KenyaCountyInfoPanel';
import { KenyaBottomNav, KenyaTopTabBar, type BottomNavTab, type TopTab } from '@/components/kenya/KenyaBottomNav';
import { KenyaSidebar, SIDEBAR_SECTIONS_EXPORTED } from '@/components/kenya/KenyaSidebar';
import { KenyaRightSidebar } from '@/components/kenya/KenyaRightSidebar';
import { KenyaCommandPalette } from '@/components/kenya/KenyaCommandPalette';
import { useLanguage } from '@/lib/i18n';

// Dynamic imports — feature panels are code-split via next/dynamic so each
// panel's JS only loads when its tab is first activated.
const KenyaConstitutionFull = dynamic(() => import('@/components/kenya/KenyaConstitutionFull').then(m => ({ default: m.KenyaConstitutionFull })), { ssr: false });
const KenyaConstituencyDevelopment = dynamic(() => import('@/components/kenya/KenyaConstituencyDevelopment').then(m => ({ default: m.KenyaConstituencyDevelopment })), { ssr: false });
const KenyaWhistleblower = dynamic(() => import('@/components/kenya/KenyaWhistleblower').then(m => ({ default: m.KenyaWhistleblower })), { ssr: false });
const KenyaPendingBillsHeatmap = dynamic(() => import('@/components/kenya/KenyaPendingBillsHeatmap').then(m => ({ default: m.KenyaPendingBillsHeatmap })), { ssr: false });
const KenyaProjectTracker = dynamic(() => import('@/components/kenya/KenyaProjectTracker').then(m => ({ default: m.KenyaProjectTracker })), { ssr: false });
const KenyaWealthDeclaration = dynamic(() => import('@/components/kenya/KenyaWealthDeclaration').then(m => ({ default: m.KenyaWealthDeclaration })), { ssr: false });
const KenyaRedFlagScanner = dynamic(() => import('@/components/kenya/KenyaRedFlagScanner').then(m => ({ default: m.KenyaRedFlagScanner })), { ssr: false });
const KenyaTenderAnomaly = dynamic(() => import('@/components/kenya/KenyaTenderAnomaly').then(m => ({ default: m.KenyaTenderAnomaly })), { ssr: false });
const KenyaPayrollAssetTracker = dynamic(() => import('@/components/kenya/KenyaPayrollAssetTracker').then(m => ({ default: m.KenyaPayrollAssetTracker })), { ssr: false });
const KenyaSentimentMonitor = dynamic(() => import('@/components/kenya/KenyaSentimentMonitor').then(m => ({ default: m.KenyaSentimentMonitor })), { ssr: false });
const KenyaTravelAudit = dynamic(() => import('@/components/kenya/KenyaTravelAudit').then(m => ({ default: m.KenyaTravelAudit })), { ssr: false });
const KenyaBeneficialOwnership = dynamic(() => import('@/components/kenya/KenyaBeneficialOwnership').then(m => ({ default: m.KenyaBeneficialOwnership })), { ssr: false });
const KenyaRevenueLeakage = dynamic(() => import('@/components/kenya/KenyaRevenueLeakage').then(m => ({ default: m.KenyaRevenueLeakage })), { ssr: false });
const KenyaCourtTracker = dynamic(() => import('@/components/kenya/KenyaCourtTracker').then(m => ({ default: m.KenyaCourtTracker })), { ssr: false });
const KenyaHotlineAggregator = dynamic(() => import('@/components/kenya/KenyaHotlineAggregator').then(m => ({ default: m.KenyaHotlineAggregator })), { ssr: false });
const KenyaContractPerformance = dynamic(() => import('@/components/kenya/KenyaContractPerformance').then(m => ({ default: m.KenyaContractPerformance })), { ssr: false });
const KenyaBudgetVariance = dynamic(() => import('@/components/kenya/KenyaBudgetVariance').then(m => ({ default: m.KenyaBudgetVariance })), { ssr: false });
const KenyaDebtMonitor = dynamic(() => import('@/components/kenya/KenyaDebtMonitor').then(m => ({ default: m.KenyaDebtMonitor })), { ssr: false });
const KenyaPeerRanking = dynamic(() => import('@/components/kenya/KenyaPeerRanking').then(m => ({ default: m.KenyaPeerRanking })), { ssr: false });
const KenyaExpenditureAlerts = dynamic(() => import('@/components/kenya/KenyaExpenditureAlerts').then(m => ({ default: m.KenyaExpenditureAlerts })), { ssr: false });
const KenyaPublicParticipation = dynamic(() => import('@/components/kenya/KenyaPublicParticipation').then(m => ({ default: m.KenyaPublicParticipation })), { ssr: false });
const KenyaPerformanceIndex = dynamic(() => import('@/components/kenya/KenyaPerformanceIndex').then(m => ({ default: m.KenyaPerformanceIndex })), { ssr: false });
const KenyaBudgetQA = dynamic(() => import('@/components/kenya/KenyaBudgetQA').then(m => ({ default: m.KenyaBudgetQA })), { ssr: false });
const KenyaBursaryTracker = dynamic(() => import('@/components/kenya/KenyaBursaryTracker').then(m => ({ default: m.KenyaBursaryTracker })), { ssr: false });
const KenyaServiceDelivery = dynamic(() => import('@/components/kenya/KenyaServiceDelivery').then(m => ({ default: m.KenyaServiceDelivery })), { ssr: false });
const KenyaResolutionTracker = dynamic(() => import('@/components/kenya/KenyaResolutionTracker').then(m => ({ default: m.KenyaResolutionTracker })), { ssr: false });

import { useLazyCountyData } from '@/hooks/use-lazy-county-data';
import {
  KenyaTreeSkeleton,
  KenyaDetailsSkeleton,
  KenyaScoreCardSkeleton,
  KenyaAccountabilitySkeleton,
} from '@/components/kenya/KenyaDashboardSkeleton';
import { usePersonalization } from '@/hooks/use-personalization';
import {
  KenyaSettingsDialog,
  KenyaPinnedPanel,
  PinButton,
} from '@/components/kenya/KenyaPersonalization';
import { KenyaFeedbackPortal, type FeedbackInitialValues } from '@/components/kenya/KenyaFeedbackPortal';
import { KenyaSearchAutocomplete } from '@/components/kenya/KenyaSearchAutocomplete';

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
    if (cls.contains('dark')) cls.remove('dark'); else cls.add('dark');
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
type MobileTab = BottomNavTab | TopTab | 'tree' | 'details' | 'counties_info' | 'score' | 'accountability' | 'summary' | 'compare' | 'feedback' | 'pending_bills' | 'projects' | 'wealth' | 'red_flags' | 'tenders' | 'payroll_assets' | 'sentiment' | 'travel' | 'ownership' | 'revenue' | 'court_cases' | 'hotline' | 'contracts' | 'variance' | 'debt' | 'alerts' | 'peer_ranking' | 'performance_index' | 'participation' | 'budget_qa' | 'bursary' | 'service_delivery' | 'resolutions' | 'videos' | 'reports' | 'development' | 'whistleblower';

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
  const [moreSectionsOpen, setMoreSectionsOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const { t: tr, countyName: tc } = useLanguage();

  // Keyboard shortcut: Cmd/Ctrl+K opens command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCommandPaletteOpen(prev => !prev); }
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleRequestExpansion = useCallback((countyName: string, sectionLabel: string) => {
    const request: FeedbackInitialValues = {
      category: 'Suggestion',
      title: `Request data expansion: ${countyName} County — ${sectionLabel}`,
      description: `I would like to request priority data expansion for ${countyName} County, specifically for: ${sectionLabel}.`,
      countyName,
    };
    setPendingExpansionRequest(request);
    setFeedbackOpen(true);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setMobileTab('feedback');
  }, []);

  const { allCounties, filteredCounties, isLoading: dataLoading } = useLazyCountyData(filters);

  const {
    preferences, isLoaded: prefsLoaded, pinRepresentative, unpinRepresentative, isPinned,
    addPreferredCounty, removePreferredCounty, toggleMetricVisibility, trackVisit,
    updatePreference, resetPreferences, visibleMetrics,
  } = usePersonalization();

  const handleSelectRepresentative = useCallback((rep: Representative) => {
    setSelectedRep(rep); setViewMode('rep-details'); setMobileTab('profile'); trackVisit(rep.id);
  }, [trackVisit]);

  const handleSelectCounty = useCallback((county: CountyData) => {
    setSelectedCounty(county); setViewMode('county-overview'); setMobileTab('counties'); addPreferredCounty(county.name);
  }, [addPreferredCounty]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => setFilters(newFilters), []);

  const effectiveMobileTab = useMemo(() => {
    const current = mobileTab === 'home' ? 'summary'
      : mobileTab === 'counties' ? 'counties_info'
      : mobileTab === 'profile' ? 'details'
      : mobileTab;
    if (prefsLoaded && preferences.defaultMobileTab && current === 'summary') return preferences.defaultMobileTab as MobileTab;
    return current;
  }, [prefsLoaded, preferences.defaultMobileTab, mobileTab]);

  // CORE_TABS — tabs that show the default dashboard layout
  const showDefaultDashboard = ['summary', 'feeds', 'details', 'counties_info', 'score', 'accountability', 'tree', 'feedback', 'home', 'counties', 'profile'].includes(mobileTab);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center gap-3 px-4">
          {/* Hamburger menu — portrait mobile only */}
          <Button variant="ghost" size="icon" className="landscape:hidden h-9 w-9 shrink-0"
            onClick={() => setMoreSectionsOpen(true)} aria-label="Menu" title="All Sections">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold tracking-tight leading-tight">{tr('app.title')}</h1>
              <p className="text-[10px] text-muted-foreground leading-tight">{tr('app.subtitle')}</p>
            </div>
            <h1 className="sm:hidden text-sm font-bold tracking-tight">{tr('app.title.short')}</h1>
          </div>

          <Badge className="hidden md:flex text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300 px-2 py-1">{tr('app.badge')}</Badge>
          <KenyaFeedStatusBar />
          <div className="flex-1" />

          <div className="hidden lg:block w-[280px]">
            <KenyaSearchAutocomplete searchQuery={filters.searchQuery}
              onSearchChange={(q) => handleFiltersChange({ ...filters, searchQuery: q })}
              onSelectRepresentative={handleSelectRepresentative} onSelectCounty={handleSelectCounty}
              pinnedIds={preferences.pinnedRepresentatives} onPin={pinRepresentative} onUnpin={unpinRepresentative} />
          </div>

          {/* Global search trigger (Cmd/Ctrl+K) */}
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"
            onClick={() => setCommandPaletteOpen(true)} aria-label={tr('action.search')} title={`${tr('action.search')} (Ctrl+K)`}>
            <Search className="h-4 w-4" />
          </Button>

          <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="sm" className="lg:hidden gap-1"><Search className="h-4 w-4" /><span className="text-xs">Search</span></Button></SheetTrigger>
            <SheetContent side="left" className="w-[320px]">
              <div className="p-4 space-y-4">
                <h3 className="text-sm font-semibold mb-3">Search & Filters</h3>
                <KenyaSearchAutocomplete searchQuery={filters.searchQuery}
                  onSearchChange={(q) => handleFiltersChange({ ...filters, searchQuery: q })}
                  onSelectRepresentative={(rep) => { handleSelectRepresentative(rep); setFiltersSheetOpen(false); }}
                  onSelectCounty={(county) => { handleSelectCounty(county); setFiltersSheetOpen(false); }}
                  pinnedIds={preferences.pinnedRepresentatives} onPin={pinRepresentative} onUnpin={unpinRepresentative} />
                <KenyaFilters filters={filters} onFiltersChange={handleFiltersChange} resultCount={filteredCounties.length} totalCount={allCounties.length} />
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="outline" size="sm" className="hidden lg:flex gap-1 text-xs" onClick={() => setFeedbackOpen(!feedbackOpen)}>
            <MessageSquare className="h-3 w-3" /> {tr('action.feedback')}
          </Button>
          <Button variant={compareMode ? 'default' : 'outline'} size="sm" className="hidden lg:flex gap-1 text-xs" onClick={() => setCompareMode(!compareMode)}>
            <Shield className="h-3 w-3" />{compareMode ? 'Exit Compare' : 'Compare'}
          </Button>
          <KenyaJsonExport />

          {/* Admin link */}
          <a href="/admin" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="hidden landscape:flex gap-1 text-xs" title={tr('action.admin')}>
              <Shield className="h-3 w-3" />{tr('action.admin')}
            </Button>
          </a>

          <KenyaSettingsDialog preferences={preferences} onToggleMetric={toggleMetricVisibility}
            onUpdatePreference={updatePreference} onReset={resetPreferences}
            isPinned={isPinned} onPin={pinRepresentative} onUnpin={unpinRepresentative} />
          <ThemeToggle />

          {/* Right sidebar toggle */}
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            aria-label={tr('action.toggleRightSidebar')} title={tr('action.toggleRightSidebar')}>
            {rightSidebarOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </Button>
        </div>

        <div className="hidden lg:block border-t px-4 py-2 bg-muted/30">
          <KenyaFilters filters={{ ...filters, searchQuery: '' }}
            onFiltersChange={(f) => handleFiltersChange({ ...f, searchQuery: filters.searchQuery })}
            resultCount={filteredCounties.length} totalCount={allCounties.length} />
        </div>
      </header>

      {/* Top Tab Bar — 3 tabs only */}
      <KenyaTopTabBar activeTab={mobileTab as TopTab} onTabChange={(tab) => setMobileTab(tab)} visible={true} />

      {/* Breadcrumbs */}
      <div className="landscape:hidden sticky top-[88px] z-30 bg-muted/30 border-b px-3 py-1.5">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground overflow-x-auto whitespace-nowrap">
          <button onClick={() => setMobileTab('home')} className="hover:text-primary transition-colors shrink-0">{tr('nav.home')}</button>
          {mobileTab !== 'home' && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="text-foreground font-medium shrink-0">
                {mobileTab === 'counties' || mobileTab === 'counties_info' ? tr('nav.counties')
                  : mobileTab === 'profile' || mobileTab === 'details' ? tr('nav.profile')
                  : mobileTab === 'constitution' ? tr('tab.constitution')
                  : mobileTab === 'feeds' ? tr('tab.feeds')
                  : mobileTab === 'news' ? tr('tab.news')
                  : tr(`item.${mobileTab}`) || mobileTab}
              </span>
            </>
          )}
          {selectedCounty && (mobileTab === 'counties' || mobileTab === 'counties_info' || mobileTab === 'profile' || mobileTab === 'details') && (
            <><ChevronRight className="h-3 w-3 shrink-0" /><span className="text-primary font-medium shrink-0 truncate">{tc(selectedCounty.name)}</span></>
          )}
          {selectedRep && viewMode === 'rep-details' && (
            <><ChevronRight className="h-3 w-3 shrink-0" /><span className="text-primary font-medium shrink-0 truncate">{selectedRep.fullName}</span></>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden has-bottom-nav">
        <KenyaSidebar activeSection={mobileTab as string} onNavigate={(section) => setMobileTab(section as MobileTab)} />

        {/* LEFT: Tree Panel */}
        <div className="hidden lg:block w-[300px] shrink-0 border-r bg-card/50">
          <div className="flex h-full flex-col">
            <div className="border-b px-3 py-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Representative Tree — 47 Counties</h2>
            </div>
            {dataLoading ? <KenyaTreeSkeleton /> : (
              <KenyaTree filters={filters} onSelectRepresentative={handleSelectRepresentative} onSelectCounty={handleSelectCounty}
                selectedId={selectedRep?.id ?? null} selectedCountyName={selectedCounty?.name ?? null} />
            )}
          </div>
        </div>

        {/* Mobile: Tree view */}
        <div className={`flex-1 overflow-y-auto lg:hidden ${effectiveMobileTab === 'tree' ? 'block' : 'hidden'}`}>
          <div className="p-4">
            {dataLoading ? <KenyaTreeSkeleton /> : (
              <KenyaTree filters={filters} onSelectRepresentative={handleSelectRepresentative} onSelectCounty={handleSelectCounty}
                selectedId={selectedRep?.id ?? null} selectedCountyName={selectedCounty?.name ?? null} />
            )}
          </div>
        </div>

        {/* CENTER: Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl p-4 lg:p-6 space-y-4">
            {preferences.pinnedRepresentatives.length > 0 && (
              <KenyaPinnedPanel pinnedIds={preferences.pinnedRepresentatives} onSelectRepresentative={handleSelectRepresentative} onUnpin={unpinRepresentative} />
            )}

            {showDefaultDashboard && (
              <div className={`${effectiveMobileTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
                <KenyaNationalSummary />
              </div>
            )}

            {showDefaultDashboard && (
              <div className={`${effectiveMobileTab === 'feeds' ? 'block' : 'hidden lg:block'}`}>
                <KenyaLiveFeedsPanel />
              </div>
            )}

            {/* Lazy-mount feature panels */}
            {mobileTab === 'constitution' && <KenyaConstitutionFull />}
            {mobileTab === 'development' && <KenyaConstituencyDevelopment />}
            {mobileTab === 'whistleblower' && <KenyaWhistleblower />}
            {mobileTab === 'pending_bills' && <KenyaPendingBillsHeatmap />}
            {mobileTab === 'projects' && <KenyaProjectTracker />}
            {mobileTab === 'wealth' && <KenyaWealthDeclaration />}
            {mobileTab === 'red_flags' && <KenyaRedFlagScanner />}
            {mobileTab === 'tenders' && <KenyaTenderAnomaly />}
            {mobileTab === 'payroll_assets' && <KenyaPayrollAssetTracker />}
            {mobileTab === 'sentiment' && <KenyaSentimentMonitor />}
            {mobileTab === 'travel' && <KenyaTravelAudit />}
            {mobileTab === 'ownership' && <KenyaBeneficialOwnership />}
            {mobileTab === 'revenue' && <KenyaRevenueLeakage />}
            {mobileTab === 'court_cases' && <KenyaCourtTracker />}
            {mobileTab === 'hotline' && <KenyaHotlineAggregator />}
            {mobileTab === 'contracts' && <KenyaContractPerformance />}
            {mobileTab === 'variance' && <KenyaBudgetVariance />}
            {mobileTab === 'debt' && <KenyaDebtMonitor />}
            {mobileTab === 'alerts' && <KenyaExpenditureAlerts />}
            {mobileTab === 'peer_ranking' && <KenyaPeerRanking />}
            {mobileTab === 'performance_index' && <KenyaPerformanceIndex />}
            {mobileTab === 'participation' && <KenyaPublicParticipation />}
            {mobileTab === 'budget_qa' && <KenyaBudgetQA />}
            {mobileTab === 'bursary' && <KenyaBursaryTracker />}
            {mobileTab === 'service_delivery' && <KenyaServiceDelivery />}
            {mobileTab === 'resolutions' && <KenyaResolutionTracker />}

            {compareMode && <KenyaComparison selectedRep={selectedRep} onSelectRepresentative={handleSelectRepresentative} />}

            {/* Counties Info Panel — uses KenyaCountyInfoPanel when county selected */}
            {showDefaultDashboard && (
              <div className={`${effectiveMobileTab === 'counties_info' ? 'block' : 'hidden lg:hidden'}`}>
                {selectedCounty ? (
                  <KenyaCountyInfoPanel county={selectedCounty} onSelectRepresentative={handleSelectRepresentative}
                    onRequestExpansion={handleRequestExpansion} onBrowseCounties={() => setMoreSectionsOpen(true)} />
                ) : (
                  <CountyPickerCard counties={allCounties} onSelectCounty={handleSelectCounty} tc={tc} />
                )}
              </div>
            )}

            {/* Desktop persistent county info */}
            {showDefaultDashboard && selectedCounty && (
              <div className="hidden lg:block">
                <KenyaCountyInfoPanel county={selectedCounty} onSelectRepresentative={handleSelectRepresentative}
                  onRequestExpansion={handleRequestExpansion} />
              </div>
            )}

            {/* Profile / Representative Details */}
            {showDefaultDashboard && (
              <div className={`${effectiveMobileTab === 'details' ? 'block' : 'hidden lg:block'}`}>
                {dataLoading && !selectedCounty && !selectedRep ? <KenyaDetailsSkeleton /> : selectedRep ? (
                  <div>
                    {selectedRep && viewMode === 'rep-details' && (
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {selectedCounty && <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setMobileTab('counties')}><MapPin className="h-3 w-3" />Back to {tc(selectedCounty.name)}</Button>}
                        <PinButton repId={selectedRep.id} isPinned={isPinned(selectedRep.id)} onPin={pinRepresentative} onUnpin={unpinRepresentative} />
                      </div>
                    )}
                    <KenyaDetailsPanel representative={selectedRep} />
                  </div>
                ) : (
                  <EmptyProfileCard onBrowseCounties={() => setMoreSectionsOpen(true)} />
                )}
              </div>
            )}

            {/* Score Card */}
            {showDefaultDashboard && (
              <div className={`${effectiveMobileTab === 'score' ? 'block' : 'hidden lg:block'}`}>
                {dataLoading && !selectedRep ? <KenyaScoreCardSkeleton /> : (
                  <KenyaScoreCard representative={selectedRep ?? (selectedCounty ? selectedCounty.governor : null)} visibleMetrics={visibleMetrics} />
                )}
              </div>
            )}

            {/* Feedback Portal */}
            {(feedbackOpen || effectiveMobileTab === 'feedback') && (
              <div className={`${effectiveMobileTab === 'feedback' ? 'block' : 'hidden lg:block'}`}>
                <KenyaFeedbackPortal representative={selectedRep} pendingExpansionRequest={pendingExpansionRequest} onPendingRequestConsumed={() => setPendingExpansionRequest(null)} />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Accountability Panel (desktop) */}
        <div className="hidden lg:block w-[350px] shrink-0 border-l bg-card/50">
          <div className="flex h-full flex-col">
            <div className="border-b px-3 py-2"><h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accountability Data</h2></div>
            <ScrollArea className="flex-1"><div className="p-4">
              {dataLoading && !selectedRep && !selectedCounty ? <KenyaAccountabilitySkeleton /> : <KenyaAccountabilityPanel representative={selectedRep ?? (selectedCounty ? selectedCounty.governor : null)} />}
            </div></ScrollArea>
          </div>
        </div>

        {/* Mobile: Accountability view */}
        <div className={`flex-1 overflow-y-auto lg:hidden ${effectiveMobileTab === 'accountability' ? 'block' : 'hidden'}`}>
          <div className="p-4">
            {dataLoading && !selectedRep && !selectedCounty ? <KenyaAccountabilitySkeleton /> : <KenyaAccountabilityPanel representative={selectedRep ?? (selectedCounty ? selectedCounty.governor : null)} />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-3 px-4 mt-auto landscape:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">{tr('footer.title')} · {tr('footer.source')}</div>
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-300">{tr('footer.nonPartisan')}</Badge>
            <span className="text-xs text-muted-foreground">{tr('footer.sources')}</span>
          </div>
        </div>
      </footer>

      <KenyaBottomNav activeTab={mobileTab as BottomNavTab} onTabChange={(tab) => setMobileTab(tab)} visible={true} />

      {/* More sections left drawer */}
      <Sheet open={moreSectionsOpen} onOpenChange={setMoreSectionsOpen}>
        <SheetContent side="left" className="w-[280px] p-0 sm:w-[320px]">
          <div className="flex h-full flex-col">
            <div className="border-b px-4 py-3 flex items-center justify-between sticky top-0 bg-background">
              <h3 className="text-sm font-semibold flex items-center gap-2"><ChevronRight className="h-4 w-4 text-primary" />{tr('action.allSections')}</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMoreSectionsOpen(false)}><X className="h-4 w-4" /></Button>
            </div>
            <ScrollArea className="flex-1"><div className="p-3 space-y-4">
              {SIDEBAR_SECTIONS_EXPORTED.map((section) => (
                <div key={section.title} className="space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider px-2">{section.title}</p>
                  {section.items.map((item) => {
                    const isActive = mobileTab === item.id;
                    return (
                      <button key={item.id} onClick={() => { setMobileTab(item.id as MobileTab); setMoreSectionsOpen(false); }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left ${isActive ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
                        <span className="shrink-0">{item.icon}</span><span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div></ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Right sidebar */}
      <KenyaRightSidebar open={rightSidebarOpen} onClose={() => setRightSidebarOpen(false)}
        pinnedRepIds={preferences.pinnedRepresentatives} onSelectPinned={() => setRightSidebarOpen(false)}
        onAllSections={() => setMoreSectionsOpen(true)} />

      {/* Command palette */}
      <KenyaCommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}
        onSelectCounty={(countyName) => { const county = allCounties.find(c => c.name === countyName); if (county) handleSelectCounty(county); }}
        onSelectSection={(sectionId) => setMobileTab(sectionId as MobileTab)}
        counties={allCounties.map(c => ({ name: c.name, governor: c.governor, senator: c.senator, womanRep: c.womanRep, constituencyMPs: c.constituencyMPs }))} />
    </div>
  );
}

// ==================== HELPER: COUNTY PICKER CARD ====================
function CountyPickerCard({ counties, onSelectCounty, tc }: { counties: CountyData[]; onSelectCounty: (county: CountyData) => void; tc: (name: string) => string }) {
  return (
    <div className="space-y-3">
      <div className="text-center py-2">
        <MapPin className="h-8 w-8 text-primary mx-auto mb-1.5" />
        <h2 className="text-base font-semibold">Select a County</h2>
        <p className="text-xs text-muted-foreground mt-1">Tap any of the 47 counties to view development, allocation, population, and reports.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {counties.map(county => {
          const gov = county.governor;
          const score = gov.scorecard.overallAccountability.score;
          return (
            <button key={county.code} onClick={() => onSelectCounty(county)}
              className="flex flex-col items-start gap-1 p-2.5 rounded-lg border bg-card hover:bg-accent/80 hover:border-primary/40 transition-colors text-left group">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] text-muted-foreground font-mono">#{county.code}</span>
                {score !== null && (
                  <span className={`text-[10px] px-1.5 py-0 rounded-full border font-bold ${
                    score >= 70 ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : score >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    : score >= 30 ? 'bg-orange-100 text-orange-800 border-orange-300'
                    : 'bg-red-100 text-red-800 border-red-300'}`
                  }>{score}</span>
                )}
              </div>
              <span className="text-sm font-medium truncate w-full group-hover:text-primary">{tc(county.name)}</span>
              <span className="text-[10px] text-muted-foreground truncate w-full">{county.region} · {gov.party}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==================== HELPER: EMPTY PROFILE CARD ====================
function EmptyProfileCard({ onBrowseCounties }: { onBrowseCounties: () => void }) {
  return (
    <div className="space-y-3">
      <div className="text-center py-6 px-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/10">
        <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <h3 className="text-sm font-semibold mb-1">No representative selected</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">Tap any county to view its governor, senator, MPs, MCAs, and CECMs — or browse the full list of 47 counties.</p>
        <Button variant="default" size="sm" className="mt-3 gap-1.5 text-xs" onClick={onBrowseCounties}>
          <MapPin className="h-3.5 w-3.5" />Browse counties
        </Button>
      </div>
    </div>
  );
}

// ==================== ENTRY POINT ====================
export default function Home() { return <Dashboard />; }
