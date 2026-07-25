'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';
import {
  FilterState,
  DEFAULT_FILTERS,
  RegionType,
  CoalitionType,
  LevelType,
  AuditOpinionType,
  REGIONS,
} from '@/lib/kenya-data';

interface KenyaFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount: number;
  totalCount: number;
}

const REGIONS_LIST: RegionType[] = ['Coast', 'North Eastern', 'Eastern', 'Central', 'Rift Valley', 'Western', 'Nyanza', 'Nairobi'];
const COALITIONS: CoalitionType[] = ['Kenya Kwanza', 'Azimio', 'Independent', 'Other'];
const LEVELS: LevelType[] = ['National', 'County', 'Constituency', 'Ward'];
const AUDIT_TYPES: AuditOpinionType[] = ['Unmodified', 'Qualified', 'Adverse', 'Disclaimer'];

export function KenyaFilters({ filters, onFiltersChange, resultCount, totalCount }: KenyaFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange(DEFAULT_FILTERS);
  };

  const hasActiveFilters = filters.searchQuery || filters.region !== 'All' || filters.coalition !== 'All' || filters.level !== 'All' || filters.auditOpinion !== 'All' || filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by county, name, party, level..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pl-9 h-9"
        />
        {filters.searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => updateFilter('searchQuery', '')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2">
        {/* Region */}
        <Select
          value={filters.region}
          onValueChange={(v) => updateFilter('region', v as RegionType | 'All')}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Regions</SelectItem>
            {REGIONS_LIST.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Coalition */}
        <Select
          value={filters.coalition}
          onValueChange={(v) => updateFilter('coalition', v as CoalitionType | 'All')}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Coalition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Coalitions</SelectItem>
            {COALITIONS.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Level */}
        <Select
          value={filters.level}
          onValueChange={(v) => updateFilter('level', v as LevelType | 'All')}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Levels</SelectItem>
            {LEVELS.map(l => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Audit Opinion */}
        <Select
          value={filters.auditOpinion}
          onValueChange={(v) => updateFilter('auditOpinion', v as AuditOpinionType | 'All')}
        >
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Audit Opinion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Opinions</SelectItem>
            {AUDIT_TYPES.map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Score Range */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Score Range:</span>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[filters.scoreRange[0], filters.scoreRange[1]]}
          onValueChange={(v) => updateFilter('scoreRange', [v[0], v[1]] as [number, number])}
          className="flex-1"
        />
        <span className="text-xs font-medium whitespace-nowrap">
          {filters.scoreRange[0]}–{filters.scoreRange[1]}
        </span>
      </div>

      {/* Result count & Clear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Filter className="h-3 w-3 mr-1" />
            {resultCount}/{totalCount} counties
          </Badge>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
