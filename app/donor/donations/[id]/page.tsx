import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDonationById } from '@/lib/donations';
import { formatRupees } from '@/lib/utils';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  Coins,
  Sparkles,
  ExternalLink,
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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/donor/donations"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Donations
        </Link>
        <Link
          href={`/donor/donations/${donation.id}/trace`}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-[#00F59B] hover:bg-[#00F59B]/90 text-black transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Trace My Donation →
        </Link>
      </div>

      {/* Official Receipt Card */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        {/* Receipt Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-800/80 bg-[#18181B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/30 flex items-center justify-center text-[#00F59B]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[#00F59B] tracking-wider uppercase block">
                  VERA Earmarked Receipt
                </span>
                <h1 className="text-xl font-bold text-white tracking-tight">Official Contribution Record</h1>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Reference Number</span>
              <span className="font-mono text-xs font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-zinc-800">
                {donation.reference}
              </span>
            </div>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Amount Callout */}
          <div className="p-5 rounded-lg bg-[#18181B] border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                Total Contribution
              </span>
              <span className="text-3xl font-black text-white font-mono mt-1 block">
                {formatRupees(Number(donation.amount))}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Programmatic Escrow Custody • Tamper-Evident Ledger
              </span>
            </div>

            <div className="self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ● LOCKED IN ESCROW
              </span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#18181B]/50 border border-zinc-800/80">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                Earmarked Campaign
              </h3>
              <Link
                href={`/campaigns/${donation.campaign_id}`}
                className="font-semibold text-white hover:text-[#00F59B] transition-colors"
              >
                {donation.campaign_title}
              </Link>
            </div>

            <div className="p-3.5 rounded-lg bg-[#18181B]/50 border border-zinc-800/80">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                Target Beneficiary
              </h3>
              <p className="font-semibold text-zinc-200">{donation.beneficiary || 'Designated Beneficiary'}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#18181B]/50 border border-zinc-800/80">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                Donor Name
              </h3>
              <p className="font-semibold text-zinc-200">{donation.donor_name}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#18181B]/50 border border-zinc-800/80">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                Date & Time
              </h3>
              <p className="font-semibold text-zinc-200 font-mono text-xs">
                {new Date(donation.created_at).toLocaleString('en-IN', {
                  dateStyle: 'long',
                  timeStyle: 'medium',
                })}
              </p>
            </div>

            <div className="sm:col-span-2 bg-[#18181B] p-4 rounded-lg border border-zinc-800 space-y-2">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                Blockchain Testnet Settlement
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <BlockchainBadge
                  status={donation.blockchain_status}
                  txHash={donation.blockchain_tx_hash || donation.transaction_hash}
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Anchored to VERA smart contract on testnet. Funds remain strictly locked in escrow until 2-of-3 multisig release approval.
              </p>
            </div>

            {donation.purpose && (
              <div className="sm:col-span-2">
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Earmark Purpose Note
                </h3>
                <p className="text-zinc-300 bg-[#18181B] p-3 rounded-lg border border-zinc-800">
                  {donation.purpose}
                </p>
              </div>
            )}
          </div>

          {/* VERA Fund Trail Life-cycle Tracker */}
          <div className="pt-5 border-t border-zinc-800">
            <h3 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-[#00F59B]" />
              VERA Fund Trail Progression
            </h3>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Donation Confirmed</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Contribution registered and validated server-side in PostgreSQL.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Earmarked to Campaign</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Tied immutably to "{donation.campaign_title}". Funds cannot be silently reallocated.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/30 text-[#06B6D4] flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Funds Locked in Escrow</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Accounting lock active. Funds are reserved and cannot be disbursed without milestone proof.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400">Milestone Proof & Verification</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    NGO will submit evidence (receipts/invoices) for AI analysis and human auditor review.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-400">Disbursement to Beneficiary</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
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
