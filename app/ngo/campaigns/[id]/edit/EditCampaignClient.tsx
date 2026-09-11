'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Campaign } from '@/types';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

interface EditCampaignClientProps {
  campaign: Campaign;
}

export const EditCampaignClient: React.FC<EditCampaignClientProps> = ({ campaign }) => {
  const router = useRouter();

  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description);
  const [targetAmount, setTargetAmount] = useState(campaign.target_amount.toString());
  const [beneficiary, setBeneficiary] = useState(campaign.beneficiary);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          target_amount: parseFloat(targetAmount),
          beneficiary,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setFieldErrors(data.details);
        }
        throw new Error(data.error || 'Failed to update campaign');
      }

      router.push(`/ngo/campaigns/${campaign.id}`);
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
        href={`/ngo/campaigns/${campaign.id}`}
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campaign Details</span>
      </Link>

      <div className="bg-[#111113] rounded-xl border border-white/[0.08] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-white/[0.08]">
          <div>
            <h1 className="text-xl font-bold text-white font-sans">Edit Campaign Details</h1>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Updating campaign will append an entry to the immutable audit trail
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
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00F59B] transition-colors"
            />
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
                className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm font-semibold focus:outline-none focus:border-[#00F59B] transition-colors"
              />
            </div>
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
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00F59B] transition-colors"
            />
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
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-xs font-sans focus:outline-none focus:border-[#00F59B] transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
            <Link
              href={`/ngo/campaigns/${campaign.id}`}
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
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
