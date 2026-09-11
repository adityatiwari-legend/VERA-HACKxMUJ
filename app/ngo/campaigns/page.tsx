import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCampaignsForNgo } from '@/lib/campaigns';
import { query } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { formatRupees } from '@/lib/utils';
import {
  FolderPlus,
  Layers,
  CheckCircle2,
  FileText,
  Building2,
  ExternalLink,
  Sparkles,
  Lock,
  Clock,
  Coins,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Check,
  PlusCircle,
  FileUp,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NgoCampaignsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'NGO' && user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const campaigns = await getCampaignsForNgo(user.id);

  // Requirement 15 Metrics:
  // Total Raised, Locked Funds, Released Funds, Active Campaigns, Pending Proofs, Milestones
  let totalRaised = 0;
  let totalReleased = 0;
  let lockedFunds = 0;
  let activeCampaignsCount = 0;
  let totalMilestonesCount = 0;
  let pendingProofsCount = 0;

  try {
    const statsRes = await query<{
      total_raised: string;
      total_released: string;
      locked_funds: string;
      active_campaigns: string;
    }>(
      `SELECT 
        COALESCE(SUM(raised_amount), 0)::numeric as total_raised,
        COALESCE(SUM(released_amount), 0)::numeric as total_released,
        COALESCE(SUM(raised_amount - released_amount), 0)::numeric as locked_funds,
        COUNT(*) FILTER (WHERE status = 'ACTIVE')::int as active_campaigns
       FROM campaigns
       WHERE ngo_id = $1`,
      [user.id]
    );

    if (statsRes.rows[0]) {
      totalRaised = Number(statsRes.rows[0].total_raised);
      totalReleased = Number(statsRes.rows[0].total_released);
      lockedFunds = Math.max(0, Number(statsRes.rows[0].locked_funds));
      activeCampaignsCount = Number(statsRes.rows[0].active_campaigns);
    }

    const msRes = await query<{ count: string }>(
      `SELECT COUNT(*)::int as count 
       FROM milestones m 
       JOIN campaigns c ON m.campaign_id = c.id 
       WHERE c.ngo_id = $1`,
      [user.id]
    );
    totalMilestonesCount = Number(msRes.rows[0]?.count || 0);

    const proofsRes = await query<{ count: string }>(
      `SELECT COUNT(*)::int as count 
       FROM proofs p 
       JOIN milestones m ON p.milestone_id = m.id 
       JOIN campaigns c ON m.campaign_id = c.id 
       WHERE c.ngo_id = $1 AND p.status IN ('SUBMITTED', 'UNDER_REVIEW')`,
      [user.id]
    );
    pendingProofsCount = Number(proofsRes.rows[0]?.count || 0);
  } catch (err) {
    console.error('Failed to load NGO stats:', err);
  }

  // Pending Actions: Milestones needing proof submission
  let pendingActions: any[] = [];
  try {
    const actionsRes = await query<{
      milestone_id: string;
      milestone_title: string;
      milestone_amount: string;
      milestone_status: string;
      campaign_id: string;
      campaign_title: string;
    }>(
      `SELECT 
        m.id as milestone_id,
        m.title as milestone_title,
        m.amount as milestone_amount,
        m.status as milestone_status,
        c.id as campaign_id,
        c.title as campaign_title
       FROM milestones m
       JOIN campaigns c ON m.campaign_id = c.id
       WHERE c.ngo_id = $1 AND m.status IN ('IN_PROGRESS', 'REJECTED')
       ORDER BY m.updated_at DESC
       LIMIT 4`,
      [user.id]
    );
    pendingActions = actionsRes.rows;
  } catch (err) {
    pendingActions = [];
  }

  // Recent Evidence
  let recentProofs: any[] = [];
  try {
    const proofsRes = await query<{
      proof_id: string;
      claimed_amount: string;
      status: string;
      submitted_at: string;
      milestone_title: string;
      campaign_id: string;
      campaign_title: string;
    }>(
      `SELECT 
        p.id as proof_id,
        p.claimed_amount,
        p.status,
        p.submitted_at,
        m.title as milestone_title,
        c.id as campaign_id,
        c.title as campaign_title
       FROM proofs p
       JOIN milestones m ON p.milestone_id = m.id
       JOIN campaigns c ON m.campaign_id = c.id
       WHERE c.ngo_id = $1
       ORDER BY p.submitted_at DESC
       LIMIT 4`,
      [user.id]
    );
    recentProofs = proofsRes.rows;
  } catch (err) {
    recentProofs = [];
  }

  // Financial Activity (Recent Donations)
  let recentDonations: any[] = [];
  try {
    const donRes = await query<{
      id: string;
      amount: string;
      reference: string;
      created_at: string;
      campaign_title: string;
    }>(
      `SELECT 
        d.id,
        d.amount,
        d.reference,
        d.created_at,
        c.title as campaign_title
       FROM donations d
       JOIN campaigns c ON d.campaign_id = c.id
       WHERE c.ngo_id = $1
       ORDER BY d.created_at DESC
       LIMIT 4`,
      [user.id]
    );
    recentDonations = donRes.rows;
  } catch (err) {
    recentDonations = [];
  }

  // First campaign ID for Quick CTAs
  const firstActiveCampaignId = campaigns[0]?.id;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#00F59B] uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>NGO Operations Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {user.name} Operations
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage campaigns, milestone evidence, and on-chain release authorizations.
          </p>
        </div>

        {/* Clear CTAs (Requirement 15: Create Campaign, Add Milestone, Submit Proof) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/ngo/campaigns/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create Campaign</span>
          </Link>

          {firstActiveCampaignId && (
            <>
              <Link
                href={`/ngo/campaigns/${firstActiveCampaignId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-white border border-zinc-700 font-semibold text-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#00F59B]" />
                <span>Add Milestone</span>
              </Link>
              <Link
                href={`/ngo/campaigns/${firstActiveCampaignId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-white border border-zinc-700 font-semibold text-xs transition-colors"
              >
                <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Submit Proof</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 6 Key Operational Metrics (Requirement 15) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Raised"
          value={formatRupees(totalRaised)}
          icon={<Coins className="w-4 h-4 text-[#00F59B]" />}
          subtext="Earmarked funds"
        />
        <StatCard
          label="Locked Funds"
          value={formatRupees(lockedFunds)}
          icon={<Lock className="w-4 h-4 text-amber-400" />}
          subtext="Custody in escrow"
        />
        <StatCard
          label="Released Funds"
          value={formatRupees(totalReleased)}
          icon={<CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />}
          subtext="Disbursed on-chain"
        />
        <StatCard
          label="Active Campaigns"
          value={activeCampaignsCount}
          icon={<Layers className="w-4 h-4 text-[#00F59B]" />}
          subtext={`${campaigns.length} total registered`}
        />
        <StatCard
          label="Pending Proofs"
          value={pendingProofsCount}
          icon={<Clock className="w-4 h-4 text-amber-400" />}
          subtext="Awaiting review"
        />
        <StatCard
          label="Milestones"
          value={totalMilestonesCount}
          icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
          subtext="Delivery phases"
        />
      </div>

      {/* Grid: Pending Actions & Recent Evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Actions */}
        <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Pending Actions</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Requires NGO Evidence
            </span>
          </div>

          {pendingActions.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No immediate pending actions. All active milestones are up to date.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {pendingActions.map((action) => (
                <div key={action.milestone_id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-white block">{action.milestone_title}</span>
                    <span className="text-[11px] text-zinc-400">
                      {action.campaign_title} • Budget: {formatRupees(Number(action.milestone_amount))}
                    </span>
                  </div>
                  <Link
                    href={`/ngo/campaigns/${action.campaign_id}/milestones/${action.milestone_id}/proof`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold shrink-0 transition-colors"
                  >
                    <span>{action.milestone_status === 'REJECTED' ? 'Resubmit Proof' : 'Upload Proof'}</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Evidence */}
        <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">Recent Evidence</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              OCR & Audit Trail
            </span>
          </div>

          {recentProofs.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">
              No evidence submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {recentProofs.map((proof) => (
                <div key={proof.proof_id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-white block">{proof.milestone_title}</span>
                    <span className="text-[11px] text-zinc-400">
                      Claimed: {formatRupees(Number(proof.claimed_amount))} • {proof.campaign_title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        proof.status === 'APPROVED'
                          ? 'bg-[#00F59B]/10 text-[#00F59B]'
                          : proof.status === 'REJECTED'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      ● {proof.status}
                    </span>
                    <Link
                      href={`/ngo/proofs/${proof.proof_id}`}
                      className="p-1 rounded text-zinc-400 hover:text-white"
                      title="View Analysis"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Section: Campaigns Directory */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Managed Campaigns</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Active campaigns under management with verified target allocations
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {campaigns.length} registered
          </span>
        </div>

        {campaigns.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No campaigns yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-5">
              Start by creating your organization's first transparent campaign to begin milestone-based funding.
            </p>
            <Link
              href="/ngo/campaigns/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold uppercase tracking-wider"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Create First Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181B] border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-5">Campaign Title</th>
                  <th className="py-3 px-5">Beneficiary</th>
                  <th className="py-3 px-5 text-right">Target</th>
                  <th className="py-3 px-5 text-right">Raised / Released</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {campaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/ngo/campaigns/${camp.id}`}
                        className="font-semibold text-white hover:text-[#00F59B] transition-colors block"
                      >
                        {camp.title}
                      </Link>
                      <span className="text-[10px] font-mono text-zinc-500">
                        Created {new Date(camp.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-zinc-300">
                      {camp.beneficiary}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-white font-mono text-xs">
                      {formatRupees(Number(camp.target_amount))}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-xs">
                      <span className="text-[#00F59B] font-semibold">{formatRupees(Number(camp.raised_amount))}</span>
                      <span className="text-zinc-500 block text-[10px]">
                        Released: {formatRupees(Number(camp.released_amount || 0))}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          camp.status === 'ACTIVE'
                            ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20'
                            : camp.status === 'COMPLETED'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        ● {camp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Link
                          href={`/ngo/campaigns/${camp.id}`}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[11px] font-semibold transition-colors"
                        >
                          Manage
                        </Link>
                        <Link
                          href={`/campaigns/${camp.id}/audit`}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Public Audit"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Activity (Recent Donations received) */}
      {recentDonations.length > 0 && (
        <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#00F59B]" />
              <h2 className="text-sm font-semibold text-white">Financial Activity (Incoming Earmarks)</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Immutable PostgreSQL Ledger
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentDonations.map((don) => (
              <div key={don.id} className="p-3 rounded-lg bg-[#18181B] border border-zinc-800 space-y-1">
                <span className="text-xs font-semibold text-white block truncate">{don.campaign_title}</span>
                <span className="text-base font-bold text-[#00F59B] font-mono block">
                  {formatRupees(Number(don.amount))}
                </span>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <span>{don.reference}</span>
                  <span>{new Date(don.created_at).toLocaleDateString('en-IN', { dateStyle: 'short' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
