import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCampaignById } from '@/lib/campaigns';
import { query } from '@/lib/db';
import { Milestone, Proof } from '@/types';
import { ArrowLeft, ShieldAlert, Sparkles, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';
import { ProofSubmitForm } from './ProofSubmitForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
    milestoneId: string;
  };
}

export default async function SubmitProofPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const campaign = await getCampaignById(params.id);
  if (!campaign) {
    notFound();
  }

  // Authorization: Only owning NGO or Admin
  if (user.role === 'NGO' && campaign.ngo_id !== user.id) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="p-8 bg-[#0E0E12] rounded-3xl border border-red-500/20 shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-red-400">Access Denied</h2>
          <p className="text-xs text-zinc-400 mt-2">
            You can only submit milestone proofs for your own campaigns.
          </p>
          <Link
            href="/ngo/campaigns"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-semibold uppercase tracking-wider"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fetch milestone
  const msRes = await query<Milestone>(
    `SELECT * FROM milestones WHERE id = $1 AND campaign_id = $2`,
    [params.milestoneId, params.id]
  );

  if (msRes.rowCount === 0) {
    notFound();
  }

  const milestone = msRes.rows[0];

  // Milestone must be IN_PROGRESS or REJECTED
  const isEligible = milestone.status === 'IN_PROGRESS' || milestone.status === 'REJECTED';

  // Check if there is an existing rejected proof to show rejection history
  const previousProofsRes = await query<Proof>(
    `SELECT * FROM proofs WHERE milestone_id = $1 ORDER BY submitted_at DESC`,
    [params.milestoneId]
  );
  const previousProofs = previousProofsRes.rows;

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Breadcrumb / Back Link */}
      <Link
        href={`/ngo/campaigns/${campaign.id}`}
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-[#00F59B] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaign
      </Link>

      {/* Header */}
      <div className="bg-[#0E0E12] rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#00F59B] uppercase tracking-wider block">
              Phase 3 — Evidence Submission
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Submit Milestone Proof
            </h1>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
            milestone.status === 'REJECTED'
              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
          }`}>
            {milestone.status === 'REJECTED' ? 'CORRECTION REQUIRED' : milestone.status}
          </span>
        </div>

        {/* Milestone Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-xs">
          <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
            <span className="text-zinc-500 block text-[10px] font-mono uppercase tracking-wider">Milestone</span>
            <span className="text-white font-bold block mt-1">{milestone.title}</span>
          </div>
          <div className="p-4 bg-[#00F59B]/5 rounded-2xl border border-[#00F59B]/20">
            <span className="text-[#00F59B] block text-[10px] font-mono uppercase tracking-wider">Allocated Budget</span>
            <span className="text-[#00F59B] font-mono font-bold block mt-1">{formatRupees(Number(milestone.amount))}</span>
          </div>
          <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
            <span className="text-zinc-500 block text-[10px] font-mono uppercase tracking-wider">Campaign</span>
            <span className="text-zinc-300 font-medium block mt-1 truncate">{campaign.title}</span>
          </div>
        </div>

        {/* Rejection notice if resubmitting */}
        {milestone.status === 'REJECTED' && previousProofs.length > 0 && previousProofs[0].rejection_reason && (
          <div className="mt-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Previous Submission Rejected by Auditor:
            </div>
            <p className="text-red-300/90 pl-6 font-mono text-[11px]">
              "{previousProofs[0].rejection_reason}"
            </p>
            <p className="text-[11px] text-zinc-400 pl-6 pt-1">
              Please upload corrected invoices/receipts and resubmit for verification.
            </p>
          </div>
        )}
      </div>

      {!isEligible ? (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 text-center space-y-4">
          <h3 className="text-base font-bold text-amber-300">Proof Submission Unavailable</h3>
          <p className="text-xs text-amber-200/80 max-w-md mx-auto leading-relaxed">
            This milestone is currently in <strong>{milestone.status}</strong> status. Proof can only be submitted when the milestone is IN_PROGRESS or REJECTED.
          </p>
          <Link
            href={`/ngo/campaigns/${campaign.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider"
          >
            Back to Campaign
          </Link>
        </div>
      ) : (
        /* Submission Form Component */
        <ProofSubmitForm
          campaignId={campaign.id}
          milestoneId={milestone.id}
          milestoneAmount={Number(milestone.amount)}
        />
      )}
    </div>
  );
}
