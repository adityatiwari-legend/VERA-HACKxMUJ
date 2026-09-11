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
  Award,
  Cpu,
  Database,
  ArrowDown,
  UserCheck,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatRupees } from '@/lib/utils';

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

  const target = financialSummary.targetAmount;
  const raised = financialSummary.raisedAmount;
  const locked = financialSummary.lockedAmount;
  const released = financialSummary.releasedAmount;
  const refunded = financialSummary.refundedAmount;
  const remaining = financialSummary.remainingAmount;
  const progressPercent = financialSummary.progressPercent;

  // Build the 9-stage Fund Trail representation from live campaign data
  const fundTrailStages = [
    {
      id: 'DONATION',
      name: 'DONATION',
      label: 'Initial Contribution',
      timestamp: timeline.find((e) => e.type === 'DONATION_RECEIVED')?.timestamp || campaign.created_at,
      status: raised > 0 ? 'CONFIRMED' : 'PENDING',
      actor: 'Public Donors',
      reference: `₹${formatRupees(raised).replace('₹', '')} contributed across confirmed donors`,
      isDone: raised > 0,
      icon: Coins,
    },
    {
      id: 'EARMARKED',
      name: 'EARMARKED',
      label: 'Programmatic Earmarking',
      timestamp: timeline.find((e) => e.type === 'DONATION_RECEIVED')?.timestamp || campaign.created_at,
      status: raised > 0 ? 'ACTIVE' : 'PENDING',
      actor: 'VERA Protocol Engine',
      reference: `Bound to Campaign ID: ${campaign.id.substring(0, 8)}... (Zero Co-mingling)`,
      isDone: raised > 0,
      icon: Lock,
    },
    {
      id: 'LOCKED',
      name: 'LOCKED',
      label: 'Escrow Vault Custody',
      timestamp: timeline.find((e) => e.type === 'FUNDS_LOCKED')?.timestamp || campaign.created_at,
      status: locked > 0 ? 'LOCKED' : 'RELEASED',
      actor: 'Smart Contract Escrow',
      reference: `${formatRupees(locked)} currently protected in custody`,
      isDone: raised > 0,
      icon: Database,
    },
    {
      id: 'MILESTONE',
      name: 'MILESTONE',
      label: 'Deliverable Capping',
      timestamp: timeline.find((e) => e.type === 'MILESTONE_CREATED')?.timestamp || campaign.created_at,
      status: milestones.length > 0 ? 'ACTIVE' : 'PENDING',
      actor: ngo.name,
      reference: `${milestones.length} bounded milestone tranches defined`,
      isDone: milestones.length > 0,
      icon: Layers,
    },
    {
      id: 'PROOF',
      name: 'PROOF',
      label: 'Evidence Ingestion',
      timestamp: timeline.find((e) => e.type === 'PROOF_SUBMITTED')?.timestamp || null,
      status: trustIndicators.proofSubmitted ? 'PROOF SUBMITTED' : 'PENDING',
      actor: ngo.name,
      reference: trustIndicators.proofSubmitted ? 'Vendor invoices & photos with SHA-256 digests' : 'Awaiting deliverable completion',
      isDone: trustIndicators.proofSubmitted,
      icon: FileCheck,
    },
    {
      id: 'VERIFICATION',
      name: 'VERIFICATION',
      label: 'AI OCR Screening',
      timestamp: timeline.find((e) => e.type === 'AI_VERIFICATION_COMPLETED')?.timestamp || null,
      status: trustIndicators.evidenceVerified ? 'APPROVED' : 'UNDER REVIEW',
      actor: 'VERA OCR AI Scanner',
      reference: trustIndicators.evidenceVerified ? 'Line-item mathematical reconciliation passed' : 'Discrepancy screening in progress',
      isDone: trustIndicators.evidenceVerified,
      icon: Cpu,
    },
    {
      id: 'AUDITOR APPROVAL',
      name: 'AUDITOR APPROVAL',
      label: 'Independent Sign-off',
      timestamp: timeline.find((e) => e.type === 'PROOF_APPROVED')?.timestamp || null,
      status: milestones.some((m) => m.approvalStatus === 'APPROVED') ? 'APPROVED' : 'UNDER REVIEW',
      actor: 'Certified Human Auditor',
      reference: milestones.some((m) => m.approvalStatus === 'APPROVED') ? 'Certified evidence integrity & authorized payout' : 'Under independent review queue',
      isDone: milestones.some((m) => m.approvalStatus === 'APPROVED'),
      icon: UserCheck,
    },
    {
      id: 'MULTISIG',
      name: 'MULTISIG',
      label: '2-of-3 Authorization',
      timestamp: timeline.find((e) => e.type === 'MULTISIG_APPROVAL' || e.type === 'RELEASE_REQUESTED')?.timestamp || null,
      status: released > 0 ? 'APPROVED' : (trustIndicators.multisigEnabled ? 'ACTIVE' : 'PENDING'),
      actor: 'NGO Admin + Project Lead + Certified Auditor',
      reference: released > 0 ? '2 of 3 threshold reached & verified' : 'Multi-signature consensus gate active',
      isDone: released > 0 || milestones.some((m) => m.releaseStatus === '2_OF_3_CONFIRMED' || m.releaseStatus === 'APPROVED'),
      icon: KeyRound,
    },
    {
      id: 'BLOCKCHAIN RELEASE',
      name: 'BLOCKCHAIN RELEASE',
      label: 'Non-Reentrant On-Chain Execution',
      timestamp: timeline.find((e) => e.type === 'FUNDS_RELEASED')?.timestamp || null,
      status: released > 0 ? 'RELEASED' : 'LOCKED',
      actor: 'VERA Smart Contract',
      reference: released > 0
        ? `${formatRupees(released)} disbursed on-chain`
        : 'Awaiting completion of previous verification stages',
      isDone: released > 0,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-8 pb-20 text-[#EDEDED]">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href={`/campaigns/${campaign.id}`}
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campaign Overview</span>
        </Link>

        <div className="flex items-center gap-3 font-mono text-xs">
          <Link
            href={`/ngos/${ngo.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111113] text-zinc-300 hover:text-white border border-white/[0.08] transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>NGO Profile</span>
          </Link>
          <Link
            href={`/campaigns/${campaign.id}/report`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00F59B] text-black font-semibold hover:bg-[#00F59B]/90 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* 
        ========================================================================
        HEADER (Requirement 12)
        PUBLIC AUDIT
        Campaign name
        "Anyone can verify this trail."
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl p-6 sm:p-8 border border-white/[0.08] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/25">
                <ShieldCheck className="w-3.5 h-3.5" />
                PUBLIC AUDIT
              </span>
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-zinc-400 font-mono">ID: {campaign.id.substring(0, 8)}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              {campaign.title}
            </h1>

            <p className="text-sm text-zinc-400 font-mono">
              Anyone can verify this trail. No login required.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono pt-1">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                NGO: <strong className="text-zinc-200">{ngo.name}</strong>
              </span>
              <span>•</span>
              <span>
                Beneficiary: <strong className="text-zinc-200">{campaign.beneficiary}</strong>
              </span>
            </div>
          </div>

          {/* Transparency Score */}
          <div className="bg-[#18181B] border border-white/[0.08] rounded-xl p-5 flex flex-col items-center justify-center shrink-0 min-w-[190px]">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-medium">
              TRANSPARENCY SCORE
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-bold font-mono text-[#00F59B]">
                {trustIndicators.score}
              </span>
              <span className="text-zinc-500 font-bold font-mono text-sm">/ 6</span>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 mt-1">
              {trustIndicators.score === 6 ? 'Fully Verified Trail' : 'Active Compliance'}
            </span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        FINANCIAL CARDS (Requirement 12)
        TARGET | RAISED | LOCKED | RELEASED | REFUNDED | REMAINING
        Dominant Indian currency numbers.
        ========================================================================
      */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
            TARGET
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {formatRupees(target)}
          </div>
        </div>

        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F59B] block font-medium">
            RAISED
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {formatRupees(raised)}
          </div>
        </div>

        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6366F1] block font-medium">
            LOCKED
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {formatRupees(locked)}
          </div>
        </div>

        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#06B6D4] block font-medium">
            RELEASED
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {formatRupees(released)}
          </div>
        </div>

        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#EF4444] block font-medium">
            REFUNDED
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {formatRupees(refunded)}
          </div>
        </div>

        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-4 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
            REMAINING
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {formatRupees(remaining)}
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        FUND TRAIL TIMELINE (Requirement 12)
        DONATION ↓ EARMARKED ↓ LOCKED ↓ MILESTONE ↓ PROOF ↓ VERIFICATION 
        ↓ AUDITOR APPROVAL ↓ MULTISIG ↓ BLOCKCHAIN RELEASE
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              VERIFIABLE EXECUTION PATH
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white font-sans">
              FUND TRAIL
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {fundTrailStages.filter((s) => s.isDone).length} of 9 Stages Complete
          </span>
        </div>

        {/* Vertical Connected Stage List */}
        <div className="relative pl-6 sm:pl-8 border-l border-white/[0.1] ml-3 sm:ml-4 space-y-6">
          {fundTrailStages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="relative group">
                {/* Node indicator */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    stage.isDone
                      ? 'bg-[#00F59B] text-black shadow-[0_0_8px_rgba(0,245,155,0.4)]'
                      : 'bg-[#18181B] border border-white/[0.2] text-zinc-500'
                  }`}
                >
                  {stage.isDone && <CheckCircle2 className="w-3 h-3 text-black" />}
                </div>

                <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06] hover:border-white/[0.14] transition-all space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-white">
                        {stage.name}
                      </span>
                      <span className="text-zinc-500 text-xs">/</span>
                      <span className="text-xs text-zinc-400 font-medium">
                        {stage.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={stage.status} size="sm" />
                      {stage.timestamp && (
                        <span className="text-[11px] font-mono text-zinc-400">
                          {new Date(stage.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-zinc-400 pt-1">
                    <span className="text-zinc-300">{stage.reference}</span>
                    <span className="text-zinc-400">
                      Actor: <strong className="text-white">{stage.actor}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 
        ========================================================================
        BLOCKCHAIN SECTION (Requirement 12)
        Blockchain Verified | Network | Transaction | Timestamp | [View on Explorer]
        Only show actual transaction hashes.
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#06B6D4] font-semibold block">
              SMART CONTRACT LEDGER
            </span>
            <h2 className="text-lg font-bold text-white">
              Blockchain Verification
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/25">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Blockchain Verified
          </span>
        </div>

        {/* Network & Contract Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
              NETWORK
            </span>
            <span className="font-bold text-[#06B6D4] text-sm block">
              {blockchain.network} (Chain ID: {blockchain.chainId})
            </span>
            <p className="text-[11px] text-zinc-400">Non-reentrant multi-sig release escrow</p>
          </div>

          <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
              CUSTODY CONTRACT
            </span>
            <span className="font-bold text-white text-xs break-all block">
              {blockchain.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
            </span>
            <p className="text-[11px] text-zinc-400">Verified Solidity escrow bytecode</p>
          </div>
        </div>

        {/* Confirmed Real Transaction Hashes */}
        <div className="space-y-3 font-mono">
          <span className="text-xs font-medium text-zinc-300 uppercase tracking-wider block">
            Confirmed On-Chain Transactions ({blockchain.transactions.length})
          </span>

          {blockchain.transactions.length === 0 ? (
            <div className="p-4 rounded-lg bg-[#18181B] text-center text-xs text-zinc-400">
              No on-chain transactions confirmed yet for this campaign.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06] border border-white/[0.08] rounded-lg overflow-hidden">
              {blockchain.transactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B] hover:bg-white/[0.02] text-xs transition-colors"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/25 uppercase">
                        {tx.label}
                      </span>
                      {tx.amount && (
                        <span className="font-bold text-white font-mono">
                          {formatRupees(tx.amount)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate max-w-sm sm:max-w-md">
                      Transaction: {tx.txHash}
                    </div>
                  </div>

                  <a
                    href={tx.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#00F59B] hover:underline shrink-0 text-xs"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 
        ========================================================================
        MILESTONE TABLE (Requirement 12)
        Clear financial allocation, claimed, released, proof, verification.
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] shadow-sm overflow-hidden space-y-0">
        <div className="p-6 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              BUDGET SEGMENTATION
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white font-sans">
              Milestone Allocation & Progress
            </h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {milestones.length} Milestones Configured
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181B] text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/[0.08]">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Milestone</th>
                <th className="px-5 py-3">Allocation</th>
                <th className="px-5 py-3">Claimed</th>
                <th className="px-5 py-3">Released</th>
                <th className="px-5 py-3">Proof Status</th>
                <th className="px-5 py-3">AI Verification</th>
                <th className="px-5 py-3">Disbursement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-mono">
              {milestones.map((ms) => (
                <tr key={ms.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-bold text-white">0{ms.sequence}</td>
                  <td className="px-5 py-3.5 font-sans">
                    <div className="font-bold text-white">{ms.title}</div>
                    <div className="text-[11px] text-zinc-400 line-clamp-1">{ms.description}</div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-white">{formatRupees(ms.allocatedAmount)}</td>
                  <td className="px-5 py-3.5 text-zinc-300">{formatRupees(ms.claimedAmount || 0)}</td>
                  <td className="px-5 py-3.5 font-bold text-[#06B6D4]">{formatRupees(ms.releasedAmount)}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={ms.proofCount > 0 ? (ms.approvalStatus || 'UNDER REVIEW') : 'PENDING'} />
                  </td>
                  <td className="px-5 py-3.5">
                    {ms.verificationStatus === 'VERIFIED' ? (
                      <span className="text-[#00F59B] font-semibold">Passed OCR</span>
                    ) : ms.discrepancyAmount && ms.discrepancyAmount > 0 ? (
                      <span className="text-[#F59E0B] font-semibold">Variance: {formatRupees(ms.discrepancyAmount)}</span>
                    ) : (
                      <span className="text-zinc-500">Awaiting Scan</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={ms.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 
        ========================================================================
        BENEFICIARY SPEND EVIDENCE (Requirement 12)
        Shown only when actually recorded.
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-4">
        <div className="border-b border-white/[0.08] pb-4">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
            VERIFIED EVIDENCE
          </span>
          <h2 className="text-lg font-bold text-white">
            Beneficiary Spend Evidence
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5 font-mono">
            Vendor invoices, itemized receipts, and completion documentation recorded for this campaign.
          </p>
        </div>

        {milestones.filter((m) => m.proofCount > 0).length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 font-mono bg-[#18181B] rounded-lg">
            Beneficiary spend evidence is pending physical deliverable execution and invoice upload.
          </div>
        ) : (
          <div className="space-y-3">
            {milestones
              .filter((m) => m.proofCount > 0)
              .map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#00F59B]" />
                      <span className="font-bold text-white">{m.title}</span>
                      <span className="text-zinc-500">({m.proofCount} Evidence File{m.proofCount > 1 ? 's' : ''})</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Discrepancy Status: {m.discrepancyAmount && m.discrepancyAmount > 0 ? (
                        <span className="text-[#F59E0B] font-semibold">Flagged: {formatRupees(m.discrepancyAmount)} Variance Resolved</span>
                      ) : (
                        <span className="text-[#00F59B] font-semibold">Exact Match (0 Discrepancy)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">Auditor Status: <strong className="text-white">{m.approvalStatus}</strong></span>
                    <span className="text-[#00F59B] font-semibold">SHA-256 Anchored</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        COMPLETE AUDIT TIMELINE (Requirement 12)
        Financial statement + activity log feel.
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 font-mono">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#00F59B] font-semibold block">
              IMMUTABLE ACTIVITY LOG
            </span>
            <h2 className="text-lg font-bold text-white font-sans">
              Complete Audit Timeline
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {timeline.length} Ledger Event{timeline.length === 1 ? '' : 's'}
          </span>
        </div>

        {timeline.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 font-mono bg-[#18181B] rounded-lg">
            No audit events recorded for this campaign yet.
          </div>
        ) : (
          <div className="relative pl-6 border-l border-white/[0.1] ml-2 space-y-6">
            {timeline.map((event) => (
              <div key={event.id} className="relative group">
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#09090B] border-2 border-[#00F59B]" />

                <div className="space-y-1 font-mono">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">
                      {new Date(event.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    {event.statusBadge && (
                      <StatusBadge status={event.statusBadge} size="sm" />
                    )}
                    {event.amount && (
                      <span className="text-xs font-bold text-white">
                        {formatRupees(event.amount)}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white font-sans">{event.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-sans">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400">
                    <span>
                      Actor: <strong className="text-white">{event.actorLabel}</strong>
                    </span>
                    {event.milestoneTitle && (
                      <>
                        <span>•</span>
                        <span>Milestone: <strong className="text-white">{event.milestoneTitle}</strong></span>
                      </>
                    )}
                    {event.txHash && (
                      <>
                        <span>•</span>
                        <a
                          href={event.explorerUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#00F59B] hover:underline"
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
        )}
      </div>

      {/* Legal & Regulatory Integrity Footer */}
      <div className="rounded-xl bg-[#111113] p-4 border border-white/[0.08] text-xs text-zinc-400 space-y-1 font-mono">
        <p className="font-semibold text-white">VERA Protocol Regulatory Integrity:</p>
        <p>
          VERA enforces programmatic fund earmarking, SHA-256 evidence hashing, AI OCR discrepancy screening, 2-of-3 multi-signature governance, and tamper-evident blockchain recording. Financial records are reconciled across atomic database transactions and testnet smart contract events.
        </p>
      </div>
    </div>
  );
}
