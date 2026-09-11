import React from "react";
import { cn } from "@/lib/utils";

/**
 * Surface — THE ALL-IMPORTANT COMPONENT (component.md §1.1)
 * Universal foundation for all cards, dialogs, timeline nodes, and panels.
 * Enforces consistent radii, border opacity, glass blur, elevation, and shadow.
 */

type SurfaceTag = "div" | "section" | "article" | "aside" | "header";

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: SurfaceTag;
  variant?:
    | "default"
    | "glass-dark"
    | "glass-light"
    | "elevated"
    | "outline"
    | "glow-emerald"
    | "glow-cyan";
  interactive?: boolean;
  glowOnHover?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  children?: React.ReactNode;
}

const variantClasses: Record<NonNullable<SurfaceProps["variant"]>, string> = {
  default:
    "bg-[#0C0C0E] border border-white/[0.08] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.5)]",
  "glass-dark": "glass-panel-dark",
  "glass-light": "glass-panel-light",
  elevated:
    "bg-[#121216] border border-white/[0.10] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.7)]",
  outline: "bg-transparent border border-white/[0.12]",
  "glow-emerald":
    "bg-[#0C0C0E] border border-brand-emerald-500/30 shadow-[0_0_24px_-4px_rgba(16,185,129,0.3)]",
  "glow-cyan":
    "bg-[#0C0C0E] border border-cyber-cyan-500/30 shadow-[0_0_24px_-4px_rgba(6,182,212,0.3)]",
};

const paddingClasses: Record<NonNullable<SurfaceProps["padding"]>, string> = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-7",
  xl: "p-10",
};

const roundedClasses: Record<NonNullable<SurfaceProps["rounded"]>, string> = {
  none: "",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
  full: "rounded-full",
};

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      as = "div",
      variant = "default",
      interactive = false,
      glowOnHover = false,
      padding = "md",
      rounded = "2xl",
      className,
      children,
      ...rest
    },
    ref
  ) => {
    const Tag = as as React.ElementType;
    return React.createElement(
      Tag,
      {
        ref,
        className: cn(
          "relative transition-all duration-300 ease-out",
          variantClasses[variant],
          paddingClasses[padding],
          roundedClasses[rounded],
          interactive &&
            "cursor-pointer hover:-translate-y-1 hover:border-white/[0.18]",
          glowOnHover &&
            "hover:shadow-[0_0_28px_-4px_rgba(16,185,129,0.35)] hover:border-brand-emerald-500/40",
          className
        ),
        ...rest,
      },
      children
    );
  }
);

Surface.displayName = "Surface";
export default Surface;
