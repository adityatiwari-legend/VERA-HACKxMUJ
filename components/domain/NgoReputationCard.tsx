import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, FileCheck, AlertTriangle, Award } from "lucide-react";
import { Surface } from "@/components/ui/Surface";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/financial/ProgressBar";
import { TrustScoreGauge } from "@/components/financial/TrustScoreGauge";

/**
 * NgoReputationCard — component.md §3.9 (Composed on Surface)
 * NGO Public Profile card with transparent trust metrics.
 */

export interface NgoReputationCardProps {
  name: string;
  trustScore: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  completedCampaigns: number;
  verifiedInvoices: number;
  tamperScore: number;
  className?: string;
}

export function NgoReputationCard({
  name,
  trustScore,
  grade,
  completedCampaigns,
  verifiedInvoices,
  tamperScore,
  className,
}: NgoReputationCardProps) {
  const tamperPct = Math.min(100, tamperScore);
  const tamperSafe = tamperScore === 0;

  return (
    <Surface variant="default" padding="lg" rounded="2xl" className={cn("space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-emerald-500" />
            <h3 className="text-base font-semibold text-white tracking-tight">{name}</h3>
          </div>
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
            Public Reputation Profile
          </p>
        </div>
        <Badge variant="emerald" size="sm" dot label="Verified NGO" />
      </div>

      {/* Gauge + metrics */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <TrustScoreGauge score={trustScore} grade={grade} size="md" />
        <div className="flex-1 w-full grid grid-cols-2 gap-3">
          <Metric icon={<ShieldCheck className="w-4 h-4 text-brand-emerald-500" />} label="Completed Campaigns" value={completedCampaigns} />
          <Metric icon={<FileCheck className="w-4 h-4 text-cyber-cyan-500" />} label="Verified Invoices" value={verifiedInvoices} />
          <Metric
            icon={<AlertTriangle className={cn("w-4 h-4", tamperSafe ? "text-brand-emerald-500" : "text-danger-rose-500")} />}
            label="Tamper Score"
            value={`${tamperScore.toFixed(2)}%`}
            valueClass={tamperSafe ? "text-brand-emerald-500" : "text-danger-rose-500"}
          />
          <Metric icon={<Award className="w-4 h-4 text-trust-indigo-500" />} label="Audit Grade" value={grade} valueClass="text-trust-indigo-500" />
        </div>
      </div>

      {/* Tamper bar */}
      <div className="pt-3 border-t border-white/[0.06]">
        <ProgressBar
          value={tamperPct}
          accent={tamperSafe ? "emerald" : "rose"}
          size="sm"
          showLabel
          label="Tamper-Evidence Index"
        />
      </div>
    </Surface>
  );
}

function Metric({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center gap-1.5 mb-1">{icon}</div>
      <div className={cn("font-mono text-lg font-semibold tabular-nums text-white", valueClass)}>
        {value}
      </div>
      <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

export default NgoReputationCard;
