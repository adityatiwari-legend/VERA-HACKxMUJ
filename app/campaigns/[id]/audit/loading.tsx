import React from 'react';

export default function AuditLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-32 bg-[#111113] rounded-xl border border-zinc-800 p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-3 w-36 bg-zinc-800 rounded" />
          <div className="h-7 w-80 bg-zinc-800/80 rounded" />
        </div>
        <div className="h-3 w-48 bg-zinc-800/40 rounded" />
      </div>

      {/* 6 Financial Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-[#111113] rounded-xl border border-zinc-800 p-3.5 space-y-2">
            <div className="h-2.5 w-16 bg-zinc-800 rounded" />
            <div className="h-6 w-24 bg-zinc-800/80 rounded" />
          </div>
        ))}
      </div>

      {/* Fund Trail Timeline Skeleton */}
      <div className="h-64 bg-[#111113] rounded-xl border border-zinc-800 p-6 space-y-4">
        <div className="h-4 w-40 bg-zinc-800 rounded" />
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="h-24 bg-[#18181B] rounded-lg border border-zinc-800/60 p-2 space-y-1.5 flex flex-col items-center justify-center">
              <div className="h-5 w-5 bg-zinc-800 rounded-full" />
              <div className="h-2.5 w-12 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
