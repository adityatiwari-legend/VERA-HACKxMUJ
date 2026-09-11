import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight, Layers, FileCheck, Landmark, Search } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            Phase 1 Foundation Active
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            A Donation Trail <span className="text-emerald-400">Donors Can Audit</span>
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed">
            FundTrail introduces verifiable integrity to philanthropic giving. Donors will be able to trace funds from donation to locked escrow, milestone verification, approval, release, and beneficiary spend.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/ngo/campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-900/30 transition-all"
            >
              Go to NGO Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              Sign In (Demo Accounts)
            </Link>
          </div>
        </div>
      </div>

      {/* 5-Phase Roadmap Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              FundTrail 5-Phase Architecture Roadmap
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Building in deliberate, production-structured phases for transparent fund tracking.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
            CURRENT: PHASE 1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          {/* Phase 1 */}
          <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-4 relative">
            <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
              ACTIVE
            </span>
            <div className="text-xs font-bold text-emerald-700">PHASE 1</div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">Foundation & Campaigns</h3>
            <p className="text-xs text-slate-600 mt-2">
              Next.js, PostgreSQL via pg, pure SQL migrations, Auth & RBAC, NGO Campaign CRUD, and audit logging.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 opacity-80">
            <div className="text-xs font-bold text-slate-400">PHASE 2</div>
            <h3 className="text-sm font-bold text-slate-700 mt-1">Earmarked Funds</h3>
            <p className="text-xs text-slate-500 mt-2">
              Donations, earmarking to campaigns, milestone definition, and fund locking state machines.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 opacity-80">
            <div className="text-xs font-bold text-slate-400">PHASE 3</div>
            <h3 className="text-sm font-bold text-slate-700 mt-1">Proof & Verification</h3>
            <p className="text-xs text-slate-500 mt-2">
              Evidence upload, SHA-256 hash anchoring, AI OCR extraction, discrepancy detection, and auditor approval.
            </p>
          </div>

          {/* Phase 4 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 opacity-80">
            <div className="text-xs font-bold text-slate-400">PHASE 4</div>
            <h3 className="text-sm font-bold text-slate-700 mt-1">Blockchain Layer</h3>
            <p className="text-xs text-slate-500 mt-2">
              Solidity smart contracts and ethers.js recording tamper-evident fund releases and state transitions.
            </p>
          </div>

          {/* Phase 5 */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 opacity-80">
            <div className="text-xs font-bold text-slate-400">PHASE 5</div>
            <h3 className="text-sm font-bold text-slate-700 mt-1">Public Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-2">
              Public audit trail explorer, NGO reputation scoring, multisig release, and production deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">PostgreSQL = Ground Truth</h3>
          <p className="text-sm text-slate-600 mt-2">
            No bloated ORM abstractions. Built using the native <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">pg</code> driver with parameterized SQL queries for predictable query performance.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Complete Audit History</h3>
          <p className="text-sm text-slate-600 mt-2">
            Every campaign creation, detail update, and status change is recorded into an append-only audit log table with actor identity and JSON metadata.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
            <Landmark className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Strict Role Separation</h3>
          <p className="text-sm text-slate-600 mt-2">
            Server-side authorization ensures NGOs can only manage their own campaigns, preventing unauthorized modifications or cross-organization tampering.
          </p>
        </div>
      </div>
    </div>
  );
}
