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
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-sm">
          <h2 className="text-xl font-bold text-rose-700">Access Denied</h2>
          <p className="text-sm text-slate-600 mt-2">
            You do not have permission to view or manage this campaign.
          </p>
          <Link
            href="/ngo/campaigns"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Return to Your Dashboard
          </Link>
        </div>
      </div>
    );
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
  const isEditable = campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Back Button */}
      <Link
        href="/ngo/campaigns"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to NGO Dashboard
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <StatusBadge status={campaign.status} />
              <span className="text-xs text-slate-400 font-mono">ID: {campaign.id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Building2 className="w-4 h-4 text-slate-400" />
                {campaign.ngo_name || 'Your Organization'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                Created {new Date(campaign.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Updated {new Date(campaign.updated_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
              </span>
            </div>
          </div>

          {isEditable && (
            <Link
              href={`/ngo/campaigns/${campaign.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors self-start"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Metadata
            </Link>
          )}
        </div>

        {/* Financial Progress Bar */}
        <div className="pt-6 space-y-4">
          <ProgressBar current={raised} total={target} label="Campaign Funding Progress" />

          {/* Financial Breakdown Grid (Section 10 & 16) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Target Funding</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{formatRupees(target)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-[11px] text-emerald-700 font-medium">Raised Amount</p>
              <p className="text-lg font-bold text-emerald-800 mt-0.5">{formatRupees(raised)}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked Funds
              </p>
              <p className="text-lg font-bold text-blue-800 mt-0.5">{formatRupees(locked)}</p>
              <span className="text-[10px] text-blue-600">Accounting Escrow</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium">Released</p>
              <p className="text-lg font-bold text-slate-600 mt-0.5">{formatRupees(released)}</p>
              <span className="text-[10px] text-slate-400">Phase 4 release</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-500 font-medium">Remaining Goal</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{formatRupees(remaining)}</p>
            </div>
          </div>
        </div>

        {/* State Transition Actions */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Status Management
          </p>
          <CampaignStatusActions campaignId={campaign.id} currentStatus={campaign.status} />
        </div>
      </div>

      {/* Description & Beneficiary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Campaign Scope & Objective</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {campaign.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Target Beneficiary</h2>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
            {campaign.beneficiary}
          </div>
          <p className="text-[11px] text-slate-400">
            Designated receiver of funds and direct outcome recipient.
          </p>
        </div>
      </div>

      {/* Milestone Manager Component (Section 11 & 17) */}
      <MilestoneManager
        campaignId={campaign.id}
        targetAmount={target}
        milestones={milestones}
        isEditable={isEditable}
      />

      {/* Received Donations Summary (Section 17) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Campaign Contributions</h2>
          </div>
          <span className="text-xs text-slate-500">
            {donations.length} contribution{donations.length === 1 ? '' : 's'} received
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No donations received yet for this campaign.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Donor</th>
                  <th className="py-3 px-6">Reference</th>
                  <th className="py-3 px-6">Purpose / Earmark</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-6 font-medium text-slate-900">{don.donor_name}</td>
                    <td className="py-3 px-6 font-mono text-[11px] text-slate-500">{don.reference}</td>
                    <td className="py-3 px-6 text-slate-600">{don.purpose || 'General support'}</td>
                    <td className="py-3 px-6 text-right font-bold text-emerald-700">
                      {formatRupees(Number(don.amount))}
                    </td>
                    <td className="py-3 px-6 text-slate-400">
                      {new Date(don.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fund Transactions Trail (Section 20) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Fund Accounting Transactions</h2>
          </div>
          <span className="text-xs text-slate-500">
            {fundTransactions.length} transaction{fundTransactions.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {fundTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No fund transactions recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {fundTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tx.type === 'DONATION'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tx.type === 'LOCK'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tx.type}
                  </span>
                  <span className="font-mono text-slate-600">{tx.reference}</span>
                  {tx.milestone_title && (
                    <span className="text-slate-400">→ {tx.milestone_title}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{formatRupees(Number(tx.amount))}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(tx.created_at).toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log Trail */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Campaign Audit Trail</h2>
          </div>
          <span className="text-xs text-slate-500">
            {auditLogs.length} immutable event{auditLogs.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="p-6 text-xs text-slate-500">No audit log entries recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      by {log.actor_name || 'System Actor'} ({log.actor_role || 'NGO'})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </span>
                </div>

                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="mt-2.5 p-3 rounded-xl bg-slate-950 text-emerald-400 text-[11px] font-mono overflow-x-auto">
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
