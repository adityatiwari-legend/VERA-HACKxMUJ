import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: string;
  accent?: 'default' | 'mint' | 'cyan' | 'indigo' | 'amber';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  accent = 'default',
  className = '',
}) => {
  const getAccentClass = () => {
    switch (accent) {
      case 'mint':
        return 'text-[#00F59B]';
      case 'cyan':
        return 'text-[#06B6D4]';
      case 'indigo':
        return 'text-[#6366F1]';
      case 'amber':
        return 'text-[#F59E0B]';
      default:
        return 'text-white';
    }
  };

  return (
    <div
      className={`bg-[#111113] rounded-xl border border-white/[0.08] p-5 shadow-sm transition-all hover:border-white/[0.16] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-medium">
            {label}
          </span>
          <div className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight truncate ${getAccentClass()}`}>
            {value}
          </div>
          {subtext && (
            <p className="text-xs text-zinc-400 font-normal leading-relaxed pt-0.5">
              {subtext}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-300 shrink-0">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-xs font-mono text-[#00F59B]">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
