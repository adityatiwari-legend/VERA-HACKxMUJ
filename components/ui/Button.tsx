import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Button — component.md §1.2
 * Accessible action button with loading states, icon support, and tactile feedback.
 */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "glow"
    | "subtle";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-emerald-500 text-black border border-brand-emerald-500 hover:bg-brand-emerald-500/90 hover:shadow-[0_0_24px_-4px_rgba(16,185,129,0.6)]",
  secondary:
    "bg-white/[0.06] text-white border border-white/[0.10] hover:bg-white/[0.10] hover:border-white/[0.18]",
  outline:
    "bg-transparent text-white border border-white/[0.18] hover:border-brand-emerald-500/50 hover:text-brand-emerald-500",
  ghost:
    "bg-transparent text-zinc-300 border border-transparent hover:bg-white/[0.05] hover:text-white",
  danger:
    "bg-danger-rose-500 text-white border border-danger-rose-500 hover:bg-danger-rose-500/90 hover:shadow-[0_0_24px_-4px_rgba(244,63,94,0.5)]",
  glow:
    "bg-brand-emerald-500 text-black border border-brand-emerald-500 shadow-[0_0_24px_-4px_rgba(16,185,129,0.5)] hover:shadow-[0_0_32px_-4px_rgba(16,185,129,0.7)]",
  subtle:
    "bg-white/[0.04] text-zinc-300 border border-white/[0.06] hover:text-white hover:bg-white/[0.07]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  xs: "px-2.5 py-1 text-[10px] gap-1",
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2.5 text-sm gap-2",
  lg: "px-6 py-3.5 text-base gap-2.5",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{loadingText ?? "Processing"}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
