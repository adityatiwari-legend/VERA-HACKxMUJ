import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getProofById } from '@/lib/proofs';
import { getAuditLogsForCampaign } from '@/lib/audit';
import { formatRupees } from '@/lib/utils';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  History,
  ShieldAlert,
  Building2,
  CheckCircle2,
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
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="p-8 bg-[#111113] rounded-xl border border-red-500/20 shadow-sm">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-400">Access Restricted</h2>
          <p className="text-xs text-zinc-400 mt-2">
            Only certified AUDITOR and ADMIN accounts may conduct evidence reviews.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold uppercase tracking-wider"
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
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Auditor Dashboard
      </Link>

      {/* Overview Header */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                Auditor Examination #{proof.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Milestone: {proof.milestone_title}
            </h1>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2">
              <span>Campaign: {proof.campaign_title}</span>
              <span className="text-zinc-600">•</span>
              <span>Submitted by {proof.ngo_name || 'NGO'}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${
                proof.status === 'APPROVED'
                  ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30'
                  : proof.status === 'REJECTED'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}
            >
              {proof.status === 'APPROVED' ? '● APPROVED' : proof.status === 'REJECTED' ? '● REJECTED' : '● UNDER REVIEW'}
            </span>
            <span className="text-[10px] font-mono text-zinc-500">
              Submitted {new Date(proof.submitted_at).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Financial Comparison & Discrepancy Board */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            Financial Comparison & OCR Extraction
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CLAIMED */}
            <div className="p-4 rounded-lg bg-[#18181B] border border-zinc-800">
              <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                CLAIMED UTILISATION
              </span>
              <span className="text-2xl font-black text-white font-mono block mt-1.5">
                {formatRupees(claimed)}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                Budget Cap: {formatRupees(Number(proof.milestone_amount || 0))}
              </span>
            </div>

            {/* DETECTED */}
            <div className="p-4 rounded-lg bg-[#18181B] border border-zinc-800">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                DETECTED BY OCR / AI
              </span>
              <span className="text-2xl font-black text-indigo-400 font-mono block mt-1.5">
                {detected !== null ? formatRupees(detected) : '—'}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
                Confidence: {ver ? `${Math.round(ver.confidence * 100)}%` : 'N/A'}
              </span>
            </div>

            {/* DISCREPANCY */}
            <div
              className={`p-4 rounded-lg border ${
                hasDiscrepancy
                  ? 'bg-red-500/5 border-red-500/20 text-red-400'
                  : 'bg-[#00F59B]/5 border-[#00F59B]/20 text-[#00F59B]'
              }`}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                DISCREPANCY DETECTED
              </span>
              <span className="text-2xl font-black font-mono block mt-1.5">
                {hasDiscrepancy ? `+${formatRupees(discrepancy)}` : '₹0 (Match)'}
              </span>
              <span className="text-[10px] font-mono mt-1 block font-semibold">
                {hasDiscrepancy ? '⚠ Discrepancy Flagged' : '✓ No Discrepancy'}
              </span>
            </div>
          </div>

          {/* Alert Banner if Discrepancy detected */}
          {hasDiscrepancy && (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Evidence Discrepancy Detected</p>
                <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                  Extracted invoice amount ({formatRupees(detected || 0)}) differs from claimed utilisation ({formatRupees(claimed)}) by <strong>{formatRupees(discrepancy)}</strong>. Carefully review the attached invoices before taking action.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Description & Verification Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-4 bg-[#18181B] rounded-lg border border-zinc-800 space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
              NGO Expenditure Justification:
            </span>
            <p className="text-zinc-300 leading-relaxed">{proof.description}</p>
          </div>

          <div className="p-4 bg-[#18181B] rounded-lg border border-zinc-800 space-y-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
              Automated Extraction Metadata:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px]">Extracted Vendor:</span>
                <span className="text-white font-semibold">{ver?.extracted_vendor || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Invoice Number:</span>
                <span className="text-white font-semibold">{ver?.extracted_invoice_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Document Date:</span>
                <span className="text-white font-semibold">{ver?.extracted_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px]">Duplicate Check:</span>
                <span className="text-white font-semibold">{ver?.duplicate_detected ? 'Duplicate Found' : 'No duplicates'}</span>
              </div>
            </div>
            {ver?.notes && (
              <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800 mt-2">
                {ver.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Uploaded Evidence Files & Cryptographic Fingerprints */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">
              Cryptographically Fingerprinted Evidence ({proof.files?.length || 0})
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">SHA-256 Tamper Evident</span>
        </div>

        {proof.files && proof.files.length > 0 ? (
          <div className="divide-y divide-zinc-800/80">
            {proof.files.map((file) => (
              <div key={file.id} className="p-5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#18181B] border border-zinc-700/60 text-zinc-400 shrink-0">
                      {file.mime_type.includes('pdf') ? (
                        <FileText className="w-4 h-4 text-red-400" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-[#00F59B]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white font-mono">{file.file_name}</p>
                      <p className="text-[11px] font-mono text-zinc-500">
                        {file.mime_type} • {(file.file_size / 1024).toFixed(0)} KB • Uploaded {new Date(file.uploaded_at).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/api/proof-files/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-mono transition-colors shrink-0 border border-zinc-700"
                  >
                    <span>Inspect Evidence</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>
                </div>

                {/* SHA-256 Hash Display */}
                <div className="p-2.5 bg-[#18181B] rounded-lg border border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 shrink-0">
                    SHA-256 Hash:
                  </span>
                  <code className="text-[11px] font-mono text-[#00F59B] select-all break-all bg-black/50 px-2 py-0.5 rounded border border-zinc-800/80 flex-1">
                    {file.sha256_hash}
                  </code>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs font-mono text-zinc-500">
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
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-white">Campaign Audit Log</h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Append-only audit ledger</span>
        </div>

        <div className="divide-y divide-zinc-800/80 max-h-72 overflow-y-auto">
          {auditLogs.slice(0, 10).map((log) => (
            <div key={log.id} className="p-4 sm:px-5 flex items-start justify-between gap-3 text-xs hover:bg-zinc-800/20 transition-colors">
              <div className="space-y-0.5">
                <span className="font-semibold text-white block">{log.action}</span>
                <span className="text-[11px] text-zinc-400">
                  By {log.actor_name || 'System'} ({log.actor_role}) • Entity: {log.entity_type} #{log.entity_id?.slice(0, 8)}
                </span>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <pre className="text-[10px] text-zinc-400 font-mono bg-black/50 p-2 rounded mt-1 overflow-x-auto border border-zinc-800">
                    {JSON.stringify(log.metadata)}
                  </pre>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
