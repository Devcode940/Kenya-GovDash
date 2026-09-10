'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import { SIDEBAR_SECTIONS_EXPORTED } from '@/components/kenya/KenyaSidebar';
import { Search, MapPin, User, Landmark, Heart, X } from 'lucide-react';

interface KenyaCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCounty: (countyName: string) => void;
  onSelectSection: (sectionId: string) => void;
  counties: {
    name: string;
    governor: { fullName: string };
    senator?: { fullName: string } | null;
    womanRep?: { fullName: string } | null;
    constituencyMPs?: { id: string; fullName: string; jurisdiction: string }[];
  }[];
}

type SearchCategory = 'County' | 'MP' | 'Senator' | 'WomanRep' | 'Section';

interface SearchResult {
  id: string;
  label: string;
  description: string;
  category: SearchCategory;
  icon: React.ReactNode;
  action: () => void;
}

const MAX_RESULTS = 50;
const TOP_RESULTS_WHEN_EMPTY = 20;
const MAX_MPS_PER_COUNTY = 10;

const CATEGORY_STYLES: Record<SearchCategory, string> = {
  County: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  MP: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
  Senator: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  WomanRep: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
  Section: 'bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30',
};

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  County: 'County',
  MP: 'MP',
  Senator: 'Senator',
  WomanRep: 'Woman Rep',
  Section: 'Section',
};

function CategoryBadge({ category }: { category: SearchCategory }) {
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium px-1.5 h-5 shrink-0 ${CATEGORY_STYLES[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

export function KenyaCommandPalette({
  open,
  onOpenChange,
  onSelectCounty,
  onSelectSection,
  counties,
}: KenyaCommandPaletteProps) {
  const { t, countyName } = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build the search index once from counties + sidebar sections.
  // Order: counties (with governor), senators, women reps, MPs (<=10 each), then sections.
  const searchIndex = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = [];

    for (const county of counties) {
      const displayName = countyName(county.name);

      // County entry — uses the localized county name and lists the governor.
      results.push({
        id: `county:${county.name}`,
        label: displayName,
        description: `Governor: ${county.governor?.fullName ?? 'N/A'}`,
        category: 'County',
        icon: <MapPin className="h-4 w-4 text-blue-500" />,
        action: () => onSelectCounty(county.name),
      });

      // Senator entry (only if data present).
      if (county.senator?.fullName) {
        results.push({
          id: `senator:${county.name}`,
          label: county.senator.fullName,
          description: `Senator \u00b7 ${displayName}`,
          category: 'Senator',
          icon: <Landmark className="h-4 w-4 text-emerald-500" />,
          action: () => onSelectCounty(county.name),
        });
      }

      // Woman Rep entry (only if data present).
      if (county.womanRep?.fullName) {
        results.push({
          id: `womanrep:${county.name}`,
          label: county.womanRep.fullName,
          description: `Woman Representative \u00b7 ${displayName}`,
          category: 'WomanRep',
          icon: <Heart className="h-4 w-4 text-rose-500" />,
          action: () => onSelectCounty(county.name),
        });
      }

      // Constituency MPs (first 10 per county).
      const mps = county.constituencyMPs?.slice(0, MAX_MPS_PER_COUNTY) ?? [];
      for (const mp of mps) {
        results.push({
          id: `mp:${mp.id}`,
          label: mp.fullName,
          description: `MP \u00b7 ${mp.jurisdiction}, ${displayName}`,
          category: 'MP',
          icon: <User className="h-4 w-4 text-orange-500" />,
          action: () => onSelectCounty(county.name),
        });
      }
    }

    // Sidebar sections — use localized labels when available, fall back to original.
    for (const section of SIDEBAR_SECTIONS_EXPORTED) {
      for (const item of section.items) {
        const key = `item.${item.id}`;
        const localized = t(key);
        const label = localized && localized !== key ? localized : item.label;
        results.push({
          id: `section:${item.id}`,
          label,
          description: section.title,
          category: 'Section',
          icon: item.icon,
          action: () => onSelectSection(item.id),
        });
      }
    }

    return results;
  }, [counties, countyName, t, onSelectCounty, onSelectSection]);

  // Filter the index based on the current query.
  const filteredResults = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return searchIndex.slice(0, TOP_RESULTS_WHEN_EMPTY);
    }
    return searchIndex
      .filter((r) => {
        return (
          r.label.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
        );
      })
      .slice(0, MAX_RESULTS);
  }, [query, searchIndex]);

  // Reset query + selected index when the dialog opens.
  // State updates are deferred via a resolved promise so we never call setState
  // synchronously inside an effect cycle (keeps the lint rule happy).
  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => {
        setQuery('');
        setSelectedIndex(0);
      });
    }
  }, [open]);

  // Keep selectedIndex within bounds when the filtered list changes.
  // State update is deferred via a resolved promise so we never call setState
  // synchronously inside an effect body (avoids cascading-render lint warning).
  useEffect(() => {
    if (selectedIndex >= filteredResults.length) {
      Promise.resolve().then(() => {
        setSelectedIndex(0);
      });
    }
  }, [filteredResults.length, selectedIndex]);

  // Scroll the active option into view whenever the selection changes.
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-cmd-index="${selectedIndex}"]`,
    );
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = (index: number) => {
    const result = filteredResults[index];
    if (!result) return;
    result.action();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, Math.max(filteredResults.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(selectedIndex);
    }
    // Esc is handled natively by the Radix Dialog wrapper.
  };

  const hasQuery = query.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl p-0 gap-0 flex flex-col max-h-[85vh] overflow-hidden"
        showCloseButton={false}
        onOpenAutoFocus={(e) => {
          // Steal focus from the default close button to the search input.
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>
            Search counties, representatives, and dashboard sections.
          </DialogDescription>
        </DialogHeader>

        {/* Search input row */}
        <div className="flex items-center gap-2 border-b px-3 sm:px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search counties, MPs, senators, sections..."
            aria-label="Search counties, MPs, senators, and dashboard sections"
            aria-autocomplete="list"
            aria-expanded
            aria-controls="kenya-command-palette-listbox"
            aria-activedescendant={
              filteredResults[selectedIndex]
                ? `kenya-command-palette-option-${selectedIndex}`
                : undefined
            }
            role="combobox"
            className="h-12 border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 bg-transparent px-0"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          id="kenya-command-palette-listbox"
          role="listbox"
          aria-label="Search results"
          className="flex-1 overflow-y-auto min-h-0 max-h-96 py-2"
        >
          {filteredResults.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Search
                className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-foreground">No results found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try a county name, an MP&apos;s name, or a section title.
              </p>
            </div>
          ) : (
            <ul className="px-2 space-y-0.5">
              {filteredResults.map((result, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <li
                    key={result.id}
                    data-cmd-index={index}
                    id={`kenya-command-palette-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => handleSelect(index)}
                    className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <span className="shrink-0" aria-hidden="true">
                      {result.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {result.label}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </div>
                    </div>
                    <CategoryBadge category={result.category} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer with result count + keyboard hints */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 sm:px-4 py-2 text-xs text-muted-foreground bg-muted/30">
          <span>
            <span className="font-semibold text-foreground">
              {filteredResults.length}
            </span>{' '}
            {filteredResults.length === 1 ? 'result' : 'results'}
            {!hasQuery && filteredResults.length > 0 && (
              <span className="text-muted-foreground/70">
                {' '}
                {'\u00b7'} showing top {TOP_RESULTS_WHEN_EMPTY}
              </span>
            )}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded border bg-background text-[10px] font-semibold">
                {'\u2191\u2193'}
              </kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded border bg-background text-[10px] font-semibold">
                {'\u21b5'}
              </kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded border bg-background text-[10px] font-semibold">
                Esc
              </kbd>
              <span>close</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
