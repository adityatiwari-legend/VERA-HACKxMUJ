import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  className = '',
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-xs font-semibold text-zinc-400">
          {label && <span>{label}</span>}
          {showPercentage && <span className="text-[#00F59B] font-mono">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
        <div
          className="bg-gradient-to-r from-[#00F59B] to-[#06B6D4] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(0,245,155,0.3)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
