import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDonorStats, getDonationsByDonor } from '@/lib/donations';
import { query } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { formatRupees } from '@/lib/utils';
import { HeartHandshake, Compass, ArrowRight, ShieldCheck, Sparkles, ExternalLink, Lock } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Role routing
  if (user.role === 'NGO') {
    redirect('/ngo/campaigns');
  }
  if (user.role === 'AUDITOR' || user.role === 'ADMIN') {
    redirect('/auditor/dashboard');
  }

  // Donor Dashboard Experience
  const [stats, donations] = await Promise.all([
    getDonorStats(user.id),
    getDonationsByDonor(user.id),
  ]);

  // Compute funds released across supported campaigns
  let fundsReleased = 0;
  try {
    const releasedRes = await query<{ total_released: string }>(
      `SELECT COALESCE(SUM(c.released_amount), 0)::numeric as total_released
       FROM campaigns c
       WHERE c.id IN (SELECT DISTINCT campaign_id FROM donations WHERE donor_id = $1)`,
      [user.id]
    );
    fundsReleased = Number(releasedRes.rows[0]?.total_released || 0);
  } catch (err) {
    fundsReleased = 0;
  }

  // Time-based greeting
  const currentHour = new Date().getHours();
  const greetingTime = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-[#00F59B] uppercase tracking-wider">
              VERA DONOR PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {greetingTime}, {user.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Your contribution overview and verifiable fund custody trail
          </p>
        </div>

        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
        >
          <Compass className="w-3.5 h-3.5" />
          Explore Campaigns
        </Link>
      </div>

      {/* Metrics: 4 stats as specified in Requirement 14 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Donated"
          value={formatRupees(Number(stats.total_donated))}
          icon={<HeartHandshake className="w-4 h-4 text-[#00F59B]" />}
          subtext="Earmarked contributions"
        />
        <StatCard
          label="Active Contributions"
          value={stats.total_donations}
          icon={<Lock className="w-4 h-4 text-amber-400" />}
          subtext="Locked in smart custody"
        />
        <StatCard
          label="Funds Released"
          value={formatRupees(fundsReleased)}
          icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
          subtext="Multisig verified tranches"
        />
        <StatCard
          label="Campaigns Supported"
          value={stats.campaigns_supported}
          icon={<Compass className="w-4 h-4 text-[#06B6D4]" />}
          subtext="Directly funded initiatives"
        />
      </div>

      {/* Recent Donations Table (Requirement 14: Campaign, Amount, Date, Status, Trace) */}
      <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Donations</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Programmatic allocation and milestone tracking for your contributions
            </p>
          </div>
          <Link
            href="/donor/donations"
            className="text-xs font-mono font-semibold text-[#00F59B] hover:underline"
          >
            View All ({donations.length}) →
          </Link>
        </div>

        {donations.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-zinc-500">
            <p>You have not made any donations yet.</p>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-1.5 mt-3 text-[#00F59B] font-semibold hover:underline"
            >
              Explore verified campaigns <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#18181B] border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  <th className="py-3 px-5">Campaign</th>
                  <th className="py-3 px-5 text-right">Amount</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {donations.slice(0, 6).map((don) => (
                  <tr key={don.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <Link
                        href={`/campaigns/${don.campaign_id}`}
                        className="font-semibold text-white hover:text-[#00F59B] transition-colors block"
                      >
                        {don.campaign_title}
                      </Link>
                      <span className="text-[10px] font-mono text-zinc-500">Ref: {don.reference}</span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-white font-mono text-sm">
                      {formatRupees(Number(don.amount))}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-zinc-400 text-[11px]">
                      {new Date(don.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/20">
                        ● {don.status === 'CONFIRMED' ? 'LOCKED IN ESCROW' : don.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          href={`/donor/donations/${don.id}/trace`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#00F59B]/10 hover:bg-[#00F59B]/20 text-[#00F59B] border border-[#00F59B]/20 font-mono text-[11px] font-semibold transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Trace</span>
                        </Link>
                        <Link
                          href={`/donor/donations/${don.id}`}
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          title="Receipt"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
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
