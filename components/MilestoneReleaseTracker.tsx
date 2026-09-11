'use client';

import React, { useState } from 'react';
import { Milestone, ReleaseRequest, UserRole } from '@/types';
import { BlockchainBadge } from './BlockchainBadge';
import { formatRupees } from '@/lib/utils';
import { getExplorerTxUrl } from '@/lib/blockchain';
import { Check, Clock, ShieldCheck, ArrowUpRight, AlertCircle, Loader2 } from 'lucide-react';

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
      setSuccessMsg('Release authorization request created. Awaiting 2-of-3 multisig signatures.');
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
      setSuccessMsg(data.message || 'Signature confirmed on-chain!');
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

  const requestedAmount = releaseRequest ? Number(releaseRequest.requested_amount) : Number(milestone.amount);
  const txHash = releaseRequest?.blockchain_tx_hash;
  const explorerUrl = txHash ? getExplorerTxUrl(undefined, txHash) : null;

  return (
    <div className="mt-3 p-5 rounded-xl bg-[#111113] border border-zinc-800 space-y-4 shadow-sm text-left">
      {/* Header: RELEASE AUTHORIZATION */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Consensus Authorization
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[10px] font-mono text-indigo-400">2-of-3 Multisig</span>
          </div>
          <h4 className="text-sm font-semibold text-white tracking-tight mt-0.5">
            RELEASE AUTHORIZATION
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {isReleased ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#00F59B]/10 text-[#00F59B] border border-[#00F59B]/30">
              <Check className="w-3.5 h-3.5" />
              RELEASED ON-CHAIN
            </span>
          ) : isReady ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              READY FOR RELEASE
            </span>
          ) : releaseRequest ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" />
              {currentApprovals} / {requiredApprovals} APPROVED
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono text-zinc-400 bg-zinc-800/60 border border-zinc-700/50">
              Awaiting Request
            </span>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-[#00F59B]/10 border border-[#00F59B]/20 text-[#00F59B] text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Financial Authorization Metric */}
      <div className="p-4 rounded-lg bg-[#18181B] border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            Authorized Tranche Release
          </span>
          <span className="text-2xl font-black text-white font-mono tracking-tight mt-0.5 block">
            {formatRupees(requestedAmount)}
          </span>
        </div>
        <div className="text-left sm:text-right font-mono text-xs text-zinc-400">
          <div>Allocation Cap: {formatRupees(Number(milestone.amount))}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            Required: <span className="text-white font-semibold">{requiredApprovals} of 3 approvals</span>
          </div>
        </div>
      </div>

      {/* Multisig Signers Checklist (Requirement 18 format) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="uppercase tracking-wider text-[10px]">Multi-Party Signers</span>
          <span className="text-[11px] font-bold text-white">
            Status: {currentApprovals} / {requiredApprovals} Approved
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          {/* Signer 1: NGO Admin */}
          {(() => {
            const isSigned = approvals.some((a) => a.approver_role === 'NGO' || a.approver_role === 'ADMIN');
            return (
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  isSigned
                    ? 'bg-[#00F59B]/5 border-[#00F59B]/20 text-white'
                    : 'bg-[#18181B] border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={isSigned ? 'text-[#00F59B] font-bold' : 'text-zinc-600'}>
                    {isSigned ? '✓' : '○'}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold block text-zinc-200">NGO Admin</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Entity Lead</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    isSigned ? 'bg-[#00F59B]/10 text-[#00F59B]' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isSigned ? 'Signed' : 'Pending'}
                </span>
              </div>
            );
          })()}

          {/* Signer 2: Project Lead */}
          {(() => {
            const isSigned = approvals.length >= 2;
            return (
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  isSigned
                    ? 'bg-[#00F59B]/5 border-[#00F59B]/20 text-white'
                    : 'bg-[#18181B] border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={isSigned ? 'text-[#00F59B] font-bold' : 'text-zinc-600'}>
                    {isSigned ? '✓' : '○'}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold block text-zinc-200">Project Lead</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Campaign Owner</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    isSigned ? 'bg-[#00F59B]/10 text-[#00F59B]' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isSigned ? 'Signed' : 'Pending'}
                </span>
              </div>
            );
          })()}

          {/* Signer 3: Auditor */}
          {(() => {
            const isSigned = approvals.some((a) => a.approver_role === 'AUDITOR');
            return (
              <div
                className={`p-3 rounded-lg border flex items-center justify-between ${
                  isSigned
                    ? 'bg-[#00F59B]/5 border-[#00F59B]/20 text-white'
                    : 'bg-[#18181B] border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={isSigned ? 'text-[#00F59B] font-bold' : 'text-zinc-600'}>
                    {isSigned ? '✓' : '○'}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold block text-zinc-200">Auditor</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Independent</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                    isSigned ? 'bg-[#00F59B]/10 text-[#00F59B]' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {isSigned ? 'Signed' : 'Pending'}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Blockchain On-Chain Details if confirmed */}
      {isReleased && txHash && (
        <div className="p-3.5 rounded-lg bg-[#00F59B]/5 border border-[#00F59B]/20 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#00F59B]">✓ RELEASED ON-CHAIN</span>
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#06B6D4] hover:underline"
              >
                View on Explorer <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="text-[11px] font-mono text-zinc-400 break-all bg-black/40 px-2 py-1 rounded border border-zinc-800">
            Transaction: {txHash}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
        {!releaseRequest && isApproved && !isReleased && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="text-xs px-3 py-2 bg-[#18181B] border border-zinc-700 text-white rounded-lg w-36 font-mono focus:outline-none focus:border-[#00F59B]"
              placeholder="Release Amount"
            />
            <button
              onClick={handleRequestRelease}
              disabled={loading}
              className="px-4 py-2 bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-semibold text-xs rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Request Release</span>
            </button>
          </div>
        )}

        {releaseRequest && !isReleased && (
          <div className="flex flex-wrap items-center gap-2">
            {!hasUserSigned && currentUser && currentUser.role !== 'DONOR' && (
              <button
                onClick={handleSignApproval}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Sign Multisig Approval ({currentApprovals}/2)</span>
              </button>
            )}

            {isReady && (currentUser?.role === 'NGO' || currentUser?.role === 'ADMIN') && (
              <button
                onClick={handleExecuteRelease}
                disabled={loading}
                className="px-4 py-2 bg-[#00F59B] hover:bg-[#00F59B]/90 text-black text-xs font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Execute On-Chain Release</span>
              </button>
            )}
          </div>
        )}

        <div className="text-[11px] font-mono text-zinc-500">
          Deterministic 2-of-3 escrow invariant enforced on-chain
        </div>
      </div>
    </div>
  );
};

export default MilestoneReleaseTracker;
