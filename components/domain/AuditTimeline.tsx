"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Lock, Coins, FileCheck, Gift, ChevronRight } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { HashDisplay } from "@/components/financial/HashDisplay";

/**
 * AuditTimeline — component.md §3.7 (Composed on Surface)
 * Unified chronological audit trail merging DB mutations and on-chain events.
 */

export type AuditEventType = "Donation" | "Approval" | "Release" | "Proof" | "Lock";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  title: string;
  timestamp: string;
  txHash?: string;
  actor?: string;
  amount?: number;
}

export interface AuditTimelineProps {
  events: AuditEvent[];
  className?: string;
}

const eventMeta: Record<
  AuditEventType,
  { variant: "emerald" | "amber" | "indigo" | "cyan" | "rose"; icon: React.ReactNode; iconClass: string }
> = {
  Donation: { variant: "cyan", icon: <Gift className="w-3.5 h-3.5" />, iconClass: "bg-cyber-cyan-500/15 text-cyber-cyan-500" },
  Approval: { variant: "indigo", icon: <ShieldCheck className="w-3.5 h-3.5" />, iconClass: "bg-trust-indigo-500/15 text-trust-indigo-500" },
  Release: { variant: "emerald", icon: <Coins className="w-3.5 h-3.5" />, iconClass: "bg-brand-emerald-500/15 text-brand-emerald-500" },
  Proof: { variant: "amber", icon: <FileCheck className="w-3.5 h-3.5" />, iconClass: "bg-alert-amber-500/15 text-alert-amber-500" },
  Lock: { variant: "amber", icon: <Lock className="w-3.5 h-3.5" />, iconClass: "bg-alert-amber-500/15 text-alert-amber-500" },
};

const filterItems = [
  { key: "All", label: "All" },
  { key: "Donation", label: "Donations" },
  { key: "Approval", label: "Approvals" },
  { key: "Release", label: "Releases" },
  { key: "Proof", label: "Proofs" },
];

export function AuditTimeline({ events, className }: AuditTimelineProps) {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered =
    filter === "All" ? events : events.filter((e) => e.type === filter);

  return (
    <Surface variant="default" padding="lg" rounded="2xl" className={cn("space-y-5", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-white tracking-tight">Audit Timeline</h3>
          <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
            {events.length} immutable events
          </p>
        </div>
        <Tabs items={filterItems} activeKey={filter} onChange={setFilter} />
      </div>

      <div className="space-y-1">
        {filtered.map((ev) => {
          const meta = eventMeta[ev.type];
          const isOpen = expanded === ev.id;
          return (
            <div key={ev.id} className="relative">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : ev.id)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left group"
              >
                <span
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    meta.iconClass
                  )}
                >
                  {meta.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">{ev.title}</span>
                    <Badge variant={meta.variant} size="xs" label={ev.type} />
                  </div>
                  <div className="font-mono text-[10px] text-zinc-500 mt-0.5">
                    {ev.timestamp}
                    {ev.actor && <span> · {ev.actor}</span>}
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-zinc-600 shrink-0 transition-transform",
                    isOpen && "rotate-90"
                  )}
                />
              </button>
              {isOpen && (
                <div className="ml-11 mb-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  {typeof ev.amount === "number" && (
                    <div className="font-mono text-sm text-white">
                      ₹{ev.amount.toLocaleString("en-IN")}
                    </div>
                  )}
                  {ev.txHash && <HashDisplay hash={ev.txHash} type="tx" label="TX" />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Surface>
  );
}

export default AuditTimeline;
