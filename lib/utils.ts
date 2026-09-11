import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Standard Indian currency formatter for VERA
 * Formats numbers into ₹X,XX,XXX format
 */
export function formatRupees(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '₹0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Short Indian currency formatter (e.g. ₹7.5L, ₹10L, ₹2.85L)
 */
export function formatRupeesShort(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '₹0';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(num % 10000000 === 0 ? 0 : 2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(num % 100000 === 0 ? 0 : 2)}L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}k`;
  }
  return `₹${num}`;
}
