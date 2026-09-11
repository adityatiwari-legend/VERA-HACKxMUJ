import React from 'react';
import { CampaignStatus } from '@/types';

interface StatusBadgeProps {
  status: CampaignStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
      case 'DRAFT':
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/10';
      case 'PAUSED':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-500/10';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ring-1 ring-inset ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {status}
    </span>
  );
};
