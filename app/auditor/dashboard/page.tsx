import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAuditorReviewQueue } from '@/lib/proofs';
import {
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Building2,
  Eye,
  ShieldAlert,
  Cpu,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatRupees } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AuditorDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'AUDITOR' && user.role !== 'ADMIN') {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center text-[#EDEDED]">
        <div className="p-8 bg-[#111113] rounded-xl border border-red-500/20 shadow-sm font-mono space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-red-400 font-sans">Access Restricted</h2>
          <p className="text-xs text-zinc-400">
            The Auditor Hub is strictly restricted to certified AUDITOR and ADMIN accounts.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-xs font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const proofs = await getAuditorReviewQueue();

  const pendingCount = proofs.filter(
    (p) => p.status === 'UNDER_REVIEW' || p.status === 'SUBMITTED'
  ).length;
  const flaggedCount = proofs.filter(
    (p) => p.verification?.ai_status === 'FLAG' || (p.verification?.discrepancy_amount || 0) > 0
  ).length;
  const approvedCount = proofs.filter((p) => p.status === 'APPROVED').length;
  const rejectedCount = proofs.filter((p) => p.status === 'REJECTED').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#EDEDED] pb-20">
      {/* Header */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6366F1] font-semibold block">
              VERIFICATION HUB
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Independent Auditor Workspace
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Review NGO milestone evidence, inspect OCR AI findings, and authorize or reject submissions.
            </p>
          </div>

          <div className="p-3 bg-[#18181B] border border-white/[0.08] rounded-xl flex items-center gap-3 shrink-0 font-mono">
            <ShieldCheck className="w-6 h-6 text-[#6366F1]" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Certified Auditor</p>
              <p className="text-xs font-bold text-white">{user.name}</p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#F59E0B] font-semibold">
                PENDING REVIEW
              </span>
              <Clock className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <p className="text-2xl font-bold text-white mt-1.5">{pendingCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Awaiting human sign-off</p>
          </div>

          <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#EF4444] font-semibold">
                DISCREPANCIES
              </span>
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            </div>
            <p className="text-2xl font-bold text-white mt-1.5">{flaggedCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Line-item variance flagged</p>
          </div>

          <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#00F59B] font-semibold">
                APPROVED
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
            </div>
            <p className="text-2xl font-bold text-white mt-1.5">{approvedCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Authorized for multisig</p>
          </div>

          <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                REJECTED
              </span>
              <XCircle className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-bold text-white mt-1.5">{rejectedCount}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Returned for correction</p>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        REVIEW QUEUE TABLE (Requirement 17)
        Campaign | Milestone | Claimed amount | Extracted amount | Difference | AI status | Submission date
        ========================================================================
      */}
      <div className="bg-[#111113] rounded-xl border border-white/[0.08] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-[#6366F1]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Review Queue
            </h2>
          </div>
          <span className="text-xs text-zinc-400">{proofs.length} total records</span>
        </div>

        {proofs.length === 0 ? (
          <div className="p-16 text-center text-xs font-mono text-zinc-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#00F59B] mx-auto" />
            <p className="font-semibold text-white">Review queue clear</p>
            <p>No milestone proofs are currently awaiting auditor verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#18181B] text-zinc-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-5">Campaign</th>
                  <th className="py-3 px-5">Milestone</th>
                  <th className="py-3 px-5 text-right">Claimed Amount</th>
                  <th className="py-3 px-5 text-right">Extracted Amount</th>
                  <th className="py-3 px-5 text-right">Difference</th>
                  <th className="py-3 px-5 text-center">AI Status</th>
                  <th className="py-3 px-5 text-center">Submission Date</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300 font-mono">
                {proofs.map((proof) => {
                  const ver = proof.verification;
                  const claimedNum = Number(proof.claimed_amount);
                  const extractedNum = ver?.extracted_amount ? Number(ver.extracted_amount) : null;
                  const diff = extractedNum !== null ? Math.abs(claimedNum - extractedNum) : (ver?.discrepancy_amount ? Number(ver.discrepancy_amount) : 0);
                  const hasDiscrepancy = diff > 0;

                  return (
                    <tr key={proof.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-5 font-sans">
                        <span className="font-bold text-white block truncate max-w-xs">
                          {proof.campaign_title}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono block mt-0.5 truncate">
                          {proof.ngo_name}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="font-semibold text-zinc-200 block truncate max-w-xs font-sans">
                          {proof.milestone_title}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right font-bold text-white">
                        {formatRupees(claimedNum)}
                      </td>

                      <td className="py-3.5 px-5 text-right text-zinc-300">
                        {extractedNum !== null ? formatRupees(extractedNum) : '—'}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {hasDiscrepancy ? (
                          <span className="font-bold text-[#F59E0B]">
                            +{formatRupees(diff)}
                          </span>
                        ) : (
                          <span className="text-[#00F59B] font-semibold">₹0 (Match)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <StatusBadge
                          status={ver?.ai_status === 'FLAG' ? 'UNDER REVIEW' : (ver?.ai_status || 'PENDING')}
                          size="sm"
                        />
                      </td>

                      <td className="py-3.5 px-5 text-center text-zinc-400">
                        {new Date(proof.submitted_at).toLocaleDateString('en-IN', {
                          dateStyle: 'medium',
                        })}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <Link
                          href={`/auditor/reviews/${proof.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs font-mono transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
