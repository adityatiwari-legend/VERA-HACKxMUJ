import React from 'react';

export default function CampaignsLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-zinc-800 rounded" />
          <div className="h-7 w-64 bg-zinc-800/70 rounded" />
          <div className="h-3 w-48 bg-zinc-800/40 rounded" />
        </div>
        <div className="h-9 w-32 bg-zinc-800 rounded-lg" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="h-14 bg-[#111113] rounded-xl border border-zinc-800 p-3 flex items-center justify-between gap-4">
        <div className="h-8 w-64 bg-zinc-800 rounded-lg" />
        <div className="h-8 w-48 bg-zinc-800 rounded-lg" />
      </div>

      {/* Campaign Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-[#111113] rounded-xl border border-zinc-800 p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-zinc-800 rounded" />
              <div className="h-5 w-4/5 bg-zinc-800/80 rounded" />
              <div className="h-3 w-full bg-zinc-800/40 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-zinc-800 rounded-full" />
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-zinc-800 rounded" />
                <div className="h-3 w-16 bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="h-8 bg-[#18181B] rounded-lg border border-zinc-800/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
