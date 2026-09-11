'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProofStatus } from '@/types';
import { CheckCircle2, XCircle, AlertCircle, Loader2, MessageSquare, RotateCcw } from 'lucide-react';

interface AuditorActionFormProps {
  proofId: string;
  currentStatus: ProofStatus;
}

export const AuditorActionForm: React.FC<AuditorActionFormProps> = ({
  proofId,
  currentStatus,
}) => {
  const router = useRouter();

  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isClosed = currentStatus === 'APPROVED' || currentStatus === 'REJECTED';

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to APPROVE this proof evidence? Note: In Phase 3, this verifies evidence integrity. Fund release occurs via 2-of-3 multisig.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/proofs/${proofId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to approve proof.');
      }

      setSuccessMessage('Proof evidence successfully APPROVED. Milestone status updated for multisig consensus.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestResubmission = async () => {
    if (!comment || comment.trim().length === 0) {
      setError('Please provide feedback explaining what needs to be corrected for resubmission.');
      return;
    }

    if (!confirm('Request evidence resubmission from the NGO?')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/proofs/${proofId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: `[Resubmission Requested] ${comment.trim()}` }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request resubmission.');
      }

      setSuccessMessage('Resubmission requested. NGO has been notified to provide corrected evidence.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment || comment.trim().length === 0) {
      setError('A rejection reason/comment is required so the NGO can review audit findings.');
      return;
    }

    if (!confirm('Reject this proof evidence? This will be permanently recorded in the immutable audit log.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/proofs/${proofId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: `[Rejected] ${comment.trim()}` }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject proof.');
      }

      setSuccessMessage('Proof evidence REJECTED. NGO milestone status updated to REJECTED.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isClosed) {
    return (
      <div
        className={`p-5 rounded-xl border ${
          currentStatus === 'APPROVED'
            ? 'bg-[#00F59B]/5 border-[#00F59B]/20 text-[#00F59B]'
            : 'bg-red-500/5 border-red-500/20 text-red-400'
        }`}
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          {currentStatus === 'APPROVED' ? (
            <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span>Auditor Decision Recorded: {currentStatus}</span>
        </div>
        <p className="text-xs mt-1 text-zinc-400">
          This evidence submission has been officially resolved. {currentStatus === 'APPROVED' ? 'Evidence is cryptographically verified.' : 'Returned to NGO for corrective action.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111113] rounded-xl border border-zinc-800 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="border-b border-zinc-800/80 pb-3">
        <h3 className="text-sm font-semibold text-white tracking-tight">Auditor Formal Determination</h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Submit your binding audit verification. Rejection or resubmission requests require clear justification.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/20 flex items-start gap-2.5 text-xs text-[#00F59B]">
          <CheckCircle2 className="w-4 h-4 text-[#00F59B] shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Comment / Justification Box */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
          Auditor Findings & Notes
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter audit notes or specific findings (e.g., Extracted invoice amount ₹1,80,000 matches claimed amount. Tax invoice serial verified.)"
          disabled={isSubmitting}
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-zinc-700/80 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#00F59B] transition-colors"
        />
        <p className="text-[11px] font-mono text-zinc-500">
          Mandatory for rejection or resubmission. Recorded permanently in append-only audit trail.
        </p>
      </div>

      {/* Action Buttons: 3 actions matching Requirement 17 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isSubmitting}
          className="py-2.5 px-4 rounded-lg bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-black" />
          )}
          <span>Approve Evidence</span>
        </button>

        <button
          type="button"
          onClick={handleRequestResubmission}
          disabled={isSubmitting}
          className="py-2.5 px-4 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          ) : (
            <RotateCcw className="w-4 h-4 text-amber-400" />
          )}
          <span>Request Resubmission</span>
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={isSubmitting}
          className="py-2.5 px-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span>Reject Evidence</span>
        </button>
      </div>

      <p className="text-[11px] font-mono text-zinc-500 text-center">
        Escrow invariant: Approving evidence updates verification state. Fund release strictly requires 2-of-3 multisig consensus.
      </p>
    </div>
  );
};
