import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNgoPublicProfile } from '@/lib/reputation';
import {
  Building2,
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Coins,
  Layers,
  FileCheck,
  TrendingUp,
  Info,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';

export const dynamic = 'force-dynamic';

export default async function PublicNgoProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await getNgoPublicProfile(params.id);
  if (!profile) {
    notFound();
  }

  const { name, createdAt, reputation, campaigns } = profile;
  const { score, grade, badge, summary, factors, stats } = reputation;

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const gradeColors = {
    'A+': 'bg-emerald-500 text-white border-emerald-400',
    'A': 'bg-emerald-600 text-white border-emerald-500',
    'B': 'bg-blue-600 text-white border-blue-500',
    'C': 'bg-amber-500 text-white border-amber-400',
    'D': 'bg-rose-600 text-white border-rose-500',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>

      {/* Header Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Verified Non-Profit Organization
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{name}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                Member on VERA since{' '}
                {new Date(createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Reputation Grade Badge */}
          <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 shrink-0">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black shadow-lg border-2 ${gradeColors[grade]}`}
            >
              {grade}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Reputation Index
              </span>
              <span className="text-2xl font-black text-white">{score} / 100</span>
              <span className="text-[11px] font-semibold text-emerald-400 block">{badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Verification Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Total Capital Raised</span>
          <span className="text-xl font-extrabold text-slate-900 mt-1 block">
            {formatRupees(stats.totalRaised)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Across {stats.totalCampaigns} Campaign(s)</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Total Released</span>
          <span className="text-xl font-extrabold text-indigo-700 mt-1 block">
            {formatRupees(stats.totalReleased)}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{stats.utilizationRatePercent}% Utilization</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Milestones Completed</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
            {stats.milestonesCompleted} / {stats.milestonesTotal}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Auditor Verified</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block">Proof Approval Rate</span>
          <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
            {stats.approvalRatePercent}%
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{stats.proofsSubmitted} Submissions</span>
        </div>
      </div>

      {/* Deterministic Reputation Methodology Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            Deterministic NGO Reputation Score Formula
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            VERA scores are 100% deterministic and transparent. No arbitrary AI hallucination or black-box rankings.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1 leading-relaxed">
          <p className="font-semibold text-slate-900">Documented Scoring Methodology:</p>
          <p>
            • <strong>Base Score:</strong> 100 points baseline.<br />
            • <strong>Penalties:</strong> -15 points per failed milestone, -10 points per rejected proof, -5 points per AI discrepancy flag, -10 points per refund transaction.<br />
            • <strong>Bonuses:</strong> +10 points per completed milestone (up to +30 max), +5 points for 100% proof approval rate, +5 points for clean high fund utilization (≥70%).<br />
            • <strong>Bounds:</strong> Strictly normalized between 0 and 100.
          </p>
        </div>

        {/* Breakdown Factors List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Active Scoring Factors for {name}
          </h3>
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
            {factors.map((f, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between bg-white">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{f.name}</div>
                  <div className="text-[11px] text-slate-500">{f.description}</div>
                </div>
                <span
                  className={`font-mono font-bold px-2.5 py-1 rounded-md text-xs ${
                    f.impact > 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : f.impact < 0
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {f.impact > 0 ? `+${f.impact}` : f.impact} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Public Campaigns Portfolio */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Public Charitable Initiatives ({campaigns.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore active and completed campaigns organized by this NGO.
            </p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No public campaigns available for this organization.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{camp.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{camp.description}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Beneficiary: <strong className="text-slate-700">{camp.beneficiary}</strong>
                    </p>
                  </div>
                  <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 self-start">
                    {camp.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <ProgressBar current={camp.raisedAmount} total={camp.targetAmount} />
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{formatRupees(camp.raisedAmount)} raised</span>
                    <span>Goal: {formatRupees(camp.targetAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {camp.milestonesCount} Milestones Defined
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Campaign Details
                    </Link>
                    <Link
                      href={`/campaigns/${camp.id}/audit`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-500"
                    >
                      Public Audit Trail
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Guarantee Statement */}
      <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Privacy & Data Boundary Guarantee:</p>
        <p>
          VERA protects sensitive organizational credentials. Private emails, phone numbers, passwords, and internal reviewer communications are strictly sealed behind server-side role-based access control.
        </p>
      </div>
    </div>
  );
}
