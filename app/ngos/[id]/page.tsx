import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNgoPublicProfile } from '@/lib/reputation';
import { formatRupees } from '@/lib/utils';
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
  RotateCcw,
  Percent,
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Back button */}
      <Link
        href="/campaigns"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaigns
      </Link>

      {/* Header Profile Banner */}
      <div className="bg-[#111113] rounded-xl p-6 sm:p-8 text-white border border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[#00F59B] shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 uppercase tracking-wider">
                ● Verified Entity
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">{name}</h1>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Onboarded on VERA since{' '}
                {new Date(createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  year: 'numeric',
                })}</span>
              </p>
            </div>
          </div>

          {/* VERA TRUST SCORE (Requirement 19) */}
          <div className="flex items-center gap-4 bg-[#18181B] p-4 rounded-xl border border-zinc-800 shrink-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black font-mono border bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30">
              {grade}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                VERA TRUST SCORE
              </span>
              <span className="text-2xl font-black font-mono text-white tracking-tight">{score} / 100</span>
              <span className="text-[10px] font-mono font-semibold text-[#00F59B] block">{badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Explainable Factors Grid (Requirement 19: Completed milestones, Rejected proofs, AI discrepancy flags, Refunds, Utilization) */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Explainable Financial Reliability Factors
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* 1. Completed Milestones */}
          <div className="bg-[#111113] rounded-xl border border-zinc-800 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00F59B]" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Completed</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.milestonesCompleted} / {stats.milestonesTotal}
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block">
              Auditor Verified
            </span>
          </div>

          {/* 2. Rejected Proofs */}
          <div className="bg-[#111113] rounded-xl border border-zinc-800 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Rejected Proofs</span>
            </div>
            <div className={`text-xl font-bold font-mono ${stats.proofsRejected > 0 ? 'text-red-400' : 'text-white'}`}>
              {stats.proofsRejected}
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block">
              {stats.proofsRejected === 0 ? '0 rejections' : '-10 pts penalty each'}
            </span>
          </div>

          {/* 3. AI Discrepancy Flags */}
          <div className="bg-[#111113] rounded-xl border border-zinc-800 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">AI Flags</span>
            </div>
            <div className={`text-xl font-bold font-mono ${stats.discrepanciesCount > 0 ? 'text-amber-400' : 'text-white'}`}>
              {stats.discrepanciesCount}
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block">
              {stats.discrepanciesCount === 0 ? 'No OCR mismatches' : 'OCR discrepancies'}
            </span>
          </div>

          {/* 4. Refunds */}
          <div className="bg-[#111113] rounded-xl border border-zinc-800 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Refunds</span>
            </div>
            <div className={`text-xl font-bold font-mono ${stats.refundsCount > 0 ? 'text-red-400' : 'text-white'}`}>
              {stats.refundsCount}
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block">
              {stats.refundsCount === 0 ? '0 clawbacks' : 'Donor refunds'}
            </span>
          </div>

          {/* 5. Utilization */}
          <div className="bg-[#111113] rounded-xl border border-zinc-800 p-4 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Percent className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span className="text-[10px] font-mono uppercase tracking-wider">Utilization</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#06B6D4]">
              {stats.utilizationRatePercent}%
            </div>
            <span className="text-[10px] font-mono text-zinc-500 block">
              Released / Raised
            </span>
          </div>
        </div>
      </div>

      {/* "How this score is calculated" (Requirement 19) */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            How this score is calculated
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            VERA scores are 100% deterministic and transparent. No arbitrary AI hallucination, subjective feedback, or pay-to-play rankings.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-[#18181B] border border-zinc-800 text-xs text-zinc-300 space-y-2 font-mono leading-relaxed">
          <p className="font-semibold text-white">Mathematical Trust Formula:</p>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-400">
            <li><strong>Base Score:</strong> 100 points neutral starting baseline.</li>
            <li><strong>Completed Milestones:</strong> +10 points per milestone verified and released (up to +30 max bonus).</li>
            <li><strong>High Utilization:</strong> +5 points bonus if fund utilization is ≥ 70% with zero discrepancies.</li>
            <li><strong>Proof Approval Rate:</strong> +5 points bonus for 100% first-pass proof approvals.</li>
            <li><strong>Penalties:</strong> -10 points per rejected proof, -5 points per AI OCR invoice discrepancy, -15 points per failed milestone, -10 points per donor refund.</li>
            <li><strong>Normalization:</strong> Score is clamped strictly between 0 and 100.</li>
          </ul>
        </div>

        {/* Breakdown Factors List */}
        <div className="space-y-2 pt-2">
          <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Current Factor Breakdown for {name}
          </h3>
          <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-lg overflow-hidden text-xs">
            {factors.map((f, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between bg-[#18181B]/40 hover:bg-[#18181B] transition-colors">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{f.name}</div>
                  <div className="text-[11px] text-zinc-400">{f.description}</div>
                </div>
                <span
                  className={`font-mono font-bold px-2.5 py-0.5 rounded text-[11px] ${
                    f.impact > 0
                      ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20'
                      : f.impact < 0
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
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
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00F59B]" />
              Campaigns by {name} ({campaigns.length})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Active and completed charitable initiatives with public audit trails
            </p>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-10 text-center text-xs font-mono text-zinc-500">
            No public campaigns registered for this organization.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {campaigns.map((camp) => (
              <div key={camp.id} className="p-5 space-y-3 hover:bg-zinc-800/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{camp.title}</h3>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{camp.description}</p>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      Beneficiary: <strong className="text-zinc-300">{camp.beneficiary}</strong>
                    </p>
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20 self-start">
                    ● {camp.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <ProgressBar current={camp.raisedAmount} total={camp.targetAmount} />
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span className="text-[#00F59B]">{formatRupees(camp.raisedAmount)} raised</span>
                    <span>Goal: {formatRupees(camp.targetAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {camp.milestonesCount} Milestones Defined
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="font-mono text-xs text-zinc-400 hover:text-white"
                    >
                      Campaign Details
                    </Link>
                    <Link
                      href={`/campaigns/${camp.id}/audit`}
                      className="inline-flex items-center gap-1 font-mono text-xs text-[#00F59B] hover:underline font-semibold"
                    >
                      <span>Public Audit</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
