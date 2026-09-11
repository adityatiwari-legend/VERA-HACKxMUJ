'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Milestone, MilestoneStatus } from '@/types';
import {
  Milestone as MilestoneIcon,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Play,
  FileCheck,
  Lock,
  Clock,
  Loader2,
} from 'lucide-react';
import { BlockchainBadge } from '@/components/BlockchainBadge';
import { MilestoneReleaseTracker } from '@/components/MilestoneReleaseTracker';
import { formatRupees } from '@/lib/utils';

interface MilestoneManagerProps {
  campaignId: string;
  targetAmount: number;
  milestones: Milestone[];
  isEditable: boolean;
}

export const MilestoneManager: React.FC<MilestoneManagerProps> = ({
  campaignId,
  targetAmount,
  milestones,
  isEditable,
}) => {
  const router = useRouter();

  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [proofRequired, setProofRequired] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAllocated = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const unallocated = Math.max(0, targetAmount - totalAllocated);

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid positive milestone amount');
      return;
    }

    if (numAmount > unallocated) {
      setError(`Milestone amount exceeds unallocated campaign funding (${formatRupees(unallocated)} remaining)`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          amount: numAmount,
          proof_required: proofRequired,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create milestone');
      }

      setTitle('');
      setDescription('');
      setAmount('');
      setShowAddForm(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMilestone = async (milestoneId: string) => {
    if (!confirm('Start this milestone? Status will transition from LOCKED to IN_PROGRESS.')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/milestones/${milestoneId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start milestone');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111113] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MilestoneIcon className="w-4 h-4 text-[#00F59B]" />
            <h2 className="text-sm font-semibold text-white">Campaign Milestones (Phase 2/3)</h2>
          </div>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            Allocated: {formatRupees(totalAllocated)} of {formatRupees(targetAmount)} ({unallocated <= 0 ? 'Fully Allocated' : `${formatRupees(unallocated)} unallocated`})
          </p>
        </div>

        {isEditable && unallocated > 0 && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold uppercase tracking-wider transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Milestone
          </button>
        )}
      </div>

      {error && (
        <div className="m-5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Milestone Form */}
      {showAddForm && (
        <form onSubmit={handleCreateMilestone} className="p-5 bg-[#18181B] border-b border-zinc-800 space-y-3.5">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Define New Milestone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Milestone Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electrical Work & Wiring"
                className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-zinc-700 text-white text-xs focus:outline-none focus:border-[#00F59B]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                Allocated Amount (INR ₹) *
              </label>
              <input
                type="number"
                min={1}
                max={unallocated}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max: ${unallocated}`}
                className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-zinc-700 text-white text-xs font-mono font-semibold focus:outline-none focus:border-[#00F59B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Description & Verification Criteria *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the materials to be purchased, contractors involved, and verification criteria for proof upload..."
              className="w-full px-3 py-2 rounded-lg bg-[#111113] border border-zinc-700 text-white text-xs focus:outline-none focus:border-[#00F59B]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="proofRequired"
              checked={proofRequired}
              onChange={(e) => setProofRequired(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-800 text-[#00F59B] focus:ring-[#00F59B]"
            />
            <label htmlFor="proofRequired" className="text-xs text-zinc-300 font-medium">
              Require documentary evidence (receipts/invoices) before fund release
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-xs font-semibold hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Milestone'}
            </button>
          </div>
        </form>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="p-10 text-center text-xs font-mono text-zinc-500">
          No milestones defined yet. Click "Add Milestone" to configure funding phases.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80">
          {milestones.map((ms) => (
            <div key={ms.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-5 h-5 rounded bg-[#00F59B]/10 border border-[#00F59B]/30 text-[#00F59B] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                    {ms.sequence}
                  </span>
                  <h3 className="text-sm font-semibold text-white">{ms.title}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      ms.status === 'IN_PROGRESS'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : ms.status === 'PROOF_SUBMITTED'
                        ? 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30'
                        : ms.status === 'APPROVED'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                        : ms.status === 'RELEASED'
                        ? 'bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30'
                        : ms.status === 'REJECTED' || ms.status === 'FAILED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    ● {ms.status === 'PROOF_SUBMITTED' ? 'PROOF SUBMITTED' : ms.status}
                  </span>
                  {ms.blockchain_status && (
                    <BlockchainBadge status={ms.blockchain_status} />
                  )}
                  {ms.proof_required && (
                    <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded border border-zinc-700">
                      <FileCheck className="w-3 h-3 text-zinc-400" /> Proof Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 pl-7 max-w-xl leading-relaxed">
                  {ms.description}
                </p>

                {/* Phase 4: Multisig Release Tracker */}
                {(ms.status === 'APPROVED' || ms.status === 'RELEASED' || ms.release_request) && (
                  <div className="pl-7 pt-2">
                    <MilestoneReleaseTracker
                      milestone={ms}
                      currentUser={{ id: '', role: 'NGO', name: 'NGO Admin' }}
                      onRefresh={() => router.refresh()}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pl-7 sm:pl-0 sm:shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-white font-mono block">
                    {formatRupees(Number(ms.amount))}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {Math.round((Number(ms.amount) / targetAmount) * 100)}% of Goal
                  </span>
                </div>

                {isEditable && ms.status === 'LOCKED' && (
                  <button
                    onClick={() => handleStartMilestone(ms.id)}
                    disabled={loading}
                    title="Start Milestone (Transition to IN_PROGRESS)"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-mono font-semibold border border-amber-500/30 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                )}

                {isEditable && (ms.status === 'IN_PROGRESS' || ms.status === 'REJECTED') && (
                  <a
                    href={`/ngo/campaigns/${campaignId}/milestones/${ms.id}/proof`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm ${
                      ms.status === 'REJECTED'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-[#00F59B] hover:bg-[#00F59B]/90 text-black'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    {ms.status === 'REJECTED' ? 'Resubmit Proof' : 'Submit Proof'}
                  </a>
                )}

                {ms.status === 'PROOF_SUBMITTED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 text-xs font-mono font-semibold">
                    <Clock className="w-3 h-3" />
                    Under Review
                  </span>
                )}

                {ms.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-mono font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}

                {ms.status === 'RELEASED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30 text-xs font-mono font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Released
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
