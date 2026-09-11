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
        return 'bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/30';
      case 'SUBMITTED':
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'NOT_SUBMITTED':
      default:
        return 'bg-white/5 text-zinc-400 border-white/10';
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
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border ${getStatusColor()}`}>
        {getStatusLabel()}
      </span>

      {network && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-mono font-medium bg-[#6366F1]/10 text-[#818cf8] border border-[#6366F1]/30">
          Network: {network}
        </span>
      )}

      {txHash && (
        <span className="text-xs font-mono bg-white/[0.04] text-zinc-300 px-2 py-0.5 rounded-lg border border-white/10">
          Tx: {truncatedHash}
        </span>
      )}

      {showExplorerLink && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#06B6D4] hover:text-[#06B6D4]/80 underline flex items-center gap-1 font-mono transition-colors"
        >
          View on Explorer ↗
        </a>
      )}
    </div>
  );
};
