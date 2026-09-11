'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CampaignStatus } from '@/types';
import { Play, Pause, CheckCheck, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

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
      <span className="text-xs font-mono text-zinc-500 italic">
        Status is terminal ({currentStatus}). No further status transitions permitted.
      </span>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {currentStatus === 'DRAFT' && (
          <button
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#00F59B] hover:bg-[#00F59B]/90 text-black transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Activate Campaign
          </button>
        )}

        {currentStatus === 'ACTIVE' && (
          <>
            <button
              onClick={() => handleStatusChange('PAUSED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
              Pause Campaign
            </button>
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#06B6D4]/10 border border-[#06B6D4]/30 hover:bg-[#06B6D4]/20 text-[#06B6D4] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCheck className="w-3.5 h-3.5" />}
              Mark Completed
            </button>
          </>
        )}

        {currentStatus === 'PAUSED' && (
          <button
            onClick={() => handleStatusChange('ACTIVE')}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-[#00F59B] hover:bg-[#00F59B]/90 text-black transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Resume Active
          </button>
        )}

        <button
          onClick={() => handleStatusChange('CANCELLED')}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-3.5 h-3.5" />
          Cancel Campaign
        </button>
      </div>
    </div>
  );
};
