"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, Wallet } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HashDisplay } from "@/components/financial/HashDisplay";

/**
 * MultisigApprovalWidget — component.md §3.4 (Composed on Surface elevated)
 * Transparent visualization of the 2-of-3 multisig authorization consensus.
 */

export interface Signer {
  role: string;
  name: string;
  address: string;
  signed: boolean;
  eligible?: boolean;
}

export interface MultisigApprovalWidgetProps {
  signers: Signer[];
  required: number;
  onSign?: () => void;
  className?: string;
}

export function MultisigApprovalWidget({
  signers,
  required,
  onSign,
  className,
}: MultisigApprovalWidgetProps) {
  const signedCount = signers.filter((s) => s.signed).length;
  const reached = signedCount >= required;
  const pct = (signedCount / required) * 100;
  const canSign = signers.some((s) => s.eligible && !s.signed);

  return (
    <Surface variant="elevated" padding="lg" rounded="2xl" className={cn("space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white tracking-tight">
            Multisig Consensus
          </h3>
          <p className="font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
            {required}-of-{signers.length} Authorization
          </p>
        </div>
        <Badge
          variant={reached ? "emerald" : "amber"}
          size="sm"
          dot
          pulse={!reached}
          label={reached ? "Quorum Reached" : "Awaiting Signatures"}
        />
      </div>

      {/* Signature progress */}
      <div>
        <div className="flex items-center justify-between mb-2 font-mono text-[11px]">
          <span className="text-zinc-500 uppercase tracking-wider">Signatures</span>
          <span className={cn("tabular-nums", reached ? "text-brand-emerald-500" : "text-alert-amber-500")}>
            {signedCount}/{required}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-white/[0.06] border border-white/[0.05] overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              reached ? "bg-brand-emerald-500" : "bg-alert-amber-500"
            )}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      </div>

      {/* Signers list */}
      <div className="space-y-2">
        {signers.map((s) => (
          <div
            key={s.role}
            className={cn(
              "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border",
              s.signed
                ? "bg-brand-emerald-500/[0.06] border-brand-emerald-500/20"
                : "bg-white/[0.03] border-white/[0.08]"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold",
                  s.signed
                    ? "bg-brand-emerald-500/15 text-brand-emerald-500"
                    : "bg-white/[0.05] text-zinc-400"
                )}
              >
                {s.signed ? <Check className="w-4 h-4" /> : s.name.slice(0, 1)}
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-sm text-white truncate">{s.name}</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
                    {s.role}
                  </span>
                  <HashDisplay hash={s.address} type="address" className="!text-[10px]" />
                </div>
              </div>
            </div>
            {s.signed ? (
              <Badge variant="emerald" size="xs" icon={<Check className="w-3 h-3" />} label="Signed" />
            ) : (
              <Badge variant="amber" size="xs" dot pulse icon={<Clock className="w-3 h-3" />} label="Pending" />
            )}
          </div>
        ))}
      </div>

      {/* Action */}
      {canSign && onSign && (
        <Button variant="primary" size="md" fullWidth leftIcon={<Wallet className="w-4 h-4" />} onClick={onSign}>
          Sign with Wallet
        </Button>
      )}
    </Surface>
  );
}

export default MultisigApprovalWidget;
