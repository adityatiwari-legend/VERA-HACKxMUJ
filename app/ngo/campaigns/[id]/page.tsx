import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCampaignById } from '@/lib/campaigns';
import { getAuditLogsForCampaign } from '@/lib/audit';
import { StatusBadge } from '@/components/StatusBadge';
import { CampaignStatusActions } from './CampaignStatusActions';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Edit3,
  Clock,
  History,
  Info,
  ShieldCheck,
  Milestone,
} from 'lucide-react';

export default async function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const campaign = await getCampaignById(params.id);
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

  const auditLogs = await getAuditLogsForCampaign(params.id);

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const isEditable = campaign.status !== 'COMPLETED' && campaign.status !== 'CANCELLED';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href="/ngo/campaigns"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns Dashboard
      </Link>

      {/* Header Banner */}
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
              Edit Details
            </Link>
          )}
        </div>

        {/* Financial Stat Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Target Funding</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              {formatRupees(Number(campaign.target_amount))}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Raised Amount</p>
            <p className="text-xl font-bold text-slate-600 mt-1">
              {formatRupees(Number(campaign.raised_amount))}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">₹0 in Phase 1</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Released Amount</p>
            <p className="text-xl font-bold text-slate-600 mt-1">
              {formatRupees(Number(campaign.released_amount))}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">₹0 in Phase 1</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-medium">Funding Balance</p>
            <p className="text-xl font-bold text-emerald-800 mt-1">
              {formatRupees(Number(campaign.target_amount))}
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Goal remaining</p>
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
          <h2 className="text-base font-bold text-slate-900">Campaign Scope & Details</h2>
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

      {/* Phase 2 Roadmap Placeholder Callout (Requirement #13) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 rounded-2xl border border-emerald-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Milestone className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 mb-1">
              Phase 2 Roadmap Placeholder
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Milestones will be configured in Phase 2.
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              In the next phase, you will break down this ₹{Number(campaign.target_amount).toLocaleString('en-IN')} target into verifiable milestones (e.g. procurement, construction, inspection), enabling donors to earmark contributions that lock securely until evidence is approved.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Trail (Requirement #4 & #14) */}
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
