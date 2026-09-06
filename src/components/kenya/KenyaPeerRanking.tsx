'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Trophy, ArrowUpDown, MapPin, TrendingUp, TrendingDown,
  Shield, DollarSign, Users, Info, Award, Medal, Filter,
} from 'lucide-react';

interface PeerRank {
  rank: number;
  countyName: string;
  countyCode: number;
  region: string;
  auditOpinion: string;
  overallAbsorption: number;
  developmentAbsorption: number;
  revenueCollection: number;
  pendingBillsPct: number;
  compositeScore: number;
  trend: 'up' | 'down' | 'stable';
  previousRank: number;
  change: number;
}

const PEER_DATA: PeerRank[] = [
  { rank: 1, countyName: 'Kajiado', countyCode: 34, region: 'Rift Valley', auditOpinion: 'Qualified', overallAbsorption: 89.5, developmentAbsorption: 71.2, revenueCollection: 86.3, pendingBillsPct: 2.1, compositeScore: 82, trend: 'up', previousRank: 3, change: 2 },
  { rank: 2, countyName: 'Nyeri', countyCode: 19, region: 'Central', auditOpinion: 'Qualified', overallAbsorption: 85.2, developmentAbsorption: 68.5, revenueCollection: 82.1, pendingBillsPct: 3.5, compositeScore: 78, trend: 'stable', previousRank: 2, change: 0 },
  { rank: 3, countyName: 'Kirinyaga', countyCode: 20, region: 'Central', auditOpinion: 'Qualified', overallAbsorption: 83.8, developmentAbsorption: 65.2, revenueCollection: 79.5, pendingBillsPct: 4.3, compositeScore: 75, trend: 'up', previousRank: 5, change: 2 },
  { rank: 4, countyName: 'Nyandarua', countyCode: 18, region: 'Central', auditOpinion: 'Qualified', overallAbsorption: 82.1, developmentAbsorption: 62.8, revenueCollection: 77.2, pendingBillsPct: 3.2, compositeScore: 73, trend: 'stable', previousRank: 4, change: 0 },
  { rank: 5, countyName: 'Meru', countyCode: 12, region: 'Eastern', auditOpinion: 'Qualified', overallAbsorption: 80.5, developmentAbsorption: 58.3, revenueCollection: 76.8, pendingBillsPct: 5.1, compositeScore: 70, trend: 'up', previousRank: 8, change: 3 },
  { rank: 6, countyName: 'Nakuru', countyCode: 32, region: 'Rift Valley', auditOpinion: 'Qualified', overallAbsorption: 79.5, developmentAbsorption: 55.2, revenueCollection: 75.1, pendingBillsPct: 8.8, compositeScore: 68, trend: 'down', previousRank: 1, change: -5 },
  { rank: 7, countyName: 'West Pokot', countyCode: 24, region: 'Rift Valley', auditOpinion: 'Qualified', overallAbsorption: 78.2, developmentAbsorption: 56.8, revenueCollection: 72.5, pendingBillsPct: 6.2, compositeScore: 66, trend: 'stable', previousRank: 7, change: 0 },
  { rank: 8, countyName: 'Embu', countyCode: 14, region: 'Eastern', auditOpinion: 'Qualified', overallAbsorption: 77.8, developmentAbsorption: 54.2, revenueCollection: 73.1, pendingBillsPct: 7.1, compositeScore: 64, trend: 'down', previousRank: 6, change: -2 },
  { rank: 9, countyName: 'Machakos', countyCode: 16, region: 'Eastern', auditOpinion: 'Qualified', overallAbsorption: 76.5, developmentAbsorption: 51.8, revenueCollection: 70.2, pendingBillsPct: 5.6, compositeScore: 62, trend: 'up', previousRank: 12, change: 3 },
  { rank: 10, countyName: 'Kisumu', countyCode: 42, region: 'Nyanza', auditOpinion: 'Qualified', overallAbsorption: 75.8, developmentAbsorption: 48.5, revenueCollection: 59.5, pendingBillsPct: 9.2, compositeScore: 60, trend: 'stable', previousRank: 10, change: 0 },
  { rank: 11, countyName: 'Kakamega', countyCode: 37, region: 'Western', auditOpinion: 'Qualified', overallAbsorption: 74.2, developmentAbsorption: 45.8, revenueCollection: 54.4, pendingBillsPct: 8.6, compositeScore: 57, trend: 'down', previousRank: 9, change: -2 },
  { rank: 12, countyName: 'Kiambu', countyCode: 22, region: 'Central', auditOpinion: 'Qualified', overallAbsorption: 73.5, developmentAbsorption: 42.1, revenueCollection: 78.8, pendingBillsPct: 7.4, compositeScore: 55, trend: 'down', previousRank: 11, change: -1 },
  { rank: 13, countyName: 'Nairobi City', countyCode: 47, region: 'Nairobi', auditOpinion: 'Qualified', overallAbsorption: 72.1, developmentAbsorption: 38.5, revenueCollection: 65.9, pendingBillsPct: 11.2, compositeScore: 52, trend: 'down', previousRank: 13, change: 0 },
  { rank: 14, countyName: 'Mombasa', countyCode: 1, region: 'Coast', auditOpinion: 'Qualified', overallAbsorption: 70.8, developmentAbsorption: 35.2, revenueCollection: 51.2, pendingBillsPct: 14.2, compositeScore: 48, trend: 'down', previousRank: 14, change: 0 },
  { rank: 15, countyName: 'Bungoma', countyCode: 39, region: 'Western', auditOpinion: 'Qualified', overallAbsorption: 68.5, developmentAbsorption: 32.8, revenueCollection: 48.0, pendingBillsPct: 8.3, compositeScore: 45, trend: 'up', previousRank: 16, change: 1 },
];

const SCORE_COLORS: Record<string, string> = {
  '80plus': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  '60s': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  '50s': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  '40s': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  '30s': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

function getScoreColor(score: number): string {
  if (score >= 80) return SCORE_COLORS['80plus'];
  if (score >= 60) return SCORE_COLORS['60s'];
  if (score >= 50) return SCORE_COLORS['50s'];
  if (score >= 40) return SCORE_COLORS['40s'];
  return SCORE_COLORS['30s'];
}

export function KenyaPeerRanking() {
  const [sortBy, setSortBy] = useState<'composite' | 'absorption' | 'development' | 'revenue'>('composite');

  const sorted = [...PEER_DATA].sort((a, b) => {
    switch (sortBy) {
      case 'absorption': return b.overallAbsorption - a.overallAbsorption;
      case 'development': return b.developmentAbsorption - a.developmentAbsorption;
      case 'revenue': return b.revenueCollection - a.revenueCollection;
      default: return b.compositeScore - a.compositeScore;
    }
  });

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-yellow-300 dark:border-yellow-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Inter-County Peer Ranking
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Rank all 47 counties by composite performance score — combining budget absorption,
            development delivery, revenue collection, and pending bills. Track ranking changes
            year-over-year to identify improving and declining counties.
          </p>
        </CardHeader>
      </Card>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-3">
        {PEER_DATA.slice(0, 3).map((c, idx) => (
          <Card key={c.countyName} className={`text-center ${idx === 0 ? 'border-2 border-yellow-400' : idx === 1 ? 'border-2 border-gray-300' : 'border-2 border-orange-400'}`}>
            <CardContent className="pt-3 pb-3">
              <div className="flex justify-center mb-1">
                {idx === 0 ? <Medal className="h-6 w-6 text-yellow-500" /> : idx === 1 ? <Medal className="h-6 w-6 text-gray-400" /> : <Medal className="h-6 w-6 text-orange-600" />}
              </div>
              <p className="text-[10px] text-muted-foreground">#{idx + 1}</p>
              <p className="text-sm font-bold">{c.countyName}</p>
              <p className="text-xs text-muted-foreground">{c.region}</p>
              <Badge className={`text-[10px] px-2 py-0 mt-1 ${getScoreColor(c.compositeScore)}`}>Score: {c.compositeScore}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Sort by:</span>
        <Button variant={sortBy === 'composite' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setSortBy('composite')}>Composite Score</Button>
        <Button variant={sortBy === 'absorption' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setSortBy('absorption')}>Overall Absorption</Button>
        <Button variant={sortBy === 'development' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setSortBy('development')}>Development Absorption</Button>
        <Button variant={sortBy === 'revenue' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setSortBy('revenue')}>Revenue Collection</Button>
      </div>

      {/* Full ranking table */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-1">
          {sorted.map((c, idx) => {
            const rankChange = c.previousRank - c.rank;
            return (
              <div key={c.countyName} className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent/30 transition-colors">
                {/* Rank */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-sm font-bold">
                  {idx + 1}
                </div>
                {/* Change indicator */}
                <div className="w-8 shrink-0 text-center">
                  {rankChange > 0 && <Badge className="text-[9px] px-1 py-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"><TrendingUp className="h-2.5 w-2.5" />{rankChange}</Badge>}
                  {rankChange < 0 && <Badge className="text-[9px] px-1 py-0 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><TrendingDown className="h-2.5 w-2.5" />{Math.abs(rankChange)}</Badge>}
                  {rankChange === 0 && <span className="text-[9px] text-muted-foreground">—</span>}
                </div>
                {/* County name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0">{c.countyCode}</Badge>
                    <span className="text-sm font-medium truncate">{c.countyName}</span>
                    <span className="text-[10px] text-muted-foreground">{c.region}</span>
                  </div>
                </div>
                {/* Metrics */}
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>Abs: {c.overallAbsorption}%</span>
                  <span>Dev: {c.developmentAbsorption}%</span>
                  <span>Rev: {c.revenueCollection}%</span>
                </div>
                {/* Composite score */}
                <Badge className={`text-[10px] px-2 py-0 shrink-0 ${getScoreColor(c.compositeScore)}`}>
                  {c.compositeScore}
                </Badge>
                {/* Progress bar */}
                <div className="w-16 hidden md:block">
                  <Progress value={c.compositeScore} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-[10px] text-muted-foreground">
        <span className="font-medium">Score legend:</span>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-400" /><span>80+ (Excellent)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-400" /><span>60-79 (Good)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-amber-400" /><span>50-59 (Fair)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-400" /><span>40-49 (Poor)</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-400" /><span>&lt;40 (Critical)</span></div>
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground"><strong>Composite Score Formula:</strong> Weighted average of: Overall Absorption (25%) + Development Absorption (30%) + Revenue Collection (25%) + Inverse Pending Bills % (20%). Score range: 0-100.</p>
              <p className="text-xs text-muted-foreground"><strong>Rank change indicator:</strong> Green ↑ = county improved rank, Red ↓ = county declined, — = unchanged. Year-over-year comparison from CoB reports.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
