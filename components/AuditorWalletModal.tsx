"use client";

import React, { useState } from "react";
import { X, ShieldCheck, CheckCircle2, Lock, Terminal, Cpu } from "lucide-react";

interface AuditorWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditorWalletModal({ isOpen, onClose }: AuditorWalletModalProps) {
  const [selectedRole, setSelectedRole] = useState<"auditor" | "contractor" | "donor">("auditor");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      setActiveAddress("0x7F21...9C4B (Certified Auditor Node)");
    }, 1100);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setActiveAddress(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E0E12] border border-white/[0.12] rounded-sm p-6 shadow-2xl crosshair-corner">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
            <span className="text-white font-semibold tracking-wider uppercase">AUDITOR KEYSTORE ACCESS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Connect an authorized cryptographic multi-sig signer to review milestone proofs, inspect SHA-256 evidence bundles, and release locked escrow tranches.
          </p>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#141418] border border-white/[0.06] rounded-none font-mono text-[11px]">
            {(["auditor", "contractor", "donor"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`py-1.5 uppercase transition-colors ${
                  selectedRole === role
                    ? "bg-white text-black font-semibold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {!isConnected ? (
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isConnecting}
                onClick={() => handleConnect()}
                className="w-full flex items-center justify-between p-3 bg-[#16161C] hover:bg-[#1C1C24] border border-white/[0.08] hover:border-[#00F59B]/50 transition-all text-left font-mono group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black border border-white/[0.08] text-[#00F59B]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-200 group-hover:text-white font-medium">
                      HARDWARE SIGNER (HSM / YUBIKEY)
                    </div>
                    <div className="text-[10px] text-zinc-500">FIPS 140-2 Level 3 Secure Enclave</div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">RECOMMENDED</span>
              </button>

              <button
                type="button"
                disabled={isConnecting}
                onClick={() => handleConnect()}
                className="w-full flex items-center justify-between p-3 bg-[#16161C] hover:bg-[#1C1C24] border border-white/[0.08] hover:border-[#00F59B]/50 transition-all text-left font-mono group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black border border-white/[0.08] text-amber-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-200 group-hover:text-white font-medium">
                      WEB3 SIGNER (METAMASK / RABBY)
                    </div>
                    <div className="text-[10px] text-zinc-500">Browser Extension Multi-sig</div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">WEB3</span>
              </button>

              <button
                type="button"
                disabled={isConnecting}
                onClick={() => handleConnect()}
                className="w-full flex items-center justify-between p-3 bg-[#16161C] hover:bg-[#1C1C24] border border-white/[0.08] hover:border-[#00F59B]/50 transition-all text-left font-mono group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-black border border-white/[0.08] text-[#38BDF8]">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-zinc-200 group-hover:text-white font-medium">
                      LOCAL AUDITOR DEMO KEY
                    </div>
                    <div className="text-[10px] text-zinc-500">Ephemeral Ed25519 Sandbox Identity</div>
                  </div>
                </div>
                <span className="text-[10px] text-[#00F59B] font-mono">1-CLICK</span>
              </button>

              {isConnecting && (
                <div className="p-3 bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center gap-2 font-mono text-xs text-[#00F59B]">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>NEGOTIATING CRYPTOGRAPHIC HANDSHAKE...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-[#00F59B]/10 border border-[#00F59B]/30 rounded-none space-y-2">
                <div className="flex items-center justify-between font-mono text-xs text-[#00F59B]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    AUTHENTICATED AUDITOR
                  </span>
                  <span className="text-[10px] uppercase">PERMISSION: LEVEL 4</span>
                </div>
                <div className="font-mono text-xs text-zinc-200 break-all bg-black/40 p-2 border border-white/[0.05]">
                  {activeAddress}
                </div>
              </div>

              <div className="font-mono text-[11px] text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>ESCROWS UNDER REVIEW:</span>
                  <span className="text-white font-semibold">4 MILESTONES</span>
                </div>
                <div className="flex justify-between">
                  <span>PENDING TRANCHES:</span>
                  <span className="text-[#00F59B] font-semibold">₹41,80,000</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="flex-1 py-2 text-xs font-mono uppercase bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white border border-white/[0.08]"
                >
                  DISCONNECT
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-mono uppercase bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold"
                >
                  PROCEED TO AUDIT
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <span>VERA PROTOCOL V2.4</span>
          <span>MULTI-SIG ENCLAVE ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
