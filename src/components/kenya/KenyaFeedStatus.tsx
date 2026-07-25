'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Wifi, WifiOff, Database, AlertTriangle, Clock } from 'lucide-react';
import { type FeedStatus } from '@/lib/live-feeds/types';

// ==================== COMPACT STATUS INDICATOR ====================

export function FeedStatusIndicator({ status, label }: { status: FeedStatus; label?: string }) {
  const iconMap = {
    live: <Wifi className="h-3 w-3 text-green-500" />,
    cached: <Database className="h-3 w-3 text-yellow-500" />,
    static: <WifiOff className="h-3 w-3 text-blue-500" />,
    unavailable: <Clock className="h-3 w-3 text-gray-400" />,
    error: <AlertTriangle className="h-3 w-3 text-red-500" />,
  };

  const colorMap = {
    live: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cached: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    static: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    unavailable: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${colorMap[status]} text-[10px] px-1.5 py-0.5 cursor-help flex items-center gap-1`}>
            {iconMap[status]}
            {label || status}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Data source status: {status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ==================== SOURCE CITATION BADGE ====================

export function SourceCitationBadge({
  source,
  fy,
  url,
  dataAvailable,
}: {
  source: string;
  fy?: string;
  url?: string;
  dataAvailable?: boolean;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`text-[10px] px-1.5 py-0.5 cursor-help ${
            dataAvailable
              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
              : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
          }`}>
            {dataAvailable ? '✓ Verified' : '⚠ Data Gap'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <p className="text-xs font-medium">{source}</p>
          {fy && <p className="text-xs text-muted-foreground">FY: {fy}</p>}
          {!dataAvailable && <p className="text-xs text-yellow-600 italic">Data not publicly available</p>}
          {url && (
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
              View source document
            </a>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ==================== HEADER FEED STATUS BAR ====================

export function KenyaFeedStatusBar() {
  // Compact inline status bar for the dashboard header
  const sources = [
    { id: 'oag', name: 'OAG', url: 'https://oagkenya.go.ke/category/reports/', status: 'cached' as FeedStatus },
    { id: 'cob', name: 'CoB', url: 'https://cob.go.ke/reports/', status: 'cached' as FeedStatus },
    { id: 'ti-kenya', name: 'TI-Kenya', url: 'https://tikenya.org/publications/', status: 'cached' as FeedStatus },
    { id: 'eacc', name: 'EACC', url: 'https://eacc.go.ke/reports/', status: 'cached' as FeedStatus },
  ];

  return (
    <div className="hidden md:flex items-center gap-1.5">
      {sources.map(s => (
        <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="group">
          <FeedStatusIndicator status={s.status} label={s.name} />
        </a>
      ))}
    </div>
  );
}
