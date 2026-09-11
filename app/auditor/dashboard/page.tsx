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
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditorDashboardPage() {
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
            The Auditor Hub is strictly restricted to certified AUDITOR and ADMIN accounts.
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

  const proofs = await getAuditorReviewQueue();

  const pendingCount = proofs.filter(
    (p) => p.status === 'UNDER_REVIEW' || p.status === 'SUBMITTED'
  ).length;
  const flaggedCount = proofs.filter(
    (p) => p.verification?.ai_status === 'FLAG' || (p.verification?.discrepancy_amount || 0) > 0
  ).length;
  const approvedCount = proofs.filter((p) => p.status === 'APPROVED').length;
  const rejectedCount = proofs.filter((p) => p.status === 'REJECTED').length;

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Phase 3 — Verification Hub
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Independent Auditor Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review NGO milestone evidence, detect financial discrepancies, and approve or reject submissions.
            </p>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-[10px] font-bold text-indigo-900 uppercase">Certified Auditor</p>
              <p className="text-xs font-bold text-indigo-700">{user.name}</p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-amber-900 mt-2">{pendingCount}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Awaiting human sign-off</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase">Discrepancies Flagged</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <p className="text-2xl font-black text-rose-900 mt-2">{flaggedCount}</p>
            <p className="text-[10px] text-rose-700 mt-0.5">Amount or hash mismatch</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Approved Evidence</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-900 mt-2">{approvedCount}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Verified milestone proofs</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase">Rejected / Resubmitted</span>
              <XCircle className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">{rejectedCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Returned for correction</p>
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Milestone Evidence Review Queue</h2>
          </div>
          <span className="text-xs text-slate-500">{proofs.length} total records</span>
        </div>

        {proofs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-semibold text-slate-700">All caught up!</p>
            <p>No milestone proofs are currently awaiting auditor verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Milestone & Campaign</th>
                  <th className="py-3 px-6">NGO</th>
                  <th className="py-3 px-6 text-right">Claimed Amount</th>
                  <th className="py-3 px-6 text-right">Detected Amount</th>
                  <th className="py-3 px-6 text-right">Discrepancy</th>
                  <th className="py-3 px-6 text-center">AI Status</th>
                  <th className="py-3 px-6 text-center">Proof Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {proofs.map((proof) => {
                  const ver = proof.verification;
                  const hasDiscrepancy = (ver?.discrepancy_amount || 0) > 0;
                  const isPending = proof.status === 'UNDER_REVIEW' || proof.status === 'SUBMITTED';

                  return (
                    <tr key={proof.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">{proof.milestone_title}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                          {proof.campaign_title}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-medium text-slate-700">
                        {proof.ngo_name || 'NGO'}
                      </td>

                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {formatRupees(Number(proof.claimed_amount))}
                      </td>

                      <td className="py-4 px-6 text-right font-medium text-slate-600">
                        {ver?.extracted_amount ? formatRupees(Number(ver.extracted_amount)) : '—'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {hasDiscrepancy ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            +{formatRupees(Number(ver?.discrepancy_amount))}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">₹0 (Match)</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ver?.ai_status === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ver?.ai_status === 'FLAG'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ver?.ai_status || 'PENDING'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            proof.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : proof.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {proof.status === 'UNDER_REVIEW' || proof.status === 'SUBMITTED'
                            ? 'UNDER REVIEW'
                            : proof.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/auditor/reviews/${proof.id}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            isPending
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isPending ? 'Inspect & Review' : 'View Report'}</span>
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
