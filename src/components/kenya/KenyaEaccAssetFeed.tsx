'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Shield, FileText, AlertTriangle, ExternalLink, Info,
  CheckCircle2, XCircle, Clock, Scale
} from 'lucide-react';
import { type EaccFeedPayload, type EaccAssetDeclaration, type EaccInvestigation, type EaccDeclarationStatus } from '@/lib/live-feeds/types';
import { getDeclarationStatusColor } from '@/lib/live-feeds/eacc-service';

// ==================== DECLARATION ROW ====================

function DeclarationRow({ declaration }: { declaration: EaccAssetDeclaration }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-muted">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{declaration.representativeName}</span>
          <Badge className={`${getDeclarationStatusColor(declaration.status)} text-[10px] px-2 py-0.5`}>
            {declaration.status}
          </Badge>
        </div>
        <span className="text-[11px] text-muted-foreground">{declaration.officialTitle}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-1">
        <span>County: {declaration.county}</span>
        <span>FY: {declaration.fy}</span>
        <span>Year: {declaration.declarationYear}</span>
      </div>

      {/* Individual amounts are always null (not publicly published) */}
      <div className="p-2 rounded border border-dashed border-muted-foreground/30 mt-1">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Declared Assets:</span>
            <span className="ml-1 italic text-muted-foreground">Not public</span>
          </div>
          <div>
            <span className="text-muted-foreground">Income:</span>
            <span className="ml-1 italic text-muted-foreground">Not public</span>
          </div>
          <div>
            <span className="text-muted-foreground">Liabilities:</span>
            <span className="ml-1 italic text-muted-foreground">Not public</span>
          </div>
          <div>
            <span className="text-muted-foreground">Net Worth:</span>
            <span className="ml-1 italic text-muted-foreground">Not public</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic mt-1">
          Individual amounts confidential per Leadership and Integrity Act (LIA) Section 26
        </p>
      </div>

      {/* Flags */}
      {declaration.flagReason && (
        <div className="mt-2 p-2 rounded border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Flag</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{declaration.flagReason}</p>
        </div>
      )}

      {/* Source */}
      <div className="mt-1 flex items-center gap-1">
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{declaration.source}</span>
        <a href={declaration.sourceUrl} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
          <ExternalLink className="h-2.5 w-2.5" />
          eacc.go.ke
        </a>
      </div>
    </div>
  );
}

// ==================== INVESTIGATION ROW ====================

function InvestigationRow({ investigation }: { investigation: EaccInvestigation }) {
  const statusColor = investigation.status === 'Under Investigation'
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    : investigation.status === 'Prosecuted'
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : investigation.status === 'Convicted'
        ? 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
        : investigation.status === 'Acquitted'
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-500';

  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-purple-200/50 dark:border-purple-800/50">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-purple-600" />
          <span className="text-sm font-semibold">{investigation.representativeName}</span>
          <Badge className={`${statusColor} text-[10px] px-2 py-0.5`}>
            {investigation.status}
          </Badge>
        </div>
        <span className="text-[11px] text-muted-foreground">{investigation.county}</span>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Case:</strong> {investigation.caseNumber}</p>
        <p><strong>Allegation:</strong> {investigation.allegationType}</p>
        <p><strong>Title:</strong> {investigation.officialTitle}</p>
        {investigation.initiatedDate && <p><strong>Initiated:</strong> {investigation.initiatedDate}</p>}
        {investigation.conclusionDate && <p><strong>Conclusion:</strong> {investigation.conclusionDate}</p>}
      </div>

      <div className="mt-1 flex items-center gap-1">
        <FileText className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{investigation.source}</span>
        <a href={investigation.sourceUrl} target="_blank" rel="noopener noreferrer"
          className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
          <ExternalLink className="h-2.5 w-2.5" />
          View
        </a>
      </div>
    </div>
  );
}

// ==================== MAIN EACC COMPONENT ====================

export function KenyaEaccAssetFeed({ feed }: { feed: EaccFeedPayload }) {
  const [activeTab, setActiveTab] = React.useState<'declarations' | 'investigations'>('declarations');

  return (
    <div className="space-y-3">
      {/* Tab selector */}
      <div className="flex items-center gap-2">
        <button
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'declarations'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          onClick={() => setActiveTab('declarations')}
        >
          <Shield className="h-3 w-3 inline mr-1" />
          Asset Declarations ({feed.assetDeclarations.length})
        </button>
        <button
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'investigations'
              ? 'bg-purple-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          onClick={() => setActiveTab('investigations')}
        >
          <Scale className="h-3 w-3 inline mr-1" />
          Investigations ({feed.investigations.length})
        </button>
      </div>

      <ScrollArea className="max-h-[300px]">
        {activeTab === 'declarations' && (
          <div className="space-y-2">
            {/* Constitutional mandate notice */}
            <div className="p-2 rounded border border-muted">
              <p className="text-[11px] text-muted-foreground">
                <strong>Constitution Article 79:</strong> The Ethics and Anti-Corruption Commission ensures
                compliance with Chapter 6 (Leadership and Integrity). All State Officers must declare their
                income, assets, and liabilities. EACC tracks compliance but individual amounts remain confidential.
              </p>
            </div>

            {/* Declarations list */}
            {feed.assetDeclarations.map((d, i) => (
              <DeclarationRow key={i} declaration={d} />
            ))}

            {feed.assetDeclarations.length === 0 && (
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No EACC asset declaration records found for this representative.
                </p>
                <p className="text-xs text-muted-foreground italic mt-1">
                  Individual declaration data is not publicly published by EACC.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'investigations' && (
          <div className="space-y-2">
            {feed.investigations.map((inv, i) => (
              <InvestigationRow key={i} investigation={inv} />
            ))}

            {feed.investigations.length === 0 && (
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Scale className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No EACC investigation records found.
                </p>
                <p className="text-xs text-muted-foreground italic mt-1">
                  Investigation data sourced from EACC annual reports and press releases.
                </p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Direct link to EACC */}
      <div className="flex items-center gap-2">
        <a href="https://eacc.go.ke/press-releases/" target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          EACC Press Releases
        </a>
        <a href="https://eacc.go.ke/reports/" target="_blank" rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          EACC Annual Reports
        </a>
      </div>
    </div>
  );
}
