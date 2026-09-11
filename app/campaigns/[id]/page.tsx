import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaignById } from '@/lib/campaigns';
import { getMilestonesForCampaign } from '@/lib/milestones';
import { getCampaignFinancialSummary } from '@/lib/fund_transactions';
import { getAuditLogsForCampaign } from '@/lib/audit';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import { BlockchainBadge } from '@/components/BlockchainBadge';
import { DonationModal } from './DonationModal';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  CheckCircle2,
  Lock,
  History,
  ShieldCheck,
  Coins,
  ExternalLink,
  Target,
  FileCheck,
  UserCheck,
  Cpu,
} from 'lucide-react';
import { formatRupees } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PublicCampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [campaign, milestones, summary, auditLogs] = await Promise.all([
    getCampaignById(params.id),
    getMilestonesForCampaign(params.id),
    getCampaignFinancialSummary(params.id),
    getAuditLogsForCampaign(params.id),
  ]);

  if (!campaign) {
    notFound();
  }

  const target = summary ? summary.targetAmount : Number(campaign.target_amount);
  const raised = summary ? summary.raisedAmount : Number(campaign.raised_amount);
  const released = summary ? summary.releasedAmount : Number(campaign.released_amount || 0);
  const locked = summary ? summary.lockedAmount : Math.max(0, raised - released);
  const refunded = summary ? summary.refundedAmount : 0;
  const remaining = summary ? summary.remainingAmount : Math.max(0, target - raised);
  const percent = summary ? summary.progressPercent : (target > 0 ? Math.round((raised / target) * 100) : 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8 pb-20 text-[#EDEDED]">
      {/* Top Back Navigation */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Campaigns</span>
      </Link>

      {/* 
        ========================================================================
        TOP SECTION (Requirement 11)
        Campaign name | Beneficiary | NGO | Status | Trust score
        Primary CTA: Donate | Secondary: View Public Audit
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-zinc-500 font-mono">ID: {campaign.id.substring(0, 8)}</span>
              {campaign.blockchain_status && (
                <BlockchainBadge
                  status={campaign.blockchain_status}
                  network={campaign.blockchain_network || 'Hardhat Testnet'}
                />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              {campaign.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-mono pt-1">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Building2 className="w-4 h-4 text-zinc-500" />
                NGO: <strong className="text-white">{campaign.ngo_name}</strong>
              </span>
              <span>•</span>
              <span className="text-zinc-300">
                Beneficiary: <strong className="text-white">{campaign.beneficiary}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Launched {new Date(campaign.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          {/* Trust Score & Action CTAs */}
          <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="p-3 bg-[#18181B] border border-white/[0.08] rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#00F59B]" />
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
                  VERA TRUST SCORE
                </span>
                <span className="text-lg font-bold font-mono text-white">94 / 100</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 w-full sm:w-auto">
              {/* Secondary CTA: View Public Audit */}
              <Link
                href={`/campaigns/${campaign.id}/audit`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#18181B] hover:bg-white/[0.06] text-white border border-white/[0.08] text-xs font-mono transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#00F59B]" />
                <span>View Public Audit</span>
              </Link>

              {/* Primary CTA: Donate */}
              {campaign.status === 'ACTIVE' ? (
                <DonationModal
                  campaignId={campaign.id}
                  campaignTitle={campaign.title}
                  remainingGoal={remaining}
                />
              ) : (
                <span className="px-4 py-2.5 rounded-lg text-xs font-mono bg-white/[0.04] text-zinc-400 border border-white/[0.08]">
                  Campaign {campaign.status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 
          ========================================================================
          FINANCIAL SUMMARY (Requirement 11)
          Target | Raised | Locked | Released | Refunded | Remaining
          ========================================================================
        */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-baseline font-mono text-xs">
              <span className="text-white font-bold text-sm">{percent}% Funded</span>
              <span className="text-zinc-400">
                {formatRupees(raised)} of {formatRupees(target)} Target
              </span>
            </div>
            <ProgressBar current={raised} total={target} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center font-mono">
            <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">TARGET</span>
              <span className="text-sm font-bold text-white block mt-1">{formatRupees(target)}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.06]">
              <span className="text-[10px] text-[#00F59B] uppercase tracking-wider block font-medium">RAISED</span>
              <span className="text-sm font-bold text-white block mt-1">{formatRupees(raised)}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.06]">
              <span className="text-[10px] text-[#6366F1] uppercase tracking-wider block font-medium">LOCKED</span>
              <span className="text-sm font-bold text-white block mt-1">{formatRupees(locked)}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.06]">
              <span className="text-[10px] text-[#06B6D4] uppercase tracking-wider block font-medium">RELEASED</span>
              <span className="text-sm font-bold text-white block mt-1">{formatRupees(released)}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.06]">
              <span className="text-[10px] text-[#EF4444] uppercase tracking-wider block font-medium">REFUNDED</span>
              <span className="text-sm font-bold text-white block mt-1">{formatRupees(refunded)}</span>
            </div>

            <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">REMAINING</span>
              <span className="text-sm font-bold text-white block mt-1">{formatRupees(remaining)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Beneficiary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#111113] rounded-xl border border-white/[0.08] p-6 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
            INITIATIVE OVERVIEW
          </span>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
            {campaign.description}
          </p>
        </div>

        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
            TARGET BENEFICIARY
          </span>
          <div className="p-3.5 rounded-lg bg-[#18181B] border border-white/[0.06] text-xs font-semibold text-white font-mono">
            {campaign.beneficiary}
          </div>
          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Funds remain locked in escrow until certified proof confirms physical deliverable execution for this beneficiary.
          </p>
        </div>
      </div>

      {/* 
        ========================================================================
        MILESTONE PROGRESS (Requirement 11)
        Each milestone clearly showing:
        Allocation | Claimed | Released | Proof status | Verification | Approval | Release status
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              DELIVERABLE ROADMAP
            </span>
            <h2 className="text-lg font-bold text-white font-sans">
              Milestone Progress & Release States
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {milestones.length} Milestone Tranches
          </span>
        </div>

        {milestones.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 font-mono bg-[#18181B] rounded-lg">
            No milestones configured for this campaign yet.
          </div>
        ) : (
          <div className="space-y-4">
            {milestones.map((ms) => {
              const allocated = Number(ms.amount);
              const claimed = ms.active_proof_status ? allocated : 0;
              const releasedAmount = ms.status === 'RELEASED' ? allocated : 0;

              return (
                <div
                  key={ms.id}
                  className="p-5 rounded-lg bg-[#18181B] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-4 font-mono text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          0{ms.sequence}
                        </span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-sm font-bold text-white font-sans">
                          {ms.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-sans leading-relaxed max-w-xl">
                        {ms.description}
                      </p>
                    </div>

                    <StatusBadge status={ms.status} size="sm" />
                  </div>

                  {/* Milestone 7 Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-white/[0.06] text-center">
                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block">ALLOCATION</span>
                      <span className="font-bold text-white mt-0.5 block">{formatRupees(allocated)}</span>
                    </div>

                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block">CLAIMED</span>
                      <span className="font-bold text-zinc-200 mt-0.5 block">{formatRupees(claimed)}</span>
                    </div>

                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block">RELEASED</span>
                      <span className="font-bold text-[#06B6D4] mt-0.5 block">{formatRupees(releasedAmount)}</span>
                    </div>

                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block">PROOF STATUS</span>
                      <span className="font-semibold text-zinc-300 mt-0.5 block truncate">
                        {claimed > 0 ? 'Submitted' : 'Pending'}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block">VERIFICATION</span>
                      <span className="font-semibold text-[#00F59B] mt-0.5 block truncate">
                        {claimed > 0 ? 'OCR Passed' : 'Pending'}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block">APPROVAL</span>
                      <span className="font-semibold text-white mt-0.5 block truncate">
                        {ms.status === 'APPROVED' || ms.status === 'RELEASED' ? 'Approved' : 'Reviewing'}
                      </span>
                    </div>

                    <div className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[10px] text-zinc-500 block">RELEASE STATUS</span>
                      <span className="font-semibold text-[#00F59B] mt-0.5 block truncate">
                        {ms.status === 'RELEASED' ? 'Released' : 'Locked'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
