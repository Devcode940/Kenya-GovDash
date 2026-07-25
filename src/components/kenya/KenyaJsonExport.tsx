'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Code, AlertCircle } from 'lucide-react';
import { generateJsonSchema } from '@/lib/kenya-data';

export function KenyaJsonExport() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDownload = () => {
    const schema = generateJsonSchema();
    const jsonStr = JSON.stringify(schema, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kenya-accountability-schema-v1.0.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const schemaPreview = JSON.stringify(generateJsonSchema(), null, 2);
  // Truncate preview for display
  const preview = schemaPreview.length > 5000
    ? schemaPreview.substring(0, 5000) + '\n\n... (truncated — download for full schema)'
    : schemaPreview;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Code className="h-3.5 w-3.5" />
          JSON Schema Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            JSON Data Schema — v1.0
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Download the complete accountability data schema with source citations, audit opinions, and data availability flags.
            </p>
            <Button onClick={handleDownload} className="gap-1">
              <Download className="h-4 w-4" />
              Download JSON
            </Button>
          </div>

          <div className="p-3 rounded-md bg-muted/50 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              This schema is designed to connect to live feeds from oagkenya.go.ke, cob.go.ke, and tikenya.org.
              Data gaps are explicitly marked. No estimates or approximations are included.
            </p>
          </div>

          <ScrollArea className="max-h-[400px]">
            <pre className="text-xs font-mono bg-muted/30 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
              {preview}
            </pre>
          </ScrollArea>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">Constitution Reference</p>
              <p>Constitution of Kenya 2010, Chapter 6 & 11</p>
            </div>
            <div>
              <p className="font-medium">Term</p>
              <p>2022–2027</p>
            </div>
            <div>
              <p className="font-medium">Source Feeds</p>
              <p>oagkenya.go.ke · cob.go.ke · tikenya.org · bajetihub.org</p>
            </div>
            <div>
              <p className="font-medium">Schema Version</p>
              <p>1.0</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
