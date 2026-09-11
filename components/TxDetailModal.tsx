"use client";

import React, { useState } from "react";
import { X, Copy, Check, MapPin, FileCode, CheckCircle2 } from "lucide-react";
import { AuditTransaction } from "@/lib/types";

interface TxDetailModalProps {
  tx: AuditTransaction | null;
  onClose: () => void;
}

export default function TxDetailModal({ tx, onClose }: TxDetailModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  if (!tx) return null;

  const handleCopy = (text: string, type: "hash" | "payload") => {
    navigator.clipboard.writeText(text);
    if (type === "hash") {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const rawJson = JSON.stringify(
    {
      txId: tx.id,
      campaign: tx.campaign,
      milestone: tx.milestone,
      amountInr: tx.amount,
      txHash: tx.txHash,
      evidenceBundle: {
        algorithm: "SHA-256",
        hash: tx.evidenceHash,
        geoTag: tx.geoTag,
        ocrDiscrepancy: tx.ocrDiscrepancy,
      },
      multiSig: {
        status: tx.auditorMultiSig,
        contractor: tx.contractor,
        verifiedAt: tx.verifiedAt,
      },
    },
    null,
    2
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D0D11] border border-white/[0.12] rounded-sm p-6 shadow-2xl crosshair-corner max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
            <span className="text-white font-semibold tracking-wider uppercase">
              CRYPTOGRAPHIC PROOF INSPECTOR // {tx.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5 font-mono">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-[#121217] border border-white/[0.06]">
              <div className="text-[10px] text-zinc-500 uppercase">CAMPAIGN</div>
              <div className="text-sm font-semibold text-white truncate">{tx.campaign}</div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{tx.category}</div>
            </div>

            <div className="p-3 bg-[#121217] border border-white/[0.06]">
              <div className="text-[10px] text-zinc-500 uppercase">RELEASED TRANCHE</div>
              <div className="text-sm font-semibold text-[#00F59B]">
                {tx.currency}
                {tx.amount.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">{tx.status}</div>
            </div>
          </div>

          {/* Hashes */}
          <div className="space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
              <span>LEDGER TRANSACTION HASH</span>
              <button
                type="button"
                onClick={() => handleCopy(tx.txHash, "hash")}
                className="text-[10px] text-zinc-400 hover:text-[#00F59B] flex items-center gap-1"
              >
                {copiedHash ? <Check className="w-3 h-3 text-[#00F59B]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? "COPIED" : "COPY HASH"}</span>
              </button>
            </div>
            <div className="p-2.5 bg-black/60 border border-white/[0.08] text-xs text-zinc-300 break-all select-all">
              {tx.txHash}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] text-zinc-500 uppercase">
              SHA-256 IMMUTABLE EVIDENCE BUNDLE (PHOTOS + INVOICES)
            </div>
            <div className="p-2.5 bg-black/60 border border-[#00F59B]/20 text-xs text-[#00F59B] break-all select-all">
              {tx.evidenceHash}
            </div>
          </div>

          {/* Audit Verification Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#121217] border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-zinc-500">AI OCR VARIANCE</div>
              <div className="text-[#00F59B] font-bold">{tx.ocrDiscrepancy.toFixed(2)}%</div>
              <div className="text-[9px] text-zinc-500">PASS CRITERIA &lt; 0.5%</div>
            </div>

            <div className="p-3 bg-[#121217] border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-zinc-500">MULTI-SIG CONSENSUS</div>
              <div className="text-white font-bold">{tx.auditorMultiSig}</div>
              <div className="text-[9px] text-zinc-500">INDEPENDENT ENCLAVE</div>
            </div>

            <div className="p-3 bg-[#121217] border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-zinc-500">GEO-LOCATION</div>
              <div className="text-white font-bold truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#38BDF8]" />
                <span>{tx.geoTag}</span>
              </div>
              <div className="text-[9px] text-zinc-500">EXIF VERIFIED</div>
            </div>
          </div>

          {/* Raw JSON Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase">
              <span className="flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                RAW VERIFIABLE MERKLE LEAF (JSON)
              </span>
              <button
                type="button"
                onClick={() => handleCopy(rawJson, "payload")}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
              >
                {copiedPayload ? <Check className="w-3 h-3 text-[#00F59B]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? "COPIED" : "COPY PAYLOAD"}</span>
              </button>
            </div>
            <pre className="p-3 bg-black border border-white/[0.08] text-[10px] text-zinc-400 overflow-x-auto max-h-36 leading-tight">
              {rawJson}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1 text-[#00F59B]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED ON VERA MAINNET AT {tx.verifiedAt}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white text-black font-semibold uppercase hover:bg-zinc-200 transition-colors"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}
