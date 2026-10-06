import React from 'react';
import { RouteOption } from '../../types';
import { Clock, Navigation2, ShieldCheck, Sparkles, ChevronRight, Activity } from 'lucide-react';

interface RouteCardProps {
  route: RouteOption;
  isSelected: boolean;
  onSelect: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  onSelect
}) => {
  const statusLabel = route.isRecommended
    ? 'RECOMMENDED'
    : route.trafficLevel === 'heavy'
    ? 'HEAVY TRAFFIC'
    : 'ALTERNATIVE';

  const trafficBadgeColor =
    route.trafficLevel === 'heavy'
      ? 'bg-rose-500/15 text-rose-500 dark:text-rose-300 light:text-rose-700 border-rose-500/30'
      : route.trafficLevel === 'moderate'
      ? 'bg-amber-500/15 text-amber-500 dark:text-amber-300 light:text-amber-700 border-amber-500/30'
      : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 light:text-emerald-700 border-emerald-500/30';

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-2xl border transition-all duration-300 p-4 ${
        isSelected
          ? 'bg-slate-900/90 dark:bg-[#111822] light:bg-slate-50 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
          : 'bg-slate-900/60 dark:bg-[#0c1117]/90 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700 dark:hover:border-slate-700 light:hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* AI Recommended Ribbon */}
      {route.isRecommended && (
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3 h-3 text-slate-950 fill-current" />
          <span>RECOMMENDED ROUTE</span>
        </div>
      )}

      {/* Header Row */}
      <div className={`flex items-start justify-between gap-2 ${route.isRecommended ? 'mt-1' : ''}`}>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: route.color || (route.isRecommended ? '#10b981' : '#14b8a6') }}
            />
            <h4 className="text-sm font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight flex items-center gap-2">
              <span>{route.codeName || route.name}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  route.isRecommended
                    ? 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 light:text-emerald-700 border-emerald-500/30'
                    : 'bg-slate-800/80 dark:bg-slate-800 light:bg-slate-100 text-slate-300 dark:text-slate-300 light:text-slate-700 border-slate-700 dark:border-slate-700 light:border-slate-200'
                }`}
              >
                {statusLabel}
              </span>
            </h4>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5 ml-4.5 truncate max-w-[260px]">
            {route.name}
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex flex-col items-end shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-slate-950/60 dark:bg-[#0c1117] light:bg-slate-100 border border-slate-800 dark:border-slate-700 light:border-slate-200 text-right">
            <span className="text-[9px] text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider block font-semibold">
              Index
            </span>
            <span className="font-mono font-extrabold text-sm text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
              {route.smartScore}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid: Distance, ETA, Traffic */}
      <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/60 dark:bg-[#0c1117]/80 light:bg-slate-50 border border-slate-800/80 dark:border-slate-800 light:border-slate-200 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider block">
            Distance
          </span>
          <span className="font-mono font-extrabold text-white dark:text-white light:text-slate-900 text-sm">
            {route.distanceKm} km
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider block">
            ETA
          </span>
          <span className="font-mono font-extrabold text-emerald-400 dark:text-emerald-400 light:text-emerald-700 text-sm">
            {route.eta}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider block">
            Traffic
          </span>
          <span
            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border capitalize ${trafficBadgeColor}`}
          >
            {route.trafficLevel}
          </span>
        </div>
      </div>

      {/* Select Call-to-action */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-[11px]">
        <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 flex items-center gap-1 font-mono text-[10px]">
          <Activity className="w-3 h-3 text-emerald-400" />
          Status: <strong className="text-slate-200 dark:text-slate-200 light:text-slate-800">{statusLabel}</strong>
        </span>

        <span className="font-semibold text-emerald-400 dark:text-emerald-400 light:text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          <span>{isSelected ? 'Active Route' : 'Select'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
