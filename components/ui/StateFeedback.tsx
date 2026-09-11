'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Inbox,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Surface } from './Surface';
import { Button } from './Button';
import { Badge } from './Badge';
import { getExplorerTxUrl } from '@/lib/blockchain';

/* -------------------------------------------------------------------------- */
/* 1. EmptyState                                                              */
/* -------------------------------------------------------------------------- */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = <Inbox className="w-8 h-8 text-zinc-500" />,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Surface
      variant="default"
      padding="xl"
      rounded="2xl"
      className={`text-center flex flex-col items-center justify-center p-12 ${className || ''}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4 text-zinc-400">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">{description}</p>
      {(actionLabel && (actionHref || onAction)) && (
        <div className="mt-5">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="sm">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </Surface>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. ErrorState                                                              */
/* -------------------------------------------------------------------------- */
export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'An unexpected error occurred',
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Surface
      variant="default"
      padding="lg"
      rounded="2xl"
      className={`border-red-500/30 bg-red-950/10 text-center p-8 flex flex-col items-center ${className || ''}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-red-300/80 mt-1 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Try Again
        </Button>
      )}
    </Surface>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. LoadingState                                                            */
/* -------------------------------------------------------------------------- */
export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading cryptographic state...', className }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 space-y-3 ${className || ''}`}>
      <Loader2 className="w-8 h-8 text-[#00F59B] animate-spin" />
      <p className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{message}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. MoneyDisplay                                                            */
/* -------------------------------------------------------------------------- */
export interface MoneyDisplayProps {
  amount: number | string;
  currency?: string;
  variant?: 'large' | 'medium' | 'small';
  color?: 'default' | 'mint' | 'cyan' | 'amber' | 'muted';
  className?: string;
}

export function MoneyDisplay({
  amount,
  currency = 'INR',
  variant = 'medium',
  color = 'default',
  className,
}: MoneyDisplayProps) {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);

  const sizeClasses = {
    large: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    medium: 'text-xl sm:text-2xl font-bold tracking-tight',
    small: 'text-sm sm:text-base font-semibold',
  }[variant];

  const colorClasses = {
    default: 'text-white',
    mint: 'text-[#00F59B]',
    cyan: 'text-[#06B6D4]',
    amber: 'text-amber-400',
    muted: 'text-zinc-400',
  }[color];

  return (
    <span className={`font-sans ${sizeClasses} ${colorClasses} ${className || ''}`}>
      {formatted}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. BlockchainTx                                                            */
/* -------------------------------------------------------------------------- */
export interface BlockchainTxProps {
  txHash: string;
  chainId?: number | string;
  network?: string;
  status?: string;
  showLink?: boolean;
  className?: string;
}

export function BlockchainTx({
  txHash,
  chainId,
  network = 'Hardhat Testnet',
  status = 'CONFIRMED',
  showLink = true,
  className,
}: BlockchainTxProps) {
  const truncated = `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 6)}`;
  const explorerUrl = getExplorerTxUrl(chainId, txHash);

  return (
    <div className={`inline-flex items-center gap-2 font-mono text-xs ${className || ''}`}>
      <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-300">
        {truncated}
      </span>
      {network && (
        <span className="px-2 py-0.5 rounded-lg bg-[#6366F1]/10 text-[#818cf8] border border-[#6366F1]/20 text-[10px]">
          {network}
        </span>
      )}
      {showLink && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#06B6D4] hover:text-[#06B6D4]/80 flex items-center gap-1 underline"
        >
          View ↗
        </a>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. MilestoneStatus                                                         */
/* -------------------------------------------------------------------------- */
export function MilestoneStatus({
  status,
  sequence,
}: {
  status: string;
  sequence?: number;
}) {
  const getVariant = () => {
    switch (status) {
      case 'COMPLETED':
      case 'RELEASED':
        return 'emerald';
      case 'IN_PROGRESS':
        return 'amber';
      case 'PENDING':
        return 'slate';
      default:
        return 'slate';
    }
  };

  return (
    <Badge
      variant={getVariant() as any}
      dot
      pulse={status === 'IN_PROGRESS'}
      label={sequence ? `M${sequence}: ${status}` : status}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* 7. ProofStatus                                                             */
/* -------------------------------------------------------------------------- */
export function ProofStatus({
  status,
}: {
  status: 'PENDING' | 'PASS' | 'FLAG' | 'FAIL' | 'MANUAL_REVIEW' | string;
}) {
  switch (status) {
    case 'PASS':
      return <Badge variant="emerald" dot label="PASS" />;
    case 'FLAG':
      return <Badge variant="amber" dot pulse label="FLAG" />;
    case 'FAIL':
      return <Badge variant="rose" dot label="FAIL" />;
    case 'MANUAL_REVIEW':
      return <Badge variant="indigo" dot label="MANUAL REVIEW" />;
    default:
      return <Badge variant="slate" dot label={status || 'PENDING'} />;
  }
}

/* -------------------------------------------------------------------------- */
/* 8. ApprovalStatus                                                          */
/* -------------------------------------------------------------------------- */
export function ApprovalStatus({
  currentSignatures,
  requiredSignatures = 2,
  status,
}: {
  currentSignatures: number;
  requiredSignatures?: number;
  status?: string;
}) {
  const isReady = currentSignatures >= requiredSignatures;

  return (
    <div className="inline-flex items-center gap-2">
      <Badge
        variant={isReady ? 'emerald' : 'amber'}
        dot
        pulse={!isReady}
        label={`${currentSignatures} of ${requiredSignatures} Signatures`}
      />
      {status && (
        <span className="text-[11px] font-mono text-zinc-400">({status})</span>
      )}
    </div>
  );
}
