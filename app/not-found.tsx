import React from 'react';
import Link from 'next/link';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#111113] rounded-xl border border-zinc-800 p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 text-[#00F59B] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">404 — Resource Not Found</span>
          <h2 className="text-xl font-bold text-white tracking-tight">Record Does Not Exist</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The requested campaign, donation, audit trail, or resource could not be located in the VERA ledger.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            Explore Campaigns
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#18181B] hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
