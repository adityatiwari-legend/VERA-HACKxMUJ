'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeartHandshake, CheckCircle2, AlertCircle, X, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { Donation } from '@/types';

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
      setError('Please select or enter a valid donation amount');
      return;
    }

    if (amount > remainingGoal) {
      setError(`Donation amount cannot exceed remaining goal of ₹${remainingGoal.toLocaleString('en-IN')}`);
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
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <HeartHandshake className="w-4 h-4" />
        {remainingGoal <= 0 ? 'Goal Reached' : 'Donate to Campaign'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!confirmedDonation ? (
              <div className="space-y-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    VERA Earmarked Contribution
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Donate to {campaignTitle}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Funds will be locked in transparent accounting escrow for this campaign.
                  </p>
                </div>

                {/* Simulated Payment Notice */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Simulated Test Donation:</span>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      No real payment gateway is hooked in Phase 2. This test contribution directly simulates fund locking and updates verifiable audit records.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Select Amount (INR ₹)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset)}
                          className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all ${
                            amount === preset
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-600/20'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          ₹{preset.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        min={1}
                        max={remainingGoal}
                        step={1}
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
                        placeholder="Or enter custom amount"
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-semibold"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Remaining funding goal: ₹{remainingGoal.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Donation Purpose / Earmark Note (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={255}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g. Solar panels procurement, Water filters"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <HeartHandshake className="w-4 h-4" />
                          Confirm Test Donation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Success State */
              <div className="text-center space-y-5 py-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">Donation Confirmed!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your contribution has been earmarked and locked in the campaign escrow.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reference:</span>
                    <span className="font-mono font-bold text-slate-900">{confirmedDonation.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-bold text-emerald-700">₹{Number(confirmedDonation.amount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      CONFIRMED (LOCKED)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/donor/donations/${confirmedDonation.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    View Donation Receipt
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
