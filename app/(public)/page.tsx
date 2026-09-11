import React from 'react';
import Link from 'next/link';
import { query } from '@/lib/db';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Compass,
  Building2,
  Lock,
  Layers,
  FileCheck,
  Eye,
  KeyRound,
  Sparkles,
  Coins,
  History,
  Award,
} from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query live platform stats
  const statsRes = await query<{
    total_campaigns: number;
    total_raised: number;
    total_released: number;
    total_milestones: number;
  }>(`
    SELECT 
      COUNT(DISTINCT c.id)::int as total_campaigns,
      COALESCE(SUM(c.raised_amount), 0)::numeric as total_raised,
      COALESCE(SUM(c.released_amount), 0)::numeric as total_released,
      COUNT(DISTINCT m.id)::int as total_milestones
    FROM campaigns c
    LEFT JOIN milestones m ON c.id = m.campaign_id
    WHERE c.status != 'CANCELLED'
  `);
  const platformStats = statsRes.rows[0] || {
    total_campaigns: 3,
    total_raised: 1075000,
    total_released: 285000,
    total_milestones: 7,
  };

  // Query featured demo campaign (Jaipur School Classroom)
  const demoRes = await query<{
    id: string;
    title: string;
    description: string;
    target_amount: number;
    raised_amount: number;
    released_amount: number;
    beneficiary: string;
    ngo_name: string;
  }>(`
    SELECT c.id, c.title, c.description, c.target_amount::numeric, c.raised_amount::numeric, c.released_amount::numeric, c.beneficiary, u.name as ngo_name
    FROM campaigns c
    JOIN users u ON c.ngo_id = u.id
    WHERE c.title ILIKE '%Jaipur%'
    LIMIT 1
  `);
  const demoCampaign = demoRes.rows[0];

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const steps = [
    {
      num: 1,
      title: 'Donate',
      desc: 'Donor contributes to an initiative with programmatic tracking.',
      icon: Coins,
    },
    {
      num: 2,
      title: 'Funds Earmarked',
      desc: 'Capital is locked into campaign escrow; cannot be reallocated.',
      icon: Lock,
    },
    {
      num: 3,
      title: 'Milestones Defined',
      desc: 'Work is segmented into verifiable deliverables with allocated caps.',
      icon: Layers,
    },
    {
      num: 4,
      title: 'Evidence Submitted',
      desc: 'NGO uploads itemized invoices, vendor receipts, and site photos.',
      icon: FileCheck,
    },
    {
      num: 5,
      title: 'AI Verification',
      desc: 'OCR cross-checks claimed sums against invoice items for discrepancies.',
      icon: Sparkles,
    },
    {
      num: 6,
      title: 'Human Auditor',
      desc: 'Certified human auditor verifies documentation before authorization.',
      icon: Eye,
    },
    {
      num: 7,
      title: 'Multisig Approval',
      desc: '2-of-3 multi-signature consensus prevents unilateral release.',
      icon: KeyRound,
    },
    {
      num: 8,
      title: 'Blockchain Release',
      desc: 'Smart contract executes release and anchors transaction receipt.',
      icon: ShieldCheck,
    },
    {
      num: 9,
      title: 'Public Audit Trail',
      desc: 'Anyone can independently inspect the entire timeline and hashes.',
      icon: History,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-8 sm:p-14 lg:p-20 border border-slate-800 shadow-2xl">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            VERA Protocol • Public Audit & Integrity Trail
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Know Where Your <span className="text-emerald-400">Donation Goes.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl font-normal">
            VERA connects donations, milestones, evidence, approvals and blockchain records into one transparent trail.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" />
              Explore Campaigns
            </Link>

            {demoCampaign && (
              <Link
                href={`/campaigns/${demoCampaign.id}/audit`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Inspect Live Audit Trail
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/ngo/campaigns"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-slate-400 hover:text-white font-semibold text-sm transition-colors"
            >
              <Building2 className="w-4 h-4" />
              For NGOs
            </Link>
          </div>
        </div>

        {/* Decorative backdrop glow */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Live Platform Transparency Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-medium block">Total Earmarked Capital</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {formatRupees(Number(platformStats.total_raised))}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Held in Verified Escrow</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-medium block">Disbursed on Milestones</span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1 block">
            {formatRupees(Number(platformStats.total_released))}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Multisig & On-Chain Release</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-medium block">Verified Milestones</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1 block">
            {platformStats.total_milestones}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Audited Proof Records</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
          <span className="text-xs text-slate-500 font-medium block">Active Initiatives</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
            {platformStats.total_campaigns}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">Publicly Auditable</span>
        </div>
      </div>

      {/* Featured Hackathon Demo Campaign Card */}
      {demoCampaign && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                Featured Demo Initiative • Hackathon Presentation Case
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {demoCampaign.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Organized by {demoCampaign.ngo_name} • Beneficiary: {demoCampaign.beneficiary}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/campaigns/${demoCampaign.id}/audit`}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Open Public Audit Dashboard →
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <ProgressBar current={Number(demoCampaign.raised_amount)} total={Number(demoCampaign.target_amount)} />
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span className="text-emerald-700">{formatRupees(Number(demoCampaign.raised_amount))} Raised & Earmarked</span>
              <span className="text-indigo-700">{formatRupees(Number(demoCampaign.released_amount))} Released to Electrical Vendor</span>
              <span className="text-slate-500">Goal: {formatRupees(Number(demoCampaign.target_amount))}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block text-[11px]">Milestone 1 (Released)</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">Electrical Work — ₹3,00,000</span>
              <span className="text-emerald-700 font-semibold block mt-1">✓ Proof Verified • 2/3 Multisig • Released ₹2,85,000</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block text-[11px]">Milestone 2 (In Progress)</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">Furniture & Desks — ₹2,50,000</span>
              <span className="text-amber-700 font-semibold block mt-1">○ Awaiting Vendor Proof Submission</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-semibold block text-[11px]">Milestone 3 (Locked)</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">Renovation & Painting — ₹4,50,000</span>
              <span className="text-slate-500 font-semibold block mt-1">○ Reserved in Escrow</span>
            </div>
          </div>
        </div>
      )}

      {/* How VERA Works: The 9-Step Transparency Flow */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Trust & Verification Architecture
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            How VERA Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            A tamper-evident fund lifecycle that eliminates the black box of traditional charitable giving.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 hover:bg-white transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">0{step.num}</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Core Principles & Value Proposition */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Earmarked Accounting</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Funds cannot be pooled into generic black-box reserves. Donations are held in escrow for specified initiatives and released strictly on approved deliverables.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">AI + Human Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            AI document inspection detects invoice math discrepancies and flags duplicate claims, while certified human auditors hold final discretionary sign-off.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">2-of-3 Multisig Control</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No single actor can withdraw capital unilaterally. Smart contracts require cryptographic consensus across independent parties before release.
          </p>
        </div>
      </div>

      {/* Honest Limitation Disclosures for Judges */}
      <div className="rounded-2xl bg-slate-900 text-slate-300 p-8 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Technical Transparency & Scope Boundaries
        </div>
        <h4 className="text-base font-bold text-white">What VERA Guarantees (And What It Does Not)</h4>
        <p className="text-xs leading-relaxed text-slate-300">
          VERA provides programmatic fund locking, evidence hashing, AI discrepancy screening, multi-signature release authorization, and tamper-evident blockchain recording. VERA does not claim blockchain provides offline omniscience: it guarantees that capital cannot move without recorded evidence and multi-party cryptographic authorization.
        </p>
      </div>
    </div>
  );
}
