'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search, X, MapPin, User, Building2, Users, Shield, Star, Pin
} from 'lucide-react';
import {
  buildAllCountyData,
  flattenAllCountiesRepresentatives,
  NATIONAL_SUMMARY,
  getCoalitionColor,
  getScoreBadgeClass,
  type Representative,
  type CountyData,
} from '@/lib/kenya-data';

// ==================== TYPES ====================

interface SearchEntry {
  rep: Representative;
  countyName: string;
  countyCode: number;
  matchField: string; // which field matched the query
}

interface KenyaSearchAutocompleteProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectRepresentative: (rep: Representative) => void;
  onSelectCounty: (county: CountyData) => void;
  pinnedIds?: string[];
  onPin?: (repId: string) => void;
  onUnpin?: (repId: string) => void;
}

// ==================== FUZZY MATCHING ====================

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact substring match (highest relevance)
  if (lowerText.includes(lowerQuery)) return true;

  // Fuzzy: all characters in query appear in order in text (with gaps allowed)
  let queryIdx = 0;
  for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIdx]) queryIdx++;
  }
  return queryIdx === lowerQuery.length;
}

function getMatchRelevance(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact start match = highest relevance
  if (lowerText.startsWith(lowerQuery)) return 100;
  // Exact substring match = high
  if (lowerText.includes(lowerQuery)) return 80;
  // Fuzzy match = lower
  return 50;
}

function getBestMatchField(rep: Representative, countyName: string, query: string): string {
  const fields: { value: string; label: string }[] = [
    { value: rep.fullName, label: 'Name' },
    { value: countyName, label: 'County' },
    { value: rep.party, label: 'Party' },
    { value: rep.coalition, label: 'Coalition' },
    { value: rep.officialTitle, label: 'Title' },
    { value: rep.jurisdiction, label: 'Jurisdiction' },
    { value: rep.level, label: 'Level' },
  ];

  let bestLabel = '';
  let bestScore = 0;

  for (const field of fields) {
    if (fuzzyMatch(field.value, query)) {
      const score = getMatchRelevance(field.value, query);
      if (score > bestScore) {
        bestScore = score;
        bestLabel = field.label;
      }
    }
  }

  return bestLabel;
}

// ==================== ICON FOR LEVEL ====================

function getLevelIcon(level: string): React.ReactNode {
  switch (level) {
    case 'National': return <Shield className="h-3 w-3 text-primary" />;
    case 'County': return <Building2 className="h-3 w-3 text-green-600" />;
    case 'Constituency': return <Users className="h-3 w-3 text-orange-600" />;
    case 'Ward': return <MapPin className="h-3 w-3 text-purple-600" />;
    default: return <User className="h-3 w-3 text-muted-foreground" />;
  }
}

// ==================== MAIN COMPONENT ====================

export function KenyaSearchAutocomplete({
  searchQuery,
  onSearchChange,
  onSelectRepresentative,
  onSelectCounty,
  pinnedIds = [],
  onPin,
  onUnpin,
}: KenyaSearchAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build search index using useMemo (computes once, avoids effect setState)
  const allCounties = useMemo(() => buildAllCountyData(), []);
  const allReps = useMemo(() => {
    const reps = flattenAllCountiesRepresentatives(allCounties);
    const nationalReps: SearchEntry[] = [
      { rep: NATIONAL_SUMMARY.president, countyName: 'National', countyCode: 0, matchField: 'Name' },
      { rep: NATIONAL_SUMMARY.deputyPresident, countyName: 'National', countyCode: 0, matchField: 'Name' },
    ];
    const countyReps: SearchEntry[] = reps.map(r => ({
      rep: r,
      countyName: r.jurisdiction,
      countyCode: r.countyCode ?? 0,
      matchField: '',
    }));
    return [...nationalReps, ...countyReps];
  }, [allCounties]);

  // Compute search results with fuzzy matching
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.trim();
    const results: SearchEntry[] = [];

    for (const entry of allReps) {
      const matchField = getBestMatchField(entry.rep, entry.countyName, query);
      if (matchField) {
        results.push({ ...entry, matchField });
      }
    }

    // Sort by relevance: pinned first, then by match quality
    results.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.rep.id) ? 1 : 0;
      const bPinned = pinnedIds.includes(b.rep.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned;

      const aScore = getMatchRelevance(a.rep.fullName, query);
      const bScore = getMatchRelevance(b.rep.fullName, query);
      return bScore - aScore;
    });

    return results.slice(0, 12); // max 12 results
  }, [searchQuery, allReps, pinnedIds]);

  // Handle selection
  const handleSelect = useCallback((entry: SearchEntry) => {
    onSelectRepresentative(entry.rep);

    // Also select the county if applicable
    if (entry.countyCode > 0) {
      const county = allCounties.find(c => c.code === entry.countyCode);
      if (county) onSelectCounty(county);
    }

    onSearchChange('');
    setIsFocused(false);
  }, [onSelectRepresentative, onSelectCounty, allCounties, onSearchChange]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isFocused && searchQuery.trim().length > 0;
  const isPinned = pinnedIds.length > 0;

  // Show pinned reps when focused but no query
  const pinnedResults = useMemo(() => {
    if (!isPinned) return [];
    return allReps.filter(e => pinnedIds.includes(e.rep.id)).slice(0, 5);
  }, [allReps, pinnedIds, isPinned]);

  const showPinned = isFocused && !searchQuery.trim() && pinnedResults.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, county, party, role..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="pl-9 h-9"
          aria-label="Search representatives with autocomplete"
          aria-expanded={showDropdown || showPinned}
          aria-autocomplete="list"
          role="combobox"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => { onSearchChange(''); setIsFocused(false); }}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {(showDropdown || showPinned) && (
        <div
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-lg shadow-lg max-h-[300px] overflow-y-auto"
          role="listbox"
        >
          {/* Pinned Representatives (shown when focused with no query) */}
          {showPinned && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground border-b bg-muted/30">
                <Pin className="h-3 w-3 mr-1 inline" />
                Pinned Representatives
              </div>
              {pinnedResults.map(entry => (
                <SearchResultItem
                  key={entry.rep.id}
                  entry={entry}
                  onSelect={handleSelect}
                  isPinned={pinnedIds.includes(entry.rep.id)}
                  onPin={onPin}
                  onUnpin={onUnpin}
                />
              ))}
            </div>
          )}

          {/* Search Results */}
          {showDropdown && searchResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground border-b bg-muted/30">
                <Search className="h-3 w-3 mr-1 inline" />
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
              </div>
              {searchResults.map(entry => (
                <SearchResultItem
                  key={entry.rep.id}
                  entry={entry}
                  onSelect={handleSelect}
                  isPinned={pinnedIds.includes(entry.rep.id)}
                  onPin={onPin}
                  onUnpin={onUnpin}
                />
              ))}
            </div>
          )}

          {showDropdown && searchResults.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No results for &quot;{searchQuery}&quot;</p>
              <p className="text-xs mt-1">Try searching by name, county, party, or role</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==================== RESULT ITEM ====================

function SearchResultItem({
  entry,
  onSelect,
  isPinned,
  onPin,
  onUnpin,
}: {
  entry: SearchEntry;
  onSelect: (entry: SearchEntry) => void;
  isPinned: boolean;
  onPin?: (repId: string) => void;
  onUnpin?: (repId: string) => void;
}) {
  const { rep, countyName, matchField } = entry;
  const overallScore = rep.scorecard.overallAccountability.score;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors"
      onClick={() => onSelect(entry)}
      role="option"
      aria-selected={false}
    >
      {getLevelIcon(rep.level)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{rep.fullName}</span>
          {overallScore !== null && (
            <Badge className={`${getScoreBadgeClass(overallScore)} text-[9px] px-0.5 py-0 border`}>
              {overallScore}
            </Badge>
          )}
          {isPinned && (
            <Pin className="h-2.5 w-2.5 text-primary fill-primary" />
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {rep.officialTitle} · {countyName}
          {matchField && <span className="text-primary ml-1">matched: {matchField}</span>}
        </div>
      </div>

      {/* Coalition badge */}
      {rep.party && (
        <Badge className={`${getCoalitionColor(rep.coalition)} text-[10px] px-1 py-0 border shrink-0`}>
          {rep.party}
        </Badge>
      )}

      {/* Pin button */}
      {onPin && onUnpin && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (isPinned) onUnpin(rep.id);
            else onPin(rep.id);
          }}
          aria-label={isPinned ? 'Unpin representative' : 'Pin representative'}
        >
          <Star className={`h-3 w-3 ${isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
        </Button>
      )}
    </div>
  );
}
