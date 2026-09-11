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
  Milestone,
  CheckCircle2,
  Lock,
  History,
  ShieldCheck,
} from 'lucide-react';

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

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const target = summary ? summary.targetAmount : Number(campaign.target_amount);
  const raised = summary ? summary.raisedAmount : Number(campaign.raised_amount);
  const locked = summary ? summary.lockedAmount : raised;
  const released = summary ? summary.releasedAmount : 0;
  const remaining = summary ? summary.remainingAmount : target - raised;
  const percent = summary ? summary.progressPercent : (target > 0 ? Math.round((raised / target) * 100) : 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Campaigns
      </Link>

      {/* Main Campaign Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-slate-400 font-mono">VERA-ID: {campaign.id.substring(0, 8)}</span>
              {campaign.blockchain_status && (
                <BlockchainBadge
                  status={campaign.blockchain_status}
                  network={campaign.blockchain_network || 'Hardhat / Sepolia Testnet'}
                />
              )}
            </div>
            {campaign.blockchain_campaign_id && (
              <div className="text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="text-slate-400">On-Chain ID:</span> {campaign.blockchain_campaign_id}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                Organized by {campaign.ngo_name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Launched {new Date(campaign.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <Link
              href={`/campaigns/${campaign.id}/audit`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Public Audit Trail
            </Link>

            {campaign.status === 'ACTIVE' ? (
              <DonationModal
                campaignId={campaign.id}
                campaignTitle={campaign.title}
                remainingGoal={remaining}
              />
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600">
                Campaign {campaign.status}
              </span>
            )}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="pt-6 space-y-4">
          <div className="space-y-2">
            <ProgressBar current={raised} total={target} />
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>{percent}% Funded</span>
              <span>Goal: {formatRupees(target)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Target Goal</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{formatRupees(target)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-[11px] text-emerald-700 font-medium">Raised & Earmarked</p>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">{formatRupees(raised)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked in Escrow
              </p>
              <p className="text-lg font-bold text-blue-800 mt-0.5">{formatRupees(locked)}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Released to Beneficiary</p>
              <p className="text-lg font-bold text-slate-600 mt-0.5">{formatRupees(released)}</p>
              <span className="text-[10px] text-slate-400">Phase 4 release</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Beneficiary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">About this Initiative</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {campaign.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Target Beneficiary</h2>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800">
            {campaign.beneficiary}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Funds will be released strictly upon verified proof that items or services reached this beneficiary.
          </p>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Milestone className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Project Milestones</h2>
          </div>
          <span className="text-xs text-slate-500">
            {milestones.length} milestone{milestones.length === 1 ? '' : 's'} configured
          </span>
        </div>

        {milestones.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No milestones configured yet for this campaign.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {milestones.map((ms) => (
              <div key={ms.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                      {ms.sequence}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{ms.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ms.status === 'IN_PROGRESS'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ms.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-7 max-w-xl">
                    {ms.description}
                  </p>
                </div>

                <div className="text-right sm:shrink-0 pl-7 sm:pl-0">
                  <span className="text-sm font-bold text-slate-900 block">
                    {formatRupees(Number(ms.amount))}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {ms.proof_required ? 'Proof required before release' : 'Standard release'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Trail preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Immutable Audit Trail</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {auditLogs.length} verified action{auditLogs.length === 1 ? '' : 's'}
            </span>
            <Link
              href={`/campaigns/${campaign.id}/audit`}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-500"
            >
              Open Full Dashboard →
            </Link>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <p className="p-6 text-xs text-slate-500">No audit events recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                    {log.action}
                  </span>
                  <span className="text-slate-600">
                    by {log.actor_name || 'System Actor'}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {new Date(log.created_at).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
