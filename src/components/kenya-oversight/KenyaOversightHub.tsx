'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { ExternalLink } from 'lucide-react';
import {
  KENYA_OVERSIGHT_FEATURES,
  type KenyaOversightFeature,
} from '@/lib/kenya-oversight-data';
import { KenyaPetitionTracker } from './KenyaPetitionTracker';
import { KenyaCidpDashboard } from './KenyaCidpDashboard';
import { KenyaRevenueAutonomy } from './KenyaRevenueAutonomy';
import { KenyaGenderInclusion } from './KenyaGenderInclusion';
import { KenyaBorderConflicts } from './KenyaBorderConflicts';
import { KenyaClimateEnvironment } from './KenyaClimateEnvironment';
import { KenyaServiceDelivery } from './KenyaServiceDelivery';
import { KenyaDevolutionPerformance } from './KenyaDevolutionPerformance';
import { KenyaBudgetTracker } from './KenyaBudgetTracker';
import { KenyaCivicParticipation } from './KenyaCivicParticipation';

// Map feature IDs to their components
const featureComponentMap: Record<string, React.FC<{ countyCode: number }>> = {
  petitions: KenyaPetitionTracker,
  cidp: KenyaCidpDashboard,
  revenue: KenyaRevenueAutonomy,
  gender: KenyaGenderInclusion,
  borders: KenyaBorderConflicts,
  climate: KenyaClimateEnvironment,
  servicedelivery: KenyaServiceDelivery,
  dpi: KenyaDevolutionPerformance,
  budgettracker: KenyaBudgetTracker,
  civic: KenyaCivicParticipation,
};

interface KenyaOversightHubProps {
  countyCode: number;
}

export function KenyaOversightHub({ countyCode }: KenyaOversightHubProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const activeFeature = KENYA_OVERSIGHT_FEATURES.find(f => f.id === selectedFeature);
  const activeComponent = selectedFeature ? featureComponentMap[selectedFeature] : null;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1">
          <span className="text-base">🔍</span>
          Extended Oversight Features (10)
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-300 cursor-help">
                New · Kenya-Specific
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-[250px]">
              <p className="text-xs">These 10 features complement the original 10 oversight features with Kenya-specific accountability data, all sourced from OAG, CoB, TI-Kenya, EACC, KNBS, NEMA, and county records.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {KENYA_OVERSIGHT_FEATURES.map((feature) => (
          <button
            key={feature.id}
            className="rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors text-left cursor-pointer group"
            onClick={() => setSelectedFeature(feature.id)}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: feature.color + '20', color: feature.color }}>
                <span className="text-sm">{feature.icon}</span>
              </div>
              <span className="text-xs font-semibold leading-tight group-hover:text-primary">
                {feature.title}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
              {feature.description}
            </p>
            <div className="mt-1.5 text-[10px] text-muted-foreground flex items-center gap-1">
              <ExternalLink className="h-2.5 w-2.5" />
              {feature.source}
            </div>
          </button>
        ))}
      </div>

      {/* Detail Dialog */}
      <Dialog open={selectedFeature !== null} onOpenChange={(open) => { if (!open) setSelectedFeature(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              {activeFeature && (
                <>
                  <div className="flex h-7 w-7 items-center justify-center rounded-md"
                    style={{ backgroundColor: activeFeature.color + '20' }}>
                    <span className="text-sm">{activeFeature.icon}</span>
                  </div>
                  <span style={{ color: activeFeature.color }}>{activeFeature.title}</span>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="px-6 pb-6 max-h-[60vh] overflow-y-auto">
            {activeComponent && <activeComponent countyCode={countyCode} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
