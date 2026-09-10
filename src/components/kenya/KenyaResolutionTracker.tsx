'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export function KenyaResolutionTracker() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Panel</CardTitle></CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 p-4 rounded-md bg-muted/30">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">This panel is being loaded...</p>
        </div>
      </CardContent>
    </Card>
  );
}
