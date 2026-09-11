import React from "react";
import { cn } from "@/lib/utils";

/**
 * Badge / StatusPill — component.md §1.3
 * Unified status representation for campaigns, milestones, proofs, multisig, and chain events.
 */

export interface BadgeProps {
  variant?: "emerald" | "amber" | "rose" | "indigo" | "cyan" | "slate";
  size?: "xs" | "sm" | "md";
  dot?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  emerald:
    "bg-brand-emerald-500/10 border-brand-emerald-500/30 text-brand-emerald-500",
  amber: "bg-alert-amber-500/10 border-alert-amber-500/30 text-alert-amber-500",
  rose: "bg-danger-rose-500/10 border-danger-rose-500/30 text-danger-rose-500",
  indigo:
    "bg-trust-indigo-500/10 border-trust-indigo-500/30 text-trust-indigo-500",
  cyan: "bg-cyber-cyan-500/10 border-cyber-cyan-500/30 text-cyber-cyan-500",
  slate: "bg-white/[0.05] border-white/[0.12] text-zinc-300",
};

const dotColor: Record<NonNullable<BadgeProps["variant"]>, string> = {
  emerald: "bg-brand-emerald-500",
  amber: "bg-alert-amber-500",
  rose: "bg-danger-rose-500",
  indigo: "bg-trust-indigo-500",
  cyan: "bg-cyber-cyan-500",
  slate: "bg-zinc-400",
};

const sizeClasses: Record<NonNullable<BadgeProps["size"]>, string> = {
  xs: "px-2 py-0.5 text-[10px] gap-1",
  sm: "px-2.5 py-1 text-[11px] gap-1.5",
  md: "px-3 py-1.5 text-xs gap-1.5",
};

export function Badge({
  variant = "slate",
  size = "sm",
  dot = false,
  pulse = false,
  icon,
  label,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono uppercase tracking-wider border rounded-full whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            dotColor[variant],
            pulse && "animate-pulse"
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </span>
  );
}

export default Badge;
