"use client";

import { FileText, AlertTriangle, Shield, DollarSign, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type Representative, type ProcurementContract, procurementContracts, getProcurementForRep } from "@/lib/data";

function contractStatusColor(status: string): string {
  if (status === "Active") return "#22c55e";
  if (status === "Completed") return "#3b82f6";
  if (status === "Under Review") return "#eab308";
  if (status === "Cancelled") return "#ef4444";
  return "#94a3b8";
}

export function ProcurementTransparency({ rep }: { rep: Representative }) {
  const contracts = getProcurementForRep(rep.id);
  const allContracts = procurementContracts;

  // Summary stats across all
  const totalContracts = allContracts.length;
  const flaggedContracts = allContracts.filter((c) => c.flagged).length;
  const singleSourceContracts = allContracts.filter((c) => c.isSingleSource).length;
  const totalOverpricing = allContracts.reduce((sum, c) => sum + (c.contractAmount - c.marketRateEstimate), 0);

  return (
    <div className="space-y-4">
      {/* Global Summary */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">Procurement Overview</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/15">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Total Contracts</div>
              <div className="text-sm font-bold">{totalContracts}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Flagged</div>
              <div className="text-sm font-bold text-red-500">{flaggedContracts}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/15">
              <Shield className="h-3.5 w-3.5 text-yellow-500" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Single-Source</div>
              <div className="text-sm font-bold text-yellow-500">{singleSourceContracts}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/15">
              <DollarSign className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground">Total Overpricing</div>
              <div className="text-sm font-bold text-orange-500">${totalOverpricing.toLocaleString()}M</div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Rep-specific Contracts */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground">Contracts for {rep.name}</h4>
        {contracts.length > 0 ? (
          contracts.map((contract) => (
            <div key={contract.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{contract.projectName}</span>
                    {contract.flagged && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-red-500 text-red-500">
                        ⚠ Flagged
                      </Badge>
                    )}
                    {contract.isSingleSource && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-yellow-500 text-yellow-500">
                        Single-Source
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4" style={{ borderColor: contractStatusColor(contract.status), color: contractStatusColor(contract.status) }}>
                      {contract.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {contract.bidder} • {contract.awardDate}
                  </div>
                </div>
              </div>
              {/* Overprice ratio visual */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-muted-foreground">Contract: ${contract.contractAmount}M</span>
                  <span className="text-muted-foreground">Market: ${contract.marketRateEstimate}M</span>
                  <span className="font-bold" style={{ color: contract.overpriceRatio > 1.5 ? "#ef4444" : contract.overpriceRatio > 1.2 ? "#eab308" : "#22c55e" }}>
                    Ratio: {contract.overpriceRatio.toFixed(2)}x
                  </span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/40">
                  <div className="h-full rounded-full bg-green-500/60" style={{ width: `${Math.min((contract.marketRateEstimate / contract.contractAmount) * 100, 100)}%` }} />
                  <div className="h-full rounded-full absolute top-0 left-0" style={{ width: "100%", backgroundColor: contract.overpriceRatio > 1.5 ? "#ef444480" : contract.overpriceRatio > 1.2 ? "#eab30880" : "#22c55e80" }} />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border bg-card p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No procurement contracts linked to this representative</p>
          </div>
        )}
      </div>
    </div>
  );
}
