import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCampaignById } from '@/lib/campaigns';
import { getMilestonesForCampaign } from '@/lib/milestones';
import { getDonationsForCampaign } from '@/lib/donations';
import { getFundTransactionsForCampaign, getCampaignFinancialSummary } from '@/lib/fund_transactions';
import { getAuditLogsForCampaign } from '@/lib/audit';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { CampaignStatusActions } from './CampaignStatusActions';
import { MilestoneManager } from './MilestoneManager';
import { formatRupees } from '@/lib/utils';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  Clock,
  History,
  Lock,
  HeartHandshake,
  Coins,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [campaign, milestones, donations, fundTransactions, summary, auditLogs] = await Promise.all([
    getCampaignById(params.id),
    getMilestonesForCampaign(params.id),
    getDonationsForCampaign(params.id),
    getFundTransactionsForCampaign(params.id),
    getCampaignFinancialSummary(params.id),
    getAuditLogsForCampaign(params.id),
  ]);

  if (!campaign) {
    notFound();
  }

  // Authorization check: NGO can only access own campaign
  if (user.role === 'NGO' && campaign.ngo_id !== user.id) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="p-8 bg-[#111113] rounded-xl border border-red-500/20 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-400">Access Denied</h2>
          <p className="text-xs text-zinc-400 mt-2">
            You do not have permission to view or manage this campaign.
          </p>
          <Link
            href="/ngo/campaigns"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wider"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const target = summary ? summary.targetAmount : Number(campaign.target_amount);
  const raised = summary ? summary.raisedAmount : Number(campaign.raised_amount);
  const locked = summary ? summary.lockedAmount : Math.max(0, raised - Number(campaign.released_amount || 0));
  const released = summary ? summary.releasedAmount : Number(campaign.released_amount || 0);
  const remaining = summary ? summary.remainingAmount : Math.max(0, target - raised);
  const isEditable = campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/ngo/campaigns"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to NGO Dashboard
        </Link>
        <Link
          href={`/campaigns/${campaign.id}/audit`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00F59B] hover:underline"
        >
          <span>View Public Audit</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-zinc-800/80">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <StatusBadge status={campaign.status} />
              <span className="text-[11px] text-zinc-500 font-mono">ID: {campaign.id.slice(0, 8)}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium text-zinc-300">
                <Building2 className="w-3.5 h-3.5 text-[#00F59B]" />
                {campaign.ngo_name || 'Your Organization'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                Created {new Date(campaign.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>
          </div>

          {isEditable && (
            <Link
              href={`/ngo/campaigns/${campaign.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-white border border-zinc-700 font-semibold text-xs transition-colors self-start"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Metadata
            </Link>
          )}
        </div>

        {/* Financial Progress Bar */}
        <div className="space-y-4">
          <ProgressBar current={raised} total={target} label="Campaign Funding Progress" />

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            <div className="p-3.5 rounded-lg bg-[#18181B] border border-zinc-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target</p>
              <p className="text-base font-bold text-white font-mono mt-0.5">{formatRupees(target)}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#18181B] border border-zinc-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#00F59B]">Raised</p>
              <p className="text-base font-bold text-[#00F59B] font-mono mt-0.5">{formatRupees(raised)}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#18181B] border border-zinc-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </p>
              <p className="text-base font-bold text-amber-400 font-mono mt-0.5">{formatRupees(locked)}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#18181B] border border-zinc-800">
              <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Released</p>
              <p className="text-base font-bold text-indigo-400 font-mono mt-0.5">{formatRupees(released)}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#18181B] border border-zinc-800 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Remaining</p>
              <p className="text-base font-bold text-zinc-300 font-mono mt-0.5">{formatRupees(remaining)}</p>
            </div>
          </div>
        </div>

        {/* State Transition Actions */}
        <div className="pt-4 border-t border-zinc-800/80">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
            Lifecycle Status Actions
          </p>
          <CampaignStatusActions campaignId={campaign.id} currentStatus={campaign.status} />
        </div>
      </div>

      {/* Description & Beneficiary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-[#111113] rounded-xl border border-zinc-800 p-5 shadow-sm space-y-2">
          <h2 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Campaign Scope & Objective</h2>
          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
            {campaign.description}
          </p>
        </div>

        <div className="bg-[#111113] rounded-xl border border-zinc-800 p-5 shadow-sm space-y-2">
          <h2 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Designated Beneficiary</h2>
          <div className="p-3 rounded-lg bg-[#18181B] border border-zinc-800 text-xs font-semibold text-[#00F59B]">
            {campaign.beneficiary}
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Designated receiver of funds and direct outcome recipient.
          </p>
        </div>
      </div>

      {/* Milestone Manager Component */}
      <MilestoneManager
        campaignId={campaign.id}
        targetAmount={target}
        milestones={milestones}
        isEditable={isEditable}
      />

      {/* Received Donations Summary */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#00F59B]" />
            <h2 className="text-sm font-semibold text-white">Campaign Contributions</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {donations.length} received
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono text-zinc-500">
            No donations received yet for this campaign.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181B] border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-2.5 px-5">Donor</th>
                  <th className="py-2.5 px-5">Reference</th>
                  <th className="py-2.5 px-5">Purpose</th>
                  <th className="py-2.5 px-5 text-right">Amount</th>
                  <th className="py-2.5 px-5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-5 font-semibold text-white">{don.donor_name}</td>
                    <td className="py-3 px-5 font-mono text-[11px] text-zinc-400">{don.reference}</td>
                    <td className="py-3 px-5 text-zinc-400">{don.purpose || 'General support'}</td>
                    <td className="py-3 px-5 text-right font-bold text-[#00F59B] font-mono">
                      {formatRupees(Number(don.amount))}
                    </td>
                    <td className="py-3 px-5 text-zinc-500 font-mono text-[11px]">
                      {new Date(don.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fund Transactions Trail */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Fund Accounting Ledger</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {fundTransactions.length} recorded
          </span>
        </div>

        {fundTransactions.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono text-zinc-500">
            No fund transactions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {fundTransactions.map((tx) => (
              <div key={tx.id} className="p-3.5 sm:px-5 flex items-center justify-between text-xs hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      tx.type === 'DONATION'
                        ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20'
                        : tx.type === 'LOCK'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}
                  >
                    ● {tx.type}
                  </span>
                  <span className="font-mono text-zinc-400 text-[11px]">{tx.reference}</span>
                  {tx.milestone_title && (
                    <span className="text-zinc-500">→ {tx.milestone_title}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-white font-mono block">{formatRupees(Number(tx.amount))}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(tx.created_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log Trail */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Immutable Audit Log</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {auditLogs.length} events
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="p-8 text-xs font-mono text-zinc-500">No audit log entries recorded yet.</p>
        ) : (
          <div className="divide-y divide-zinc-800/80 max-h-72 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">
                      by <span className="text-white">{log.actor_name || 'System'}</span> ({log.actor_role || 'NGO'})
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </span>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-2 p-2 rounded bg-black/50 border border-zinc-800 text-[#00F59B] text-[10px] font-mono overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
