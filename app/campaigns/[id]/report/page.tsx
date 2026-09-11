import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaignAuditDetails } from '@/lib/campaigns';
import { getCampaignAuditTimeline } from '@/lib/audit_timeline';
import { PrintButton } from './PrintButton';
import { ArrowLeft, ShieldCheck, CheckCircle2, FileCheck, Coins, Layers, History, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CampaignReportPage({
  params,
}: {
  params: { id: string };
}) {
  const [details, timeline] = await Promise.all([
    getCampaignAuditDetails(params.id),
    getCampaignAuditTimeline(params.id),
  ]);

  if (!details) {
    notFound();
  }

  const { campaign, ngo, financialSummary, milestones, blockchain, trustIndicators } = details;

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const reportDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 pt-4 print:p-0 print:space-y-6">
      {/* Non-print navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/campaigns/${campaign.id}/audit`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Audit Dashboard
        </Link>
        <PrintButton />
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm print:border-none print:shadow-none print:p-0 space-y-8">
        {/* Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-700 font-bold tracking-wider uppercase text-xs">
              <ShieldCheck className="w-4 h-4" />
              VERA Fund Trail Integrity Platform
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Campaign Audit & Financial Report
            </h1>
            <p className="text-xs text-slate-500">
              Generated automatically from verified PostgreSQL records and testnet smart contract anchors.
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <p className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Report Timestamp</p>
            <p className="font-mono font-medium text-slate-800">{reportDate}</p>
            <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-1">
              STATUS: {campaign.status}
            </div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            1. Campaign Metadata & Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Initiative Title</span>
              <span className="font-bold text-slate-900 block mt-0.5">{campaign.title}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Executing NGO</span>
              <span className="font-bold text-slate-900 block mt-0.5">{ngo.name}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Beneficiary</span>
              <span className="font-bold text-slate-900 block mt-0.5">{campaign.beneficiary}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">VERA System ID</span>
              <span className="font-mono text-slate-700 block mt-0.5 text-[11px]">{campaign.id}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Audit Breakdown */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-slate-500" />
            2. Financial Ledger & Escrow Accounting
          </h2>
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Financial Metric</th>
                <th className="p-3 text-right">Amount (INR)</th>
                <th className="p-3">Accounting State / Invariant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3 font-semibold">Target Capital Goal</td>
                <td className="p-3 text-right font-mono font-bold">{formatRupees(financialSummary.targetAmount)}</td>
                <td className="p-3 text-slate-500">Authorized campaign funding ceiling</td>
              </tr>
              <tr className="bg-emerald-50/40">
                <td className="p-3 font-semibold text-emerald-900">Total Confirmed Donations</td>
                <td className="p-3 text-right font-mono font-bold text-emerald-800">{formatRupees(financialSummary.raisedAmount)}</td>
                <td className="p-3 text-emerald-700">Received and earmarked from {financialSummary.donorsCount} unique donor(s)</td>
              </tr>
              <tr className="bg-blue-50/40">
                <td className="p-3 font-semibold text-blue-900">Locked in Escrow</td>
                <td className="p-3 text-right font-mono font-bold text-blue-800">{formatRupees(financialSummary.lockedAmount)}</td>
                <td className="p-3 text-blue-700">Reserved in PostgreSQL accounting escrow awaiting milestone proofs</td>
              </tr>
              <tr className="bg-indigo-50/40">
                <td className="p-3 font-semibold text-indigo-900">Total Released to Beneficiary</td>
                <td className="p-3 text-right font-mono font-bold text-indigo-800">{formatRupees(financialSummary.releasedAmount)}</td>
                <td className="p-3 text-indigo-700">Disbursed upon auditor review and 2-of-3 multisig signatures</td>
              </tr>
              {financialSummary.refundedAmount > 0 && (
                <tr className="bg-rose-50/40">
                  <td className="p-3 font-semibold text-rose-900">Total Refunded to Donors</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-800">{formatRupees(financialSummary.refundedAmount)}</td>
                  <td className="p-3 text-rose-700">Returned to donors due to unfulfilled milestones</td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold">
                <td className="p-3">Current Escrow Balance</td>
                <td className="p-3 text-right font-mono">{formatRupees(financialSummary.remainingBalance)}</td>
                <td className="p-3 text-slate-600">Net active funds held in escrow</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Milestones & Verification Audit */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            3. Milestone Delivery, Proof Evidence & Verification
          </h2>
          <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Milestone</th>
                <th className="p-3 text-right">Allocated</th>
                <th className="p-3 text-right">Released</th>
                <th className="p-3">Proof Evidence</th>
                <th className="p-3">Auditor Approval</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {milestones.map((ms) => (
                <tr key={ms.id}>
                  <td className="p-3 font-mono font-bold">{ms.sequence}</td>
                  <td className="p-3">
                    <span className="font-bold block">{ms.title}</span>
                    <span className="text-[10px] text-slate-400 block">{ms.description}</span>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold">{formatRupees(ms.allocatedAmount)}</td>
                  <td className="p-3 text-right font-mono font-semibold text-indigo-700">{formatRupees(ms.releasedAmount)}</td>
                  <td className="p-3">
                    {ms.proofCount > 0 ? (
                      <span className="text-emerald-700 font-semibold">{ms.proofCount} Docs (SHA-256 Hashed)</span>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold">{ms.approvalStatus}</span>
                  </td>
                  <td className="p-3">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                      {ms.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Blockchain Testnet Settlement */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            4. Smart Contract Blockchain Anchors
          </h2>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Blockchain Network:</span>
              <span className="font-bold text-slate-900">{blockchain.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contract Address:</span>
              <span className="font-mono text-slate-800">{blockchain.contractAddress || '0x0B306BF915C4d645ff596e518fAf3F9669b97016'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Confirmed On-Chain Transactions:</span>
              <span className="font-bold text-slate-900">{blockchain.transactions.length} record(s)</span>
            </div>
          </div>
        </div>

        {/* Section 5: Attestation & System Invariants */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-2">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            System Attestation & Compliance Statement
          </p>
          <p>
            This document represents an automated export of the VERA audit trail. All financial mutations execute within ACID-compliant PostgreSQL database transactions. Release operations enforce 2-of-3 multi-signature consensus before smart contract execution.
          </p>
          <div className="flex justify-between pt-4 text-slate-400 font-mono text-[10px]">
            <span>VERA Protocol v0.2.0 (Phase 5)</span>
            <span>Tamper-Evident Public Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
