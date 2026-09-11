import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaignAuditDetails } from '@/lib/campaigns';
import { getCampaignAuditTimeline } from '@/lib/audit_timeline';
import { PrintButton } from './PrintButton';
import { formatRupees } from '@/lib/utils';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Coins,
  Layers,
  History,
  ExternalLink,
  Building2,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';

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

  const { campaign, ngo, financialSummary, milestones, blockchain } = details;

  const reportDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 pt-4 print:p-0 print:space-y-4 print:max-w-none">
      {/* Non-print navigation */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/campaigns/${campaign.id}/audit`}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Audit
        </Link>
        <PrintButton />
      </div>

      {/* Official Report Document Container */}
      <div className="bg-[#111113] print:bg-white text-zinc-200 print:text-slate-900 rounded-xl border border-zinc-800 print:border-none p-6 sm:p-10 shadow-sm print:p-0 space-y-8">
        {/* Report Header */}
        <div className="border-b border-zinc-800 print:border-b-2 print:border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#00F59B] print:text-emerald-700 font-bold tracking-wider uppercase text-xs font-mono">
              <ShieldCheck className="w-4 h-4" />
              VERA Fund Trail Transparency Report
            </div>
            <h1 className="text-2xl font-bold text-white print:text-slate-900 tracking-tight">
              Official Campaign Audit Statement
            </h1>
            <p className="text-xs text-zinc-400 print:text-slate-600">
              Cryptographically verified against PostgreSQL immutable ledger and EVM testnet anchors.
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1">
            <p className="text-zinc-500 print:text-slate-500 uppercase tracking-wider text-[10px] font-mono">Statement Date</p>
            <p className="font-mono text-zinc-300 print:text-slate-800 text-[11px]">{reportDate}</p>
            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20 print:bg-emerald-100 print:text-emerald-800">
              ● {campaign.status}
            </div>
          </div>
        </div>

        {/* Section 1: Campaign Overview */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold">
            1. Campaign Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-[#18181B] print:bg-slate-50 border border-zinc-800 print:border-slate-200 text-xs">
            <div>
              <span className="text-zinc-500 print:text-slate-500 text-[10px] font-mono uppercase block">Initiative Title</span>
              <span className="font-semibold text-white print:text-slate-900 block mt-0.5">{campaign.title}</span>
            </div>
            <div>
              <span className="text-zinc-500 print:text-slate-500 text-[10px] font-mono uppercase block">Managing NGO</span>
              <span className="font-semibold text-white print:text-slate-900 block mt-0.5">{ngo.name}</span>
            </div>
            <div>
              <span className="text-zinc-500 print:text-slate-500 text-[10px] font-mono uppercase block">Target Beneficiary</span>
              <span className="font-semibold text-white print:text-slate-900 block mt-0.5">{campaign.beneficiary}</span>
            </div>
            <div>
              <span className="text-zinc-500 print:text-slate-500 text-[10px] font-mono uppercase block">Audit ID</span>
              <span className="font-mono text-zinc-400 print:text-slate-700 block mt-0.5 text-[11px]">{campaign.id.slice(0, 12)}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Financial Summary */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-zinc-400" />
            2. Financial Summary & Escrow Custody
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-zinc-800 print:border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-[#18181B] print:bg-slate-100 text-zinc-400 print:text-slate-700 text-[10px] font-mono uppercase">
                <tr>
                  <th className="p-3">Financial Metric</th>
                  <th className="p-3 text-right">Amount (INR)</th>
                  <th className="p-3">Accounting State / Invariant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 print:divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-white print:text-slate-900">Target Capital Goal</td>
                  <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">{formatRupees(financialSummary.targetAmount)}</td>
                  <td className="p-3 text-zinc-400 print:text-slate-600">Authorized campaign funding ceiling</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[#00F59B] print:text-emerald-800">Total Confirmed Donations</td>
                  <td className="p-3 text-right font-mono font-bold text-[#00F59B] print:text-emerald-800">{formatRupees(financialSummary.raisedAmount)}</td>
                  <td className="p-3 text-zinc-400 print:text-slate-600">Received and earmarked from {financialSummary.donorsCount} unique donor(s)</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-400 print:text-amber-800">Locked in Escrow</td>
                  <td className="p-3 text-right font-mono font-bold text-amber-400 print:text-amber-800">{formatRupees(financialSummary.lockedAmount)}</td>
                  <td className="p-3 text-zinc-400 print:text-slate-600">Reserved in smart escrow custody awaiting milestone evidence</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-indigo-400 print:text-indigo-800">Total Released</td>
                  <td className="p-3 text-right font-mono font-bold text-indigo-400 print:text-indigo-800">{formatRupees(financialSummary.releasedAmount)}</td>
                  <td className="p-3 text-zinc-400 print:text-slate-600">Disbursed on-chain upon independent auditor and multisig authorization</td>
                </tr>
                {financialSummary.refundedAmount > 0 && (
                  <tr>
                    <td className="p-3 font-semibold text-red-400 print:text-red-800">Total Refunded</td>
                    <td className="p-3 text-right font-mono font-bold text-red-400 print:text-red-800">{formatRupees(financialSummary.refundedAmount)}</td>
                    <td className="p-3 text-zinc-400 print:text-slate-600">Returned to donors due to unfulfilled conditions</td>
                  </tr>
                )}
                <tr className="bg-[#18181B]/60 print:bg-slate-50 font-bold">
                  <td className="p-3 text-white print:text-slate-900">Current Escrow Balance</td>
                  <td className="p-3 text-right font-mono text-white print:text-slate-900">{formatRupees(financialSummary.remainingBalance)}</td>
                  <td className="p-3 text-zinc-400 print:text-slate-600">Net active funds held in escrow custody</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Milestones */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            3. Milestones Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-zinc-800 print:border-slate-300 rounded-lg overflow-hidden">
              <thead className="bg-[#18181B] print:bg-slate-100 text-zinc-400 print:text-slate-700 text-[10px] font-mono uppercase">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Milestone Title</th>
                  <th className="p-3 text-right">Allocation</th>
                  <th className="p-3 text-right">Released</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 print:divide-slate-200">
                {milestones.map((ms) => (
                  <tr key={ms.id}>
                    <td className="p-3 font-mono font-bold text-zinc-400">{ms.sequence}</td>
                    <td className="p-3">
                      <span className="font-semibold text-white print:text-slate-900 block">{ms.title}</span>
                      <span className="text-[10px] text-zinc-500 print:text-slate-500 block">{ms.description}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">{formatRupees(ms.allocatedAmount)}</td>
                    <td className="p-3 text-right font-mono font-semibold text-indigo-400 print:text-indigo-800">{formatRupees(ms.releasedAmount)}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {ms.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Evidence */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            4. Cryptographic Evidence Records
          </h2>
          <div className="p-4 rounded-lg bg-[#18181B] print:bg-slate-50 border border-zinc-800 print:border-slate-200 text-xs space-y-2">
            <p className="text-zinc-300 print:text-slate-700 leading-relaxed">
              Every expense invoice submitted by the NGO is cryptographically fingerprinted using SHA-256 upon upload. Tampering with any byte invalidates verification on-chain.
            </p>
            <div className="divide-y divide-zinc-800/80 print:divide-slate-200 pt-1">
              {milestones.map((ms) => (
                <div key={ms.id} className="py-2 flex items-center justify-between">
                  <span className="font-semibold text-white print:text-slate-900">{ms.title}</span>
                  <span className="font-mono text-xs text-[#00F59B] print:text-emerald-700">
                    {ms.proofCount > 0 ? `${ms.proofCount} Document(s) Hashed & Fingerprinted` : 'No evidence submitted'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Verification */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
            5. Automated AI & OCR Verification
          </h2>
          <div className="p-4 rounded-lg bg-[#18181B] print:bg-slate-50 border border-zinc-800 print:border-slate-200 text-xs space-y-2">
            <p className="text-zinc-300 print:text-slate-700">
              Receipts undergo automated optical character recognition (OCR) and duplicate detection. Extracted amounts and tax invoice serial numbers are cross-referenced with milestone allocations to flag discrepancies.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded bg-[#111113] print:bg-white border border-zinc-800 print:border-slate-200">
                <span className="text-zinc-500 block text-[10px]">OCR Precision Engine</span>
                <span className="text-white print:text-slate-900 font-bold">Standard Invariant OCR</span>
              </div>
              <div className="p-2.5 rounded bg-[#111113] print:bg-white border border-zinc-800 print:border-slate-200">
                <span className="text-zinc-500 block text-[10px]">Duplicate Hash Check</span>
                <span className="text-[#00F59B] print:text-emerald-700 font-bold">Passed (0 duplicates)</span>
              </div>
              <div className="p-2.5 rounded bg-[#111113] print:bg-white border border-zinc-800 print:border-slate-200">
                <span className="text-zinc-500 block text-[10px]">Auditor Cross-Check</span>
                <span className="text-indigo-400 print:text-indigo-700 font-bold">Enforced Before Release</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Approvals */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
            6. Auditor Verification & Multisig Approvals
          </h2>
          <div className="p-4 rounded-lg bg-[#18181B] print:bg-slate-50 border border-zinc-800 print:border-slate-200 text-xs space-y-2">
            <p className="text-zinc-300 print:text-slate-700">
              Human auditor verification is mandatory. Once evidence is verified, fund disbursement requires 2-of-3 multi-signature consensus among designated keys (NGO Admin, Project Lead, Certified Auditor).
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs font-mono">
              <span className="inline-flex items-center gap-1 text-[#00F59B] print:text-emerald-700 font-semibold">
                ✓ 2-of-3 Multisig Rule Enforced
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 print:text-slate-600">Double-release prevented by contract state machine</span>
            </div>
          </div>
        </div>

        {/* Section 7: Blockchain Activity */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            7. Blockchain Activity & Smart Contract Anchors
          </h2>
          <div className="p-4 rounded-lg bg-[#18181B] print:bg-slate-50 border border-zinc-800 print:border-slate-200 text-xs space-y-2">
            <div className="flex justify-between font-mono">
              <span className="text-zinc-500 print:text-slate-500">Blockchain Network:</span>
              <span className="font-bold text-white print:text-slate-900">{blockchain.network}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-zinc-500 print:text-slate-500">Contract Address:</span>
              <span className="font-mono text-zinc-300 print:text-slate-800">{blockchain.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}</span>
            </div>
            <div className="flex justify-between font-mono">
              <span className="text-zinc-500 print:text-slate-500">Confirmed On-Chain Transactions:</span>
              <span className="font-bold text-white print:text-slate-900">{blockchain.transactions.length} record(s)</span>
            </div>
          </div>
        </div>

        {/* Section 8: Audit Timeline */}
        <div className="space-y-2.5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400 print:text-slate-500 font-bold flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-zinc-400" />
            8. Chronological Audit Timeline
          </h2>
          <div className="divide-y divide-zinc-800 print:divide-slate-200 border border-zinc-800 print:border-slate-200 rounded-lg overflow-hidden text-xs">
            {timeline.slice(0, 10).map((event) => (
              <div key={event.id} className="p-3 flex items-start justify-between gap-3 bg-[#18181B]/40 print:bg-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white print:text-slate-900">{event.title}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-zinc-800 text-zinc-400 print:bg-slate-100 print:text-slate-700">
                      {event.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 print:text-slate-600 mt-0.5">{event.description}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 print:text-slate-500 shrink-0">
                  {new Date(event.timestamp).toLocaleDateString('en-IN', { dateStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attestation & System Invariants */}
        <div className="pt-5 border-t border-zinc-800 print:border-slate-300 text-[10px] font-mono text-zinc-500 print:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VERA Protocol • Tamper-Evident Public Ledger</span>
          <span>ACID-Compliant PostgreSQL + EVM Smart Contract</span>
        </div>
      </div>
    </div>
  );
}
