'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartHandshake, CheckCircle2, AlertCircle, X, ShieldAlert, Sparkles, ArrowRight, Loader2, Lock, Coins } from 'lucide-react';
import { Donation } from '@/types';
import { formatRupees } from '@/lib/utils';

interface DonationModalProps {
  campaignId: string;
  campaignTitle: string;
  remainingGoal: number;
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const DonationModal: React.FC<DonationModalProps> = ({
  campaignId,
  campaignTitle,
  remainingGoal,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number | ''>(1000);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedDonation, setConfirmedDonation] = useState<Donation | null>(null);

  const handleOpen = () => {
    setError(null);
    setConfirmedDonation(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (confirmedDonation) {
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError('Please select or enter a valid donation amount.');
      return;
    }

    if (amount > remainingGoal) {
      setError(`Donation amount cannot exceed remaining goal of ${formatRupees(remainingGoal)}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          purpose: purpose || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Failed to process donation');
      }

      setConfirmedDonation(data.donation);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={remainingGoal <= 0}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Coins className="w-4 h-4 text-black" />
        <span>{remainingGoal <= 0 ? 'Goal Reached' : 'Donate to Campaign'}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111113] rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-white/[0.08] relative">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {confirmedDonation ? (
              <div className="space-y-6 text-center font-mono">
                <div className="w-12 h-12 rounded-full bg-[#00F59B]/10 border border-[#00F59B]/25 flex items-center justify-center text-[#00F59B] mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-sans">
                    Donation Confirmed & Earmarked
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Your contribution is locked in the campaign escrow vault.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#18181B] border border-white/[0.06] text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Reference:</span>
                    <span className="font-bold text-white">{confirmedDonation.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Amount:</span>
                    <span className="font-bold text-[#00F59B] text-sm">{formatRupees(confirmedDonation.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Status:</span>
                    <span className="text-[#00F59B] font-semibold">● LOCKED IN ESCROW</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Link
                    href={`/donor/donations/${confirmedDonation.id}/trace`}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-[#00F59B] text-black font-semibold text-xs text-center hover:bg-[#00F59B]/90 transition-colors"
                  >
                    Trace Contribution →
                  </Link>
                  <button
                    onClick={handleClose}
                    className="py-2.5 px-4 rounded-lg bg-white/[0.04] text-white border border-white/[0.08] text-xs hover:bg-white/[0.08] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F59B] font-semibold block">
                    ESCROW CONTRIBUTION
                  </span>
                  <h3 className="text-xl font-bold text-white font-sans">
                    Support this Initiative
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-1 font-sans">
                    {campaignTitle}
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Preset Amounts */}
                <div className="space-y-1.5 font-mono">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    Select Amount (₹)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setAmount(preset)}
                        className={`py-2 px-2 rounded-lg border text-xs font-semibold transition-all ${
                          amount === preset
                            ? 'bg-[#00F59B]/15 text-[#00F59B] border-[#00F59B]/40'
                            : 'bg-[#18181B] text-zinc-400 border-white/[0.06] hover:text-white'
                        }`}
                      >
                        {formatRupees(preset)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-1.5 font-mono">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    Custom Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max={remainingGoal}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    placeholder="Enter custom amount"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-white/[0.08] text-white text-sm font-semibold focus:outline-none focus:border-[#00F59B] transition-colors"
                  />
                  <span className="text-[11px] text-zinc-500">
                    Remaining campaign goal: {formatRupees(remainingGoal)}
                  </span>
                </div>

                {/* Note / Purpose */}
                <div className="space-y-1.5 font-mono">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-medium">
                    Message or Purpose (Optional)
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. In memory of / For classroom supplies"
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-[#18181B] border border-white/[0.08] text-white focus:outline-none focus:border-[#00F59B] transition-colors font-sans"
                  />
                </div>

                {/* Escrow Guarantee Notice */}
                <div className="p-3 rounded-lg bg-[#18181B] border border-white/[0.06] flex items-start gap-2.5 text-xs text-zinc-400 font-mono">
                  <Lock className="w-4 h-4 text-[#00F59B] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    100% of your contribution is locked in the campaign escrow vault and released only upon verified milestones.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !amount || amount <= 0}
                    className="w-full py-3 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs font-mono transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming Escrow Lock...</span>
                      </>
                    ) : (
                      <span>Confirm {formatRupees(amount || 0)} Contribution</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DonationModal;
