'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export const PrintButton: React.FC = () => {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all"
    >
      <Printer className="w-4 h-4" />
      Print / Save as PDF
    </button>
  );
};
