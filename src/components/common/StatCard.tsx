import React, { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  subtitle?: string;
  glowColor?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  glowColor = 'cyan'
}) => {
  const glowStyles = {
    cyan: 'from-cyan-500/10 to-transparent border-cyan-500/20 text-cyan-400',
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/20 text-emerald-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-transparent border-rose-500/20 text-rose-400'
  }[glowColor];

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-slate-900/80 dark:bg-[#0f172a]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-5 shadow-sm transition-all duration-300 hover:border-slate-700">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${glowStyles} rounded-bl-full opacity-60 pointer-events-none transition-opacity duration-300 group-hover:opacity-100`} />

      <div className="relative flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-100 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200 shadow-inner">
          {icon}
        </div>
      </div>

      <div className="relative flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white dark:text-white light:text-slate-900 tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold ${
              isPositive ? 'text-emerald-500 dark:text-emerald-400 light:text-emerald-600' : 'text-rose-500 dark:text-rose-400 light:text-rose-600'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="relative text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-2 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};
