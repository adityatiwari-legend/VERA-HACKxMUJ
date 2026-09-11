import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDonationsByDonor, getDonorStats } from '@/lib/donations';
import { StatCard } from '@/components/StatCard';
import { HeartHandshake, Compass, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';

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

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            Donor Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Earmarked Contributions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your donated funds locked in transparent campaign escrows.
          </p>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-sm transition-all self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          Explore Campaigns
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Donated"
          value={formatRupees(Number(stats.total_donated))}
          icon={<HeartHandshake className="w-4 h-4 text-emerald-600" />}
          subtext="Total across all campaigns"
        />
        <StatCard
          label="Total Contributions"
          value={stats.total_donations}
          icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
          subtext="Active simulated donations"
        />
        <StatCard
          label="Campaigns Supported"
          value={stats.campaigns_supported}
          icon={<Compass className="w-4 h-4 text-indigo-600" />}
          subtext="Unique initiatives funded"
        />
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Donation Records</h2>
          <span className="text-xs text-slate-500">
            {donations.length} contribution{donations.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No donations yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
              You have not made any contributions yet. Browse active campaigns to start tracking transparent fund allocations.
            </p>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Browse Campaigns
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-6">Campaign & Purpose</th>
                  <th className="py-3 px-6">Reference ID</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <Link
                        href={`/campaigns/${don.campaign_id}`}
                        className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors block"
                      >
                        {don.campaign_title}
                      </Link>
                      {don.purpose && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          Purpose: {don.purpose}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-medium text-slate-600">
                      {don.reference}
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-emerald-700">
                      {formatRupees(Number(don.amount))}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {don.status} (LOCKED)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(don.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/donor/donations/${don.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-500 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <span>Receipt</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
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
