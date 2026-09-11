import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ShieldCheck, HeartHandshake, Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // If user is NGO, forward directly to NGO campaigns dashboard
  if (user.role === 'NGO') {
    redirect('/ngo/campaigns');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            {user.role === 'DONOR' ? (
              <HeartHandshake className="w-6 h-6" />
            ) : (
              <Eye className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 mb-1">
              Role: {user.role}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm mb-6">
          <p className="font-semibold mb-1">ℹ️ Phase 1 Scope Notice:</p>
          <p className="text-amber-800 leading-relaxed">
            FundTrail is currently running in <strong>Phase 1: Foundation & Campaign Management</strong>. In this phase, NGOs create and configure verified campaigns in PostgreSQL.
          </p>
          <p className="text-amber-800 leading-relaxed mt-2">
            Donor fund earmarking, payment simulation, and milestone locking will become available in <strong>Phase 2</strong>. Evidence auditing and verification will activate in <strong>Phase 3</strong>.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
          <p className="text-xs text-slate-500">
            Logged in as <span className="font-medium text-slate-700">{user.email}</span>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Explore Platform Overview
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
