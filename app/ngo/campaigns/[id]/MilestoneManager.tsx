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
} from 'lucide-react';
import { BlockchainBadge } from '@/components/BlockchainBadge';
import { MilestoneReleaseTracker } from '@/components/MilestoneReleaseTracker';

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
      setError(`Milestone amount exceeds unallocated campaign funding (₹${unallocated.toLocaleString('en-IN')} remaining)`);
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

  const formatRupees = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MilestoneIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Campaign Milestones (Phase 2)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Allocated: {formatRupees(totalAllocated)} of {formatRupees(targetAmount)} ({unallocated <= 0 ? 'Fully Allocated' : `${formatRupees(unallocated)} unallocated`})
          </p>
        </div>

        {isEditable && unallocated > 0 && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Milestone
          </button>
        )}
      </div>

      {error && (
        <div className="m-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Milestone Form */}
      {showAddForm && (
        <form onSubmit={handleCreateMilestone} className="p-6 bg-slate-50/80 border-b border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Define New Milestone
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Milestone Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electrical Work & Wiring"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Verification Criteria *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the materials to be purchased, contractors involved, and verification criteria for proof upload in Phase 3..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="proofRequired"
              checked={proofRequired}
              onChange={(e) => setProofRequired(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="proofRequired" className="text-xs text-slate-700 font-medium">
              Require documentary evidence (receipts/invoices) before fund release in Phase 3
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Milestone'}
            </button>
          </div>
        </form>
      )}

      {/* Milestones List */}
      {milestones.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          No milestones defined yet. Click "Add Milestone" to configure funding phases.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {milestones.map((ms) => (
            <div key={ms.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {ms.sequence}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{ms.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ms.status === 'IN_PROGRESS'
                      ? 'bg-amber-100 text-amber-800'
                      : ms.status === 'PROOF_SUBMITTED'
                      ? 'bg-blue-100 text-blue-800'
                      : ms.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ms.status === 'RELEASED'
                      ? 'bg-teal-100 text-teal-800'
                      : ms.status === 'REJECTED' || ms.status === 'FAILED'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {ms.status === 'PROOF_SUBMITTED' ? 'PROOF SUBMITTED' : ms.status}
                  </span>
                  {ms.blockchain_status && (
                    <BlockchainBadge status={ms.blockchain_status} />
                  )}
                  {ms.proof_required && (
                    <span className="hidden xs:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <FileCheck className="w-3 h-3 text-slate-400" /> Proof Required
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 pl-8 max-w-xl">
                  {ms.description}
                </p>

                {/* Phase 4: Multisig Release Tracker */}
                {(ms.status === 'APPROVED' || ms.status === 'RELEASED' || ms.release_request) && (
                  <div className="pl-8 pt-2">
                    <MilestoneReleaseTracker
                      milestone={ms}
                      currentUser={{ id: '', role: 'NGO', name: 'NGO Admin' }}
                      onRefresh={() => router.refresh()}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pl-8 sm:pl-0 sm:shrink-0">
                <div className="text-left sm:text-right">
                  <span className="text-sm font-bold text-slate-900 block">
                    {formatRupees(Number(ms.amount))}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {Math.round((Number(ms.amount) / targetAmount) * 100)}% of Goal
                  </span>
                </div>

                {isEditable && ms.status === 'LOCKED' && (
                  <button
                    onClick={() => handleStartMilestone(ms.id)}
                    disabled={loading}
                    title="Start Milestone (Transition to IN_PROGRESS)"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    Start
                  </button>
                )}

                {isEditable && (ms.status === 'IN_PROGRESS' || ms.status === 'REJECTED') && (
                  <a
                    href={`/ngo/campaigns/${campaignId}/milestones/${ms.id}/proof`}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                      ms.status === 'REJECTED'
                        ? 'bg-rose-600 hover:bg-rose-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    {ms.status === 'REJECTED' ? 'Resubmit Proof' : 'Submit Proof'}
                  </a>
                )}

                {ms.status === 'PROOF_SUBMITTED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                    <Clock className="w-3 h-3" />
                    Under Review
                  </span>
                )}

                {ms.status === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Evidence Approved
                  </span>
                )}

                {ms.status === 'RELEASED' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Funds Released
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
