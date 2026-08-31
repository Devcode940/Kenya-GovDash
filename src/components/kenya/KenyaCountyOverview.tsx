'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  User, MapPin, Shield, Building2, Users, Landmark,
  ChevronRight, Star, AlertCircle, Eye, Sparkles,
} from 'lucide-react';
import {
  type CountyData,
  type Representative,
  getCoalitionColor,
  getScoreBadgeClass,
  getAuditColor,
} from '@/lib/kenya-data';
import { KenyaOfficialsGrid } from './KenyaOfficialsGrid';

// ==================== TYPES ====================

interface KenyaCountyOverviewProps {
  county: CountyData;
  onSelectRepresentative: (rep: Representative) => void;
  onPin?: (repId: string) => void;
  onUnpin?: (repId: string) => void;
  isPinned?: (repId: string) => boolean;
  onRequestExpansion?: (countyName: string, sectionLabel: string) => void;
}

// ==================== OFFICIAL CARD ====================

function OfficialCard({
  rep,
  roleLabel,
  icon,
  onSelect,
  onPin,
  onUnpin,
  isPinned,
  compact = false,
}: {
  rep: Representative;
  roleLabel: string;
  icon: React.ReactNode;
  onSelect: (rep: Representative) => void;
  onPin?: (repId: string) => void;
  onUnpin?: (repId: string) => void;
  isPinned?: boolean;
  compact?: boolean;
}) {
  const overallScore = rep.scorecard.overallAccountability.score;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent/80 transition-colors border ${
        compact ? 'border-transparent hover:border-muted' : 'border bg-card'
      }`}
      onClick={() => onSelect(rep)}
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60">
        {icon}
      </div>

      {/* Name & Role */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-medium truncate ${compact ? 'text-sm' : 'text-base'}`}>{rep.fullName}</span>
          {overallScore !== null && (
            <Badge className={`${getScoreBadgeClass(overallScore)} text-[10px] px-1 py-0 border shrink-0`}>
              {overallScore}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">{roleLabel}</span>
          {rep.party && (
            <Badge className={`${getCoalitionColor(rep.coalition)} text-[10px] px-1.5 py-0 border shrink-0`}>
              {rep.party}
            </Badge>
          )}
        </div>
      </div>

      {/* Score bar (compact for overview) */}
      {!compact && overallScore !== null && (
        <div className="w-20 shrink-0">
          <Progress value={overallScore} className="h-2" />
        </div>
      )}

      {/* Pin button */}
      {onPin && onUnpin && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            if (isPinned) onUnpin(rep.id);
            else onPin(rep.id);
          }}
          aria-label={isPinned ? 'Unpin' : 'Pin for quick access'}
        >
          <Star className={`h-3.5 w-3.5 ${isPinned ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
        </Button>
      )}

      {/* View details arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}

// ==================== DATA GAP CARD ====================

function DataGapCard({
  title,
  icon,
  countyName,
}: {
  title: string;
  icon: React.ReactNode;
  countyName: string;
}) {
  return (
    <Card className="border border-dashed border-muted-foreground/40 bg-muted/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30">
          <AlertCircle className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Detailed {countyName} County official data not yet available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Individual names and contact details for {title.toLowerCase()} in {countyName} County
              are not publicly available in latest IEBC, OAG, or county government publications.
              As data becomes available from official sources, it will be added here.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== MAIN COMPONENT ====================

export function KenyaCountyOverview({
  county,
  onSelectRepresentative,
  onPin,
  onUnpin,
  isPinned,
  onRequestExpansion,
}: KenyaCountyOverviewProps) {
  const gov = county.governor;
  const govScore = gov.scorecard.overallAccountability.score;

  // Collect all key officials
  const keyOfficials: { rep: Representative; label: string; icon: React.ReactNode }[] = [
    { rep: gov, label: `Governor, ${county.name} County`, icon: <Shield className="h-4 w-4 text-primary" /> },
  ];

  if (county.deputyGovernor) {
    keyOfficials.push({
      rep: county.deputyGovernor,
      label: `Deputy Governor, ${county.name} County`,
      icon: <User className="h-4 w-4 text-muted-foreground" />,
    });
  }

  if (county.senator) {
    keyOfficials.push({
      rep: county.senator,
      label: `Senator, ${county.name} County`,
      icon: <Landmark className="h-4 w-4 text-blue-600" />,
    });
  }

  if (county.womanRep) {
    keyOfficials.push({
      rep: county.womanRep,
      label: `Woman Representative, ${county.name} County`,
      icon: <Users className="h-4 w-4 text-pink-600" />,
    });
  }

  // Audit opinion badge
  const auditType = gov.auditOpinion?.fy2023_24?.type;
  const auditBadge = auditType ? (
    <Badge className={`${getAuditColor(auditType)} text-[10px] px-2 py-0.5 border`}>
      OAG FY 2023/24: {auditType}
    </Badge>
  ) : null;

  return (
    <div className="space-y-4">
      {/* County Header Card */}
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {county.name} County
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                County Code {county.code} · {county.region} Region · Constitution of Kenya 2010, Chapter 11
              </p>
            </div>
            <div className="flex flex-col gap-1 items-end">
              {govScore !== null && (
                <Badge className={`${getScoreBadgeClass(govScore)} px-3 py-1 text-sm font-bold border-2`}>
                  Gov Score: {govScore}
                </Badge>
              )}
              {auditBadge}
              <Badge className={`${getCoalitionColor(gov.coalition)} text-xs px-2 py-1 border`}>
                {gov.coalition}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Governor score summary */}
          {govScore !== null && (
            <div className="flex items-center gap-2 mb-2">
              <Progress value={govScore} className="h-3 flex-1" />
              <span className="text-sm font-semibold">{govScore}/100</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Click any official below to view full details, contact info, scorecard, and accountability data.
          </p>
        </CardContent>
      </Card>

      {/* Key Officials Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            County Leadership & Elected Officials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {keyOfficials.map(({ rep, label, icon }) => (
            <OfficialCard
              key={rep.id}
              rep={rep}
              roleLabel={label}
              icon={icon}
              onSelect={onSelectRepresentative}
              onPin={onPin}
              onUnpin={onUnpin}
              isPinned={isPinned?.(rep.id)}
            />
          ))}
        </CardContent>
      </Card>

      {/* Officials Grid (MPs / MCAs / CECMs) — replaces separate list sections */}
      <KenyaOfficialsGrid
        countyName={county.name}
        constituencyMPs={county.constituencyMPs}
        electedMCAs={county.electedMCAs}
        nominatedMCAs={county.nominatedMCAs}
        cecms={county.cecms}
        onSelectRepresentative={onSelectRepresentative}
        onPin={onPin}
        onUnpin={onUnpin}
        isPinned={isPinned}
        onRequestExpansion={onRequestExpansion}
      />

      {/* County Assembly Speaker (if available, shown separately from grid) */}
      {(county.assemblySpeaker || county.deputySpeaker) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              County Assembly Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {county.assemblySpeaker && (
                <OfficialCard
                  rep={county.assemblySpeaker}
                  roleLabel="Assembly Speaker"
                  icon={<Building2 className="h-4 w-4 text-purple-600" />}
                  onSelect={onSelectRepresentative}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  isPinned={isPinned?.(county.assemblySpeaker.id)}
                  compact
                />
              )}
              {county.deputySpeaker && (
                <OfficialCard
                  rep={county.deputySpeaker}
                  roleLabel="Deputy Speaker"
                  icon={<User className="h-4 w-4 text-purple-400" />}
                  onSelect={onSelectRepresentative}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  isPinned={isPinned?.(county.deputySpeaker.id)}
                  compact
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other County Officials */}
      {(county.countySecretary || county.countyAttorney) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Other County Officials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {county.countySecretary && (
                <OfficialCard
                  rep={county.countySecretary}
                  roleLabel="County Secretary"
                  icon={<User className="h-4 w-4 text-muted-foreground" />}
                  onSelect={onSelectRepresentative}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  isPinned={isPinned?.(county.countySecretary.id)}
                  compact
                />
              )}
              {county.countyAttorney && (
                <OfficialCard
                  rep={county.countyAttorney}
                  roleLabel="County Attorney"
                  icon={<User className="h-4 w-4 text-muted-foreground" />}
                  onSelect={onSelectRepresentative}
                  onPin={onPin}
                  onUnpin={onUnpin}
                  isPinned={isPinned?.(county.countyAttorney.id)}
                  compact
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Gap Notice + Request Expansion CTA */}
      <div className="p-3 rounded-lg border border-dashed border-muted-foreground/30 space-y-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-xs text-muted-foreground">
            Officials without scores show &quot;N/A&quot; — data not publicly available in latest OAG/CoB/TI-Kenya reports.
            Click any official card to view their full profile, scorecard breakdown, and source citations.
            This platform is non-partisan: all data comes from constitutional oversight bodies.
          </p>
        </div>
        {onRequestExpansion && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-muted-foreground/20">
            <div className="flex items-center gap-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Want more detailed data for {county.name} County?</span>
            </div>
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => onRequestExpansion(county.name, 'Comprehensive county expansion')}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Request Expansion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
