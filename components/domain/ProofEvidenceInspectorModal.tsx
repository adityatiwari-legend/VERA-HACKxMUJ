"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FileCheck, ImageIcon, FileText, Calculator, ShieldCheck, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BlockchainBadge } from "./BlockchainBadge";
import { HashDisplay } from "@/components/financial/HashDisplay";

/**
 * ProofEvidenceInspectorModal — component.md §3.5 (Modal uses Surface)
 * Examine evidence files, SHA-256 hashes, and AI discrepancy screening.
 */

export interface OcrLineItem {
  vendor: string;
  date: string;
  invoiceNo: string;
  amount: number;
}

export interface ProofEvidenceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidence: {
    title: string;
    sha256: string;
    txHash: string;
    network?: "Hardhat" | "Sepolia" | "Mainnet";
    claimedAmount: number;
    invoiceAmount: number;
    ocrConfidence: number;
    lineItems: OcrLineItem[];
    auditorNotes?: string;
    verifiedAt?: string;
  };
}

export function ProofEvidenceInspectorModal({
  isOpen,
  onClose,
  evidence,
}: ProofEvidenceInspectorModalProps) {
  const mathValid = evidence.claimedAmount === evidence.invoiceAmount;
  const mathDelta = Math.abs(evidence.claimedAmount - evidence.invoiceAmount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={evidence.title}
      description="Cryptographic evidence inspection · SHA-256 anchored"
      footer={
        <>
          <Button variant="ghost" size="md" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="md" leftIcon={<ShieldCheck className="w-4 h-4" />}>
            Mark Verified
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Hash + chain */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              SHA-256 Evidence Hash
            </div>
            <HashDisplay hash={evidence.sha256} type="sha256" className="!text-sm" />
          </div>
          <BlockchainBadge
            network={evidence.network ?? "Sepolia"}
            txHash={evidence.txHash}
            confirmed
          />
        </div>

        {/* Preview placeholder */}
        <div className="flex items-center justify-center h-40 rounded-xl border border-white/[0.08] bg-white/[0.02] text-zinc-500">
          <div className="flex flex-col items-center gap-2">
            {evidence.title.match(/\.pdf$/i) ? (
              <FileText className="w-8 h-8" />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
            <span className="font-mono text-xs">RECEIPT PREVIEW</span>
          </div>
        </div>

        {/* Discrepancy comparison */}
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border",
            mathValid
              ? "bg-brand-emerald-500/[0.06] border-brand-emerald-500/20"
              : "bg-danger-rose-500/[0.06] border-danger-rose-500/20"
          )}
        >
          <div className="flex items-center gap-2">
            {mathValid ? (
              <ShieldCheck className="w-5 h-5 text-brand-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-danger-rose-500" />
            )}
            <span className="font-mono text-xs text-zinc-300">Math Validation</span>
          </div>
          <div className="font-mono text-sm">
            <span className="text-zinc-400">Claimed ₹{evidence.claimedAmount.toLocaleString("en-IN")}</span>
            <span className="text-zinc-600 mx-2">vs</span>
            <span className="text-white">Invoice ₹{evidence.invoiceAmount.toLocaleString("en-IN")}</span>
          </div>
          <Badge
            variant={mathValid ? "emerald" : "rose"}
            size="sm"
            icon={<Calculator className="w-3 h-3" />}
            label={mathValid ? "Validated" : `Δ ₹${mathDelta.toLocaleString("en-IN")}`}
          />
        </div>

        {/* OCR line items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">OCR Line-Item Extraction</h4>
            <Badge variant="indigo" size="xs" label={`Confidence ${evidence.ocrConfidence}%`} />
          </div>
          <div className="border border-white/[0.08] rounded-xl overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-white/[0.03] text-zinc-500 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3 font-medium">Vendor</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium">Invoice No</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {evidence.lineItems.map((item, i) => (
                  <tr key={i} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-zinc-300">{item.vendor}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{item.date}</td>
                    <td className="py-2.5 px-3 text-zinc-400">{item.invoiceNo}</td>
                    <td className="py-2.5 px-3 text-right text-white tabular-nums">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Auditor notes */}
        {evidence.auditorNotes && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-trust-indigo-500" />
              <h4 className="text-sm font-semibold text-white">Auditor Notes</h4>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-trust-indigo-500/40 pl-3">
              {evidence.auditorNotes}
            </p>
            {evidence.verifiedAt && (
              <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-wider">
                Verified at {evidence.verifiedAt}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ProofEvidenceInspectorModal;
