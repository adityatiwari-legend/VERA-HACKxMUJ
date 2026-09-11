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
  ArrowUpDown,
  Layers,
} from 'lucide-react';
import { formatRupees, formatRupeesShort } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function CampaignsExplorePage({
  searchParams,
}: {
  searchParams?: { q?: string; status?: string; sort?: string };
}) {
  const searchTerm = searchParams?.q?.trim() || '';
  const statusFilter = searchParams?.status?.toUpperCase() || 'ACTIVE';
  const sortBy = searchParams?.sort || 'recent';

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

  let orderClause = 'ORDER BY c.created_at DESC';
  if (sortBy === 'raised') {
    orderClause = 'ORDER BY c.raised_amount DESC';
  } else if (sortBy === 'target') {
    orderClause = 'ORDER BY c.target_amount DESC';
  } else if (sortBy === 'progress') {
    orderClause = 'ORDER BY (c.raised_amount::numeric / NULLIF(c.target_amount::numeric, 0)) DESC';
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
    ${orderClause}
  `;

  const res = await query<Campaign>(sql, params);
  const campaigns = res.rows;

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-8 pb-20 text-[#EDEDED]">
      {/* Header Section */}
      <div className="bg-[#111113] rounded-xl p-6 sm:p-8 border border-white/[0.08] space-y-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
          DISCOVERY DIRECTORY
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
          Verified Philanthropic Initiatives
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans leading-relaxed">
          Every initiative is segmented into deliverables with strict spending caps. Capital is locked in escrow custody and released only upon certified multi-signature consensus.
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <form method="GET" className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="q"
            defaultValue={searchTerm}
            placeholder="Search campaign, beneficiary, or NGO..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-white/[0.08] bg-[#18181B] text-white placeholder:text-zinc-500 font-mono focus:outline-none focus:border-[#00F59B] transition-all"
          />
          {statusFilter !== 'ACTIVE' && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          {sortBy !== 'recent' && (
            <input type="hidden" name="sort" value={sortBy} />
          )}
        </form>

        {/* Filter & Sort Bar */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider hidden sm:inline">
            Status:
          </span>
          {[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'All', value: 'ALL' },
          ].map((tab) => {
            const isActive = statusFilter === tab.value;
            const qp = new URLSearchParams();
            if (searchTerm) qp.set('q', searchTerm);
            if (tab.value !== 'ACTIVE') qp.set('status', tab.value);
            if (sortBy !== 'recent') qp.set('sort', sortBy);
            const href = `/campaigns${qp.toString() ? `?${qp.toString()}` : ''}`;

            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30 font-semibold'
                    : 'bg-[#18181B] text-zinc-400 border-white/[0.06] hover:text-white'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}

          <span className="text-zinc-600 mx-1">|</span>

          {/* Sort Menu */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[11px] text-zinc-500">Sort:</span>
            {[
              { label: 'Recent', value: 'recent' },
              { label: 'Progress', value: 'progress' },
              { label: 'Goal', value: 'target' },
            ].map((s) => {
              const isActive = sortBy === s.value;
              const qp = new URLSearchParams();
              if (searchTerm) qp.set('q', searchTerm);
              if (statusFilter !== 'ACTIVE') qp.set('status', statusFilter);
              if (s.value !== 'recent') qp.set('sort', s.value);
              const href = `/campaigns${qp.toString() ? `?${qp.toString()}` : ''}`;

              return (
                <Link
                  key={s.value}
                  href={href}
                  className={`px-2 py-1 rounded text-[11px] transition-colors ${
                    isActive
                      ? 'text-white font-bold underline decoration-[#00F59B]'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Campaigns Listing */}
      {campaigns.length === 0 ? (
        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-12 text-center space-y-3 font-mono">
          <Compass className="w-8 h-8 text-zinc-600 mx-auto" />
          <h2 className="text-base font-bold text-white font-sans">No matching campaigns found</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search keywords or filter settings.
          </p>
          <Link
            href="/campaigns"
            className="inline-block text-xs font-bold text-[#00F59B] hover:underline pt-2"
          >
            Clear Filters →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((camp) => {
            const target = Number(camp.target_amount);
            const raised = Number(camp.raised_amount);
            const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
            const milestoneCount = camp.milestones_count || 3;

            return (
              <div
                key={camp.id}
                className="bg-[#111113] rounded-xl border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between p-5 space-y-5"
              >
                <div className="space-y-3.5">
                  {/* Top: Status & Trust Score */}
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={camp.status} />
                    <span className="text-[11px] font-mono text-zinc-400">
                      Trust Score <strong className="text-white font-bold">94</strong>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="text-base font-bold text-white hover:text-[#00F59B] transition-colors block font-sans leading-snug"
                    >
                      {camp.title}
                    </Link>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {camp.description}
                    </p>
                  </div>

                  {/* NGO & Beneficiary Meta */}
                  <div className="space-y-1 text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{camp.ngo_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Compass className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">{camp.beneficiary}</span>
                    </div>
                  </div>

                  {/* Financial Metrics (Dominant typography) */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-baseline justify-between font-mono">
                      <div>
                        <span className="text-lg font-bold text-white">
                          {formatRupeesShort(raised)}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1">
                          / {formatRupeesShort(target)}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#00F59B]">
                        {pct}% funded
                      </span>
                    </div>

                    <ProgressBar current={raised} total={target} />

                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-zinc-500" />
                        {milestoneCount} milestones
                      </span>
                      <span>Target: {formatRupees(target)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.06]">
                  <Link
                    href={`/campaigns/${camp.id}/audit`}
                    className="py-2 px-3 rounded-lg bg-[#18181B] hover:bg-white/[0.06] text-white border border-white/[0.08] text-xs font-mono text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00F59B]" />
                    <span>View Audit</span>
                  </Link>

                  <Link
                    href={`/campaigns/${camp.id}`}
                    className="py-2 px-3 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs font-mono text-center transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Contribute</span>
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
