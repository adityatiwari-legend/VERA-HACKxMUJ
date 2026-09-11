"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Lock, FileCheck, Eye, Check, Coins, ArrowRight } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HashDisplay } from "@/components/financial/HashDisplay";

/**
 * EscrowMilestoneTracker — component.md §3.3 (Composed on Surface)
 * Sleek, interactive, step-by-step milestone progress.
 */

export type MilestoneStatus =
  | "LOCKED"
  | "PROOF_SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "RELEASED";

export interface EscrowMilestone {
  id: number;
  title: string;
  budget: number;
  status: MilestoneStatus;
  signers: number;
  requiredSigners: number;
  txHash?: string;
}

export interface EscrowMilestoneTrackerProps {
  milestones: EscrowMilestone[];
  onAction?: (milestone: EscrowMilestone, action: string) => void;
  className?: string;
}

const statusMeta: Record<
  MilestoneStatus,
  { variant: "amber" | "indigo" | "cyan" | "emerald"; label: string; icon: React.ReactNode }
> = {
  LOCKED: { variant: "amber", label: "Locked", icon: <Lock className="w-3 h-3" /> },
  PROOF_SUBMITTED: { variant: "indigo", label: "Proof Submitted", icon: <FileCheck className="w-3 h-3" /> },
  UNDER_REVIEW: { variant: "cyan", label: "Under Review", icon: <Eye className="w-3 h-3" /> },
  APPROVED: { variant: "emerald", label: "Approved", icon: <Check className="w-3 h-3" /> },
  RELEASED: { variant: "emerald", label: "Released", icon: <Coins className="w-3 h-3" /> },
};

function actionFor(status: MilestoneStatus): string | null {
  switch (status) {
    case "LOCKED":
      return "Request Release";
    case "PROOF_SUBMITTED":
      return "Sign Approval";
    case "UNDER_REVIEW":
      return "Execute Release";
    case "APPROVED":
      return "Execute Release";
    default:
      return null;
  }
}

export function EscrowMilestoneTracker({
  milestones,
  onAction,
  className,
}: EscrowMilestoneTrackerProps) {
  const releasedCount = milestones.filter((m) => m.status === "RELEASED").length;
  const totalBudget = milestones.reduce((s, m) => s + m.budget, 0);

  return (
    <Surface variant="default" padding="lg" rounded="2xl" className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white tracking-tight">
            Escrow Milestone Pipeline
          </h3>
          <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
            {releasedCount} of {milestones.length} released · ₹{totalBudget.toLocaleString("en-IN")} total
          </p>
        </div>
        <Badge variant="emerald" size="sm" dot label="2/3 Multisig" />
      </div>

      {/* Pipeline */}
      <div className="space-y-3">
        {milestones.map((m, idx) => {
          const meta = statusMeta[m.status];
          const action = actionFor(m.status);
          const isReleased = m.status === "RELEASED";
          return (
            <div key={m.id} className="relative">
              <div className="flex items-stretch gap-4">
                {/* Node + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full border flex items-center justify-center shrink-0 font-mono text-xs font-semibold",
                      isReleased
                        ? "bg-brand-emerald-500/15 border-brand-emerald-500/40 text-brand-emerald-500"
                        : "bg-white/[0.04] border-white/[0.12] text-zinc-400"
                    )}
                  >
                    {isReleased ? <Check className="w-4 h-4" /> : idx + 1}
                  </div>
                  {idx < milestones.length - 1 && (
                    <div className="flex-1 w-px bg-white/[0.08] my-1" />
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-white">{m.title}</div>
                      <div className="font-mono text-[11px] text-zinc-500">
                        ₹{m.budget.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <Badge variant={meta.variant} size="xs" dot pulse={m.status === "UNDER_REVIEW"} icon={meta.icon} label={meta.label} />
                  </div>

                  {/* Sub-row */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                        Multisig
                      </span>
                      <span
                        className={cn(
                          "font-mono text-xs tabular-nums",
                          m.signers >= m.requiredSigners
                            ? "text-brand-emerald-500"
                            : "text-alert-amber-500"
                        )}
                      >
                        {m.signers}/{m.requiredSigners}
                      </span>
                      {m.txHash && <HashDisplay hash={m.txHash} type="tx" />}
                    </div>
                    {action && (
                      <Button
                        variant="outline"
                        size="xs"
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                        onClick={() => onAction?.(m, action)}
                      >
                        {action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Surface>
  );
}

export default EscrowMilestoneTracker;
