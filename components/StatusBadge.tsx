import React from 'react';

export type UnifiedStatus =
  | 'ACTIVE'
  | 'DRAFT'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'LOCKED'
  | 'IN_PROGRESS'
  | 'IN PROGRESS'
  | 'PROOF_SUBMITTED'
  | 'PROOF SUBMITTED'
  | 'UNDER_REVIEW'
  | 'UNDER REVIEW'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'RELEASED'
  | 'REFUNDED'
  | 'FAILED'
  | 'CONFIRMED'
  | 'PENDING'
  | string;

interface StatusBadgeProps {
  status: UnifiedStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'sm',
}) => {
  const normalized = (status || '').toUpperCase().replace(/_/g, ' ');

  // Return specific subtle styles based on semantic category
  const getStyle = () => {
    switch (normalized) {
      case 'APPROVED':
      case 'RELEASED':
      case 'CONFIRMED':
      case 'ACTIVE':
        return {
          dot: 'bg-[#00F59B]',
          badge: 'bg-[#00F59B]/10 text-[#00F59B] border-[#00F59B]/25',
        };
      case 'IN PROGRESS':
      case 'COMPLETED':
        return {
          dot: 'bg-[#06B6D4]',
          badge: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/25',
        };
      case 'PROOF SUBMITTED':
      case 'UNDER REVIEW':
      case 'SUBMITTED':
      case 'PENDING':
        return {
          dot: 'bg-[#F59E0B]',
          badge: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/25',
        };
      case 'LOCKED':
        return {
          dot: 'bg-[#6366F1]',
          badge: 'bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/25',
        };
      case 'REJECTED':
      case 'FAILED':
      case 'CANCELLED':
        return {
          dot: 'bg-[#EF4444]',
          badge: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25',
        };
      case 'REFUNDED':
        return {
          dot: 'bg-purple-400',
          badge: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
        };
      case 'PAUSED':
      case 'DRAFT':
      default:
        return {
          dot: 'bg-zinc-400',
          badge: 'bg-white/[0.04] text-zinc-300 border-white/[0.08]',
        };
    }
  };

  const { dot, badge } = getStyle();

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 tracking-wider',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono font-medium border ${badge} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{normalized}</span>
    </span>
  );
};

export default StatusBadge;
