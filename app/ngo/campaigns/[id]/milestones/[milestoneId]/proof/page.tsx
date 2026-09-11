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
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-sm">
          <h2 className="text-xl font-bold text-rose-700">Access Denied</h2>
          <p className="text-sm text-slate-600 mt-2">
            You can only submit milestone proofs for your own campaigns.
          </p>
          <Link
            href="/ngo/campaigns"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
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
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaign
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
              Phase 3 — Evidence Submission
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">
              Submit Milestone Proof
            </h1>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            milestone.status === 'REJECTED'
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {milestone.status === 'REJECTED' ? 'CORRECTION REQUIRED' : milestone.status}
          </span>
        </div>

        {/* Milestone Meta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Milestone</span>
            <span className="text-slate-900 font-bold block mt-0.5">{milestone.title}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Allocated Budget</span>
            <span className="text-emerald-700 font-bold block mt-0.5">{formatRupees(Number(milestone.amount))}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Campaign</span>
            <span className="text-slate-900 font-medium block mt-0.5 truncate">{campaign.title}</span>
          </div>
        </div>

        {/* Rejection notice if resubmitting */}
        {milestone.status === 'REJECTED' && previousProofs.length > 0 && previousProofs[0].rejection_reason && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Previous Submission Rejected by Auditor:
            </div>
            <p className="text-rose-700 pl-5">
              "{previousProofs[0].rejection_reason}"
            </p>
            <p className="text-[11px] text-rose-600 pl-5 pt-1">
              Please upload corrected invoices/receipts and resubmit for verification.
            </p>
          </div>
        )}
      </div>

      {!isEligible ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
          <h3 className="text-sm font-bold text-amber-900">Proof Submission Unavailable</h3>
          <p className="text-xs text-amber-700 max-w-md mx-auto">
            This milestone is currently in <strong>{milestone.status}</strong> status. Proof can only be submitted when the milestone is IN_PROGRESS or REJECTED.
          </p>
          <Link
            href={`/ngo/campaigns/${campaign.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 text-white text-xs font-semibold"
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
