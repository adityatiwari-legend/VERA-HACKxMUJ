import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import { getNgoReputationScore } from '@/lib/reputation';
import { Building2, Award, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NgoDirectoryPage() {
  const ngosRes = await query<{
    id: string;
    name: string;
    email: string;
    created_at: string;
  }>(
    `SELECT id, name, email, created_at
     FROM users
     WHERE role = 'NGO'
     ORDER BY created_at ASC`
  );

  const ngosWithScores = await Promise.all(
    ngosRes.rows.map(async (ngo) => {
      const reputation = await getNgoReputationScore(ngo.id);
      return {
        ...ngo,
        reputation,
      };
    })
  );

  const gradeColors: Record<string, string> = {
    'A+': 'bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30',
    'A': 'bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30',
    'B': 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30',
    'C': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'D': 'bg-red-500/10 text-red-400 border-red-500/30',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-[#0E0E12] rounded-3xl border border-white/5 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00F59B]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 uppercase tracking-wider">
            VERA Registry
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Verified NGO Directory
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Non-profit organizations subject to deterministic, open audit metrics, verified evidence milestones, and multi-signature governance.
          </p>
        </div>
      </div>

      {/* NGO Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ngosWithScores.map((ngo) => {
          const { score, grade, badge, stats } = ngo.reputation;

          return (
            <Link
              key={ngo.id}
              href={`/ngos/${ngo.id}`}
              className="group bg-[#0E0E12] rounded-3xl border border-white/5 hover:border-white/10 p-6 sm:p-8 shadow-2xl transition-all block relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center text-[#00F59B] group-hover:scale-105 transition-transform">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-[#00F59B] transition-colors">
                      {ngo.name}
                    </h2>
                    <p className="text-[11px] font-mono text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Since {new Date(ngo.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${gradeColors[grade] || 'bg-white/5 text-zinc-400 border-white/10'}`}>
                  {grade} ({score}/100)
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/5 text-center">
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Campaigns</span>
                  <span className="font-bold font-mono text-white text-sm mt-0.5 block">{stats.totalCampaigns}</span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Milestones</span>
                  <span className="font-bold font-mono text-[#00F59B] text-sm mt-0.5 block">{stats.milestonesCompleted} done</span>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Approval</span>
                  <span className="font-bold font-mono text-[#06B6D4] text-sm mt-0.5 block">{stats.approvalRatePercent}%</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs font-mono text-zinc-400 pt-2">
                <span className="text-[11px] text-zinc-500">{badge}</span>
                <span className="inline-flex items-center gap-1 text-[#00F59B] group-hover:translate-x-1 transition-transform font-semibold">
                  View Profile <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
