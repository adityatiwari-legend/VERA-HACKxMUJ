'use client';

import React from 'react';
import { BlockchainStatus } from '@/types';
import { getExplorerTxUrl } from '@/lib/blockchain';

interface BlockchainBadgeProps {
  status?: BlockchainStatus | null;
  txHash?: string | null;
  network?: string | null;
  chainId?: number | string;
  className?: string;
  showExplorerLink?: boolean;
}

export const BlockchainBadge: React.FC<BlockchainBadgeProps> = ({
  status = 'NOT_SUBMITTED',
  txHash,
  network,
  chainId,
  className = '',
  showExplorerLink = true,
}) => {
  const currentStatus = status || 'NOT_SUBMITTED';

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'CONFIRMED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SUBMITTED':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NOT_SUBMITTED':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = () => {
    switch (currentStatus) {
      case 'CONFIRMED':
        return '✓ Blockchain Confirmed';
      case 'SUBMITTED':
        return '⏳ Submitted to Testnet';
      case 'PENDING':
        return '⏳ Blockchain Pending';
      case 'FAILED':
        return '✕ Blockchain Failed';
      case 'NOT_SUBMITTED':
      default:
        return '○ Not Submitted';
    }
  };

  const explorerUrl = txHash ? getExplorerTxUrl(chainId, txHash) : null;
  const truncatedHash = txHash ? `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 6)}` : null;

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getStatusColor()}`}>
        {getStatusLabel()}
      </span>

      {network && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Network: {network}
        </span>
      )}

      {txHash && (
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
          Tx: {truncatedHash}
        </span>
      )}

      {showExplorerLink && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          View on Explorer →
        </a>
      )}
    </div>
  );
};
