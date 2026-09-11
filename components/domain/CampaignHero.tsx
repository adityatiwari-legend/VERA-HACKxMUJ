import React from "react";
import { cn } from "@/lib/utils";
import { Download, Eye, Wallet } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/financial/ProgressBar";
import { BlockchainBadge } from "./BlockchainBadge";
import { HashDisplay } from "@/components/financial/HashDisplay";

/**
 * CampaignHero — component.md §3.2 (Composed on Surface variant="glass-dark")
 * High-impact hero header across Campaign Details and Public Audit pages.
 */

export interface CampaignHeroProps {
  title: string;
  ngo: string;
  category: string;
  raised: number;
  target: number;
  escrowLocked: number;
  released: number;
  contractAddress: string;
  txHash: string;
  onDonate?: () => void;
  onAudit?: () => void;
  className?: string;
}

export function CampaignHero({
  title,
  ngo,
  category,
  raised,
  target,
  escrowLocked,
  released,
  contractAddress,
  txHash,
  onDonate,
  onAudit,
  className,
}: CampaignHeroProps) {
  const pct = target > 0 ? (raised / target) * 100 : 0;

  return (
    <Surface
      as="header"
      variant="glass-dark"
      padding="xl"
      rounded="2xl"
      className={cn("vera-ambient-mesh relative overflow-hidden", className)}
    >
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: identity + actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="emerald" size="sm" dot pulse label={category} />
            <Badge variant="slate" size="sm" label="Escrow Active" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-[-0.03em] leading-[1.05]">
              {title}
            </h1>
            <p className="font-mono text-sm text-zinc-400">
              Operated by{" "}
              <span className="text-brand-emerald-500">{ngo}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button variant="glow" size="md" leftIcon={<Wallet className="w-4 h-4" />} onClick={onDonate}>
              Donate Now
            </Button>
            <Button variant="secondary" size="md" leftIcon={<Eye className="w-4 h-4" />} onClick={onAudit}>
              View Public Audit
            </Button>
            <Button variant="ghost" size="md" leftIcon={<Download className="w-4 h-4" />}>
              Export PDF Report
            </Button>
          </div>
        </div>

        {/* Right: financial summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SummaryPill label="Raised" value={`₹${raised.toLocaleString("en-IN")}`} accent="emerald" />
            <SummaryPill label="Released" value={`₹${released.toLocaleString("en-IN")}`} accent="cyan" />
            <SummaryPill label="Escrow Locked" value={`₹${escrowLocked.toLocaleString("en-IN")}`} accent="amber" />
            <SummaryPill label="Target" value={`₹${target.toLocaleString("en-IN")}`} accent="slate" />
          </div>
          <ProgressBar value={pct} accent="emerald" showLabel label="Funding" />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
            <BlockchainBadge txHash={txHash} confirmed />
            <HashDisplay hash={contractAddress} type="address" label="Contract" />
          </div>
        </div>
      </div>
    </Surface>
  );
}

function SummaryPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "emerald" | "cyan" | "amber" | "slate";
}) {
  const accentText = {
    emerald: "text-brand-emerald-500",
    cyan: "text-cyber-cyan-500",
    amber: "text-alert-amber-500",
    slate: "text-zinc-300",
  }[accent];
  return (
    <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08]">
      <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className={cn("mt-1 font-mono font-semibold tabular-nums text-base", accentText)}>
        {value}
      </div>
    </div>
  );
}

export default CampaignHero;
