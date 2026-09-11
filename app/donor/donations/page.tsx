import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDonationsByDonor, getDonorStats } from '@/lib/donations';
import { StatCard } from '@/components/StatCard';
import { formatRupees } from '@/lib/utils';
import { HeartHandshake, Compass, ExternalLink, ShieldCheck, ArrowRight, Sparkles, ArrowLeft, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DonorDonationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const [donations, stats] = await Promise.all([
    getDonationsByDonor(user.id),
    getDonorStats(user.id),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#00F59B] uppercase tracking-wider mb-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Donor Contribution History</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            My Earmarked Contributions
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Track your donated funds locked in transparent campaign escrows with programmatic allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Dashboard
          </Link>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            Explore Campaigns
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Total Donated"
          value={formatRupees(Number(stats.total_donated))}
          icon={<HeartHandshake className="w-4 h-4 text-[#00F59B]" />}
          subtext="Earmarked contributions"
        />
        <StatCard
          label="Total Contributions"
          value={stats.total_donations}
          icon={<Lock className="w-4 h-4 text-amber-400" />}
          subtext="Custody locked transactions"
        />
        <StatCard
          label="Campaigns Supported"
          value={stats.campaigns_supported}
          icon={<Compass className="w-4 h-4 text-[#06B6D4]" />}
          subtext="Unique initiatives funded"
        />
      </div>

      {/* Donations Table */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Donation Records</h2>
          <span className="text-xs font-mono text-zinc-500">
            {donations.length} contribution{donations.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-700 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">No donations yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-5">
              You have not made any contributions yet. Browse active campaigns to start tracking transparent fund allocations.
            </p>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold uppercase tracking-wider"
            >
              Browse Campaigns
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181B] border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-5">Campaign & Purpose</th>
                  <th className="py-3 px-5">Reference ID</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/campaigns/${don.campaign_id}`}
                        className="font-semibold text-white hover:text-[#00F59B] transition-colors block"
                      >
                        {don.campaign_title}
                      </Link>
                      {don.purpose && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Purpose: {don.purpose}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[11px] text-zinc-400">
                      {don.reference}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-white font-mono text-sm">
                      {formatRupees(Number(don.amount))}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20">
                        ● LOCKED IN ESCROW
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-[11px] text-zinc-400 font-mono">
                      {new Date(don.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          href={`/donor/donations/${don.id}/trace`}
                          className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#00F59B] hover:text-[#00F59B]/80 px-2.5 py-1 rounded bg-[#00F59B]/10 border border-[#00F59B]/20 transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Trace</span>
                        </Link>
                        <Link
                          href={`/donor/donations/${don.id}`}
                          className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
                        >
                          <span>Receipt</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
