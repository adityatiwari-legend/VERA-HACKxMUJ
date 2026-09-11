'use client';

import React from 'react';
import { Printer } from 'lucide-react';

export const PrintButton: React.FC = () => {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider bg-[#00F59B] hover:bg-[#00F59B]/90 text-black shadow-[0_0_16px_rgba(0,245,155,0.2)] transition-all"
    >
      <Printer className="w-4 h-4" />
      Print / Save as PDF
    </button>
  );
};
