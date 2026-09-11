'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProofStatus } from '@/types';
import { CheckCircle2, XCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';

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
    if (!confirm('Are you sure you want to APPROVE this proof evidence? Note: In Phase 3, this approves evidence but does NOT release money.')) {
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

      setSuccessMessage('Proof evidence successfully APPROVED. (Funds remain locked until Phase 4 release)');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment || comment.trim().length === 0) {
      setError('A rejection reason/comment is required so the NGO can submit corrected evidence.');
      return;
    }

    if (!confirm('Reject this proof evidence? The NGO will be notified to submit corrected documentation.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/proofs/${proofId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reject proof.');
      }

      setSuccessMessage('Proof evidence REJECTED. NGO milestone status updated to REJECTED for correction.');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during rejection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isClosed) {
    return (
      <div className={`p-5 rounded-2xl border ${
        currentStatus === 'APPROVED'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-2 font-bold text-sm">
          {currentStatus === 'APPROVED' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600" />
          )}
          Auditor Decision Recorded: {currentStatus}
        </div>
        <p className="text-xs mt-1 opacity-80">
          This evidence submission has been officially resolved. {currentStatus === 'APPROVED' ? 'Evidence is verified.' : 'Returned to NGO for correction.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-900">Auditor Formal Decision</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit your binding audit verification. Rejecting requires a clear justification for NGO correction.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Comment / Justification Box */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
          Auditor Comments & Findings
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Enter audit notes or specific rejection reason (e.g. Invoice amount differs from claimed utilisation. Please submit corrected documentation.)"
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-[11px] text-slate-400">
          Mandatory if rejecting. Recorded in permanent audit log.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isSubmitting}
          className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>Approve Evidence</span>
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={isSubmitting}
          className="w-full sm:flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>Reject (Require Correction)</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-400 text-center italic">
        Phase 3 Notice: Approving evidence updates milestone status to APPROVED but strictly does not release money. Fund release belongs to Phase 4.
      </p>
    </div>
  );
};
