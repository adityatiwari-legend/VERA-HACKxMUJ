"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Tabs & SegmentedControl — component.md §1.6
 * Tabbed navigation and filters (e.g. campaign status filters).
 */

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Tabs({ items, activeKey, onChange, className, size = "sm" }: TabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl",
        className
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg font-mono uppercase tracking-wider transition-all duration-200",
              size === "sm" ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-xs",
              active
                ? "bg-white text-black font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
            )}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-md text-[10px] tabular-nums",
                  active ? "bg-black/10 text-black" : "bg-white/[0.06] text-zinc-500"
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
