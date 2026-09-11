import React from 'react';

export default function GlobalLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 pt-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-20 bg-[#111113] rounded-xl border border-zinc-800/80 p-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-6 w-64 bg-zinc-800/60 rounded" />
        </div>
        <div className="h-9 w-28 bg-zinc-800 rounded-lg" />
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-[#111113] rounded-xl border border-zinc-800/80 p-4 space-y-2">
            <div className="h-3 w-24 bg-zinc-800 rounded" />
            <div className="h-7 w-32 bg-zinc-800/80 rounded" />
            <div className="h-3 w-20 bg-zinc-800/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="h-80 bg-[#111113] rounded-xl border border-zinc-800/80 p-6 space-y-4">
        <div className="h-5 w-48 bg-zinc-800 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[#18181B] rounded-lg border border-zinc-800/60 flex items-center justify-between px-4">
              <div className="h-4 w-40 bg-zinc-800 rounded" />
              <div className="h-4 w-20 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
