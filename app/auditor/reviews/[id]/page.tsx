import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getProofById } from '@/lib/proofs';
import { getAuditLogsForCampaign } from '@/lib/audit';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Building2,
  History,
  Info,
} from 'lucide-react';
import { AuditorActionForm } from './AuditorActionForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AuditorReviewDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'AUDITOR' && user.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="p-8 bg-white rounded-2xl border border-rose-200 shadow-sm">
          <h2 className="text-xl font-bold text-rose-700">Access Restricted</h2>
          <p className="text-sm text-slate-600 mt-2">
            Only certified AUDITOR and ADMIN accounts may conduct evidence reviews.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  let proof;
  try {
    proof = await getProofById(params.id, user);
  } catch (err: any) {
    notFound();
  }

  const auditLogs = proof.campaign_id ? await getAuditLogsForCampaign(proof.campaign_id) : [];

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const ver = proof.verification;
  const claimed = Number(proof.claimed_amount);
  const detected = ver?.extracted_amount ? Number(ver.extracted_amount) : null;
  const discrepancy = Number(ver?.discrepancy_amount || 0);
  const hasDiscrepancy = discrepancy > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Back to Dashboard */}
      <Link
        href="/auditor/dashboard"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Auditor Dashboard
      </Link>

      {/* Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Auditor Examination #{proof.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Milestone: {proof.milestone_title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Campaign: {proof.campaign_title} • Submitted by {proof.ngo_name || 'NGO'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
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
                ? 'PENDING AUDITOR SIGN-OFF'
                : proof.status}
            </span>
            <span className="text-[10px] text-slate-400">
              Submitted {new Date(proof.submitted_at).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* PROMINENT DISCREPANCY COMPARISON BOARD (Section 30 & 31) */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Financial Comparison & Discrepancy Analysis
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* CLAIMED */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                CLAIMED UTILISATION
              </span>
              <span className="text-2xl font-black text-slate-900 block mt-1.5">
                {formatRupees(claimed)}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Max Budget: {formatRupees(Number(proof.milestone_amount || 0))}
              </span>
            </div>

            {/* DETECTED */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                DETECTED BY OCR / AI
              </span>
              <span className="text-2xl font-black text-indigo-900 block mt-1.5">
                {detected !== null ? formatRupees(detected) : '—'}
              </span>
              <span className="text-[10px] text-indigo-600 mt-1 block font-semibold">
                Confidence: {ver ? `${Math.round(ver.confidence * 100)}%` : 'N/A'}
              </span>
            </div>

            {/* DISCREPANCY */}
            <div
              className={`p-5 rounded-2xl text-center border ${
                hasDiscrepancy
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                DISCREPANCY DETECTED
              </span>
              <span className="text-2xl font-black block mt-1.5">
                {hasDiscrepancy ? `+${formatRupees(discrepancy)}` : '₹0 (Match)'}
              </span>
              <span className="text-[10px] mt-1 block font-bold">
                {hasDiscrepancy ? '⚠ Discrepancy Flagged' : '✓ No Discrepancy'}
              </span>
            </div>
          </div>

          {/* Detailed Alert Banner if Discrepancy detected */}
          {hasDiscrepancy && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-950">Evidence Discrepancy Detected</p>
                <p className="leading-relaxed">
                  The invoice amount detected by automated extraction ({formatRupees(detected || 0)}) differs from the milestone claimed utilisation ({formatRupees(claimed)}) by <strong>{formatRupees(discrepancy)}</strong>. Please verify the invoice details carefully before deciding.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Description & Verification Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-700 block">NGO Justification Description:</span>
            <p className="text-slate-600 leading-relaxed">{proof.description}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
            <span className="font-bold text-slate-700 block">Automated Extraction Findings:</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="text-slate-400 block">Extracted Vendor:</span>
                <span className="font-semibold text-slate-800">{ver?.extracted_vendor || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Invoice Number:</span>
                <span className="font-semibold text-slate-800">{ver?.extracted_invoice_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Document Date:</span>
                <span className="font-semibold text-slate-800">{ver?.extracted_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Duplicate Check:</span>
                <span className="font-semibold text-slate-800">{ver?.duplicate_detected ? 'Duplicate Found' : 'No duplicates'}</span>
              </div>
            </div>
            {ver?.notes && (
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 mt-2">
                {ver.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Uploaded Evidence Files & Cryptographic Fingerprints */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Cryptographically Fingerprinted Evidence ({proof.files?.length || 0})
            </h2>
          </div>
          <span className="text-xs text-slate-400">SHA-256 Tamper Evident</span>
        </div>

        {proof.files && proof.files.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {proof.files.map((file) => (
              <div key={file.id} className="p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                      {file.mime_type.includes('pdf') ? (
                        <FileText className="w-5 h-5 text-rose-600" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{file.file_name}</p>
                      <p className="text-[11px] text-slate-400">
                        {file.mime_type} • {(file.file_size / 1024).toFixed(0)} KB • Uploaded {new Date(file.uploaded_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/api/proof-files/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors shrink-0 shadow-sm"
                  >
                    <span>Inspect Evidence</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* SHA-256 Hash Display */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">
                    SHA-256 Fingerprint:
                  </span>
                  <code className="text-[11px] font-mono text-slate-700 select-all break-all bg-white px-2 py-0.5 rounded border border-slate-200 flex-1">
                    {file.sha256_hash}
                  </code>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No files available for this proof.
          </div>
        )}
      </div>

      {/* Auditor Formal Decision Component */}
      <AuditorActionForm
        proofId={proof.id}
        currentStatus={proof.status}
      />

      {/* Immutable Audit Trail for this Campaign */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Campaign Audit Trail</h2>
          </div>
          <span className="text-xs text-slate-400">Append-only audit log</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {auditLogs.slice(0, 10).map((log) => (
            <div key={log.id} className="p-4 flex items-start justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">{log.action}</span>
                <span className="text-[11px] text-slate-500">
                  By {log.actor_name || 'System'} ({log.actor_role}) • Entity: {log.entity_type} #{log.entity_id?.slice(0, 8)}
                </span>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="text-[10px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(log.metadata)}
                  </pre>
                )}
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
