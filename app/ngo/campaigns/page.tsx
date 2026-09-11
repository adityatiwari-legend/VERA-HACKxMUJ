import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCampaignsForNgo, getNgoCampaignStats } from '@/lib/campaigns';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import {
  FolderPlus,
  Layers,
  CheckCircle2,
  FileText,
  Building2,
  ExternalLink,
  Edit3,
  Sparkles,
} from 'lucide-react';

export default async function NgoCampaignsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'NGO' && user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [campaigns, stats] = await Promise.all([
    getCampaignsForNgo(user.id),
    getNgoCampaignStats(user.id),
  ]);

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            NGO Campaign Management
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {user.name} Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, audit, and track campaigns with immutable PostgreSQL records.
          </p>
        </div>

        <Link
          href="/ngo/campaigns/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition-all self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          Create New Campaign
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Campaigns"
          value={stats.total_campaigns}
          icon={<Layers className="w-4 h-4 text-indigo-600" />}
          subtext="All campaigns in database"
        />
        <StatCard
          label="Active Campaigns"
          value={stats.active_campaigns}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          subtext="Open for future Phase 2 donations"
        />
        <StatCard
          label="Draft Campaigns"
          value={stats.draft_campaigns}
          icon={<FileText className="w-4 h-4 text-slate-600" />}
          subtext="Work in progress"
        />
        <StatCard
          label="Target Allocation"
          value={formatRupees(Number(stats.total_target_amount) || 0)}
          icon={<Sparkles className="w-4 h-4 text-amber-600" />}
          subtext="Cumulative funding goal"
        />
      </div>

      {/* Campaigns List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Campaign Directory</h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {campaigns.length} campaign{campaigns.length === 1 ? '' : 's'}
          </span>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No campaigns yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Start by creating your organization's first transparent campaign to prepare for Phase 2 milestones.
            </p>
            <Link
              href="/ngo/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              Create First Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Campaign Details</th>
                  <th className="py-3 px-6">Beneficiary</th>
                  <th className="py-3 px-6 text-right">Target Amount</th>
                  <th className="py-3 px-6 text-right">Raised / Released</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={`/ngo/campaigns/${camp.id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors block"
                      >
                        {camp.title}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-md">
                        {camp.description}
                      </p>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Created {new Date(camp.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 text-xs font-medium">
                      {camp.beneficiary}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-slate-900">
                      {formatRupees(Number(camp.target_amount))}
                    </td>
                    <td className="py-4 px-6 text-right text-xs">
                      <div className="font-medium text-slate-700">₹0 / ₹0</div>
                      <span className="text-[10px] text-slate-400">Phase 1 (No fake funds)</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <StatusBadge status={camp.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/ngo/campaigns/${camp.id}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="View Details & Audit Trail"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {camp.status !== 'COMPLETED' && camp.status !== 'CANCELLED' && (
                          <Link
                            href={`/ngo/campaigns/${camp.id}/edit`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Campaign"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
