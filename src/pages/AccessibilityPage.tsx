import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Navigation,
  Compass,
  Sparkles,
  ShieldCheck,
  Footprints
} from 'lucide-react';
import { MapView } from '../components/map/MapView';
import { googleMapsService } from '../services/googleMapsService';
import { routeService } from '../services/routeService';
import { RouteOption } from '../types';

export const AccessibilityPage: React.FC = () => {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState<RouteOption[]>(routeService.getAllRoutes());
  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => {
    const all = routeService.getAllRoutes();
    return all.find((r) => r.isRecommended)?.id || all[0]?.id || '';
  });

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Simplified Real-World Metrics as requested
  const realWorldMetrics = [
    {
      label: 'Wheelchair Suitability',
      value: 'Excellent',
      rating: 'Certified barrier-free access',
      color: 'text-emerald-400',
      badge: 'Score: 95/100',
      statusBg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Footpath Condition',
      value: 'Good',
      rating: 'Uniform asphalt sidewalk',
      color: 'text-emerald-400',
      badge: 'Score: 88/100',
      statusBg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Road Crossing Safety',
      value: 'Moderate',
      rating: 'Signals present at major junctions',
      color: 'text-amber-400',
      badge: 'Score: 78/100',
      statusBg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Ramp Availability',
      value: 'Good',
      rating: 'Transition curb cuts active',
      color: 'text-emerald-400',
      badge: 'Score: 92/100',
      statusBg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Accessibility Risks',
      value: '2 Detected',
      rating: 'Peelamedu narrow curb & flyover work',
      color: 'text-rose-400',
      badge: 'Requires Caution',
      statusBg: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      label: 'Overall Compliance',
      value: 'Grade A',
      rating: 'Logistics cargo & step-free compliant',
      color: 'text-teal-400',
      badge: '91/100 Index',
      statusBg: 'bg-teal-500/10 border-teal-500/20'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors">
      {/* Executive Header */}
      <div className="rounded-3xl bg-slate-900/90 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 light:bg-emerald-50 border border-emerald-500/30 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 text-xs font-semibold">
            <Accessibility className="w-3.5 h-3.5" />
            <span>Inclusive Logistics & Route Compliance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
            Corridor Accessibility Evaluation
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
            Real-world audit of wheelchair suitability, sidewalk condition, road crossing safety, ramp cuts, and corridor hazards.
          </p>
        </div>

        {/* Big Score Card */}
        <div className="shrink-0 flex flex-col items-center p-6 rounded-2xl bg-slate-950/60 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 min-w-[210px] text-center shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500 mb-1">
            Accessibility Score
          </span>
          <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
            91<span className="text-xl text-slate-500">/100</span>
          </div>
          <span className="mt-2 text-xs font-bold text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
            Certified Step-Free
          </span>
        </div>
      </div>

      {/* 6 Clean Actionable Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {realWorldMetrics.map((m, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/90 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider">
                {m.label}
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${m.statusBg} ${m.color}`}>
                {m.badge}
              </span>
            </div>

            <div className={`text-xl font-black ${m.color}`}>
              {m.value}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600">
              {m.rating}
            </p>
          </div>
        ))}
      </div>

      {/* Accessible Corridor Map View */}
      <div className="rounded-3xl bg-slate-900/90 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-extrabold text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
                Audited Corridor Map
              </h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">
              {activeRoute ? `${activeRoute.name} • ${activeRoute.distanceKm} km` : 'Active Corridor Preview'}
            </p>
          </div>

          <button
            onClick={() => navigate('/smart-route')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Open Smart Route Dispatcher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-800 dark:border-slate-800 light:border-slate-200 relative shadow-inner">
          <MapView
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            showTrafficOverlay={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPage;
