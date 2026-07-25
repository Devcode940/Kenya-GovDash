'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  User, Phone, Mail, Globe, ExternalLink, Shield, MapPin,
  Calendar, Info, AlertCircle
} from 'lucide-react';
import { getCoalitionColor, type Representative } from '@/lib/kenya-data';

interface KenyaDetailsPanelProps {
  representative: Representative | null;
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div className="flex items-center gap-2 py-1">
      {icon}
      <span className="text-xs text-muted-foreground">{label}:</span>
      {value ? (
        <span className="text-xs font-medium">{value}</span>
      ) : (
        <span className="text-xs text-muted-foreground italic">Not publicly available</span>
      )}
    </div>
  );
}

export function KenyaDetailsPanel({ representative }: KenyaDetailsPanelProps) {
  if (!representative) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-muted-foreground">Select a Representative</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click on any node in the tree to view detailed information
          </p>
        </CardContent>
      </Card>
    );
  }

  const rep = representative;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{rep.fullName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{rep.officialTitle}</p>
          </div>
          <Badge className={`${getCoalitionColor(rep.coalition)} text-xs px-2 py-1 border`}>
            {rep.party} · {rep.coalition}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="text-sm font-medium">{rep.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Jurisdiction</p>
              <p className="text-sm font-medium">{rep.jurisdiction}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Term</p>
              <p className="text-sm font-medium">{rep.termStart} — {rep.termEnd}</p>
            </div>
          </div>
          {rep.votes && (
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Votes</p>
                <p className="text-sm font-medium">{rep.votes.toLocaleString()}</p>
                {rep.votesSource && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <ExternalLink className="h-2.5 w-2.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px]">
                        <p className="text-xs">Source: {rep.votesSource}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Contact Information */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <Phone className="h-4 w-4" />
            Contact Information
          </h4>
          <div className="space-y-0.5">
            <ContactRow icon={<Mail className="h-3 w-3" />} label="Email" value={rep.contacts.email} />
            <ContactRow icon={<Phone className="h-3 w-3" />} label="Phone" value={rep.contacts.phone} />
            <ContactRow icon={<User className="h-3 w-3" />} label="X (Twitter)" value={rep.contacts.twitter} />
            <ContactRow icon={<Globe className="h-3 w-3" />} label="Website" value={rep.contacts.website} />
          </div>
        </div>

        <Separator />

        {/* Biography */}
        <div>
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <Info className="h-4 w-4" />
            Biography
          </h4>
          {rep.biography ? (
            <div>
              <p className="text-sm leading-relaxed">{rep.biography}</p>
              {rep.biographySource && (
                <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  Source: {rep.biographySource}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground italic">
                Biography not available from official sources
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
