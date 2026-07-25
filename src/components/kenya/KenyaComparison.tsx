'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  GitCompare, X, Plus, AlertCircle, ExternalLink
} from 'lucide-react';
import {
  buildAllCountyData,
  NATIONAL_SUMMARY,
  getCoalitionColor,
  getScoreBadgeClass,
  getAuditColor,
  type Representative,
} from '@/lib/kenya-data';

interface KenyaComparisonProps {
  selectedRep: Representative | null;
  onSelectRepresentative: (rep: Representative) => void;
}

const METRIC_LABELS = [
  { key: 'overallAccountability', label: 'Overall Accountability' },
  { key: 'transparencyBudget', label: 'Transparency & Budget' },
  { key: 'projectDeliveryAbsorption', label: 'Project Delivery' },
  { key: 'manifestoFulfillment', label: 'Manifesto Fulfillment' },
  { key: 'legislativeOversight', label: 'Legislative Oversight' },
  { key: 'ethicsIntegrity', label: 'Ethics & Integrity' },
  { key: 'publicSentiment', label: 'Public Sentiment' },
] as const;

export function KenyaComparison({ selectedRep, onSelectRepresentative }: KenyaComparisonProps) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allReps = getAllRepresentatives();
  const selectedReps = compareIds.map(id => allReps.find(r => r.id === id)).filter(Boolean) as Representative[];

  // Add current selection to compare
  const addToCompare = (rep: Representative) => {
    if (compareIds.length >= 4) return;
    if (compareIds.includes(rep.id)) return;
    setCompareIds([...compareIds, rep.id]);
  };

  const removeFromCompare = (id: string) => {
    setCompareIds(compareIds.filter(cid => cid !== id));
  };

  // Search representatives
  const filteredReps = searchQuery
    ? allReps.filter(r => {
        const q = searchQuery.toLowerCase();
        return `${r.fullName} ${r.officialTitle} ${r.party} ${r.jurisdiction}`.toLowerCase().includes(q);
      })
    : allReps.slice(0, 50);

  if (selectedReps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        <GitCompare className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          Select 2-4 representatives to compare
        </p>
        {selectedRep && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => addToCompare(selectedRep)}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add {selectedRep.fullName}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1"
        >
          <Plus className="h-3 w-3" />
          Browse Representatives
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Select Representatives to Compare</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Search by name, title, party..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
              />
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-1">
                  {filteredReps.map(rep => (
                    <div
                      key={rep.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer text-sm"
                      onClick={() => addToCompare(rep)}
                    >
                      <span className="font-medium">{rep.fullName}</span>
                      <Badge className={`${getCoalitionColor(rep.coalition)} text-xs px-1 py-0 border`}>
                        {rep.party}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-primary" />
            Side-by-Side Comparison
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
        {/* Selected reps badges */}
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedReps.map(rep => (
            <Badge key={rep.id} className={`${getCoalitionColor(rep.coalition)} text-xs px-2 py-1 border flex items-center gap-1`}>
              {rep.fullName}
              <button onClick={() => removeFromCompare(rep.id)} className="ml-1 hover:text-destructive">
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
          {compareIds.length < 4 && (
            <Button variant="outline" size="sm" className="h-6 text-xs gap-1" onClick={() => setDialogOpen(true)}>
              <Plus className="h-2.5 w-2.5" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-[140px]">Metric</TableHead>
                {selectedReps.map(rep => (
                  <TableHead key={rep.id} className="text-xs text-center">{rep.fullName}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Party */}
              <TableRow>
                <TableCell className="text-xs font-medium">Party / Coalition</TableCell>
                {selectedReps.map(rep => (
                  <TableCell key={rep.id} className="text-xs text-center">
                    <Badge className={`${getCoalitionColor(rep.coalition)} px-1 py-0 border text-[10px]`}>
                      {rep.party} · {rep.coalition}
                    </Badge>
                  </TableCell>
                ))}
              </TableRow>

              {/* Audit Opinion */}
              <TableRow>
                <TableCell className="text-xs font-medium">Audit Opinion (FY 2023/24)</TableCell>
                {selectedReps.map(rep => (
                  <TableCell key={rep.id} className="text-xs text-center">
                    {rep.auditOpinion ? (
                      <Badge className={`${getAuditColor(rep.auditOpinion.fy2023_24.type)} px-1 py-0 text-[10px]`}>
                        {rep.auditOpinion.fy2023_24.type}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground italic">N/A</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>

              {/* Scorecard Metrics */}
              {METRIC_LABELS.map(config => (
                <TableRow key={config.key}>
                  <TableCell className="text-xs font-medium">{config.label}</TableCell>
                  {selectedReps.map(rep => {
                    const metric = rep.scorecard[config.key as keyof typeof rep.scorecard];
                    const score = metric.score;
                    return (
                      <TableCell key={rep.id} className="text-xs text-center">
                        <Badge className={`${getScoreBadgeClass(score)} px-1 py-0 border text-[10px]`}>
                          {score ?? 'N/A'}
                        </Badge>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* Budget Absorption */}
              <TableRow>
                <TableCell className="text-xs font-medium">Overall Absorption</TableCell>
                {selectedReps.map(rep => (
                  <TableCell key={rep.id} className="text-xs text-center">
                    {rep.budgetPerformance?.overallAbsorption.rate ?? 'N/A'}
                    {rep.budgetPerformance?.overallAbsorption.rate !== null ? '%' : ''}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-xs font-medium">Dev. Absorption</TableCell>
                {selectedReps.map(rep => (
                  <TableCell key={rep.id} className="text-xs text-center">
                    {rep.budgetPerformance?.developmentAbsorption.rate ?? 'N/A'}
                    {rep.budgetPerformance?.developmentAbsorption.rate !== null ? '%' : ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Data gap notice */}
        <div className="mt-3 p-2 rounded-md border border-dashed border-muted-foreground/30">
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              &quot;N/A&quot; indicates: Data not publicly available in latest OAG/CoB/TI-Kenya reports.
              All scores are evidence-based. No estimates or approximations.
            </p>
          </div>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Representatives to Compare</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search by name, title, party..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm"
            />
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-1">
                {filteredReps.map(rep => (
                  <div
                    key={rep.id}
                    className={`flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer text-sm ${compareIds.includes(rep.id) ? 'opacity-50' : ''}`}
                    onClick={() => { addToCompare(rep); if (compareIds.length >= 3) setDialogOpen(false); }}
                  >
                    <span className="font-medium">{rep.fullName}</span>
                    <Badge className={`${getCoalitionColor(rep.coalition)} text-xs px-1 py-0 border`}>
                      {rep.party}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function getAllRepresentatives(): Representative[] {
  const reps: Representative[] = [NATIONAL_SUMMARY.president, NATIONAL_SUMMARY.deputyPresident];
  const counties = buildAllCountyData();
  for (const county of counties) {
    reps.push(county.governor);
  }
  return reps;
}
