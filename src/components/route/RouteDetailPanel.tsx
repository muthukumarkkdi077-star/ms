import React, { useState } from 'react';
import { RouteOption } from '../../types';
import { SmartScore } from '../common/SmartScore';
import { TrafficBadge } from '../common/TrafficBadge';
import {
  Clock,
  Navigation,
  IndianRupee,
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
  CloudSun,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  Volume2,
  Share2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

interface RouteDetailPanelProps {
  route: RouteOption;
  onClose?: () => void;
  onStartNavigation?: () => void;
}

export const RouteDetailPanel: React.FC<RouteDetailPanelProps> = ({
  route,
  onClose,
  onStartNavigation
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'turns' | 'accessibility'>('overview');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleStartNav = () => {
    setIsNavigating(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#10b981', '#38bdf8']
    });
    addToast('success', `Navigation Started: ${route.codeName}`, `Turn-by-turn guidance active for ${route.distanceKm} km trip.`);
    if (onStartNavigation) onStartNavigation();
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] border-l border-slate-800 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: route.color }}
            />
            <h3 className="text-lg font-bold text-white tracking-tight">
              {route.codeName} Overview
            </h3>
            {route.isRecommended && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                AI CHOICE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{route.name}</p>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800/80 bg-slate-900/50 px-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Intelligence Overview
        </button>
        <button
          onClick={() => setActiveTab('turns')}
          className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'turns'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Turn by Turn ({route.turnByTurn?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('accessibility')}
          className={`px-3 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'accessibility'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Accessibility Audit
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-5 space-y-5 flex-1">
        {activeTab === 'overview' && (
          <>
            {/* Smart Score Highlight Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-[#131d31] to-[#0f172a] border border-cyan-500/30 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  AI Multi-Factor Score
                </span>
                <h4 className="text-xl font-extrabold text-white mt-0.5">
                  Route Smart Score
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Synthesized across time efficiency, accessibility ramps, live traffic telemetry and weather.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <TrafficBadge level={route.trafficLevel} />
                  <span className="text-xs text-slate-300 font-mono bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
                    ETA: {route.eta}
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                <SmartScore score={route.smartScore} size="md" />
              </div>
            </div>

            {/* Why This Route? AI Explanation Section */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Why this route?</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{route.aiExplanation}"
              </p>
            </div>

            {/* Primary Metrics 2x4 Grid */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Telemetry & Road Parameters
              </h5>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                {/* Distance */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Distance</span>
                  <span className="text-base font-bold font-mono text-white mt-0.5 block">
                    {route.distanceKm} km
                  </span>
                </div>

                {/* Travel Time */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Travel Time</span>
                  <span className="text-base font-bold font-mono text-white mt-0.5 block">
                    {route.durationMin} mins
                  </span>
                </div>

                {/* Traffic Level */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Traffic Level</span>
                  <span className="text-sm font-semibold text-slate-200 mt-1 block capitalize">
                    {route.trafficLevel} Congestion
                  </span>
                </div>

                {/* Road Condition */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Road Condition</span>
                  <span className="text-sm font-semibold text-emerald-400 mt-1 block">
                    {route.roadCondition}
                  </span>
                </div>

                {/* Weather */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Weather</span>
                  <span className="text-sm font-semibold text-slate-200 mt-1 block">
                    {route.weatherImpact === 'None' ? 'Optimal (Clear)' : route.weatherImpact}
                  </span>
                </div>

                {/* Accessibility Score */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Accessibility</span>
                  <span className="text-base font-bold font-mono text-cyan-400 mt-0.5 block">
                    {route.accessibilityScore} / 100
                  </span>
                </div>

                {/* Elderly Friendliness */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Elderly Friendliness</span>
                  <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                    {route.elderlyFriendlinessScore} / 100
                  </span>
                </div>

                {/* Delay Probability */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Delay Probability</span>
                  <span className={`text-base font-bold font-mono mt-0.5 block ${
                    route.delayRiskPercent > 20 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {route.delayRiskPercent}%
                  </span>
                </div>

                {/* Estimated Fuel Cost (Full Width) */}
                <div className="col-span-2 p-3 rounded-xl bg-gradient-to-r from-slate-900 to-[#131d31] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Estimated Fuel Cost</span>
                    <span className="text-lg font-bold font-mono text-white">
                      ₹{route.estimatedCostInr}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Efficient Route
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Turn-by-Turn Tab */}
        {activeTab === 'turns' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-400 mb-2">
              Step-by-step guidance optimized for step-free transitions:
            </div>
            {(route.turnByTurn || []).map((turn, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3"
              >
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Navigation className="w-3.5 h-3.5 transform -rotate-45" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white leading-snug">
                    {turn.instruction}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span>{turn.distance}</span>
                    {turn.accessibilityNote && (
                      <span className="text-cyan-400 font-medium">
                        • {turn.accessibilityNote}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accessibility Audit Tab */}
        {activeTab === 'accessibility' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300 uppercase">
                  Accessibility Score
                </span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {route.accessibilityScore} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div
                  className="bg-cyan-400 h-2 rounded-full"
                  style={{ width: `${route.accessibilityScore}%` }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audited Waypoint Features
              </h5>
              {route.features && route.features.length > 0 ? (
                route.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-start gap-3 ${
                      feature.status === 'safe'
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300'
                        : feature.status === 'warning'
                        ? 'bg-amber-500/5 border-amber-500/30 text-amber-300'
                        : 'bg-rose-500/5 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <span className="text-base">
                      {feature.status === 'safe' ? '✓' : '⚠'}
                    </span>
                    <div>
                      <h6 className="text-xs font-bold text-white">{feature.name}</h6>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 p-4 text-center bg-slate-900 rounded-xl">
                  No accessibility hazards logged along this corridor.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 border-t border-slate-800 bg-[#0f172a] sticky bottom-0 z-10 flex gap-2">
        <button
          onClick={handleStartNav}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.99]"
        >
          <Navigation className="w-4 h-4 fill-current" />
          <span>{isNavigating ? 'Navigation Active' : 'Start Smart Navigation'}</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            addToast('info', 'Route Copied', 'Share link copied to clipboard.');
          }}
          title="Share Route"
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
