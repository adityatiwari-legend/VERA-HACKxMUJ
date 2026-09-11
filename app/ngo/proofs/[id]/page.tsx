import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getProofById } from '@/lib/proofs';
import {
  ArrowLeft,
  FileCheck,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Building2,
  Hash,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function NgoProofDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  let proof;
  try {
    proof = await getProofById(params.id, user);
  } catch (err: any) {
    if (err.statusCode === 404 || err.name === 'NotFoundError') {
      notFound();
    }
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-sm">
          <h2 className="text-xl font-bold text-rose-700">Access Restricted</h2>
          <p className="text-sm text-slate-600 mt-2">{err.message}</p>
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

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const ver = proof.verification;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back Button */}
      <Link
        href={proof.campaign_id ? `/ngo/campaigns/${proof.campaign_id}` : '/ngo/campaigns'}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Campaign
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                Evidence Submission #{proof.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Milestone: {proof.milestone_title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Campaign: {proof.campaign_title}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                proof.status === 'APPROVED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : proof.status === 'REJECTED'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {proof.status === 'UNDER_REVIEW' || proof.status === 'SUBMITTED'
                ? 'PENDING AUDITOR REVIEW'
                : proof.status}
            </span>
            <span className="text-[10px] text-slate-400">
              Submitted on {new Date(proof.submitted_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              Claimed Utilisation
            </span>
            <span className="text-base font-bold text-slate-900 block mt-1">
              {formatRupees(Number(proof.claimed_amount))}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              Milestone Allocation
            </span>
            <span className="text-base font-bold text-slate-700 block mt-1">
              {formatRupees(Number(proof.milestone_amount || 0))}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase block">
              Fund Release Status
            </span>
            <span className="text-xs font-bold text-slate-500 block mt-1">
              ₹0 Released (Phase 4)
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1 text-xs">
          <span className="font-bold text-slate-700 block">Submitted Justification:</span>
          <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            {proof.description}
          </p>
        </div>

        {/* Rejection Notice & Resubmission CTA */}
        {proof.status === 'REJECTED' && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-rose-800 text-sm">
              <XCircle className="w-5 h-5 text-rose-600" />
              Proof Evidence Rejected by Auditor
            </div>
            <p className="text-rose-700 leading-relaxed pl-7">
              <strong>Auditor Feedback:</strong> {proof.rejection_reason || 'No comments provided.'}
            </p>
            <div className="pl-7 pt-1">
              <Link
                href={`/ngo/campaigns/${proof.campaign_id}/milestones/${proof.milestone_id}/proof`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Submit Corrected Evidence
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Discrepancy & AI Verification Result Card */}
      {ver && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Automated Verification & Discrepancy Analysis
              </h2>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                ver.ai_status === 'PASS'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : ver.ai_status === 'FLAG'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {ver.ai_status}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Extracted Vendor</span>
              <span className="text-slate-900 font-bold block mt-0.5 truncate">
                {ver.extracted_vendor || 'N/A'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Invoice Amount</span>
              <span className="text-slate-900 font-bold block mt-0.5">
                {ver.extracted_amount ? formatRupees(Number(ver.extracted_amount)) : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Discrepancy</span>
              <span
                className={`font-bold block mt-0.5 ${
                  Number(ver.discrepancy_amount) > 0 ? 'text-amber-600' : 'text-emerald-600'
                }`}
              >
                {formatRupees(Number(ver.discrepancy_amount))}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">AI Confidence</span>
              <span className="text-indigo-600 font-bold block mt-0.5">
                {Math.round(ver.confidence * 100)}%
              </span>
            </div>
          </div>

          {/* Verification Notes */}
          {ver.notes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 block">System Verification Findings:</span>
              <p className="text-slate-600">{ver.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Evidence Files with SHA-256 Fingerprints */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Uploaded Evidence Documents ({proof.files?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Cryptographically fingerprinted</span>
        </div>

        {proof.files && proof.files.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {proof.files.map((file) => (
              <div key={file.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                    {file.mime_type.includes('pdf') ? (
                      <FileText className="w-5 h-5 text-rose-600" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">{file.file_name}</p>
                    <p className="text-[11px] text-slate-400">
                      {file.mime_type} • {(file.file_size / 1024).toFixed(0)} KB
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">SHA-256:</span>
                      <code className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 break-all">
                        {file.sha256_hash}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-11 sm:pl-0">
                  <a
                    href={`/api/proof-files/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    <span>View / Download</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No files attached to this proof record.
          </div>
        )}
      </div>
    </div>
  );
}
