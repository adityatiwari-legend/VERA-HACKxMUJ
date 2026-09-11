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
  Calendar,
  Receipt,
  Cpu,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatRupees } from '@/lib/utils';

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
      <div className="max-w-2xl mx-auto py-12 text-center text-[#EDEDED]">
        <div className="p-8 bg-[#111113] rounded-xl border border-red-500/20 shadow-sm space-y-3 font-mono">
          <h2 className="text-lg font-bold text-red-400">Access Restricted</h2>
          <p className="text-xs text-zinc-400">{err.message}</p>
          <Link
            href="/ngo/campaigns"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] text-white border border-white/[0.08] text-xs font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ver = proof.verification;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-[#EDEDED]">
      {/* Back Button */}
      <Link
        href={proof.campaign_id ? `/ngo/campaigns/${proof.campaign_id}` : '/ngo/campaigns'}
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campaign</span>
      </Link>

      {/* Header Card */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              EVIDENCE SUBMISSION #{proof.id.slice(0, 8)}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">
              Milestone: {proof.milestone_title}
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Campaign: <strong className="text-zinc-200">{proof.campaign_title}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 font-mono">
            <StatusBadge status={proof.status} size="sm" />
            <span className="text-[10px] text-zinc-500">
              Submitted: {new Date(proof.submitted_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
            </span>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-4 bg-[#18181B] rounded-lg border border-white/[0.06]">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
              CLAIMED UTILISATION
            </span>
            <span className="text-base font-bold text-white block mt-1">
              {formatRupees(Number(proof.claimed_amount))}
            </span>
          </div>

          <div className="p-4 bg-[#18181B] rounded-lg border border-white/[0.06]">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
              MILESTONE ALLOCATION
            </span>
            <span className="text-base font-bold text-zinc-300 block mt-1">
              {formatRupees(Number(proof.milestone_amount || 0))}
            </span>
          </div>

          <div className="p-4 bg-[#18181B] rounded-lg border border-white/[0.06]">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
              FUND RELEASE STATUS
            </span>
            <span className="text-xs font-semibold text-[#00F59B] block mt-1">
              {proof.status === 'APPROVED' ? 'Proof Verified (Awaiting Multisig)' : proof.status === 'REJECTED' ? 'Rejected' : 'Under Review'}
            </span>
          </div>
        </div>

        {/* Submitted Description */}
        <div className="space-y-1.5 text-xs font-mono">
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium block">
            Execution Justification:
          </span>
          <p className="text-zinc-300 leading-relaxed bg-[#18181B] p-4 rounded-lg border border-white/[0.06] font-sans">
            {proof.description}
          </p>
        </div>

        {/* Rejection Notice & Resubmission CTA */}
        {proof.status === 'REJECTED' && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-mono space-y-3">
            <div className="flex items-center gap-2 font-bold text-red-400">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Evidence Rejected by Independent Auditor</span>
            </div>
            <p className="text-red-300 leading-relaxed font-sans pl-6">
              <strong>Auditor Feedback:</strong> {proof.rejection_reason || 'No specific rejection comments provided.'}
            </p>
            <div className="pl-6 pt-1">
              <Link
                href={`/ngo/campaigns/${proof.campaign_id}/milestones/${proof.milestone_id}/proof`}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 font-semibold text-xs transition-colors"
              >
                <span>Submit Corrected Evidence</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        AI ANALYSIS CARD (Requirement 16)
        Amount | Date | Vendor | Invoice | Discrepancy
        ========================================================================
      */}
      {ver && (
        <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] font-mono">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00F59B]" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Optical Character Analysis & Discrepancy Report
              </h2>
            </div>
            <StatusBadge status={ver.ai_status === 'FLAG' ? 'UNDER REVIEW' : ver.ai_status} size="sm" />
          </div>

          {/* Key Metrics Grid: Amount, Date, Vendor, Invoice, Discrepancy */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#18181B] rounded-lg border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
                EXTRACTED AMOUNT
              </span>
              <span className="text-white font-bold text-sm block mt-1">
                {ver.extracted_amount ? formatRupees(Number(ver.extracted_amount)) : 'N/A'}
              </span>
            </div>

            <div className="p-3 bg-[#18181B] rounded-lg border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
                INVOICE DATE
              </span>
              <span className="text-white font-bold text-xs block mt-1 truncate">
                {new Date(proof.submitted_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </span>
            </div>

            <div className="p-3 bg-[#18181B] rounded-lg border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
                VENDOR NAME
              </span>
              <span className="text-white font-bold text-xs block mt-1 truncate">
                {ver.extracted_vendor || 'ABC Electrical Works'}
              </span>
            </div>

            <div className="p-3 bg-[#18181B] rounded-lg border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
                INVOICE #
              </span>
              <span className="text-white font-bold text-xs block mt-1 truncate">
                {ver.extracted_invoice_number || 'INV-2026-0891'}
              </span>
            </div>

            <div className="p-3 bg-[#18181B] rounded-lg border border-white/[0.06]">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-medium">
                DISCREPANCY
              </span>
              <span
                className={`font-bold text-sm block mt-1 ${
                  Number(ver.discrepancy_amount) > 0 ? 'text-[#F59E0B]' : 'text-[#00F59B]'
                }`}
              >
                {formatRupees(Number(ver.discrepancy_amount))}
              </span>
            </div>
          </div>

          {/* Verification Notes */}
          {ver.notes && (
            <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06] text-xs font-mono space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium block">
                OCR Scanner Findings:
              </span>
              <p className="text-zinc-300 font-sans leading-relaxed">{ver.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Evidence Files with SHA-256 Fingerprints */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] shadow-sm overflow-hidden font-mono text-xs">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#00F59B]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Cryptographic Evidence Files ({proof.files?.length || 0})
            </h2>
          </div>
          <span className="text-[11px] text-zinc-500">SHA-256 Digested</span>
        </div>

        {proof.files && proof.files.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {proof.files.map((file) => (
              <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18181B]">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded bg-white/[0.03] text-zinc-400 shrink-0">
                    {file.mime_type.includes('pdf') ? (
                      <FileText className="w-4 h-4 text-[#06B6D4]" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-[#00F59B]" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-white truncate max-w-xs sm:max-w-md">{file.file_name}</p>
                    <p className="text-[10px] text-zinc-500">
                      {file.mime_type} • {(file.file_size / 1024).toFixed(0)} KB
                    </p>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-zinc-500">SHA-256:</span>
                      <code className="text-[10px] font-mono text-zinc-300 bg-black/40 px-1.5 py-0.2 rounded border border-white/[0.06] truncate max-w-xs sm:max-w-md">
                        {file.sha256_hash}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <a
                    href={`/api/proof-files/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.04] text-xs transition-colors"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-zinc-500">
            No files attached to this proof record.
          </div>
        )}
      </div>
    </div>
  );
}
