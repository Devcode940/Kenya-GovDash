'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Award, Shield, DollarSign, Users, Building2, Scale,
  TrendingUp, MapPin, Info, Star,
} from 'lucide-react';

interface DimensionScore {
  name: string;
  icon: React.ReactNode;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

interface CountyIndex {
  rank: number;
  countyName: string;
  countyCode: number;
  region: string;
  overallScore: number;
  grade: string;
  dimensions: DimensionScore[];
  change: number; // vs last year
  topStrength: string;
  topWeakness: string;
}

const COUNTIES: CountyIndex[] = [
  {
    rank: 1, countyName: 'Kajiado', countyCode: 34, region: 'Rift Valley', overallScore: 82, grade: 'A-', change: 4,
    dimensions: [
      { name: 'Fiscal Management', icon: <DollarSign className="h-3.5 w-3.5" />, score: 85, maxScore: 100, status: 'excellent' },
      { name: 'Service Delivery', icon: <Building2 className="h-3.5 w-3.5" />, score: 78, maxScore: 100, status: 'good' },
      { name: 'Transparency', icon: <Shield className="h-3.5 w-3.5" />, score: 88, maxScore: 100, status: 'excellent' },
      { name: 'Public Participation', icon: <Users className="h-3.5 w-3.5" />, score: 82, maxScore: 100, status: 'good' },
      { name: 'Audit Compliance', icon: <Scale className="h-3.5 w-3.5" />, score: 80, maxScore: 100, status: 'good' },
    ],
    topStrength: 'Highest budget transparency (CBTS 74/100)',
    topWeakness: 'Limited own-source revenue (Kshs 1,380M)',
  },
  {
    rank: 2, countyName: 'Nyeri', countyCode: 19, region: 'Central', overallScore: 78, grade: 'B+', change: 0,
    dimensions: [
      { name: 'Fiscal Management', icon: <DollarSign className="h-3.5 w-3.5" />, score: 82, maxScore: 100, status: 'good' },
      { name: 'Service Delivery', icon: <Building2 className="h-3.5 w-3.5" />, score: 75, maxScore: 100, status: 'good' },
      { name: 'Transparency', icon: <Shield className="h-3.5 w-3.5" />, score: 80, maxScore: 100, status: 'good' },
      { name: 'Public Participation', icon: <Users className="h-3.5 w-3.5" />, score: 72, maxScore: 100, status: 'good' },
      { name: 'Audit Compliance', icon: <Scale className="h-3.5 w-3.5" />, score: 82, maxScore: 100, status: 'good' },
    ],
    topStrength: 'Strong audit compliance — clean Qualified opinion',
    topWeakness: 'Moderate development absorption (68.5%)',
  },
  {
    rank: 3, countyName: 'Kisumu', countyCode: 42, region: 'Nyanza', overallScore: 68, grade: 'B', change: 2,
    dimensions: [
      { name: 'Fiscal Management', icon: <DollarSign className="h-3.5 w-3.5" />, score: 75, maxScore: 100, status: 'good' },
      { name: 'Service Delivery', icon: <Building2 className="h-3.5 w-3.5" />, score: 68, maxScore: 100, status: 'fair' },
      { name: 'Transparency', icon: <Shield className="h-3.5 w-3.5" />, score: 65, maxScore: 100, status: 'fair' },
      { name: 'Public Participation', icon: <Users className="h-3.5 w-3.5" />, score: 72, maxScore: 100, status: 'good' },
      { name: 'Audit Compliance', icon: <Scale className="h-3.5 w-3.5" />, score: 60, maxScore: 100, status: 'fair' },
    ],
    topStrength: 'High public participation (89% attendance)',
    topWeakness: 'Moderate pending bills (9.2% of budget)',
  },
  {
    rank: 4, countyName: 'Nairobi City', countyCode: 47, region: 'Nairobi', overallScore: 52, grade: 'C+', change: -3,
    dimensions: [
      { name: 'Fiscal Management', icon: <DollarSign className="h-3.5 w-3.5" />, score: 55, maxScore: 100, status: 'fair' },
      { name: 'Service Delivery', icon: <Building2 className="h-3.5 w-3.5" />, score: 48, maxScore: 100, status: 'poor' },
      { name: 'Transparency', icon: <Shield className="h-3.5 w-3.5" />, score: 50, maxScore: 100, status: 'fair' },
      { name: 'Public Participation', icon: <Users className="h-3.5 w-3.5" />, score: 58, maxScore: 100, status: 'fair' },
      { name: 'Audit Compliance', icon: <Scale className="h-3.5 w-3.5" />, score: 48, maxScore: 100, status: 'poor' },
    ],
    topStrength: 'Largest revenue base (Kshs 12.2B own-source)',
    topWeakness: 'Kshs 4.31B pending bills (11.2% of budget) — critical',
  },
  {
    rank: 5, countyName: 'Mombasa', countyCode: 1, region: 'Coast', overallScore: 48, grade: 'C', change: -2,
    dimensions: [
      { name: 'Fiscal Management', icon: <DollarSign className="h-3.5 w-3.5" />, score: 45, maxScore: 100, status: 'poor' },
      { name: 'Service Delivery', icon: <Building2 className="h-3.5 w-3.5" />, score: 42, maxScore: 100, status: 'poor' },
      { name: 'Transparency', icon: <Shield className="h-3.5 w-3.5" />, score: 50, maxScore: 100, status: 'fair' },
      { name: 'Public Participation', icon: <Users className="h-3.5 w-3.5" />, score: 70, maxScore: 100, status: 'good' },
      { name: 'Audit Compliance', icon: <Scale className="h-3.5 w-3.5" />, score: 33, maxScore: 100, status: 'critical' },
    ],
    topStrength: 'Decent public participation (70% attendance)',
    topWeakness: '14.2% pending bills — debt service at 30.9% (PFM breach)',
  },
  {
    rank: 6, countyName: 'Bungoma', countyCode: 39, region: 'Western', overallScore: 45, grade: 'C-', change: 1,
    dimensions: [
      { name: 'Fiscal Management', icon: <DollarSign className="h-3.5 w-3.5" />, score: 40, maxScore: 100, status: 'poor' },
      { name: 'Service Delivery', icon: <Building2 className="h-3.5 w-3.5" />, score: 45, maxScore: 100, status: 'poor' },
      { name: 'Transparency', icon: <Shield className="h-3.5 w-3.5" />, score: 42, maxScore: 100, status: 'poor' },
      { name: 'Public Participation', icon: <Users className="h-3.5 w-3.5" />, score: 43, maxScore: 100, status: 'poor' },
      { name: 'Audit Compliance', icon: <Scale className="h-3.5 w-3.5" />, score: 55, maxScore: 100, status: 'fair' },
    ],
    topStrength: 'Improving trend (+1 rank)',
    topWeakness: '52% revenue shortfall — worst revenue collection',
  },
];

const STATUS_COLORS: Record<string, string> = {
  excellent: 'bg-emerald-500',
  good: 'bg-blue-500',
  fair: 'bg-amber-500',
  poor: 'bg-orange-500',
  critical: 'bg-red-500',
};

export function KenyaPerformanceIndex() {
  const [selected, setSelected] = useState<CountyIndex | null>(COUNTIES[0]);

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-purple-300 dark:border-purple-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            County Performance Index
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Composite scoring across 5 dimensions: Fiscal Management, Service Delivery,
            Transparency, Public Participation, and Audit Compliance. Grades from A+ to F
            based on constitutional oversight body assessments.
          </p>
        </CardHeader>
      </Card>

      {/* Ranking list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">County Rankings</h3>
          <ScrollArea className="max-h-[500px]">
            <div className="space-y-1">
              {COUNTIES.map((c, idx) => (
                <button
                  key={c.countyName}
                  onClick={() => setSelected(c)}
                  className={`w-full flex items-center gap-2 p-2 rounded-md border transition-colors text-left ${selected?.countyName === c.countyName ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/30'}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60 text-sm font-bold">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{c.countyName}</span>
                    <span className="text-[10px] text-muted-foreground ml-1">{c.region}</span>
                  </div>
                  <Badge className={`text-[10px] px-2 py-0 shrink-0 ${c.overallScore >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : c.overallScore >= 60 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : c.overallScore >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}>
                    {c.grade}
                  </Badge>
                  <span className="text-sm font-bold w-8 text-right shrink-0">{c.overallScore}</span>
                  <div className="w-12 shrink-0">
                    <Progress value={c.overallScore} className="h-2" />
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Detail panel */}
        {selected && (
          <div>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {selected.countyName} County
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Code {selected.countyCode} · {selected.region}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{selected.overallScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                    <Badge className={`text-xs px-2 py-0 ${selected.overallScore >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : selected.overallScore >= 60 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : selected.overallScore >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'}`}>
                      Grade: {selected.grade}
                    </Badge>
                    <div className="flex items-center justify-end gap-0.5 mt-1">
                      {selected.change > 0 ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : selected.change < 0 ? <TrendingUp className="h-3 w-3 text-red-600 rotate-180" /> : null}
                      <span className={`text-[10px] ${selected.change > 0 ? 'text-emerald-600' : selected.change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                        {selected.change > 0 ? '+' : ''}{selected.change} vs last year
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {selected.dimensions.map(dim => (
                  <div key={dim.name}>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="flex items-center gap-1.5">{dim.icon}{dim.name}</span>
                      <span className="font-medium">{dim.score}/100</span>
                    </div>
                    <Progress value={dim.score} className={`h-2 [&>div]:${STATUS_COLORS[dim.status]}`} />
                  </div>
                ))}

                <div className="mt-3 p-2 rounded-md bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300"><strong>Strength:</strong> {selected.topStrength}</p>
                </div>
                <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <p className="text-[11px] text-red-700 dark:text-red-300"><strong>Weakness:</strong> {selected.topWeakness}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground"><strong>Scoring dimensions (20% each):</strong></p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]"><DollarSign className="h-2.5 w-2.5 mr-0.5" />Fiscal Management: Budget absorption, revenue collection, debt service ratio</Badge>
                <Badge variant="outline" className="text-[10px]"><Building2 className="h-2.5 w-2.5 mr-0.5" />Service Delivery: Project completion, health/education metrics</Badge>
                <Badge variant="outline" className="text-[10px]"><Shield className="h-2.5 w-2.5 mr-0.5" />Transparency: CBTS score, document publication, data availability</Badge>
                <Badge variant="outline" className="text-[10px]"><Users className="h-2.5 w-2.5 mr-0.5" />Public Participation: Attendance, comment incorporation, inclusivity</Badge>
                <Badge variant="outline" className="text-[10px]"><Scale className="h-2.5 w-2.5 mr-0.5" />Audit Compliance: OAG opinion quality, recommendation implementation</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground italic mt-1">Grading: A+ (90+), A (85-89), A- (80-84), B+ (75-79), B (70-74), B- (65-69), C+ (60-64), C (55-59), C- (50-54), D (40-49), F (&lt;40)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
