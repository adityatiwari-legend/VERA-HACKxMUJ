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
  Info,
  Lock,
  Database,
  Cpu,
  UserCheck,
} from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import { formatRupees } from '@/lib/utils';

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

  // The 8 canonical steps specified by Requirement 13
  const timelineSteps = [
    {
      step: 1,
      title: 'Donation',
      subtitle: 'Contribution Received',
      description: `${formatRupees(donation.amount)} contribution received and assigned permanent reference: ${donation.reference}.`,
      isDone: true,
      timestamp: donation.created_at,
      icon: Coins,
    },
    {
      step: 2,
      title: 'Earmarked',
      subtitle: 'Programmatic Allocation',
      description: `Funds bound programmatically to "${donation.campaign_title}". Zero co-mingling with general NGO operational funds.`,
      isDone: true,
      timestamp: donation.created_at,
      icon: Lock,
    },
    {
      step: 3,
      title: 'Locked',
      subtitle: 'Escrow Custody',
      description: `Capital held in escrow custody until milestone deliverables are independently certified.`,
      isDone: true,
      timestamp: donation.created_at,
      icon: Database,
    },
    {
      step: 4,
      title: 'Assigned to milestone',
      subtitle: 'Budget Segmentation',
      description: `Programmatically allocated across ${milestones.length} bounded milestone tranches for ${donation.beneficiary}.`,
      isDone: milestones.length > 0,
      timestamp: null,
      icon: Layers,
    },
    {
      step: 5,
      title: 'Evidence submitted',
      subtitle: 'Vendor Invoices & Photos',
      description: milestones.some((m) => ['PROOF_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'RELEASED'].includes(m.status))
        ? 'Executing NGO uploaded vendor receipts and site inspection photographs with SHA-256 digests.'
        : 'Awaiting vendor invoice submission upon deliverable completion.',
      isDone: milestones.some((m) => ['PROOF_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'RELEASED'].includes(m.status)),
      timestamp: null,
      icon: FileCheck,
    },
    {
      step: 6,
      title: 'Verification',
      subtitle: 'AI Line-Item OCR',
      description: milestones.some((m) => ['APPROVED', 'RELEASED'].includes(m.status))
        ? 'OCR line-item scanner mathematically verified vendor invoice totals against claimed budget.'
        : 'AI screening executes immediately upon evidence upload.',
      isDone: milestones.some((m) => ['APPROVED', 'RELEASED'].includes(m.status)),
      timestamp: null,
      icon: Cpu,
    },
    {
      step: 7,
      title: 'Auditor approval',
      subtitle: 'Independent Certification',
      description: milestones.some((m) => ['APPROVED', 'RELEASED'].includes(m.status))
        ? 'Certified independent auditor inspected documentation and signed off on compliance.'
        : 'Human auditor sign-off pending evidence examination.',
      isDone: milestones.some((m) => ['APPROVED', 'RELEASED'].includes(m.status)),
      timestamp: null,
      icon: UserCheck,
    },
    {
      step: 8,
      title: 'Release',
      subtitle: '2-of-3 Multisig On-Chain',
      description: Number(donation.released_amount) > 0
        ? `Smart contract released tranche upon 2-of-3 multisig consensus. Real transaction hash recorded.`
        : 'Funds remain safely locked in escrow custody until final multisig consensus.',
      isDone: Number(donation.released_amount) > 0,
      timestamp: null,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 text-[#EDEDED]">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={`/donor/donations/${donation.id}`}
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Contribution Receipt</span>
        </Link>
        <Link
          href={`/campaigns/${donation.campaign_id}/audit`}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold bg-white/[0.04] text-white border border-white/[0.08] hover:bg-white/[0.08] transition-all"
        >
          <ShieldCheck className="w-4 h-4 text-[#00F59B]" />
          <span>View Campaign Public Audit</span>
        </Link>
      </div>

      {/* 
        ========================================================================
        HERO SECTION (Requirement 13)
        "Where did my donation go?"
        ₹10,000 / Donation
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl p-6 sm:p-8 border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              DONOR TRACEABILITY LEDGER
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-sans">
              Where did my donation go?
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Campaign: <strong className="text-zinc-200">{donation.campaign_title}</strong> • Ref: {donation.reference}
            </p>
          </div>

          <div className="bg-[#18181B] border border-white/[0.08] p-5 rounded-xl text-left sm:text-right shrink-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
              Donation
            </span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-[#00F59B] mt-0.5">
              {formatRupees(donation.amount)}
            </div>
            <span className="text-[11px] font-mono text-zinc-400">
              {new Date(donation.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        PROGRAMMATIC ALLOCATION DISCLAIMER (Requirement 13)
        "This represents programmatic allocation within the campaign."
        Do NOT claim physical currency tracking.
        ========================================================================
      */}
      <div className="rounded-xl bg-[#111113] p-4 border border-white/[0.08] text-xs font-mono flex items-start gap-3 text-zinc-300">
        <Info className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-white">
            Programmatic Transparency Notice:
          </p>
          <p className="text-zinc-400 leading-relaxed">
            This represents programmatic allocation within the campaign. VERA tracks earmarked funds and milestone commitments within verified smart contracts rather than individual physical bank notes.
          </p>
        </div>
      </div>

      {/* 
        ========================================================================
        VERTICAL TIMELINE (Requirement 13)
        ✓ Donation
        ✓ Earmarked
        ✓ Locked
        ✓ Assigned to milestone
        ✓ Evidence submitted
        ✓ Verification
        ✓ Auditor approval
        ✓ Release
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 font-mono">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#00F59B] font-semibold block">
              EXECUTION MILESTONES
            </span>
            <h2 className="text-lg font-bold text-white font-sans">
              Contribution Progression
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {timelineSteps.filter((s) => s.isDone).length} of 8 Stages Complete
          </span>
        </div>

        <div className="relative pl-6 sm:pl-8 border-l border-white/[0.1] ml-3 sm:ml-4 space-y-6">
          {timelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative group">
                {/* Checkmark or bullet node */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                    step.isDone
                      ? 'bg-[#00F59B] text-black shadow-[0_0_8px_rgba(0,245,155,0.4)]'
                      : 'bg-[#18181B] border border-white/[0.2] text-zinc-500'
                  }`}
                >
                  {step.isDone && <CheckCircle2 className="w-3 h-3 text-black" />}
                </div>

                <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06] hover:border-white/[0.14] transition-all space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-white">
                        {step.isDone ? '✓ ' : '○ '}
                        {step.title}
                      </span>
                      <span className="text-zinc-500 text-xs">/</span>
                      <span className="text-xs text-zinc-400 font-medium">
                        {step.subtitle}
                      </span>
                    </div>

                    <StatusBadge status={step.isDone ? 'APPROVED' : 'PENDING'} size="sm" />
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {step.description}
                  </p>

                  {step.timestamp && (
                    <div className="text-[11px] font-mono text-zinc-500 pt-0.5">
                      Recorded: {new Date(step.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Milestone Allocation Context */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 font-mono">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#00F59B] font-semibold block">
              DELIVERABLE TARGETS
            </span>
            <h3 className="text-base font-bold text-white font-sans">
              Supported Milestone Deliverables
            </h3>
          </div>
          <span className="text-xs text-zinc-400">
            {milestones.length} Milestone Tranches
          </span>
        </div>

        <div className="divide-y divide-white/[0.06] text-xs font-mono">
          {milestones.map((m) => (
            <div key={m.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-white">{m.title}</span>
                <p className="text-[11px] text-zinc-400 font-sans mt-0.5">{m.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-zinc-200">{formatRupees(m.amount)}</span>
                <StatusBadge status={m.status} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
