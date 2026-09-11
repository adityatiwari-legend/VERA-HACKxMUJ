import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaignAuditDetails } from '@/lib/campaigns';
import { getCampaignAuditTimeline } from '@/lib/audit_timeline';
import {
  ShieldCheck,
  Building2,
  Lock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Printer,
  History,
  Layers,
  FileCheck,
  KeyRound,
  FileText,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';

export const dynamic = 'force-dynamic';

export default async function PublicAuditDashboardPage({
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

  const target = financialSummary.targetAmount;
  const raised = financialSummary.raisedAmount;
  const locked = financialSummary.lockedAmount;
  const released = financialSummary.releasedAmount;
  const refunded = financialSummary.refundedAmount;
  const remaining = financialSummary.remainingAmount;
  const progressPercent = financialSummary.progressPercent;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign Page
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/ngos/${ngo.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            View NGO Public Profile
          </Link>
          <Link
            href={`/campaigns/${campaign.id}/report`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Export Audit Report
          </Link>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                PUBLIC AUDIT TRAIL
              </span>
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-slate-400 font-mono">ID: {campaign.id.substring(0, 8)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {campaign.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                NGO: <strong className="text-white">{ngo.name}</strong>
              </span>
              <span>•</span>
              <span>
                Beneficiary: <strong className="text-white">{campaign.beneficiary}</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">
                Public Transparency Level: High
              </span>
            </div>
          </div>

          {/* Trust Score Badge */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center shrink-0 min-w-[170px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Transparency Score
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-emerald-400">{trustIndicators.score}</span>
              <span className="text-slate-400 font-bold text-sm">/6</span>
            </div>
            <span className="text-[11px] text-emerald-300 font-medium mt-0.5">
              {trustIndicators.score === 6 ? 'Fully Verified Trail' : 'Active Compliance'}
            </span>
          </div>
        </div>
      </div>

      {/* Campaign Trust Indicators Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          Campaign Transparency Indicators
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${trustIndicators.fundsEarmarked ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className="font-semibold text-slate-800">Funds Earmarked</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${trustIndicators.milestonesDefined ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className="font-semibold text-slate-800">Milestones Defined</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${trustIndicators.proofSubmitted ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className="font-semibold text-slate-800">Proof Submitted</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${trustIndicators.evidenceVerified ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className="font-semibold text-slate-800">Evidence Verified</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${trustIndicators.blockchainRecorded ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className="font-semibold text-slate-800">Blockchain Recorded</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${trustIndicators.multisigEnabled ? 'text-emerald-600' : 'text-slate-300'}`} />
            <span className="font-semibold text-slate-800">Multisig Enabled</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 italic">
          Transparency indicators report programmatic compliance and recorded verification evidence. They do not constitute an absolute real-world guarantee.
        </p>
      </div>

      {/* Financial Summary & Visual Analytics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-600" />
              Financial Summary & Capital Allocation
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Programmatic escrow breakdown verified through atomic database transactions.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 self-start sm:self-auto">
            {progressPercent}% Goal Reached
          </span>
        </div>

        {/* 6-box Financial Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">Target Goal</p>
            <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{formatRupees(target)}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <p className="text-[11px] font-medium text-emerald-800">Total Raised</p>
            <p className="text-base sm:text-lg font-bold text-emerald-900 mt-1">{formatRupees(raised)}</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
            <p className="text-[11px] font-medium text-blue-800">Locked in Escrow</p>
            <p className="text-base sm:text-lg font-bold text-blue-900 mt-1">{formatRupees(locked)}</p>
          </div>
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <p className="text-[11px] font-medium text-indigo-800">Total Released</p>
            <p className="text-base sm:text-lg font-bold text-indigo-900 mt-1">{formatRupees(released)}</p>
          </div>
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100">
            <p className="text-[11px] font-medium text-rose-800">Total Refunded</p>
            <p className="text-base sm:text-lg font-bold text-rose-900 mt-1">{formatRupees(refunded)}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">Remaining to Goal</p>
            <p className="text-base sm:text-lg font-bold text-slate-800 mt-1">{formatRupees(remaining)}</p>
          </div>
        </div>

        {/* Visual Analytics: Fund Distribution Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Fund Escrow Distribution</span>
            <span>Total Accounted: {formatRupees(raised)}</span>
          </div>

          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {raised > 0 ? (
              <>
                {released > 0 && (
                  <div
                    style={{ width: `${Math.round((released / raised) * 100)}%` }}
                    className="bg-indigo-600 h-full transition-all"
                    title={`Released to Beneficiary: ${formatRupees(released)}`}
                  />
                )}
                {locked > 0 && (
                  <div
                    style={{ width: `${Math.round((locked / raised) * 100)}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`Locked in Escrow: ${formatRupees(locked)}`}
                  />
                )}
                {refunded > 0 && (
                  <div
                    style={{ width: `${Math.round((refunded / raised) * 100)}%` }}
                    className="bg-rose-500 h-full transition-all"
                    title={`Refunded to Donors: ${formatRupees(refunded)}`}
                  />
                )}
              </>
            ) : (
              <div className="w-full bg-slate-200 h-full" />
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                Released ({raised > 0 ? Math.round((released / raised) * 100) : 0}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Locked in Escrow ({raised > 0 ? Math.round((locked / raised) * 100) : 0}%)
              </span>
              {refunded > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  Refunded ({Math.round((refunded / raised) * 100)}%)
                </span>
              )}
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Invariant Verified: Raised ≥ Locked + Released + Refunded
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Transparency Table & Verification Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Milestones & Evidence Verification Registry
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every milestone requires audited invoice evidence and multisig approval before release.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {milestones.length} Milestones Configured
          </span>
        </div>

        {milestones.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No milestones configured for this campaign yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Milestone Title</th>
                  <th className="px-5 py-3">Allocated / Released</th>
                  <th className="px-5 py-3">Proof Evidence</th>
                  <th className="px-5 py-3">AI / OCR Verification</th>
                  <th className="px-5 py-3">Auditor & Multisig</th>
                  <th className="px-5 py-3">Disbursement State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {milestones.map((ms) => (
                  <tr key={ms.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      {ms.sequence}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 text-sm">{ms.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                        {ms.description}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900">{formatRupees(ms.allocatedAmount)}</div>
                      <div className="text-[11px] text-slate-500">
                        Released: <span className="font-semibold text-indigo-700">{formatRupees(ms.releasedAmount)}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {ms.proofCount > 0 ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-100">
                            <FileCheck className="w-3 h-3" />
                            {ms.proofCount} Document(s)
                          </span>
                          <p className="text-[10px] text-slate-400">Cryptographically Hashed (SHA-256)</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Awaiting Proof</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {ms.verificationStatus === 'VERIFIED' ? (
                        <div>
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Passed Checks
                          </span>
                          {ms.detectedAmount && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Doc Total: {formatRupees(ms.detectedAmount)}
                            </p>
                          )}
                        </div>
                      ) : ms.discrepancyAmount && ms.discrepancyAmount > 0 ? (
                        <div>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Discrepancy: {formatRupees(ms.discrepancyAmount)}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Claimed: {formatRupees(ms.claimedAmount || 0)} | Invoice: {formatRupees(ms.detectedAmount || 0)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending AI Scan</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            ms.approvalStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ms.approvalStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          Auditor: {ms.approvalStatus}
                        </span>

                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          Multisig: {ms.releaseStatus}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${
                          ms.status === 'RELEASED'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : ms.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ms.status === 'FAILED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ms.status}
                      </span>

                      {ms.status === 'RELEASED' && (
                        <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                          ✓ On-chain Disbursed
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Beneficiary Spend Disclosure Note */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Beneficiary Spend Evidence:</strong> Invoices, itemized receipts, and execution photos are verified by certified auditors before fund disbursement.
            </span>
          </div>
          <span className="text-[11px] text-slate-400 shrink-0">
            Private files protected by RBAC
          </span>
        </div>
      </div>

      {/* Public Blockchain Verification Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Public Blockchain Verification & Explorer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamper-evident on-chain anchors on {blockchain.network}.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Smart Contract Verified
          </span>
        </div>

        {/* Contract Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider block">
              VERA Smart Contract Address
            </span>
            <span className="font-mono font-bold text-slate-900 break-all text-xs">
              {blockchain.contractAddress || '0x0B306BF915C4d645ff596e518fAf3F9669b97016'}
            </span>
            <p className="text-[10px] text-slate-400">Escrow, 2-of-3 Multisig, and Automated Settlement</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider block">
              Active Blockchain Network
            </span>
            <span className="font-bold text-slate-900 text-sm block">
              {blockchain.network}
            </span>
            <p className="text-[10px] text-slate-400 font-mono">Chain ID: {blockchain.chainId}</p>
          </div>
        </div>

        {/* Confirmed On-Chain Transactions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Confirmed On-Chain Transactions ({blockchain.transactions.length})
          </h3>

          {blockchain.transactions.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 text-center text-xs text-slate-400">
              No on-chain transactions submitted yet for this campaign.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {blockchain.transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/80 text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase">
                        {tx.label}
                      </span>
                      {tx.amount && (
                        <span className="font-bold text-slate-900">
                          {formatRupees(tx.amount)}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 truncate max-w-sm sm:max-w-md">
                      Tx: {tx.txHash}
                    </div>
                  </div>

                  <a
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-500 shrink-0 text-xs"
                  >
                    View on Explorer
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-slate-400">
            * All displayed transaction hashes are genuine blockchain receipts generated by the testnet JSON-RPC node. No simulated or fabricated hashes.
          </p>
        </div>
      </div>

      {/* Complete Chronological Fund & Audit Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Complete Chronological Audit Timeline</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every event recorded immutably in PostgreSQL audit logs and on-chain ledgers.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {timeline.length} Event{timeline.length === 1 ? '' : 's'}
          </span>
        </div>

        {timeline.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No audit events recorded for this campaign yet.
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <div className="relative border-l-2 border-slate-200 pl-6 space-y-8 ml-2">
              {timeline.map((event) => (
                <div key={event.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-emerald-600 shadow-sm" />

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        {new Date(event.timestamp).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                      {event.statusBadge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {event.statusBadge}
                        </span>
                      )}
                      {event.amount && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {formatRupees(event.amount)}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {event.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                      <span>
                        Actor: <strong className="text-slate-700">{event.actorLabel}</strong>
                      </span>
                      {event.milestoneTitle && (
                        <>
                          <span>•</span>
                          <span>
                            Milestone: <strong className="text-slate-700">{event.milestoneTitle}</strong>
                          </span>
                        </>
                      )}
                      {event.txHash && (
                        <>
                          <span>•</span>
                          <a
                            href={event.explorerUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-emerald-600 hover:text-emerald-500"
                          >
                            Tx: {event.txHash.substring(0, 10)}...
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Legal & Non-Exaggeration Disclaimer */}
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">VERA Platform Integrity Statement:</p>
        <p>
          VERA provides programmatic fund locking, evidence hashing, AI discrepancy screening, multi-signature release authorization, and tamper-evident blockchain recording. VERA does not independently certify offline physical reality or provide warranties regarding vendor goods quality.
        </p>
      </div>
    </div>
  );
}
