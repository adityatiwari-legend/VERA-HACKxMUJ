"use client";

import React, { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { INITIAL_TRANSACTIONS } from "@/lib/mockData";
import { AuditTransaction } from "@/lib/types";
import TxDetailModal from "./TxDetailModal";

export default function AuditLedger() {
  const [transactions, setTransactions] = useState<AuditTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "RELEASED" | "ESCROW_LOCKED" | "AUDITING">("ALL");
  const [selectedTx, setSelectedTx] = useState<AuditTransaction | null>(null);

  // Fetch live transactions from backend on mount
  useEffect(() => {
    fetch('/api/audit/ledger')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      })
      .catch(() => {});
  }, []);

  // Live simulation: simulate a new verified transaction entering the stream every 16 seconds
  useEffect(() => {
    const campaigns = [
      "Solar Water Pump Installation #12",
      "Kashmir Winter Shelter Insulation",
      "Tribal Children Nutrition Center",
      "Sundarbans Mangrove Reforestation",
    ];

    const interval = setInterval(() => {
      const randomCampaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const randomAmount = Math.floor(Math.random() * 25 + 5) * 50000;
      const newTx: AuditTransaction = {
        id: `TX-${Math.floor(Math.random() * 900 + 9910)}`,
        timestamp: "Just now",
        campaign: randomCampaign,
        category: "Infrastructure",
        milestone: "Tranche Verified by 3/3 Auditor Quorum",
        amount: randomAmount,
        currency: "₹",
        status: "RELEASED",
        txHash: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        evidenceHash: "e3b0" + Array.from({ length: 60 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        contractor: "0x89" + Math.floor(Math.random() * 900 + 100) + "...node",
        auditorMultiSig: "3/3 Signatures Verified",
        ocrDiscrepancy: 0.0,
        geoTag: "28.6139° N, 77.2090° E",
        verifiedAt: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      };

      setTransactions((prev) => [newTx, ...prev.slice(0, 14)]);
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "ALL") return matchesSearch;
    return matchesSearch && tx.status === activeFilter;
  });

  return (
    <section id="audit-ledger" className="py-20 bg-[#09090B] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[#00F59B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B] animate-ping" />
              <span>REAL-TIME AUDIT STREAM</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-[-0.03em] text-white">
              Public Ledger & Milestone Proofs
            </h2>
          </div>
          <div className="font-mono text-xs text-zinc-500">
            AUTO-STREAMING // 1,429 RECORDED ON-CHAIN TRANSACTIONS
          </div>
        </div>

        {/* Controls: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 font-mono text-xs">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="FILTER BY CAMPAIGN, TX, OR HASH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#121216] border border-white/[0.08] text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00F59B]/60 text-xs rounded-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {(["ALL", "RELEASED", "ESCROW_LOCKED", "AUDITING"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 transition-colors uppercase ${
                  activeFilter === filter
                    ? "bg-white text-black font-semibold"
                    : "bg-[#121216] text-zinc-400 hover:text-white border border-white/[0.06]"
                }`}
              >
                {filter.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Tabular Ledger Container */}
        <div className="border border-white/[0.08] bg-[#0C0C0E] overflow-x-auto crosshair-corner">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-[#121216] text-zinc-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-medium">TIMESTAMP</th>
                <th className="py-3 px-4 font-medium">CAMPAIGN & TRANCHE</th>
                <th className="py-3 px-4 font-medium">AMOUNT (INR)</th>
                <th className="py-3 px-4 font-medium">STATUS</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">TX HASH</th>
                <th className="py-3 px-4 font-medium text-right">PROOF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="hover:bg-[#16161D] transition-colors cursor-pointer group"
                >
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400">
                    <span className="text-zinc-300 font-semibold group-hover:text-white">{tx.timestamp}</span>
                    <div className="text-[10px] text-zinc-500">{tx.id}</div>
                  </td>

                  {/* Campaign */}
                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                    <div className="text-white font-medium truncate group-hover:text-[#00F59B] transition-colors">
                      {tx.campaign}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{tx.milestone}</div>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-white">
                    {tx.currency}
                    {tx.amount.toLocaleString("en-IN")}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.status === "RELEASED" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B] text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B]" />
                        RELEASED
                      </span>
                    )}
                    {tx.status === "ESCROW_LOCKED" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ESCROW LOCKED
                      </span>
                    )}
                    {tx.status === "AUDITING" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                        AUDITING
                      </span>
                    )}
                    {tx.status === "OCR_VERIFIED" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        OCR VERIFIED
                      </span>
                    )}
                  </td>

                  {/* TX Hash */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500 text-[11px] hidden md:table-cell">
                    <span className="hover:text-zinc-300 transition-colors">
                      {tx.txHash.substring(0, 10)}...{tx.txHash.substring(34)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTx(tx);
                      }}
                      className="px-2.5 py-1 bg-white/[0.04] group-hover:bg-[#00F59B] group-hover:text-black border border-white/[0.08] text-zinc-300 text-[10px] uppercase transition-all inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>INSPECT</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Micro Telemetry Bar */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-zinc-500 px-1">
          <div>SHOWING {filteredTransactions.length} AUDITED TRANCHES</div>
          <div>HASH VALIDATION ALGORITHM: KECCAK-256 / SHA-256 MERKLE TREES</div>
        </div>
      </div>

      {/* Cryptographic Inspector Modal */}
      <TxDetailModal
        tx={selectedTx}
        onClose={() => setSelectedTx(null)}
      />
    </section>
  );
}
