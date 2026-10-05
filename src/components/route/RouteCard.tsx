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
    ? 'BEST ROUTE'
    : route.trafficLevel === 'heavy'
    ? 'HEAVY TRAFFIC'
    : 'ALTERNATIVE';

  const trafficBadgeColor =
    route.trafficLevel === 'heavy'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
      : route.trafficLevel === 'moderate'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  return (
    <div
      onClick={onSelect}
      className={`group relative cursor-pointer rounded-2xl border transition-all duration-300 p-4 ${
        isSelected
          ? 'bg-[#131d31] border-cyan-400/90 shadow-xl shadow-cyan-950/50 ring-1 ring-cyan-500/40'
          : 'bg-[#0f172a]/90 border-slate-800/80 hover:border-slate-700 hover:bg-[#131d31]/60'
      }`}
    >
      {/* AI Recommended Ribbon */}
      {route.isRecommended && (
        <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-md shadow-cyan-500/30">
          <Sparkles className="w-3 h-3 text-slate-950 fill-current" />
          <span>AI RECOMMENDED</span>
        </div>
      )}

      {/* Header Row */}
      <div className={`flex items-start justify-between gap-2 ${route.isRecommended ? 'mt-1' : ''}`}>
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: route.color }}
            />
            <h4 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{route.codeName}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  route.isRecommended
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : route.trafficLevel === 'heavy'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {statusLabel}
              </span>
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 ml-4.5 truncate max-w-[260px]">
            {route.name}
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex flex-col items-end shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-right shadow-inner">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
              Score
            </span>
            <span className="font-mono font-extrabold text-base text-cyan-300">
              {route.smartScore}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid: Distance, ETA, Traffic */}
      <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Distance</span>
          <span className="font-mono font-extrabold text-white text-sm">
            {route.distanceKm} km
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ETA</span>
          <span className="font-mono font-extrabold text-cyan-300 text-sm">
            {route.eta}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Traffic</span>
          <span
            className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border capitalize ${trafficBadgeColor}`}
          >
            {route.trafficLevel}
          </span>
        </div>
      </div>

      {/* Select Call-to-action */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
        <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
          <Activity className="w-3 h-3 text-cyan-400" />
          Status: <strong className="text-slate-200">{statusLabel}</strong>
        </span>

        <span className="font-semibold text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          <span>{isSelected ? 'Selected' : 'Select'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
