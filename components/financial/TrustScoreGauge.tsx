import React from "react";
import { cn } from "@/lib/utils";

/**
 * TrustScoreGauge — component.md §2.3
 * Dynamic circular SVG gauge visualizing NGO Reputation Index (0–100).
 */

export interface TrustScoreGaugeProps {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

const sizeMap: Record<NonNullable<TrustScoreGaugeProps["size"]>, number> = {
  sm: 96,
  md: 140,
  lg: 180,
};

function gradeColor(grade: TrustScoreGaugeProps["grade"]) {
  switch (grade) {
    case "A+":
      return { stroke: "#10B981", text: "text-brand-emerald-500", glow: "rgba(16,185,129,0.4)" };
    case "A":
      return { stroke: "#10B981", text: "text-brand-emerald-500", glow: "rgba(16,185,129,0.3)" };
    case "B":
      return { stroke: "#06B6D4", text: "text-cyber-cyan-500", glow: "rgba(6,182,212,0.3)" };
    case "C":
      return { stroke: "#F59E0B", text: "text-alert-amber-500", glow: "rgba(245,158,11,0.3)" };
    case "D":
      return { stroke: "#F43F5E", text: "text-danger-rose-500", glow: "rgba(244,63,94,0.3)" };
  }
}

export function TrustScoreGauge({
  score,
  grade,
  size = "md",
  showDetails = true,
}: TrustScoreGaugeProps) {
  const dim = sizeMap[size];
  const stroke = size === "sm" ? 8 : size === "md" ? 12 : 14;
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const offset = circumference - (clamped / 100) * circumference;
  const colors = gradeColor(grade);

  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          className="-rotate-90"
        >
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
              filter: `drop-shadow(0 0 6px ${colors.glow})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-mono font-bold tabular-nums", colors.text, size === "sm" ? "text-xl" : "text-3xl")}>
            {Math.round(clamped)}
          </span>
          <span className={cn("font-mono font-semibold", colors.text, size === "sm" ? "text-xs" : "text-base")}>
            {grade}
          </span>
        </div>
      </div>
      {showDetails && (
        <div className="text-center space-y-0.5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Reputation Index
          </div>
          <div className={cn("text-xs font-mono", colors.text)}>
            {grade === "A+" || grade === "A"
              ? "Cryptographically Trusted"
              : grade === "B"
              ? "Verified — Monitoring"
              : grade === "C"
              ? "Conditional Trust"
              : "High Risk — Review"}
          </div>
        </div>
      )}
    </div>
  );
}

export default TrustScoreGauge;
