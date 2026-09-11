'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignStatus } from '@/types';
import { Play, Pause, CheckCheck, XCircle, AlertTriangle } from 'lucide-react';

interface CampaignStatusActionsProps {
  campaignId: string;
  currentStatus: CampaignStatus;
}

export const CampaignStatusActions: React.FC<CampaignStatusActionsProps> = ({
  campaignId,
  currentStatus,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: CampaignStatus) => {
    if (!confirm(`Are you sure you want to change status to "${newStatus}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') {
    return (
      <span className="text-xs text-slate-400 italic">
        Status is terminal ({currentStatus}). No further status transitions permitted.
      </span>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {currentStatus === 'DRAFT' && (
          <button
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Activate Campaign
          </button>
        )}

        {currentStatus === 'ACTIVE' && (
          <>
            <button
              onClick={() => handleStatusChange('PAUSED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause Campaign
            </button>
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark Completed
            </button>
          </>
        )}

        {currentStatus === 'PAUSED' && (
          <button
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Resume Active
          </button>
        )}

        <button
          onClick={() => handleStatusChange('CANCELLED')}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel Campaign
        </button>
      </div>
    </div>
  );
};
