"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Surface } from "./Surface";

/**
 * Modal / Dialog — component.md §1.4
 * Accessible overlay dialog with blurred backdrop, Escape handling, animated entry.
 */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  footer?: React.ReactNode;
}

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  footer,
}: ModalProps) {
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full animate-in fade-in zoom-in-95 duration-200",
          sizeClasses[size]
        )}
      >
        <Surface variant="elevated" rounded="2xl" padding="none" className="overflow-hidden">
          {(title || description) && (
            <div className="px-6 py-5 border-b border-white/[0.08] flex items-start justify-between gap-4">
              <div className="space-y-1">
                {title && (
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-sm text-zinc-400">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 p-1.5 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end gap-3 bg-white/[0.02]">
              {footer}
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}

export default Modal;
