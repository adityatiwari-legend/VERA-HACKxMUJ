"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export default function Footer() {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [copiedContract, setCopiedContract] = useState<string | null>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (address: string, label: string) => {
    navigator.clipboard.writeText(address);
    setCopiedContract(label);
    setTimeout(() => setCopiedContract(null), 2000);
  };

  const smartContracts = [
    { chain: "ETH MAINNET", address: "0x88F2...410A", full: "0x88F2c56aA12891902Bc199E39218F8B410a08891" },
    { chain: "ARBITRUM ONE", address: "0x391C...9B12", full: "0x391Ce192080a98F8aC100e4085002C9B12384a20" },
    { chain: "POLYGON PoS", address: "0x117A...024C", full: "0x117Ae2980189B19020468902030920401024C982" },
  ];

  return (
    <footer className="bg-[#09090B] text-zinc-400 font-mono text-xs border-t border-white/[0.08] relative">
      {/* Upper Footer Telemetry Bar */}
      <div className="border-b border-white/[0.08] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: System Telemetry */}
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">SYSTEM TIME (UTC)</div>
              <div className="text-sm font-semibold text-white tracking-wider">
                {currentTime || "LOADING..."}
              </div>
              <div className="text-[10px] text-zinc-500">BLOCK LATENCY: ~12ms</div>
            </div>

            {/* Col 2: Network SLA */}
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">UPTIME STATUS</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#00F59B]">
                <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
                <span>99.98% OPERATIONAL SLA</span>
              </div>
              <div className="text-[10px] text-zinc-500">CONSENSUS: 100% HEALTHY</div>
            </div>

            {/* Col 3: Smart Contracts */}
            <div className="space-y-2 md:col-span-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">VERIFIED CORE ESCROW CONTRACTS</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {smartContracts.map((c) => (
                  <button
                    key={c.chain}
                    type="button"
                    onClick={() => handleCopy(c.full, c.chain)}
                    className="p-2 bg-[#121216] hover:bg-[#181820] border border-white/[0.06] hover:border-white/[0.2] transition-colors text-left flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-[9px] text-zinc-500">{c.chain}</div>
                      <div className="text-[11px] text-zinc-300 font-semibold">{c.address}</div>
                    </div>
                    {copiedContract === c.chain ? (
                      <Check className="w-3.5 h-3.5 text-[#00F59B]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Main Footer Links */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white tracking-tight font-sans">VERA</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-white/[0.06] text-[#00F59B]">PROTOCOL</span>
              </div>
              <p className="text-xs text-zinc-500 max-w-md">
                Every rupee traceable. Audited before it moves. Zero tolerance for diversion or unverified capital releases.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
              <a href="#physics-arena" className="hover:text-white transition-colors">
                ZERO-G ARENA
              </a>
              <a href="#protocol-bento" className="hover:text-white transition-colors">
                PROTOCOL ARCHITECTURE
              </a>
              <a href="#escrow-simulator" className="hover:text-white transition-colors">
                ESCROW SIMULATOR
              </a>
              <a href="#audit-ledger" className="hover:text-white transition-colors">
                PUBLIC LEDGER
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#00F59B] flex items-center gap-1 transition-colors"
              >
                <span>GITHUB REPO</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Bottom Copyright and Crosshairs */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-600">
            <div>© {new Date().getFullYear()} VERA TRUST LAYER. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-4">
              <span>SHA-256 AUDIT ARCHITECTURE</span>
              <span>•</span>
              <span>ZERO-KNOWLEDGE ESCROWS</span>
              <span>•</span>
              <span className="text-zinc-500">ALCHE.STUDIO INSPIRATION</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
