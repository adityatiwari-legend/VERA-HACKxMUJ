import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDonorStats, getDonationsByDonor } from '@/lib/donations';
import { StatCard } from '@/components/StatCard';
import { ShieldCheck, HeartHandshake, Compass, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If user is NGO, forward directly to NGO campaigns hub
  if (user.role === 'NGO') {
    redirect('/ngo/campaigns');
  }

  // Donor Dashboard Experience (Section 14)
  const [stats, donations] = await Promise.all([
    getDonorStats(user.id),
    getDonationsByDonor(user.id),
  ]);

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
                Role: {user.role}
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                VERA Phase 2: Live donation earmarking, fund locking, and verified audit tracking
              </p>
            </div>
          </div>

          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <Compass className="w-4 h-4" />
            Explore Campaigns
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Donated"
          value={formatRupees(Number(stats.total_donated))}
          icon={<HeartHandshake className="w-4 h-4 text-emerald-600" />}
          subtext="Earmarked to active initiatives"
        />
        <StatCard
          label="Confirmed Contributions"
          value={stats.total_donations}
          icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
          subtext="Simulated test donations"
        />
        <StatCard
          label="Campaigns Supported"
          value={stats.campaigns_supported}
          icon={<Compass className="w-4 h-4 text-indigo-600" />}
          subtext="Directly funded causes"
        />
      </div>

      {/* Recent Donations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Contributions</h2>
          <Link
            href="/donor/donations"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-500"
          >
            View All Donations
          </Link>
        </div>

        {donations.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">
            <p>You have not made any donations yet.</p>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-1.5 mt-3 text-emerald-600 font-semibold hover:underline"
            >
              Explore verified campaigns <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {donations.slice(0, 5).map((don) => (
              <div key={don.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors">
                <div>
                  <Link
                    href={`/campaigns/${don.campaign_id}`}
                    className="font-bold text-slate-900 hover:text-emerald-600 block"
                  >
                    {don.campaign_title}
                  </Link>
                  <span className="text-[11px] font-mono text-slate-400">Ref: {don.reference}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-bold text-emerald-700 block">{formatRupees(Number(don.amount))}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(don.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <Link
                    href={`/donor/donations/${don.id}`}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                    title="View Receipt"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
