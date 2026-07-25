'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Settings, Pin, Star, X, Trash2, Eye, EyeOff, User, MapPin,
  Shield, BarChart3, BookOpen, CheckCircle2, Heart, TrendingUp,
} from 'lucide-react';
import {
  buildAllCountyData,
  flattenAllCountiesRepresentatives,
  NATIONAL_SUMMARY,
  getCoalitionColor,
  getScoreBadgeClass,
  type Representative,
} from '@/lib/kenya-data';
import {
  usePersonalization,
  type DashboardPreferences,
} from '@/hooks/use-personalization';

// ==================== METRIC CONFIG ====================

const METRIC_CONFIG = [
  { key: 'overallAccountability', label: 'Overall Accountability', icon: BarChart3, description: 'Weighted average of all metrics' },
  { key: 'transparencyBudget', label: 'Transparency & Budget', icon: Eye, description: 'Budget transparency and openness scores' },
  { key: 'projectDeliveryAbsorption', label: 'Project Delivery', icon: TrendingUp, description: 'Development budget absorption rates' },
  { key: 'manifestoFulfillment', label: 'Manifesto Fulfillment', icon: BookOpen, description: 'Promise tracking vs delivery' },
  { key: 'legislativeOversight', label: 'Legislative Oversight', icon: Shield, description: 'Assembly oversight effectiveness' },
  { key: 'ethicsIntegrity', label: 'Ethics & Integrity', icon: CheckCircle2, description: 'EACC compliance and integrity scores' },
  { key: 'publicSentiment', label: 'Public Sentiment', icon: Heart, description: 'Citizen awareness and satisfaction' },
] as const;

// ==================== PERSONALIZATION SETTINGS DIALOG ====================

interface KenyaSettingsDialogProps {
  preferences: DashboardPreferences;
  onToggleMetric: (key: string) => void;
  onUpdatePreference: <K extends keyof DashboardPreferences>(key: K, value: DashboardPreferences[K]) => void;
  onReset: () => void;
  isPinned: (repId: string) => boolean;
  onPin: (repId: string) => void;
  onUnpin: (repId: string) => void;
}

export function KenyaSettingsDialog({
  preferences,
  onToggleMetric,
  onUpdatePreference,
  onReset,
  isPinned,
  onPin,
  onUnpin,
}: KenyaSettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-xs" aria-label="Dashboard settings">
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Dashboard Personalization
          </DialogTitle>
          <DialogDescription>
            Customize which metrics appear, manage pinned representatives, and configure display preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Metric Visibility */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Metric Visibility
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              Toggle which scorecard metrics appear. Hidden metrics still count toward overall score calculations.
            </p>
            <div className="space-y-2">
              {METRIC_CONFIG.map(config => {
                const isVisible = !preferences.hiddenMetrics.includes(config.key);
                const Icon = config.icon;
                return (
                  <div key={config.key} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-sm font-medium">{config.label}</span>
                        <p className="text-[11px] text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={isVisible}
                      onCheckedChange={() => onToggleMetric(config.key)}
                      aria-label={`Toggle ${config.label} visibility`}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Display Preferences */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Display Preferences
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div>
                  <span className="text-sm font-medium">Compact Tree View</span>
                  <p className="text-[11px] text-muted-foreground">Show fewer details in tree nodes</p>
                </div>
                <Switch
                  checked={preferences.compactTree}
                  onCheckedChange={(v) => onUpdatePreference('compactTree', v)}
                  aria-label="Toggle compact tree"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div>
                  <span className="text-sm font-medium">Data Gap Warnings</span>
                  <p className="text-[11px] text-muted-foreground">Show warnings when data is unavailable</p>
                </div>
                <Switch
                  checked={preferences.showDataGapWarnings}
                  onCheckedChange={(v) => onUpdatePreference('showDataGapWarnings', v)}
                  aria-label="Toggle data gap warnings"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Pinned Representatives */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Pin className="h-4 w-4 text-primary" />
              Pinned Representatives ({preferences.pinnedRepresentatives.length})
            </h3>
            {preferences.pinnedRepresentatives.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No pinned representatives. Star any representative to pin them for quick access.
              </p>
            ) : (
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {preferences.pinnedRepresentatives.map(repId => (
                  <PinnedRepItem
                    key={repId}
                    repId={repId}
                    onUnpin={onUnpin}
                  />
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Preferred Counties */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Preferred Counties ({preferences.preferredCounties.length})
            </h3>
            {preferences.preferredCounties.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No preferred counties set. Counties will be highlighted when selected.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {preferences.preferredCounties.map(county => (
                  <Badge key={county} className="text-xs px-2 py-1 border bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <MapPin className="h-2.5 w-2.5 mr-1" />
                    {county}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 ml-1"
                      onClick={() => {/* removePreferredCounty handled via parent */}}
                      aria-label={`Remove ${county} from preferred`}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Reset */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reset All Preferences</p>
              <p className="text-xs text-muted-foreground">Clear all personalization data</p>
            </div>
            <Button variant="destructive" size="sm" onClick={onReset}>
              <Trash2 className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== PINNED REPS QUICK ACCESS PANEL ====================

interface KenyaPinnedPanelProps {
  pinnedIds: string[];
  onSelectRepresentative: (rep: Representative) => void;
  onUnpin: (repId: string) => void;
}

export function KenyaPinnedPanel({
  pinnedIds,
  onSelectRepresentative,
  onUnpin,
}: KenyaPinnedPanelProps) {
  const [pinnedReps, setPinnedReps] = useState<Representative[]>([]);

  // Resolve pinned IDs to full representative objects
  React.useEffect(() => {
    if (pinnedIds.length === 0) {
      setPinnedReps([]);
      return;
    }

    const counties = buildAllCountyData();
    const allReps = flattenAllCountiesRepresentatives(counties);

    // Include national-level reps
    const national = [NATIONAL_SUMMARY.president, NATIONAL_SUMMARY.deputyPresident];
    const fullList = [...national, ...allReps];

    const resolved = pinnedIds
      .map(id => fullList.find(r => r.id === id))
      .filter((r): r is Representative => r !== undefined);

    setPinnedReps(resolved);
  }, [pinnedIds]);

  if (pinnedReps.length === 0) return null;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Pin className="h-4 w-4 text-primary" />
          Pinned for Quick Access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {pinnedReps.map(rep => {
            const overallScore = rep.scorecard.overallAccountability.score;
            return (
              <div
                key={rep.id}
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onSelectRepresentative(rep)}
              >
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-medium truncate flex-1">{rep.fullName}</span>
                <span className="text-xs text-muted-foreground truncate">{rep.officialTitle}</span>
                {rep.party && (
                  <Badge className={`${getCoalitionColor(rep.coalition)} text-[10px] px-1 py-0 border`}>
                    {rep.party}
                  </Badge>
                )}
                {overallScore !== null && (
                  <Badge className={`${getScoreBadgeClass(overallScore)} text-[10px] px-1 py-0 border`}>
                    {overallScore}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 shrink-0"
                  onClick={(e) => { e.stopPropagation(); onUnpin(rep.id); }}
                  aria-label={`Unpin ${rep.fullName}`}
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== PINNED REP ITEM (in settings) ====================

function PinnedRepItem({ repId, onUnpin }: { repId: string; onUnpin: (id: string) => void }) {
  const [rep, setRep] = useState<Representative | null>(null);

  React.useEffect(() => {
    const counties = buildAllCountyData();
    const allReps = flattenAllCountiesRepresentatives(counties);
    const national = [NATIONAL_SUMMARY.president, NATIONAL_SUMMARY.deputyPresident];
    const found = [...national, ...allReps].find(r => r.id === repId);
    setRep(found || null);
  }, [repId]);

  if (!rep) return <div className="p-2 text-xs text-muted-foreground">Loading...</div>;

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
      <Star className="h-3 w-3 text-primary fill-primary" />
      <span className="text-sm font-medium truncate flex-1">{rep.fullName}</span>
      <span className="text-xs text-muted-foreground">{rep.officialTitle}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0"
        onClick={() => onUnpin(repId)}
        aria-label={`Unpin ${rep.fullName}`}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}

// ==================== PIN BUTTON (for details panel) ====================

export function PinButton({
  repId,
  isPinned,
  onPin,
  onUnpin,
}: {
  repId: string;
  isPinned: boolean;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
}) {
  return (
    <Button
      variant={isPinned ? 'default' : 'outline'}
      size="sm"
      className="gap-1 text-xs"
      onClick={() => isPinned ? onUnpin(repId) : onPin(repId)}
      aria-label={isPinned ? `Unpin representative` : `Pin representative for quick access`}
    >
      <Star className={`h-3 w-3 ${isPinned ? 'fill-current' : ''}`} />
      {isPinned ? 'Pinned' : 'Pin'}
    </Button>
  );
}
