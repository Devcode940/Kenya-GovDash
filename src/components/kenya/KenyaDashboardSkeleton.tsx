'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// ==================== SKELETON LOADING STATES ====================

export function KenyaTreeSkeleton() {
  return (
    <div className="p-2 space-y-2">
      {/* National Level skeleton */}
      <Skeleton className="h-8 w-full rounded-md" />

      {/* County items skeleton */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-3 w-6 rounded" />
          <Skeleton className="h-4 w-[120px] rounded" />
          <Skeleton className="h-4 w-[40px] rounded ml-auto" />
          <Skeleton className="h-4 w-[30px] rounded" />
        </div>
      ))}

      <div className="text-center text-xs text-muted-foreground pt-2">
        Loading county data...
      </div>
    </div>
  );
}

export function KenyaDetailsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[180px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
          <Skeleton className="h-6 w-[80px] rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key details grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-[60px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          ))}
        </div>
        {/* Contact info */}
        <Skeleton className="h-4 w-full" />
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-[200px]" />
          ))}
        </div>
        {/* Biography */}
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}

export function KenyaScoreCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-[160px]" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Overall score */}
        <div className="flex items-center justify-between p-3 rounded-lg">
          <Skeleton className="h-4 w-[160px]" />
          <Skeleton className="h-8 w-[40px] rounded-md" />
        </div>
        {/* Individual metrics */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-[120px]" />
                <Skeleton className="h-4 w-[30px] rounded" />
              </div>
              <Skeleton className="h-2 w-full rounded" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function KenyaFiltersSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-9 w-full rounded-md" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-[130px] rounded-md" />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-[70px]" />
        <Skeleton className="h-2 flex-1 rounded" />
        <Skeleton className="h-3 w-[40px]" />
      </div>
    </div>
  );
}

export function KenyaAccountabilitySkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-[140px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-full rounded-md" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-4 w-[180px]" />
        </div>
      </CardContent>
    </Card>
  );
}
