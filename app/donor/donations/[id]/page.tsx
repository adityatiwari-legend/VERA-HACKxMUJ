import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDonationById } from '@/lib/donations';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  Coins,
  Sparkles,
  Printer,
} from 'lucide-react';
import { BlockchainBadge } from '@/components/BlockchainBadge';

export const dynamic = 'force-dynamic';

export default async function DonationReceiptPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const donation = await getDonationById(params.id, user.id);
  if (!donation) {
    notFound();
  }

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/donor/donations"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Donations
        </Link>
        <Link
          href={`/donor/donations/${donation.id}/trace`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Trace My Donation →
        </Link>
      </div>

      {/* Official Receipt Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase block">
                  VERA Earmarked Receipt
                </span>
                <h1 className="text-xl font-bold tracking-tight">Official Contribution Record</h1>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Reference Number</span>
              <span className="font-mono text-sm font-bold text-white">{donation.reference}</span>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Amount Callout */}
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Total Contribution
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-900 mt-1 block">
                {formatRupees(Number(donation.amount))}
              </span>
              <span className="text-[11px] text-emerald-700 mt-0.5 block">
                Simulated Test Contribution • No Real Payment Processor
              </span>
            </div>

            <div className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {donation.status} & LOCKED
              </span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Earmarked Campaign
              </h3>
              <Link
                href={`/campaigns/${donation.campaign_id}`}
                className="font-bold text-slate-900 hover:text-emerald-600 transition-colors"
              >
                {donation.campaign_title}
              </Link>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Target Beneficiary
              </h3>
              <p className="font-medium text-slate-800">{donation.beneficiary || 'Designated Beneficiary'}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Donor Name
              </h3>
              <p className="font-medium text-slate-800">{donation.donor_name}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Date & Time
              </h3>
              <p className="font-medium text-slate-800">
                {new Date(donation.created_at).toLocaleString('en-IN', {
                  dateStyle: 'long',
                  timeStyle: 'medium',
                })}
              </p>
            </div>

            <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Phase 4: Blockchain Testnet Settlement
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <BlockchainBadge
                  status={donation.blockchain_status}
                  txHash={donation.blockchain_tx_hash || donation.transaction_hash}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Anchored to VERA smart contract on testnet. Funds remain strictly locked in escrow until 2-of-3 multisig release approval.
              </p>
            </div>

            {donation.purpose && (
              <div className="sm:col-span-2">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Earmark Purpose Note
                </h3>
                <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {donation.purpose}
                </p>
              </div>
            )}
          </div>

          {/* VERA Fund Trail Life-cycle Tracker */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              VERA Fund Trail Progression
            </h3>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Donation Confirmed</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Contribution registered and validated server-side in PostgreSQL.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Earmarked to Campaign</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tied immutably to "{donation.campaign_title}". Funds cannot be silently reallocated.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Funds Locked in Escrow (Phase 2)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Accounting lock active in database. Funds are reserved and cannot be disbursed without milestone proof.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3.5 opacity-60">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Milestone Proof & Verification (Phase 3)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    NGO will submit evidence (receipts/invoices) for AI analysis and human auditor review.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3.5 opacity-60">
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Disbursement to Beneficiary (Phase 4/5)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Funds released only after milestone approval, anchored with public audit trails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
