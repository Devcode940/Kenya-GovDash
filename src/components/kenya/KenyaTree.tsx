'use client';

import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChevronRight, ChevronDown, Landmark, MapPin, User,
  Building2, Users, FileText, Shield
} from 'lucide-react';
import {
  buildAllCountyData,
  NATIONAL_SUMMARY,
  getCoalitionColor,
  getAuditColor,
  getScoreBadgeClass,
  filterCounties,
  type CountyData,
  type Representative,
  type FilterState,
  type CoalitionType,
} from '@/lib/kenya-data';

interface KenyaTreeProps {
  filters: FilterState;
  onSelectRepresentative: (rep: Representative) => void;
  onSelectCounty: (county: CountyData) => void;
  selectedId: string | null;
  selectedCountyName: string | null;
}

export function KenyaTree({ filters, onSelectRepresentative, onSelectCounty, selectedId, selectedCountyName }: KenyaTreeProps) {
  const [expandedCounties, setExpandedCounties] = useState<Set<string>>(new Set(['Kajiado']));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Kajiado-governor', 'Kajiado-assembly', 'Kajiado-cecms']));
  const [nationalExpanded, setNationalExpanded] = useState(false);

  const allCounties = useMemo(() => buildAllCountyData(), []);
  const filteredCounties = useMemo(() => filterCounties(allCounties, filters), [allCounties, filters]);

  const toggleCounty = (countyName: string) => {
    setExpandedCounties(prev => {
      const next = new Set(prev);
      if (next.has(countyName)) next.delete(countyName);
      else next.add(countyName);
      return next;
    });
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionKey)) next.delete(sectionKey);
      else next.add(sectionKey);
      return next;
    });
  };

  const isSelected = (id: string) => selectedId === id;
  const isCountySelected = (countyName: string) => selectedCountyName === countyName;

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {/* National Level */}
        <div className="mb-2">
          <div
            className={`flex items-center gap-1 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${isSelected(NATIONAL_SUMMARY.president.id) ? 'bg-accent ring-2 ring-primary' : ''}`}
            onClick={() => setNationalExpanded(!nationalExpanded)}
          >
            <Landmark className="h-4 w-4 text-primary" />
            {nationalExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="text-sm font-semibold">National Level</span>
          </div>

          {nationalExpanded && (
            <div className="ml-4 space-y-1 mt-1">
              {/* President */}
              <div
                className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors text-xs ${isSelected(NATIONAL_SUMMARY.president.id) ? 'bg-accent ring-1 ring-primary' : ''}`}
                onClick={() => onSelectRepresentative(NATIONAL_SUMMARY.president)}
              >
                <User className="h-3 w-3 text-primary" />
                <span className="font-medium truncate">{NATIONAL_SUMMARY.president.fullName}</span>
                <Badge className={`${getCoalitionColor(NATIONAL_SUMMARY.president.coalition)} text-[10px] px-1 py-0 border`}>
                  {NATIONAL_SUMMARY.president.party}
                </Badge>
              </div>

              {/* Deputy President */}
              <div
                className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors text-xs ${isSelected(NATIONAL_SUMMARY.deputyPresident.id) ? 'bg-accent ring-1 ring-primary' : ''}`}
                onClick={() => onSelectRepresentative(NATIONAL_SUMMARY.deputyPresident)}
              >
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium truncate">{NATIONAL_SUMMARY.deputyPresident.fullName}</span>
                <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-[10px] px-1 py-0 border border-red-300">
                  Impeached Oct 2024
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* 47 Counties */}
        <div className="space-y-0.5">
          {filteredCounties.map(county => {
            const isExpanded = expandedCounties.has(county.name);
            const gov = county.governor;
            const isKajiado = county.name === 'Kajiado';
            const overallScore = gov.scorecard.overallAccountability.score;

            return (
              <div key={county.code}>
                {/* County Header */}
                <div
                  className={`flex items-center gap-1 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${isCountySelected(county.name) ? 'bg-accent ring-2 ring-primary' : ''}`}
                  onClick={() => {
                    toggleCounty(county.name);
                    onSelectCounty(county);
                  }}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{county.code}</span>
                  <span className="text-sm font-medium truncate">{county.name}</span>
                  <Badge className={`${getCoalitionColor(gov.coalition)} text-[10px] px-1 py-0 border ml-auto`}>
                    {gov.party}
                  </Badge>
                  {gov.auditOpinion && (
                    <Badge className={`${getAuditColor(gov.auditOpinion.fy2023_24.type)} text-[10px] px-1 py-0`}>
                      {gov.auditOpinion.fy2023_24.type.substring(0, 3)}
                    </Badge>
                  )}
                  {overallScore !== null && (
                    <Badge className={`${getScoreBadgeClass(overallScore)} text-[10px] px-1 py-0 border`}>
                      {overallScore}
                    </Badge>
                  )}
                </div>

                {/* County Sub-levels */}
                {isExpanded && (
                  <div className="ml-4 space-y-0.5 mt-1">
                    {/* Governor */}
                    <SectionNode
                      label="Governor & Deputy"
                      icon={<User className="h-3 w-3" />}
                      sectionKey={`${county.name}-governor`}
                      isExpanded={expandedSections.has(`${county.name}-governor`)}
                      onToggle={toggleSection}
                      isKajiado={isKajiado}
                    >
                      <RepNode
                        rep={gov}
                        isSelected={isSelected(gov.id)}
                        onSelect={onSelectRepresentative}
                        showScore
                      />
                      {county.deputyGovernor && (
                        <RepNode
                          rep={county.deputyGovernor}
                          isSelected={isSelected(county.deputyGovernor.id)}
                          onSelect={onSelectRepresentative}
                        />
                      )}
                    </SectionNode>

                    {/* Senator & Woman Rep */}
                    <SectionNode
                      label="Senator & Woman Rep"
                      icon={<Building2 className="h-3 w-3" />}
                      sectionKey={`${county.name}-senate`}
                      isExpanded={expandedSections.has(`${county.name}-senate`)}
                      onToggle={toggleSection}
                      isKajiado={isKajiado}
                    >
                      {county.senator && (
                        <RepNode
                          rep={county.senator}
                          isSelected={isSelected(county.senator.id)}
                          onSelect={onSelectRepresentative}
                        />
                      )}
                      {county.womanRep && (
                        <RepNode
                          rep={county.womanRep}
                          isSelected={isSelected(county.womanRep.id)}
                          onSelect={onSelectRepresentative}
                        />
                      )}
                      {!isKajiado && !county.senator && (
                        <p className="text-xs text-muted-foreground italic p-1">Expand to load latest OAG/CoB data</p>
                      )}
                    </SectionNode>

                    {/* Constituency MPs */}
                    <SectionNode
                      label="Constituency MPs"
                      icon={<Users className="h-3 w-3" />}
                      sectionKey={`${county.name}-mps`}
                      isExpanded={expandedSections.has(`${county.name}-mps`)}
                      onToggle={toggleSection}
                      isKajiado={isKajiado}
                    >
                      {county.constituencyMPs ? county.constituencyMPs.map(mp => (
                        <RepNode
                          key={mp.id}
                          rep={mp}
                          isSelected={isSelected(mp.id)}
                          onSelect={onSelectRepresentative}
                        />
                      )) : (
                        <p className="text-xs text-muted-foreground italic p-1">Expand to load latest OAG/CoB data</p>
                      )}
                    </SectionNode>

                    {/* County Assembly */}
                    <SectionNode
                      label="County Assembly"
                      icon={<FileText className="h-3 w-3" />}
                      sectionKey={`${county.name}-assembly`}
                      isExpanded={expandedSections.has(`${county.name}-assembly`)}
                      onToggle={toggleSection}
                      isKajiado={isKajiado}
                    >
                      {county.assemblySpeaker && (
                        <RepNode
                          rep={county.assemblySpeaker}
                          isSelected={isSelected(county.assemblySpeaker.id)}
                          onSelect={onSelectRepresentative}
                          label="Speaker"
                        />
                      )}
                      {county.deputySpeaker && (
                        <RepNode
                          rep={county.deputySpeaker}
                          isSelected={isSelected(county.deputySpeaker.id)}
                          onSelect={onSelectRepresentative}
                          label="Deputy Speaker"
                        />
                      )}
                      {county.electedMCAs ? (
                        <div className="max-h-32 overflow-y-auto">
                          {county.electedMCAs.slice(0, 5).map(mca => (
                            <RepNode
                              key={mca.id}
                              rep={mca}
                              isSelected={isSelected(mca.id)}
                              onSelect={onSelectRepresentative}
                              compact
                            />
                          ))}
                          {county.electedMCAs.length > 5 && (
                            <p className="text-xs text-muted-foreground p-1">
                              +{county.electedMCAs.length - 5} more MCAs (click to view all)
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic p-1">Expand to load latest OAG/CoB data</p>
                      )}
                    </SectionNode>

                    {/* CECMs */}
                    <SectionNode
                      label="County Executive Committee"
                      icon={<Shield className="h-3 w-3" />}
                      sectionKey={`${county.name}-cecms`}
                      isExpanded={expandedSections.has(`${county.name}-cecms`)}
                      onToggle={toggleSection}
                      isKajiado={isKajiado}
                    >
                      {county.cecms ? county.cecms.map(cecm => (
                        <RepNode
                          key={cecm.id}
                          rep={cecm}
                          isSelected={isSelected(cecm.id)}
                          onSelect={onSelectRepresentative}
                          compact
                        />
                      )) : (
                        <p className="text-xs text-muted-foreground italic p-1">Expand to load latest OAG/CoB data</p>
                      )}
                    </SectionNode>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredCounties.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No counties match your filters</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

// Section Node Component
function SectionNode({
  label, icon, sectionKey, isExpanded, onToggle, isKajiado, children
}: {
  label: string;
  icon: React.ReactNode;
  sectionKey: string;
  isExpanded: boolean;
  onToggle: (key: string) => void;
  isKajiado: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className="flex items-center gap-1 p-1 rounded-md cursor-pointer hover:bg-accent/50 transition-colors text-xs"
        onClick={() => onToggle(sectionKey)}
      >
        {isExpanded ? <ChevronDown className="h-2.5 w-2.5" /> : <ChevronRight className="h-2.5 w-2.5" />}
        {icon}
        <span className="font-medium">{label}</span>
        {!isKajiado && !isExpanded && (
          <span className="text-[10px] text-muted-foreground ml-auto italic">Expand to load data</span>
        )}
      </div>
      {isExpanded && <div className="ml-3 space-y-0.5 mt-0.5">{children}</div>}
    </div>
  );
}

// Representative Node Component
function RepNode({
  rep, isSelected, onSelect, showScore, label, compact
}: {
  rep: Representative;
  isSelected: boolean;
  onSelect: (rep: Representative) => void;
  showScore?: boolean;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 p-1 rounded-md cursor-pointer hover:bg-accent transition-colors ${compact ? 'text-[11px]' : 'text-xs'} ${isSelected ? 'bg-accent ring-1 ring-primary' : ''}`}
      onClick={() => onSelect(rep)}
    >
      <User className={`${compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} text-muted-foreground`} />
      {label && <Badge className="text-[9px] px-0.5 py-0 bg-muted text-muted-foreground">{label}</Badge>}
      <span className="font-medium truncate">{rep.fullName}</span>
      {rep.party && (
        <Badge className={`${getCoalitionColor(rep.coalition)} text-[9px] px-0.5 py-0 border ml-auto`}>
          {rep.party}
        </Badge>
      )}
      {showScore && rep.scorecard.overallAccountability.score !== null && (
        <Badge className={`${getScoreBadgeClass(rep.scorecard.overallAccountability.score)} text-[9px] px-0.5 py-0 border`}>
          {rep.scorecard.overallAccountability.score}
        </Badge>
      )}
    </div>
  );
}
