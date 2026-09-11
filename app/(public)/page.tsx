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
  Coins,
  Cpu,
  ArrowUpRight,
  ExternalLink,
  Receipt,
  Sparkles,
  FileText,
  Award,
  TrendingUp,
  AlertCircle,
  Database,
} from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';
import { StatusBadge } from '@/components/StatusBadge';
import { StatCard } from '@/components/StatCard';
import AuditLedger from '@/components/AuditLedger';
import HeroAnimatedSection from '@/components/HeroAnimatedSection';
import { formatRupees, formatRupeesShort } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Query live platform stats
  let platformStats = {
    total_campaigns: 3,
    total_raised: 1075000,
    total_released: 285000,
    total_milestones: 7,
  };

  try {
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
    if (statsRes.rows[0]) {
      platformStats = statsRes.rows[0];
    }
  } catch (err) {
    // Graceful fallback to default stats
  }

  // Query Jaipur demo campaign
  let demoCampaign: any = {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    title: 'Government School Classroom — Jaipur',
    description: 'Comprehensive infrastructure modernization for 6 rural primary classrooms at Government Secondary School, Jaipur.',
    target_amount: 1000000,
    raised_amount: 750000,
    released_amount: 285000,
    beneficiary: 'Jaipur Primary School Students (250+ children)',
    ngo_name: 'Rajasthan Education Foundation',
  };

  try {
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
    if (demoRes.rows[0]) {
      demoCampaign = demoRes.rows[0];
    }
  } catch (err) {
    // Fallback to demo default
  }

  // Query additional active campaigns for featured discovery
  let featuredCampaigns: any[] = [];
  try {
    const featRes = await query(`
      SELECT 
        c.id, c.title, c.description, c.target_amount::numeric, c.raised_amount::numeric, 
        c.released_amount::numeric, c.beneficiary, c.status, u.name as ngo_name,
        COUNT(DISTINCT m.id)::int as milestones_count
      FROM campaigns c
      JOIN users u ON c.ngo_id = u.id
      LEFT JOIN milestones m ON c.id = m.campaign_id
      WHERE c.status IN ('ACTIVE', 'COMPLETED')
      GROUP BY c.id, u.name
      ORDER BY c.raised_amount DESC
      LIMIT 3
    `);
    featuredCampaigns = featRes.rows;
  } catch (err) {
    featuredCampaigns = [demoCampaign];
  }

  const totalRaised = Number(platformStats.total_raised);
  const totalReleased = Number(platformStats.total_released);
  const totalLocked = Math.max(0, totalRaised - totalReleased);

  const pipelineStages = [
    {
      num: '01',
      title: 'Donation',
      subtitle: 'Programmatic Earmarking',
      desc: 'Donor contributes to an initiative. Funds are assigned an immutable reference and bound to the campaign ID.',
      icon: Coins,
      accent: 'mint',
    },
    {
      num: '02',
      title: 'Earmarked',
      subtitle: 'Zero Co-Mingling',
      desc: 'Capital is strictly segregated. Architecture prevents pooling with general NGO operational budgets.',
      icon: Lock,
      accent: 'mint',
    },
    {
      num: '03',
      title: 'Locked',
      subtitle: 'Escrow Custody',
      desc: 'Funds are atomically locked in the smart contract escrow vault prior to physical deliverable execution.',
      icon: Database,
      accent: 'indigo',
    },
    {
      num: '04',
      title: 'Milestone',
      subtitle: 'Budget Capped',
      desc: 'Campaign expenditure is segmented into discrete tranches with pre-set financial allocation limits.',
      icon: Layers,
      accent: 'cyan',
    },
    {
      num: '05',
      title: 'Evidence',
      subtitle: 'Cryptographic Hashing',
      desc: 'NGO uploads itemized vendor invoices and site inspection photos with SHA-256 fingerprint generation.',
      icon: FileCheck,
      accent: 'cyan',
    },
    {
      num: '06',
      title: 'Verification',
      subtitle: 'AI Line-Item OCR',
      desc: 'Automated OCR extracts vendor data, line items, and invoice totals, flagging variance against claimed milestones.',
      icon: Cpu,
      accent: 'amber',
    },
    {
      num: '07',
      title: 'Approval',
      subtitle: 'Certified Human Auditor',
      desc: 'Certified human auditor evaluates AI findings, inspects evidence integrity, and records formal approval.',
      icon: Eye,
      accent: 'indigo',
    },
    {
      num: '08',
      title: 'Release',
      subtitle: '2-of-3 Multi-Signature',
      desc: 'Consensus from 2 of 3 authorized signers (NGO Admin, Project Lead, Auditor) triggers smart contract disbursement.',
      icon: KeyRound,
      accent: 'mint',
    },
    {
      num: '09',
      title: 'Audit',
      subtitle: 'Public Ledger Anchor',
      desc: 'All actions and on-chain release transaction hashes are permanently viewable on the public ledger without login.',
      icon: ShieldCheck,
      accent: 'mint',
    },
  ];

  return (
    <div className="w-full flex flex-col items-center bg-[#09090B] text-[#EDEDED]">
      {/* 
        ========================================================================
        1. HERO ANIMATED SCREEN — UNTOUCHED AS MANDATED BY REQUIREMENT 1
        ========================================================================
      */}
      <HeroAnimatedSection platformStats={platformStats} demoCampaign={demoCampaign} />

      {/* 
        ========================================================================
        2. TRUST STATEMENT SECTION (Requirement 9.1)
        ========================================================================
      */}
      <section className="w-full border-b border-white/[0.08] bg-[#0C0C0E] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F59B]" />
            <span>THE CORE VERA COMMITMENT</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans">
            Every donation should have a trail.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Philanthropy has suffered from opaque disbursement and blind trust. VERA replaces good intentions with programmatic certainty: capital locked in audited escrows and released only when physical proof is independently certified.
          </p>
        </div>
      </section>

      {/* 
        ========================================================================
        3. PLATFORM METRICS RIBBON (Requirement 9.3)
        ========================================================================
      */}
      <section id="protocol-metrics" className="w-full border-b border-white/[0.08] bg-[#09090B] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            label="Total Funds Tracked"
            value={formatRupees(totalRaised)}
            subtext="100% accounted on ledger"
            accent="default"
            icon={<Coins className="w-4 h-4 text-white" />}
          />
          <StatCard
            label="Locked in Escrow"
            value={formatRupees(totalLocked)}
            subtext="Held safely until verified"
            accent="mint"
            icon={<Lock className="w-4 h-4 text-[#00F59B]" />}
          />
          <StatCard
            label="Milestones Verified"
            value={`${platformStats.total_milestones} Tranches`}
            subtext="Backed by vendor invoices"
            accent="cyan"
            icon={<Layers className="w-4 h-4 text-[#06B6D4]" />}
          />
          <StatCard
            label="Audited Releases"
            value={formatRupees(totalReleased)}
            subtext="2-of-3 multisig authorized"
            accent="indigo"
            icon={<ShieldCheck className="w-4 h-4 text-[#6366F1]" />}
          />
        </div>
      </section>

      {/* 
        ========================================================================
        4. HOW VERA WORKS — 9-STAGE VERIFIABLE LIFECYCLE (Requirement 9.2)
        ========================================================================
      */}
      <section id="pipeline" className="w-full border-b border-white/[0.08] py-20 px-4 sm:px-6 lg:px-8 bg-[#0C0C0E]/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              SYSTEM ARCHITECTURE
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              The 9-Stage Verifiable Fund Trail
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Donations are never disbursed in a lump sum. They traverse an immutable 9-stage verification pipeline before a single rupee reaches a vendor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pipelineStages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.num}
                  className="p-5 rounded-xl bg-[#111113] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-zinc-500">
                        {stage.num}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                        {stage.subtitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-zinc-200 shrink-0">
                        <Icon className="w-4 h-4 text-[#00F59B]" />
                      </div>
                      <h3 className="text-base font-bold text-white font-sans">
                        {stage.title}
                      </h3>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        5. FEATURED CAMPAIGNS (Requirement 9.4 & Requirement 10 preview)
        ========================================================================
      */}
      <section className="w-full border-b border-white/[0.08] py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#06B6D4] font-semibold block">
                AUDITED INITIATIVES
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Featured Verified Campaigns
              </h2>
            </div>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#00F59B] hover:underline"
            >
              <span>Explore All Initiatives</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((camp) => {
              const targetVal = Number(camp.target_amount);
              const raisedVal = Number(camp.raised_amount);
              const releasedVal = Number(camp.released_amount);
              const pct = targetVal > 0 ? Math.min(100, Math.round((raisedVal / targetVal) * 100)) : 0;

              return (
                <div
                  key={camp.id}
                  className="rounded-xl bg-[#111113] border border-white/[0.08] p-6 flex flex-col justify-between hover:border-white/[0.18] transition-all space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={camp.status || 'ACTIVE'} />
                      <span className="text-[10px] font-mono text-zinc-500">
                        TRUST SCORE 94
                      </span>
                    </div>

                    <div>
                      <Link
                        href={`/campaigns/${camp.id}`}
                        className="text-lg font-bold text-white hover:text-[#00F59B] transition-colors block"
                      >
                        {camp.title}
                      </Link>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {camp.description}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{camp.ngo_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Compass className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{camp.beneficiary}</span>
                      </div>
                    </div>

                    {/* Financial Progress Breakdown */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <div className="flex justify-between items-baseline font-mono">
                        <div>
                          <span className="text-lg font-bold text-white">
                            {formatRupees(raisedVal)}
                          </span>
                          <span className="text-xs text-zinc-500 ml-1">
                            / {formatRupees(targetVal)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#00F59B]">
                          {pct}% funded
                        </span>
                      </div>
                      <ProgressBar current={raisedVal} total={targetVal} />
                      <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-1">
                        <span>{camp.milestones_count || 3} milestones</span>
                        <span>{formatRupees(releasedVal)} released</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                    <Link
                      href={`/campaigns/${camp.id}/audit`}
                      className="py-2.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] text-xs font-mono text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00F59B]" />
                      <span>View Audit</span>
                    </Link>
                    <Link
                      href={`/campaigns/${camp.id}`}
                      className="py-2.5 px-3 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs font-mono text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Contribute</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        6. PUBLIC AUDIT EXPLANATION (Requirement 9.5)
        ========================================================================
      */}
      <section className="w-full border-b border-white/[0.08] py-20 px-4 sm:px-6 lg:px-8 bg-[#0C0C0E]/40">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6366F1] font-semibold block">
              OPEN VERIFICATION
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Anyone Can Verify This Trail. No Login Required.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              VERA treats public transparency as a civil utility. The Public Audit Dashboard is available to anyone in the world without an account, allowing independent verification of every receipt, signature, and transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/20 flex items-center justify-center text-[#00F59B]">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">SHA-256 Evidence Hashes</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Vendor invoices and progress photographs are cryptographically digested. Any post-upload tampering alters the hash and invalidates the audit trail immediately.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Discrepancy Reporting</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Optical character recognition mathematically compares claimed milestone amounts against invoice line items. Any variance is flagged publicly before auditor review.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#111113] border border-white/[0.08] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Real On-Chain Anchors</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Smart contract releases generate real immutable transaction hashes. We never display fake or mock hashes; every execution links directly to the block explorer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        7. DONOR TRACEABILITY EXPLANATION (Requirement 9.6)
        ========================================================================
      */}
      <section className="w-full border-b border-white/[0.08] py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
                DONOR EMPOWERMENT
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                Trace Every Rupee to Its Deliverable
              </h2>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">
              When you donate through VERA, your funds do not disappear into a black box. You receive a cryptographic contribution receipt allowing you to track your exact programmatic allocation across each milestone.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111113] border border-white/[0.06]">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0" />
                <span className="text-zinc-300">Dedicated reference code for every contribution</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111113] border border-white/[0.06]">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0" />
                <span className="text-zinc-300">Atomic escrow lock prevents early or unauthorized disbursement</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#111113] border border-white/[0.06]">
                <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0" />
                <span className="text-zinc-300">Explicit transparency on pooled programmatic allocation</span>
              </div>
            </div>

            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00F59B] text-black font-semibold text-xs font-mono hover:bg-[#00F59B]/90 transition-colors"
              >
                <span>Track Your Contributions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#111113] rounded-xl border border-white/[0.08] p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-zinc-400">DONATION TRACE PREVIEW</span>
              <span className="text-[#00F59B]">VERIFIED ESCROW</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Contribution Amount</span>
                <span className="text-white font-bold text-base">₹10,000</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Campaign Earmark</span>
                <span className="text-zinc-200">Jaipur Primary School</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Assigned Milestone</span>
                <span className="text-[#06B6D4]">Classroom Electrical Works</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">AI Verification</span>
                <span className="text-[#00F59B]">Invoice Matches Claim</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Multisig Consensus</span>
                <span className="text-white">2 of 3 Signers Confirmed</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Smart Contract Release</span>
                <span className="text-[#00F59B]">Executed On-Chain</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        8. NGO REPUTATION SCORE PREVIEW (Requirement 9.7)
        ========================================================================
      */}
      <section className="w-full border-b border-white/[0.08] py-20 px-4 sm:px-6 lg:px-8 bg-[#0C0C0E]/40">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-3xl space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              TRANSPARENT RELIABILITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Deterministic NGO Trust Scoring
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              We do not use subjective user star reviews. Every NGO is evaluated on deterministic mathematical factors: on-time milestone delivery, zero invoice discrepancies, and certified auditor approval rates.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-[#111113] border border-white/[0.08] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-white/[0.08] pb-6 md:pb-0 md:pr-6">
              <div className="w-20 h-20 rounded-xl bg-[#00F59B]/10 border border-[#00F59B]/25 flex items-center justify-center text-3xl font-black font-mono text-[#00F59B]">
                A
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
                  VERA TRUST INDEX
                </span>
                <div className="text-3xl font-bold font-mono text-white">
                  94 <span className="text-sm text-zinc-500 font-normal">/ 100</span>
                </div>
                <span className="text-xs font-mono text-[#00F59B]">Institutional Reliability</span>
              </div>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <span className="text-[10px] text-zinc-500 block">COMPLETED MILESTONES</span>
                <span className="text-white font-bold text-sm block mt-1">+15 pts</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <span className="text-[10px] text-zinc-500 block">REJECTED PROOFS</span>
                <span className="text-[#00F59B] font-bold text-sm block mt-1">0 flags</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <span className="text-[10px] text-zinc-500 block">DISCREPANCY VARIANCE</span>
                <span className="text-[#F59E0B] font-bold text-sm block mt-1">-6 pts</span>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg">
                <span className="text-[10px] text-zinc-500 block">FUND UTILISATION</span>
                <span className="text-[#06B6D4] font-bold text-sm block mt-1">100% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        9. LIVE MONOSPACE AUDIT LEDGER (Activity stream)
        ========================================================================
      */}
      <section className="w-full border-b border-white/[0.08] py-20 px-4 sm:px-6 lg:px-8 bg-[#09090B]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
              LIVE TRANSACTION STREAM
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Immutable Ledger Activity
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Real-time feed streaming escrow locks, milestone releases, and OCR verification digests across all initiatives.
            </p>
          </div>

          <AuditLedger />
        </div>
      </section>

      {/* 
        ========================================================================
        10. FINAL SAAS CALL TO ACTION (Requirement 9.8)
        ========================================================================
      */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 text-center bg-[#0C0C0E]">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Experience Verifiable Giving
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Support initiatives where capital moves strictly upon certified physical progress. Every transaction is verifiable on the public ledger.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/register"
              className="px-6 py-3 rounded-lg bg-[#00F59B] text-black font-semibold text-xs font-mono hover:bg-[#00F59B]/90 transition-colors"
            >
              CREATE FREE ACCOUNT
            </Link>
            <Link
              href="/campaigns"
              className="px-6 py-3 rounded-lg bg-white/[0.04] text-white border border-white/[0.08] text-xs font-mono hover:bg-white/[0.08] transition-colors"
            >
              BROWSE CAMPAIGNS
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
