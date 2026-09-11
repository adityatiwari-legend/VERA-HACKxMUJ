"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Wallet, Lock, Layers, ScanLine, ShieldCheck, Coins, Check } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/financial/ProgressBar";
import { BlockchainBadge } from "./BlockchainBadge";
import { HashDisplay } from "@/components/financial/HashDisplay";

/**
 * DonationJourneyTrace — component.md §3.8 (Composed on Surface variant="glass-dark")
 * Signature donor experience: "Where Did My Money Go?"
 */

export interface JourneyStage {
  key: string;
  title: string;
  description: string;
  amount?: number;
  txHash?: string;
  evidenceHash?: string;
}

export interface DonationJourneyTraceProps {
  donationAmount: number;
  campaign: string;
  stages: JourneyStage[];
  currentStageIndex: number;
  className?: string;
}

const stageIcons = [Wallet, Lock, Layers, ScanLine, ShieldCheck, Coins];

export function DonationJourneyTrace({
  donationAmount,
  campaign,
  stages,
  currentStageIndex,
  className,
}: DonationJourneyTraceProps) {
  const [openStage, setOpenStage] = useState<number | null>(null);

  return (
    <Surface
      variant="glass-dark"
      padding="xl"
      rounded="2xl"
      className={cn("vera-ambient-mesh space-y-6", className)}
    >
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <Badge variant="emerald" size="sm" dot pulse label="Live Trace" />
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Where Did My Money Go?
            </h2>
            <p className="font-mono text-xs text-zinc-400">
              {campaign} · ₹{donationAmount.toLocaleString("en-IN")} traced
            </p>
          </div>
        </div>

        {/* Pipeline */}
        <div className="relative">
          {/* connector line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/[0.08]" />
          <div
            className="absolute left-[19px] top-2 w-px bg-brand-emerald-500 transition-all duration-700"
            style={{ height: `calc(${(currentStageIndex / (stages.length - 1)) * 100}% )` }}
          />

          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const Icon = stageIcons[idx % stageIcons.length];
              const isDone = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isOpen = openStage === idx;
              const clickable = isDone || isCurrent;
              return (
                <div key={stage.key} className="relative flex gap-4">
                  <div
                    className={cn(
                      "shrink-0 z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all",
                      isDone && "bg-brand-emerald-500/15 border-brand-emerald-500 text-brand-emerald-500",
                      isCurrent && "bg-brand-emerald-500 border-brand-emerald-500 text-black animate-vera-node-pulse",
                      !isDone && !isCurrent && "bg-[#0C0C0E] border-white/[0.12] text-zinc-600"
                    )}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 pb-2 min-w-0">
                    <button
                      type="button"
                      disabled={!clickable}
                      onClick={() => clickable && setOpenStage(isOpen ? null : idx)}
                      className={cn(
                        "w-full text-left rounded-xl px-4 py-3 border transition-all",
                        isCurrent
                          ? "bg-white/[0.05] border-brand-emerald-500/30"
                          : isDone
                          ? "bg-white/[0.02] border-white/[0.08] hover:border-white/[0.16]"
                          : "bg-transparent border-white/[0.05] opacity-60",
                        clickable && "cursor-pointer",
                        !clickable && "cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm font-medium", isCurrent ? "text-white" : "text-zinc-300")}>
                          {stage.title}
                        </span>
                        {isCurrent ? (
                          <Badge variant="emerald" size="xs" dot pulse label="Active" />
                        ) : isDone ? (
                          <Badge variant="slate" size="xs" label="Done" />
                        ) : (
                          <Badge variant="slate" size="xs" label="Pending" />
                        )}
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">
                        {stage.description}
                      </p>
                    </button>

                    {isOpen && clickable && (
                      <div className="mt-2 ml-1 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                        {typeof stage.amount === "number" && (
                          <div className="font-mono text-sm text-white">
                            ₹{stage.amount.toLocaleString("en-IN")}
                          </div>
                        )}
                        {stage.txHash && (
                          <div className="flex items-center gap-2">
                            <BlockchainBadge txHash={stage.txHash} variant="compact" />
                          </div>
                        )}
                        {stage.evidenceHash && (
                          <HashDisplay hash={stage.evidenceHash} type="sha256" label="Evidence" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress summary */}
        <div className="pt-2 border-t border-white/[0.08]">
          <ProgressBar
            value={currentStageIndex}
            max={stages.length - 1}
            accent="emerald"
            showLabel
            label="Trace Progress"
          />
          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="sm">
              Download Trace PDF
            </Button>
          </div>
        </div>
      </div>
    </Surface>
  );
}

export default DonationJourneyTrace;
