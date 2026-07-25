'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Shield, TrendingUp, FileText, CheckCircle2, AlertCircle,
  ExternalLink, BarChart3, Eye, BookOpen, Users, Heart
} from 'lucide-react';
import { getScoreColor, getScoreBadgeClass, type Representative, type ScoreMetric } from '@/lib/kenya-data';

interface KenyaScoreCardProps {
  representative: Representative | null;
  visibleMetrics?: string[]; // metric keys to show (from personalization)
}

const METRIC_CONFIG = [
  { key: 'overallAccountability', label: 'Overall Accountability', icon: BarChart3, color: 'text-primary' },
  { key: 'transparencyBudget', label: 'Transparency & Budget', icon: Eye, color: 'text-green-600' },
  { key: 'projectDeliveryAbsorption', label: 'Project Delivery & Absorption', icon: TrendingUp, color: 'text-orange-600' },
  { key: 'manifestoFulfillment', label: 'Manifesto Fulfillment', icon: BookOpen, color: 'text-purple-600' },
  { key: 'legislativeOversight', label: 'Legislative/Oversight Performance', icon: Shield, color: 'text-yellow-600' },
  { key: 'ethicsIntegrity', label: 'Ethics & Integrity', icon: CheckCircle2, color: 'text-red-600' },
  { key: 'publicSentiment', label: 'Public Sentiment/Citizen Awareness', icon: Heart, color: 'text-pink-600' },
] as const;

export function KenyaScoreCard({ representative, visibleMetrics }: KenyaScoreCardProps) {
  if (!representative) return null;

  const rep = representative;
  const scorecard = rep.scorecard;

  // Filter metrics based on personalization preferences
  const allVisibleMetrics = visibleMetrics || METRIC_CONFIG.map(c => c.key);
  const showOverall = allVisibleMetrics.includes('overallAccountability');
  const filteredMetrics = METRIC_CONFIG.filter(c => c.key !== 'overallAccountability' && allVisibleMetrics.includes(c.key));

  // Don't render if no metrics visible
  if (filteredMetrics.length === 0 && !showOverall) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Accountability Scorecard
          {visibleMetrics && visibleMetrics.length < 7 && (
            <Badge className="text-[10px] bg-muted text-muted-foreground border">
              {filteredMetrics.length + (showOverall ? 1 : 0)}/7 metrics
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Overall Score */}
          {showOverall && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Overall Accountability Score</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getScoreBadgeClass(scorecard.overallAccountability.score)} px-3 py-1 text-sm font-bold border-2`}>
                  {scorecard.overallAccountability.score ?? 'N/A'}
                </Badge>
                <SourceCitationButton metric={scorecard.overallAccountability} />
              </div>
            </div>
          )}

          {showOverall && filteredMetrics.length > 0 && <Separator />}

          {/* Individual Metrics */}
          <div className="space-y-2">
            {filteredMetrics.map(config => {
              const metric = scorecard[config.key as keyof typeof scorecard] as ScoreMetric;
              const Icon = config.icon;

              return (
                <div key={config.key} className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{config.label}</span>
                      <div className="flex items-center gap-1">
                        <Badge className={`${getScoreBadgeClass(metric.score)} text-xs px-2 py-0.5 border`}>
                          {metric.score ?? 'N/A'}
                        </Badge>
                        <SourceCitationButton metric={metric} />
                      </div>
                    </div>
                    <Progress
                      value={metric.score ?? 0}
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Data Gap Notice */}
          <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Metrics marked &quot;N/A&quot; indicate: Data not publicly available in latest OAG/CoB/TI-Kenya reports.
                All scores are evidence-based with source citations. No estimates or approximations are used.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Source Citation Button with Dialog
function SourceCitationButton({ metric }: { metric: ScoreMetric }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Source Citation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Score</p>
              <p className="text-sm font-semibold">{metric.score ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Data Available</p>
              <p className="text-sm font-semibold">{metric.dataAvailable ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {metric.dataAvailable ? (
            <>
              <div>
                <p className="text-xs text-muted-foreground">Source</p>
                <p className="text-sm">{metric.source}</p>
              </div>
              {metric.fy && (
                <div>
                  <p className="text-xs text-muted-foreground">Financial Year</p>
                  <p className="text-sm">{metric.fy}</p>
                </div>
              )}
              {metric.page && (
                <div>
                  <p className="text-xs text-muted-foreground">Page/Section</p>
                  <p className="text-sm">{metric.page}</p>
                </div>
              )}
              {metric.url && (
                <div>
                  <p className="text-xs text-muted-foreground">Document URL</p>
                  <a href={metric.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">
                    {metric.url}
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground italic">
                  {metric.note || 'Data not publicly available in latest OAG/CoB/TI-Kenya reports'}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
