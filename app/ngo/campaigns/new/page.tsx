'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FolderPlus, AlertCircle, HelpCircle } from 'lucide-react';

export default function NewCampaignPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>('DRAFT');

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          target_amount: parseFloat(targetAmount),
          beneficiary,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        throw new Error(data.error || 'Failed to create campaign');
      }

      router.push(`/ngo/campaigns/${data.campaign.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-[#EDEDED] pb-16">
      <Link
        href="/ngo/campaigns"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to NGO Dashboard</span>
      </Link>

      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
          <div className="w-10 h-10 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/20 text-[#00F59B] flex items-center justify-center">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-sans">Create New Campaign</h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Configure campaign deliverable metadata and financial target cap
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
              {Object.keys(fieldErrors).length > 0 && (
                <ul className="list-disc pl-5 mt-1 text-xs space-y-0.5 text-red-300">
                  {Object.entries(fieldErrors).map(([k, v]) => (
                    <li key={k}>{k}: {v.join(', ')}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Campaign Title <span className="text-[#00F59B]">*</span>
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Solar Water Purification for 10 Rural Schools"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00F59B] transition-colors"
            />
            <p className="text-[11px] text-zinc-500">
              Concise, descriptive title identifying the initiative.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Target Funding Goal (INR ₹) <span className="text-[#00F59B]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-zinc-500 text-sm font-semibold">₹</span>
              <input
                type="number"
                required
                min={1}
                step={1}
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="500000"
                className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm font-semibold focus:outline-none focus:border-[#00F59B] transition-colors"
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              Must be positive. Raised and released balances strictly initialize at ₹0.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Target Beneficiary <span className="text-[#00F59B]">*</span>
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={200}
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="e.g. 1,400 Primary School Students in Jaipur District"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00F59B] transition-colors"
            />
            <p className="text-[11px] text-zinc-500">
              Who receives the physical deliverable or verified outcome.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Detailed Description <span className="text-[#00F59B]">*</span>
            </label>
            <textarea
              required
              rows={4}
              minLength={10}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the scope of work, expected impact, procurement schedule, and intended milestones..."
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-xs font-sans focus:outline-none focus:border-[#00F59B] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
              Initial Campaign Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus('DRAFT')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  status === 'DRAFT'
                    ? 'border-white/[0.3] bg-white/[0.08] text-white'
                    : 'border-white/[0.06] bg-[#18181B] text-zinc-400 hover:text-white'
                }`}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => setStatus('ACTIVE')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  status === 'ACTIVE'
                    ? 'border-[#00F59B]/40 bg-[#00F59B]/15 text-[#00F59B]'
                    : 'border-white/[0.06] bg-[#18181B] text-zinc-400 hover:text-white'
                }`}
              >
                Publish as Active
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Link
              href="/ngo/campaigns"
              className="px-4 py-2 rounded-lg border border-white/[0.08] text-zinc-400 text-xs hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  <span>Create Campaign</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
