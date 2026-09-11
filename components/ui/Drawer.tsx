"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Surface } from "./Surface";

/**
 * Drawer / SlideOver — component.md §1.5
 * Slide-in sheet from the right for deep inspection of invoices, OCR details, multisig history.
 */

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: "md" | "lg" | "xl";
}

const widthClasses: Record<NonNullable<DrawerProps["width"]>, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "lg",
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full bg-[#0C0C0E] border-l border-white/[0.10] shadow-[0_0_60px_rgba(0,0,0,0.7)] animate-in slide-in-from-right duration-300 flex flex-col",
          widthClasses[width]
        )}
      >
        <Surface
          as="header"
          variant="default"
          padding="md"
          rounded="none"
          className="border-b border-white/[0.08] shrink-0"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white tracking-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="shrink-0 p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Surface>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export default Drawer;
