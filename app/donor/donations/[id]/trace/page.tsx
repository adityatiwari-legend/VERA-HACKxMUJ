import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDonationJourney } from '@/lib/audit_timeline';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Coins,
  FileCheck,
  KeyRound,
  Sparkles,
  Info,
  Lock,
} from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';

export const dynamic = 'force-dynamic';

export default async function TraceDonationPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const journey = await getDonationJourney(params.id, user.id);
  if (!journey) {
    notFound();
  }

  const { donation, stages, milestones } = journey;

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/donor/donations/${donation.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Donation Receipt
        </Link>
        <Link
          href={`/campaigns/${donation.campaign_id}/audit`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          View Full Campaign Audit
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Trace My Donation Journey
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Where Did My Money Go?
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Follow your ₹{formatRupees(donation.amount)} contribution through escrow locking, milestone allocation, AI/auditor verification, and blockchain release.
            </p>
          </div>

          <div className="text-left sm:text-right bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Your Contribution</span>
            <span className="text-2xl font-black text-emerald-400 block mt-0.5">
              {formatRupees(donation.amount)}
            </span>
            <span className="font-mono text-[10px] text-slate-400">{donation.reference}</span>
          </div>
        </div>
      </div>

      {/* Campaign Fund Allocation Context */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Earmarked Initiative
            </h3>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {donation.campaign_title}
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Beneficiary: <strong className="text-slate-800">{donation.beneficiary}</strong>
          </span>
        </div>

        <div className="space-y-1.5">
          <ProgressBar current={donation.raised_amount} total={donation.target_amount} />
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>{formatRupees(donation.raised_amount)} raised of {formatRupees(donation.target_amount)}</span>
            <span>Released: {formatRupees(donation.released_amount)}</span>
          </div>
        </div>
      </div>

      {/* Visual Step-by-Step Fund Journey */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Programmatic Journey of Your Funds
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of your contribution across the VERA transparency pipeline.
          </p>
        </div>

        <div className="relative border-l-2 border-slate-200 pl-6 space-y-8 ml-3">
          {stages.map((stage) => {
            const isCompleted = stage.status === 'COMPLETED';
            const isAwaiting = stage.status === 'AWAITING_RELEASE';

            return (
              <div key={stage.step} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[33px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isAwaiting
                      ? 'bg-indigo-600 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span>{stage.step}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        isCompleted ? 'text-slate-900' : 'text-slate-500'
                      }`}
                    >
                      {stage.title}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isAwaiting
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : isAwaiting ? '○ Next in Queue' : '○ Pending'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {stage.description}
                  </p>

                  {stage.txHash && (
                    <div className="pt-1">
                      <a
                        href={stage.explorerUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-emerald-600 hover:text-emerald-500"
                      >
                        Blockchain Tx: {stage.txHash.substring(0, 16)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Allocation Path breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Campaign Milestone Allocation Breakdown
          </h2>
          <span className="text-xs text-slate-500">
            {milestones.length} Milestone(s)
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Your donation is held in the campaign's pooled escrow. Milestone progress below determines when and how much capital is released to vendors:
        </p>

        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {milestones.map((ms) => (
            <div key={ms.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-500">M{ms.sequence}</span>
                  <span className="font-bold text-slate-900">{ms.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700">
                    {ms.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{ms.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="font-bold text-slate-900 block">{formatRupees(ms.amount)}</span>
                <span className="text-[10px] text-indigo-700 font-semibold">
                  Released: {formatRupees(ms.released_amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Accounting Disclosure */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-5 text-xs text-blue-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-blue-950">
          <Info className="w-4 h-4 text-blue-700" />
          Honest Accounting Disclosure
        </div>
        <p className="leading-relaxed">
          This fund trail represents programmatic allocation within the campaign escrow. In pooled donations, contributions are earmarked to this specific campaign and disbursed only as milestones are verified and approved via 2-of-3 multisig, rather than tracking individual physical bank notes.
        </p>
      </div>
    </div>
  );
}
