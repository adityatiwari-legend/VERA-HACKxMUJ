import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/financial/ProgressBar";
import { TrustScoreGauge } from "@/components/financial/TrustScoreGauge";

/**
 * CampaignCard — component.md §3.1 (Composed on Surface)
 * Reusable campaign card for Home, Browse Explorer, and NGO Dashboard.
 */

export type CampaignStatus = "Active" | "Paused" | "Completed";

export interface CampaignCardProps {
  title: string;
  ngo: string;
  category: string;
  raised: number;
  target: number;
  milestonesReleased: number;
  milestonesTotal: number;
  status: CampaignStatus;
  trustScore: number;
  trustGrade: "A+" | "A" | "B" | "C" | "D";
  href?: string;
  onDonate?: () => void;
  className?: string;
}

const statusVariant: Record<CampaignStatus, "emerald" | "amber" | "slate"> = {
  Active: "emerald",
  Paused: "amber",
  Completed: "slate",
};

export function CampaignCard({
  title,
  ngo,
  category,
  raised,
  target,
  milestonesReleased,
  milestonesTotal,
  status,
  trustScore,
  trustGrade,
  href = "#",
  onDonate,
  className,
}: CampaignCardProps) {
  const pct = target > 0 ? (raised / target) * 100 : 0;

  return (
    <Surface
      as="article"
      variant="default"
      interactive
      glowOnHover
      padding="lg"
      rounded="2xl"
      className={cn("group flex flex-col gap-5", className)}
    >
      {/* Header: category + status */}
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {category}
        </span>
        <Badge
          variant={statusVariant[status]}
          size="xs"
          dot
          pulse={status === "Active"}
          label={status}
        />
      </div>

      {/* Title + NGO */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white tracking-tight leading-snug group-hover:text-brand-emerald-500 transition-colors">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
          <ShieldCheck className="w-3 h-3 text-brand-emerald-500/70" />
          <span>{ngo}</span>
        </div>
      </div>

      {/* Trust gauge + funds */}
      <div className="flex items-center justify-between gap-4 py-1">
        <TrustScoreGauge score={trustScore} grade={trustGrade} size="sm" showDetails={false} />
        <div className="flex-1 space-y-1 text-right">
          <div className="text-xl font-mono font-semibold text-white tabular-nums">
            ₹{raised.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            of ₹{target.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      <ProgressBar value={pct} accent="emerald" size="sm" />

      {/* Milestone counter + CTA */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="font-mono text-[11px] text-zinc-400">
          <span className="text-white">{milestonesReleased}</span>
          <span className="text-zinc-500"> of {milestonesTotal} released</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={href}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl bg-white/[0.04] text-zinc-300 border border-white/[0.06] hover:text-white hover:bg-white/[0.07] transition-all active:scale-[0.98]"
          >
            Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          {onDonate && (
            <Button size="sm" onClick={onDonate} className="!px-3 !py-1.5">
              Donate
            </Button>
          )}
        </div>
      </div>
    </Surface>
  );
}

export default CampaignCard;
