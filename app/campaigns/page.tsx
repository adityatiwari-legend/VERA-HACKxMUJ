import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { Campaign } from '@/types';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Compass,
  Building2,
  Users,
  Milestone,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CampaignsExplorePage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string };
}) {
  const searchTerm = searchParams?.q?.trim() || '';
  const statusFilter = searchParams?.status?.toUpperCase() || 'ACTIVE';

  const validPublicStatuses = ['ACTIVE', 'COMPLETED', 'PAUSED'];

  let whereClause = `WHERE c.status IN ('ACTIVE', 'COMPLETED', 'PAUSED')`;
  const params: any[] = [];

  if (statusFilter !== 'ALL' && validPublicStatuses.includes(statusFilter)) {
    params.push(statusFilter);
    whereClause = `WHERE c.status = $${params.length}`;
  }

  if (searchTerm) {
    params.push(`%${searchTerm}%`);
    const pIndex = params.length;
    whereClause += ` AND (c.title ILIKE $${pIndex} OR c.description ILIKE $${pIndex} OR c.beneficiary ILIKE $${pIndex} OR u.name ILIKE $${pIndex})`;
  }

  const sql = `
    SELECT 
      c.id,
      c.ngo_id,
      c.title,
      c.description,
      c.target_amount::numeric as target_amount,
      c.raised_amount::numeric as raised_amount,
      c.released_amount::numeric as released_amount,
      c.beneficiary,
      c.status,
      c.created_at,
      u.name as ngo_name,
      COUNT(DISTINCT m.id)::int as milestones_count,
      COUNT(DISTINCT d.id)::int as donors_count
    FROM campaigns c
    JOIN users u ON c.ngo_id = u.id
    LEFT JOIN milestones m ON c.id = m.campaign_id
    LEFT JOIN donations d ON c.id = d.campaign_id AND d.status = 'CONFIRMED'
    ${whereClause}
    GROUP BY c.id, u.name
    ORDER BY c.created_at DESC
  `;

  const res = await query<Campaign>(sql, params);
  const campaigns = res.rows;

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-8 text-white border border-slate-800 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-3">
          <Compass className="w-4 h-4" />
          VERA Transparent Giving
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Explore Verified Initiatives</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Every contribution is earmarked to an escrow vault, tracked against verifiable milestones, and anchored by tamper-evident blockchain records.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input Form */}
        <form method="GET" className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={searchTerm}
            placeholder="Search by title, beneficiary, or NGO..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
          {statusFilter !== 'ACTIVE' && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
        </form>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Paused', value: 'PAUSED' },
            { label: 'All Public', value: 'ALL' },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            const queryParams = new URLSearchParams();
            if (searchTerm) queryParams.set('q', searchTerm);
            if (tab.value !== 'ACTIVE') queryParams.set('status', tab.value);
            const href = `/campaigns${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No matching campaigns found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or status filter to find verified initiatives.
          </p>
          <Link
            href="/campaigns"
            className="inline-block mt-4 text-xs font-bold text-emerald-600 hover:text-emerald-500"
          >
            Clear Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => {
            const target = Number(camp.target_amount);
            const raised = Number(camp.raised_amount);
            const released = Number(camp.released_amount || 0);
            const percent = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {camp.ngo_name}
                    </span>
                    <StatusBadge status={camp.status} />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mt-2">
                      {camp.description}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">Beneficiary:</span> {camp.beneficiary}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <ProgressBar current={raised} total={target} />
                    <div className="flex justify-between text-xs font-medium pt-1">
                      <span className="text-slate-900 font-bold">{formatRupees(raised)} raised</span>
                      <span className="text-slate-500">Goal: {formatRupees(target)}</span>
                    </div>
                  </div>

                  {/* Trust indicator mini pill */}
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Earmarked Escrow • 2-of-3 Multisig • Auditable</span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/campaigns/${camp.id}/audit`}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-emerald-700 transition-colors text-[11px]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Public Audit Trail
                  </Link>

                  <Link
                    href={`/campaigns/${camp.id}`}
                    className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    View & Donate
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
