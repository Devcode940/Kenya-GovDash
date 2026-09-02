'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Users, MapPin, Search, ChevronRight, Star, ArrowUpDown,
  Grid3x3, List, AlertCircle, Sparkles,
} from 'lucide-react';
import {
  type Representative,
  type CoalitionType,
  getCoalitionColor,
  getScoreBadgeClass,
} from '@/lib/kenya-data';

// ==================== TYPES ====================

export type GridTab = 'mps' | 'elected-mcas' | 'nominated-mcas' | 'cecms';

interface KenyaOfficialsGridProps {
  countyName: string;
  constituencyMPs?: Representative[];
  electedMCAs?: Representative[];
  nominatedMCAs?: Representative[];
  cecms?: Representative[];
  onSelectRepresentative: (rep: Representative) => void;
  onPin?: (repId: string) => void;
  onUnpin?: (repId: string) => void;
  isPinned?: (repId: string) => boolean;
  onRequestExpansion?: (countyName: string, sectionLabel: string) => void;
}

// ==================== COALITION STATS ====================

function useCoalitionBreakdown(reps: Representative[]) {
  return useMemo(() => {
    const counts = new Map<CoalitionType, number>();
    for (const r of reps) {
      counts.set(r.coalition, (counts.get(r.coalition) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [reps]);
}

// ==================== SORT OPTIONS ====================

type SortKey = 'name' | 'jurisdiction' | 'party' | 'score';

function sortReps(reps: Representative[], key: SortKey): Representative[] {
  const sorted = [...reps];
  switch (key) {
    case 'name':
      sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
      break;
    case 'jurisdiction':
      sorted.sort((a, b) => (a.jurisdiction || '').localeCompare(b.jurisdiction || ''));
      break;
    case 'party':
      sorted.sort((a, b) => (a.party || '').localeCompare(b.party || ''));
      break;
    case 'score':
      sorted.sort((a, b) => (b.scorecard.overallAccountability.score ?? -1) - (a.scorecard.overallAccountability.score ?? -1));
      break;
  }
  return sorted;
}

// ==================== GRID CARD ====================

function GridCard({
  rep,
  roleLabel,
  onSelect,
  onPin,
  onUnpin,
  isPinned,
}: {
  rep: Representative;
  roleLabel: string;
  onSelect: (rep: Representative) => void;
  onPin?: (repId: string) => void;
  onUnpin?: (repId: string) => void;
  isPinned?: boolean;
}) {
  const score = rep.scorecard.overallAccountability.score;

  return (
    <div
      className="group relative flex flex-col gap-2 p-3 rounded-lg border bg-card hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
      onClick={() => onSelect(rep)}
    >
      {/* Top row: name + pin */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-sm leading-tight">{rep.fullName}</span>
            {score !== null && (
              <Badge className={`${getScoreBadgeClass(score)} text-[10px] px-1 py-0 border shrink-0`}>
                {score}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{roleLabel}</p>
        </div>
        {onPin && onUnpin && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0 opacity-60 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              if (isPinned) onUnpin(rep.id);
              else onPin(rep.id);
            }}
            aria-label={isPinned ? 'Unpin' : 'Pin for quick access'}
          >
            <Star className={`h-3 w-3 ${isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
          </Button>
        )}
      </div>

      {/* Party/coalition badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {rep.party && (
          <Badge className={`${getCoalitionColor(rep.coalition)} text-[10px] px-1.5 py-0 border`}>
            {rep.party}
          </Badge>
        )}
        {rep.coalition && rep.coalition !== 'Independent' && (
          <span className="text-[10px] text-muted-foreground">{rep.coalition}</span>
        )}
      </div>

      {/* Score bar (if available) */}
      {score !== null && (
        <div className="flex items-center gap-1.5">
          <Progress value={score} className="h-1.5 flex-1" />
          <span className="text-[10px] text-muted-foreground shrink-0">{score}/100</span>
        </div>
      )}

      {/* Hover hint */}
      <div className="flex items-center justify-end gap-0.5 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        View details
        <ChevronRight className="h-3 w-3" />
      </div>
    </div>
  );
}

// ==================== EMPTY STATE ====================

function GridEmptyState({
  countyName,
  sectionLabel,
  onRequestExpansion,
}: {
  countyName: string;
  sectionLabel: string;
  onRequestExpansion?: (countyName: string, sectionLabel: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-md bg-muted/30 border border-dashed border-muted-foreground/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {sectionLabel} data for {countyName} County is not yet available
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This information is sourced from IEBC gazette notices, county assembly records,
            and official county publications. As official data becomes available, it will
            be added here.
          </p>
        </div>
      </div>
      {onRequestExpansion && (
        <Button
          variant="default"
          size="sm"
          className="self-start gap-1.5 text-xs"
          onClick={() => onRequestExpansion(countyName, sectionLabel)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Request County Expansion
        </Button>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function KenyaOfficialsGrid({
  countyName,
  constituencyMPs = [],
  electedMCAs = [],
  nominatedMCAs = [],
  cecms = [],
  onSelectRepresentative,
  onPin,
  onUnpin,
  isPinned,
  onRequestExpansion,
}: KenyaOfficialsGridProps) {
  const [activeTab, setActiveTab] = useState<GridTab>(() => {
    if (constituencyMPs.length > 0) return 'mps';
    if (electedMCAs.length > 0) return 'elected-mcas';
    if (nominatedMCAs.length > 0) return 'nominated-mcas';
    if (cecms.length > 0) return 'cecms';
    return 'mps';
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('jurisdiction');
  const [showAll, setShowAll] = useState(false);

  const COLLAPSED_LIMIT = 12;

  // Available tabs (only show tabs that have data)
  const tabs: { key: GridTab; label: string; icon: React.ReactNode; count: number; data: Representative[] }[] = ([
    { key: 'mps' as GridTab, label: 'Constituency MPs', icon: <Users className="h-3.5 w-3.5" />, count: constituencyMPs.length, data: constituencyMPs },
    { key: 'elected-mcas' as GridTab, label: 'Elected MCAs', icon: <MapPin className="h-3.5 w-3.5" />, count: electedMCAs.length, data: electedMCAs },
    { key: 'nominated-mcas' as GridTab, label: 'Nominated MCAs', icon: <Users className="h-3.5 w-3.5" />, count: nominatedMCAs.length, data: nominatedMCAs },
    { key: 'cecms' as GridTab, label: 'CECMs', icon: <Users className="h-3.5 w-3.5" />, count: cecms.length, data: cecms },
  ]).filter(t => t.count > 0);

  const activeTabData = useMemo(() => {
    const tab = tabs.find(t => t.key === activeTab);
    return tab?.data ?? [];
  }, [tabs, activeTab]);

  const coalitionBreakdown = useCoalitionBreakdown(activeTabData);

  const filtered = useMemo(() => {
    if (!search.trim()) return activeTabData;
    const q = search.toLowerCase().trim();
    return activeTabData.filter(r =>
      r.fullName.toLowerCase().includes(q) ||
      (r.jurisdiction || '').toLowerCase().includes(q) ||
      (r.party || '').toLowerCase().includes(q) ||
      (r.officialTitle || '').toLowerCase().includes(q)
    );
  }, [activeTabData, search]);

  const sorted = useMemo(() => sortReps(filtered, sortKey), [filtered, sortKey]);

  const visible = useMemo(() => {
    if (showAll || sorted.length <= COLLAPSED_LIMIT) return sorted;
    return sorted.slice(0, COLLAPSED_LIMIT);
  }, [sorted, showAll]);

  const roleLabelFor = (rep: Representative, tab: GridTab): string => {
    switch (tab) {
      case 'mps': return `MP, ${rep.jurisdiction}`;
      case 'elected-mcas': return `MCA, ${rep.jurisdiction} Ward`;
      case 'nominated-mcas': return `Nominated MCA${rep.jurisdiction ? `, ${rep.jurisdiction}` : ''}`;
      case 'cecms': return rep.officialTitle;
    }
  };

  // Reset showAll when switching tabs
  const handleTabChange = (tab: GridTab) => {
    setActiveTab(tab);
    setShowAll(false);
    setSearch('');
  };

  // If no data at all in any tab
  if (tabs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Elected & Appointed Officials Grid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GridEmptyState
            countyName={countyName}
            sectionLabel="Sub-county official"
            onRequestExpansion={onRequestExpansion}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Grid3x3 className="h-4 w-4 text-primary" />
            Officials Grid — {countyName} County
          </CardTitle>
          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-muted/60">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 flex-wrap mt-2">
          {tabs.map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.icon}
              {tab.label}
              <Badge
                variant="outline"
                className={`text-[10px] px-1 py-0 ${
                  activeTab === tab.key
                    ? 'bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground'
                    : 'bg-muted/50'
                }`}
              >
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Coalition breakdown */}
        {coalitionBreakdown.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-2 text-[11px] text-muted-foreground">
            <span className="font-medium">Coalition split:</span>
            {coalitionBreakdown.map(([coal, n]) => (
              <Badge
                key={coal}
                className={`${getCoalitionColor(coal)} text-[10px] px-1.5 py-0 border`}
              >
                {coal}: {n}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Search + sort */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search by name, ${activeTab === 'mps' ? 'constituency' : activeTab.includes('mcas') ? 'ward' : 'title'}, or party…`}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-8 text-xs border rounded-md px-2 bg-background"
            >
              <option value="jurisdiction">Sort: {activeTab === 'mps' ? 'Constituency' : activeTab.includes('mcas') ? 'Ward' : 'Title'}</option>
              <option value="name">Sort: Name (A–Z)</option>
              <option value="party">Sort: Party</option>
              <option value="score">Sort: Score (high→low)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Showing <span className="font-medium">{visible.length}</span>
            {visible.length < sorted.length && ` of ${sorted.length}`}
            {search.trim() && ` matching "${search.trim()}"`}
          </span>
          {sorted.length > COLLAPSED_LIMIT && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setShowAll(s => !s)}
            >
              {showAll ? 'Show less' : `Show all ${sorted.length}`}
            </Button>
          )}
        </div>

        {/* Grid / List */}
        {visible.length === 0 ? (
          <GridEmptyState
            countyName={countyName}
            sectionLabel={tabs.find(t => t.key === activeTab)?.label ?? 'Official'}
            onRequestExpansion={onRequestExpansion}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {visible.map(rep => (
              <GridCard
                key={rep.id}
                rep={rep}
                roleLabel={roleLabelFor(rep, activeTab)}
                onSelect={onSelectRepresentative}
                onPin={onPin}
                onUnpin={onUnpin}
                isPinned={isPinned?.(rep.id)}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border rounded-md border">
            {visible.map(rep => {
              const score = rep.scorecard.overallAccountability.score;
              return (
                <div
                  key={rep.id}
                  className="group flex items-center gap-3 p-2.5 hover:bg-accent/60 transition-colors cursor-pointer"
                  onClick={() => onSelectRepresentative(rep)}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60">
                    {activeTab === 'mps' ? <Users className="h-3.5 w-3.5 text-orange-600" /> :
                     activeTab === 'elected-mcas' ? <MapPin className="h-3.5 w-3.5 text-purple-500" /> :
                     activeTab === 'nominated-mcas' ? <Users className="h-3.5 w-3.5 text-blue-500" /> :
                     <Users className="h-3.5 w-3.5 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-sm truncate">{rep.fullName}</span>
                      {score !== null && (
                        <Badge className={`${getScoreBadgeClass(score)} text-[10px] px-1 py-0 border shrink-0`}>
                          {score}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{roleLabelFor(rep, activeTab)}</p>
                  </div>
                  <Badge className={`${getCoalitionColor(rep.coalition)} text-[10px] px-1.5 py-0 border shrink-0 hidden sm:inline-flex`}>
                    {rep.party}
                  </Badge>
                  {onPin && onUnpin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPinned?.(rep.id)) onUnpin(rep.id);
                        else onPin(rep.id);
                      }}
                      aria-label={isPinned?.(rep.id) ? 'Unpin' : 'Pin'}
                    >
                      <Star className={`h-3 w-3 ${isPinned?.(rep.id) ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                    </Button>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              );
            })}
          </div>
        )}

        {/* Show all (when collapsed) */}
        {!showAll && sorted.length > COLLAPSED_LIMIT && (
          <div className="flex justify-center pt-1">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowAll(true)}
            >
              Show all {sorted.length} {activeTab === 'mps' ? 'MPs' : activeTab === 'elected-mcas' ? 'MCAs' : activeTab === 'nominated-mcas' ? 'Nominated MCAs' : 'CECMs'}
            </Button>
          </div>
        )}

        {/* Footer note */}
        <p className="text-[11px] text-muted-foreground italic pt-1 border-t border-dashed border-muted-foreground/20">
          All officials are sourced from IEBC 2022 gazette notices and county assembly records.
          Click any card to view full profile, scorecard, contact info, and source citations.
        </p>
      </CardContent>
    </Card>
  );
}
