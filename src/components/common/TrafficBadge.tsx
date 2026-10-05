import React from 'react';

interface TrafficBadgeProps {
  level: 'low' | 'moderate' | 'heavy';
  showDot?: boolean;
}

export const TrafficBadge: React.FC<TrafficBadgeProps> = ({ level, showDot = true }) => {
  const configs = {
    low: {
      label: 'Low Traffic',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400 shadow-emerald-400/50'
    },
    moderate: {
      label: 'Moderate Traffic',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400 shadow-amber-400/50'
    },
    heavy: {
      label: 'Heavy Traffic',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400 shadow-rose-400/50'
    }
  }[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${configs.bg}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${configs.dot} animate-pulse shadow-sm`}
        />
      )}
      {configs.label}
    </span>
  );
};
