import React from "react";
import { cn } from "@/lib/utils";

/**
 * ProgressBar — base progress bar used across VERA components.
 * Composed inside CampaignCard, CampaignHero, EscrowMilestoneTracker, etc.
 */

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  accent?: "emerald" | "cyan" | "indigo" | "amber" | "rose";
  showLabel?: boolean;
  label?: string;
  className?: string;
  glow?: boolean;
}

const sizeClasses: Record<NonNullable<ProgressBarProps["size"]>, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

const accentClasses: Record<NonNullable<ProgressBarProps["accent"]>, string> = {
  emerald: "bg-brand-emerald-500",
  cyan: "bg-cyber-cyan-500",
  indigo: "bg-trust-indigo-500",
  amber: "bg-alert-amber-500",
  rose: "bg-danger-rose-500",
};

const accentGlow: Record<NonNullable<ProgressBarProps["accent"]>, string> = {
  emerald: "shadow-[0_0_12px_rgba(16,185,129,0.5)]",
  cyan: "shadow-[0_0_12px_rgba(6,182,212,0.5)]",
  indigo: "shadow-[0_0_12px_rgba(99,102,241,0.5)]",
  amber: "shadow-[0_0_12px_rgba(245,158,11,0.5)]",
  rose: "shadow-[0_0_12px_rgba(244,63,94,0.5)]",
};

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  accent = "emerald",
  showLabel = false,
  label,
  className,
  glow = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
          <span className="text-zinc-400 uppercase tracking-wider">
            {label ?? "Progress"}
          </span>
          <span className="text-zinc-300 tabular-nums">{pct.toFixed(1)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-white/[0.06] border border-white/[0.05]",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            accentClasses[accent],
            glow && accentGlow[accent]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
