'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users, MessageCircle, MapPin, Calendar, Clock,
  CheckCircle2, AlertCircle, Filter, Info, Building2, Megaphone,
} from 'lucide-react';

interface ParticipationRecord {
  id: string;
  countyName: string;
  eventTitle: string;
  eventType: 'budget_hearing' | 'CIDP_review' | 'ADP_consultation' | 'CFSP_forum' | 'CBROP_review';
  eventDate: string;
  attendeesRegistered: number;
  attendeesActual: number;
  attendancePct: number;
  commentsSubmitted: number;
  commentsIncorporated: number;
  incorporationPct: number;
  status: 'completed' | 'upcoming' | 'cancelled';
  genderBreakdown: { male: number; female: number; youth: number; pwd: number };
  constitutionalRef: string;
}

const PARTICIPATION_DATA: ParticipationRecord[] = [
  { id: 'p1', countyName: 'Nairobi City', eventTitle: 'FY 2025/26 Budget Hearing — North', eventType: 'budget_hearing', eventDate: '2025-04-15', attendeesRegistered: 450, attendeesActual: 380, attendancePct: 84, commentsSubmitted: 125, commentsIncorporated: 42, incorporationPct: 34, status: 'completed', genderBreakdown: { male: 220, female: 160, youth: 85, pwd: 12 }, constitutionalRef: 'Article 196 — Public Participation' },
  { id: 'p2', countyName: 'Mombasa', eventTitle: 'CIDP 2024-2028 Review Forum', eventType: 'CIDP_review', eventDate: '2025-03-20', attendeesRegistered: 280, attendeesActual: 195, attendancePct: 70, commentsSubmitted: 78, commentsIncorporated: 25, incorporationPct: 32, status: 'completed', genderBreakdown: { male: 120, female: 75, youth: 45, pwd: 8 }, constitutionalRef: 'Article 10 — Public Participation' },
  { id: 'p3', countyName: 'Kisumu', eventTitle: 'Annual Development Plan Consultation', eventType: 'ADP_consultation', eventDate: '2025-05-10', attendeesRegistered: 320, attendeesActual: 285, attendancePct: 89, commentsSubmitted: 95, commentsIncorporated: 58, incorporationPct: 61, status: 'completed', genderBreakdown: { male: 160, female: 125, youth: 70, pwd: 10 }, constitutionalRef: 'Article 196 — Budget Process' },
  { id: 'p4', countyName: 'Nakuru', eventTitle: 'CFSP Public Forum — FY 2025/26', eventType: 'CFSP_forum', eventDate: '2025-04-22', attendeesRegistered: 380, attendeesActual: 310, attendancePct: 82, commentsSubmitted: 110, commentsIncorporated: 35, incorporationPct: 32, status: 'completed', genderBreakdown: { male: 180, female: 130, youth: 60, pwd: 15 }, constitutionalRef: 'PFM Act 2015 — CFSP Consultation' },
  { id: 'p5', countyName: 'Kajiado', eventTitle: 'Ward-level Budget Consultation', eventType: 'budget_hearing', eventDate: '2025-04-30', attendeesRegistered: 220, attendeesActual: 205, attendancePct: 93, commentsSubmitted: 88, commentsIncorporated: 72, incorporationPct: 82, status: 'completed', genderBreakdown: { male: 110, female: 95, youth: 55, pwd: 6 }, constitutionalRef: 'Article 196 — Public Participation' },
  { id: 'p6', countyName: 'Kiambu', eventTitle: 'County Fiscal Strategy Paper Forum', eventType: 'CFSP_forum', eventDate: '2025-05-15', attendeesRegistered: 350, attendeesActual: 220, attendancePct: 63, commentsSubmitted: 65, commentsIncorporated: 12, incorporationPct: 18, status: 'completed', genderBreakdown: { male: 140, female: 80, youth: 35, pwd: 5 }, constitutionalRef: 'PFM Act 2015 — CFSP Consultation' },
  { id: 'p7', countyName: 'Machakos', eventTitle: 'CBROP 2024 Public Review', eventType: 'CBROP_review', eventDate: '2025-09-15', attendeesRegistered: 180, attendeesActual: 0, attendancePct: 0, commentsSubmitted: 0, commentsIncorporated: 0, incorporationPct: 0, status: 'upcoming', genderBreakdown: { male: 0, female: 0, youth: 0, pwd: 0 }, constitutionalRef: 'PFM Act 2015 — CBROP Review' },
  { id: 'p8', countyName: 'Kakamega', eventTitle: 'FY 2025/26 Budget Hearing — East', eventType: 'budget_hearing', eventDate: '2025-04-18', attendeesRegistered: 290, attendeesActual: 240, attendancePct: 83, commentsSubmitted: 82, commentsIncorporated: 28, incorporationPct: 34, status: 'completed', genderBreakdown: { male: 140, female: 100, youth: 50, pwd: 8 }, constitutionalRef: 'Article 196 — Public Participation' },
  { id: 'p9', countyName: 'Meru', eventTitle: 'CIDP Mid-Term Review Forum', eventType: 'CIDP_review', eventDate: '2025-03-12', attendeesRegistered: 250, attendeesActual: 198, attendancePct: 79, commentsSubmitted: 70, commentsIncorporated: 45, incorporationPct: 64, status: 'completed', genderBreakdown: { male: 115, female: 83, youth: 40, pwd: 7 }, constitutionalRef: 'Article 10 — Public Participation' },
  { id: 'p10', countyName: 'Bungoma', eventTitle: 'ADP 2025/26 Sub-County Consultation', eventType: 'ADP_consultation', eventDate: '2025-05-20', attendeesRegistered: 200, attendeesActual: 85, attendancePct: 43, commentsSubmitted: 25, commentsIncorporated: 5, incorporationPct: 20, status: 'completed', genderBreakdown: { male: 55, female: 30, youth: 15, pwd: 3 }, constitutionalRef: 'Article 196 — Budget Process' },
];

const EVENT_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  budget_hearing: { label: 'Budget Hearing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: <Building2 className="h-3 w-3" /> },
  CIDP_review: { label: 'CIDP Review', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200', icon: <Calendar className="h-3 w-3" /> },
  ADP_consultation: { label: 'ADP Consultation', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200', icon: <Users className="h-3 w-3" /> },
  CFSP_forum: { label: 'CFSP Forum', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: <Megaphone className="h-3 w-3" /> },
  CBROP_review: { label: 'CBROP Review', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', icon: <CheckCircle2 className="h-3 w-3" /> },
};

export function KenyaPublicParticipation() {
  const [filter, setFilter] = useState('all');

  const filtered = PARTICIPATION_DATA.filter(p => filter === 'all' || p.eventType === filter);

  const stats = {
    totalEvents: PARTICIPATION_DATA.length,
    completed: PARTICIPATION_DATA.filter(p => p.status === 'completed').length,
    totalAttendees: PARTICIPATION_DATA.reduce((s, p) => s + p.attendeesActual, 0),
    totalComments: PARTICIPATION_DATA.reduce((s, p) => s + p.commentsSubmitted, 0),
    avgIncorporation: Math.round(PARTICIPATION_DATA.filter(p => p.status === 'completed').reduce((s, p) => s + p.incorporationPct, 0) / PARTICIPATION_DATA.filter(p => p.status === 'completed').length),
  };

  return (
    <div className="space-y-4 p-4">
      <Card className="border-2 border-blue-300 dark:border-blue-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Public Participation Tracker
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track citizen participation in county budget hearings, CIDP reviews, ADP consultations,
            and CFSP forums. Measure attendance rates, comments submitted vs incorporated, and
            inclusivity (gender, youth, persons with disabilities).
          </p>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-[10px] w-fit gap-1">
            <Users className="h-2.5 w-2.5" /> Article 196 — Public Participation in Budget Process
          </Badge>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-blue-500"><CardContent className="pt-3 pb-3"><Users className="h-3.5 w-3.5 text-blue-600 mb-1" /><p className="text-lg font-bold text-blue-600">{stats.totalAttendees}</p><p className="text-[10px] text-muted-foreground">Total Attendees</p></CardContent></Card>
        <Card className="border-l-4 border-l-emerald-500"><CardContent className="pt-3 pb-3"><MessageCircle className="h-3.5 w-3.5 text-emerald-600 mb-1" /><p className="text-lg font-bold text-emerald-600">{stats.totalComments}</p><p className="text-[10px] text-muted-foreground">Comments Submitted</p></CardContent></Card>
        <Card className="border-l-4 border-l-amber-500"><CardContent className="pt-3 pb-3"><CheckCircle2 className="h-3.5 w-3.5 text-amber-600 mb-1" /><p className="text-lg font-bold text-amber-600">{stats.avgIncorporation}%</p><p className="text-[10px] text-muted-foreground">Avg Comment Incorporation</p></CardContent></Card>
        <Card className="border-l-4 border-l-purple-500"><CardContent className="pt-3 pb-3"><Calendar className="h-3.5 w-3.5 text-purple-600 mb-1" /><p className="text-lg font-bold text-purple-600">{stats.completed}/{stats.totalEvents}</p><p className="text-[10px] text-muted-foreground">Events Completed</p></CardContent></Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => setFilter('all')}>All Types</Button>
        {Object.entries(EVENT_TYPE_CONFIG).map(([key, cfg]) => <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" className="h-7 text-xs gap-1" onClick={() => setFilter(key)}>{cfg.icon}{cfg.label}</Button>)}
      </div>

      {/* Records */}
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-2">
          {filtered.map(p => {
            const eventCfg = EVENT_TYPE_CONFIG[p.eventType];
            return (
              <Card key={p.id} className={`border-l-4 ${p.status === 'upcoming' ? 'border-l-blue-500 opacity-70' : p.incorporationPct > 50 ? 'border-l-emerald-500' : p.incorporationPct < 25 ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium">{p.eventTitle}</h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[9px] px-1 py-0"><MapPin className="h-2.5 w-2.5 mr-0.5" />{p.countyName}</Badge>
                        <Badge className={`text-[9px] px-1.5 py-0 ${eventCfg.color}`}>{eventCfg.icon}<span className="ml-0.5">{eventCfg.label}</span></Badge>
                        {p.status === 'upcoming' && <Badge className="text-[9px] px-1.5 py-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><Clock className="h-2.5 w-2.5 mr-0.5" />Upcoming</Badge>}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{new Date(p.eventDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  {p.status === 'completed' ? (
                    <>
                      {/* Attendance */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Attendance: {p.attendeesActual} / {p.attendeesRegistered}</span>
                          <span className="font-medium">{p.attendancePct}%</span>
                        </div>
                        <Progress value={p.attendancePct} className="h-1.5" />
                      </div>

                      {/* Comments incorporation */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground">Comments incorporated: {p.commentsIncorporated} / {p.commentsSubmitted}</span>
                          <span className={`font-medium ${p.incorporationPct > 50 ? 'text-emerald-600' : p.incorporationPct < 25 ? 'text-red-600' : 'text-amber-600'}`}>{p.incorporationPct}%</span>
                        </div>
                        <Progress value={p.incorporationPct} className={`h-1.5 ${p.incorporationPct < 25 ? '[&>div]:bg-red-500' : p.incorporationPct > 50 ? '[&>div]:bg-emerald-500' : ''}`} />
                      </div>

                      {/* Inclusivity */}
                      <div className="flex items-center gap-2 mt-2 text-[10px]">
                        <span className="text-muted-foreground">Inclusivity:</span>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">Male: {p.genderBreakdown.male}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">Female: {p.genderBreakdown.female}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">Youth: {p.genderBreakdown.youth}</Badge>
                        <Badge variant="outline" className="text-[9px] px-1 py-0">PWD: {p.genderBreakdown.pwd}</Badge>
                      </div>

                      {/* Low incorporation warning */}
                      {p.incorporationPct < 25 && (
                        <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                          <AlertCircle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-red-700 dark:text-red-300">Low incorporation rate ({p.incorporationPct}%) — citizen input may be ceremonial rather than meaningful. Constitution requires genuine participation, not just attendance.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-2 p-2 rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                      <Clock className="h-3 w-3 text-blue-600 shrink-0" />
                      <p className="text-[10px] text-blue-700 dark:text-blue-300">Scheduled for {new Date(p.eventDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  )}

                  <p className="text-[9px] text-muted-foreground italic mt-1.5">{p.constitutionalRef}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <Card className="border-dashed">
        <CardContent className="pt-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground"><strong>Why this matters:</strong> Article 196 of the Constitution requires counties to facilitate public participation in the budget process. The PFM Act 2015 mandates specific forums: CFSP, ADP, CIDP, and CBROP consultations. Low comment incorporation rates (&lt;25%) suggest participation is performative — citizens attend but their input is ignored.</p>
              <p className="text-xs text-muted-foreground"><strong>Inclusivity check:</strong> Gender parity (Article 27 — not more than two-thirds of one gender), youth representation (Article 55 — 60% of population), and persons with disabilities (Article 54) must be actively included in all participation forums.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
