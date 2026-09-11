'use client';

import React, { useState } from 'react';
import { Milestone, ReleaseRequest, UserRole } from '@/types';
import { BlockchainBadge } from './BlockchainBadge';

interface MilestoneReleaseTrackerProps {
  milestone: Milestone;
  currentUser?: {
    id: string;
    role: UserRole;
    name: string;
  } | null;
  onRefresh?: () => void;
}

export const MilestoneReleaseTracker: React.FC<MilestoneReleaseTrackerProps> = ({
  milestone,
  currentUser,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>(milestone.amount.toString());

  const releaseRequest = milestone.release_request;
  const approvals = releaseRequest?.approvals || [];
  const currentApprovals = releaseRequest?.current_approvals || 0;
  const requiredApprovals = releaseRequest?.required_approvals || 2;
  const isReleased = milestone.status === 'RELEASED';
  const isReady = releaseRequest?.status === 'READY_TO_RELEASE';
  const isApproved = milestone.status === 'APPROVED' || milestone.active_proof_status === 'APPROVED';

  // Check if current user has already signed
  const hasUserSigned = currentUser
    ? approvals.some((a) => a.approver_id === currentUser.id)
    : false;

  const handleRequestRelease = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/milestones/${milestone.id}/release-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(customAmount) || milestone.amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate release request');
      setSuccessMsg('Release request successfully initiated! Awaiting 2-of-3 multisig signatures.');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignApproval = async () => {
    if (!releaseRequest) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/release-requests/${releaseRequest.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit signature');
      setSuccessMsg(data.message || 'Signature confirmed!');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteRelease = async () => {
    if (!releaseRequest) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/release-requests/${releaseRequest.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute fund release');
      setSuccessMsg('Funds successfully released on-chain and confirmed in database!');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">
            Phase 4: 2-of-3 Multi-Signature & On-Chain Release
          </h4>
          <p className="text-xs text-slate-500">
            Escrow release governed by smart contract invariants
          </p>
        </div>
        <div className="flex items-center gap-2">
          {releaseRequest && (
            <BlockchainBadge
              status={releaseRequest.blockchain_status}
              txHash={releaseRequest.blockchain_tx_hash}
            />
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
          {successMsg}
        </div>
      )}

      {/* Financial Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs">
        <div>
          <span className="text-slate-500 block">Milestone Allocation:</span>
          <span className="font-semibold text-slate-800">
            ₹{Number(milestone.amount).toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Requested Release:</span>
          <span className="font-semibold text-slate-800">
            {releaseRequest
              ? `₹${Number(releaseRequest.requested_amount).toLocaleString('en-IN')}`
              : 'Not Requested'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Multisig Threshold:</span>
          <span className="font-semibold text-slate-800">
            {currentApprovals} / {requiredApprovals} Approved
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Release State:</span>
          <span
            className={`font-semibold ${
              isReleased
                ? 'text-emerald-700'
                : isReady
                ? 'text-indigo-700'
                : 'text-amber-700'
            }`}
          >
            {isReleased
              ? '✓ Released On-Chain'
              : isReady
              ? 'Ready To Release'
              : releaseRequest
              ? 'Awaiting Multisig'
              : 'Pending Request'}
          </span>
        </div>
      </div>

      {/* Multisig Signers Visual Checklist */}
      {releaseRequest && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>2-of-3 Multisig Authorizations</span>
            <span>{currentApprovals >= 2 ? 'Threshold Met (2/3)' : `Need ${2 - currentApprovals} more signature(s)`}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Signer 1: NGO Admin */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-slate-800 block">NGO Admin</span>
                <span className="text-slate-500 text-[10px]">Managing Entity</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  approvals.some((a) => a.approver_role === 'NGO' || a.approver_role === 'ADMIN')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {approvals.some((a) => a.approver_role === 'NGO' || a.approver_role === 'ADMIN')
                  ? '✓ Signed'
                  : 'Pending'}
              </span>
            </div>

            {/* Signer 2: Campaign Owner */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-slate-800 block">Campaign Lead</span>
                <span className="text-slate-500 text-[10px]">Project Creator</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  approvals.length >= 2
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {approvals.length >= 2 ? '✓ Signed' : 'Pending'}
              </span>
            </div>

            {/* Signer 3: Certified Auditor */}
            <div className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
              <div>
                <span className="font-medium text-slate-800 block">Auditor</span>
                <span className="text-slate-500 text-[10px]">Independent Assessor</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  approvals.some((a) => a.approver_role === 'AUDITOR')
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {approvals.some((a) => a.approver_role === 'AUDITOR')
                  ? '✓ Signed'
                  : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {!releaseRequest && isApproved && !isReleased && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg w-32"
              placeholder="Release Amount"
            />
            <button
              onClick={handleRequestRelease}
              disabled={loading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Request Fund Release'}
            </button>
          </div>
        )}

        {releaseRequest && !isReleased && (
          <div className="flex flex-wrap items-center gap-2">
            {!hasUserSigned && currentUser && currentUser.role !== 'DONOR' && (
              <button
                onClick={handleSignApproval}
                disabled={loading}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Signing...' : `Sign Multisig Approval (${currentApprovals}/2)`}
              </button>
            )}

            {isReady && (currentUser?.role === 'NGO' || currentUser?.role === 'ADMIN') && (
              <button
                onClick={handleExecuteRelease}
                disabled={loading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {loading ? 'Executing Release...' : 'Execute On-Chain Release'}
              </button>
            )}
          </div>
        )}

        <div className="text-[11px] text-slate-400 italic">
          Testnet settlement layer (Demo / Non-monetary)
        </div>
      </div>
    </div>
  );
};
