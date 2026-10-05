import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accessibility,
  HeartHandshake,
  Footprints,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Navigation,
  Compass,
  MapPin,
  ArrowRight,
  Info
} from 'lucide-react';
import { SmartScore } from '../components/common/SmartScore';
import { MapView } from '../components/map/MapView';
import { googleMapsService } from '../services/googleMapsService';
import { RouteOption } from '../types';

export const AccessibilityPage: React.FC = () => {
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('Peelamedu Tech Zone, Coimbatore');
  const [destination, setDestination] = useState('RS Puram DB Road, Coimbatore');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Load initial accessible corridor
  useEffect(() => {
    async function loadAccessibleCorridor() {
      setIsLoadingRoute(true);
      const computed = await googleMapsService.calculateRoutes(origin, destination);
      if (computed && computed.length > 0) {
        setRoutes(computed);
        setSelectedRouteId(computed[0].id);
      }
      setIsLoadingRoute(false);
    }
    loadAccessibleCorridor();
  }, []);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const accessibilityMetrics = [
    {
      title: 'Wheelchair Suitability',
      rating: 'High Suitability',
      score: 94,
      desc: 'Level sidewalks, certified curb ramps, and continuous paved surfaces along primary pedestrian corridors.',
      statusColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/10'
    },
    {
      title: 'Elderly & Senior Friendly',
      rating: 'Good Suitability',
      score: 88,
      desc: 'Frequent resting alcoves, shaded pedestrian walkways, and extended signal countdown times at intersections.',
      statusColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgGlow: 'bg-cyan-500/10'
    },
    {
      title: 'Pedestrian Walkability',
      rating: 'Moderate Suitability',
      score: 82,
      desc: 'Separated footpaths along arterial corridors; minor construction detours observed near service lanes.',
      statusColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgGlow: 'bg-amber-500/10'
    },
    {
      title: 'Step-Free Access',
      rating: '100% Step-Free',
      score: 96,
      desc: 'Zero mandatory stair ascents. Seamless ramp gradations under 1:12 slope ratio along the primary route.',
      statusColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/10'
    },
    {
      title: 'Road Surface Risk',
      rating: 'Low Risk',
      score: 90,
      desc: 'Uniform asphalt surfacing with minimal potholes or broken curb segments reported in active municipal telemetry.',
      statusColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/10'
    },
    {
      title: 'Audible & Visual Beacons',
      rating: 'Present at Key Junctions',
      score: 78,
      desc: 'Acoustic pedestrian crossing signals enabled at major arterial crosswalks.',
      statusColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      bgGlow: 'bg-cyan-500/10'
    }
  ];

  const obstacles = [
    {
      title: 'Temporary Footpath Narrowing',
      location: 'Avinashi Road near Peelamedu',
      severity: 'Low',
      note: 'Minor utility cabling on sidewalk; alternative 1.8m ramp path active.'
    },
    {
      title: 'Steep Curb Transition',
      location: 'DB Road North Junction',
      severity: 'Moderate',
      note: 'Slope exceeds 8%; use adjacent signalized crossing with level curb-cut.'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0f172a] via-[#131d31] to-[#0f172a] border border-cyan-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Accessibility className="w-3.5 h-3.5" />
            <span>Smart Accessibility & Inclusive Mobility</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Accessibility Intelligence Engine
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time evaluation of wheelchair paths, step-free access, elderly transit comfort, and urban obstacle mapping.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start text-xs text-slate-300">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              Step-Free Corridors Active
            </span>
            <span className="text-slate-500">•</span>
            <span>Indian Municipal Standards Compliant</span>
          </div>
        </div>

        {/* Overall Accessibility Score Card */}
        <div className="shrink-0 flex flex-col items-center p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl z-10 min-w-[200px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Accessibility Index
          </span>
          <div className="font-mono text-4xl font-black text-cyan-300">91/100</div>
          <span className="mt-2 text-xs font-semibold text-emerald-400">
            Highly Accessible Network
          </span>
        </div>
      </div>

      {/* 6 Clean Meaningful Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessibilityMetrics.map((m, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-[#0f172a]/95 border ${m.borderColor} shadow-xl space-y-2.5 relative overflow-hidden`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                {m.title}
              </h3>
              <span className="font-mono font-bold text-xs text-cyan-300">
                {m.score}/100
              </span>
            </div>

            <div className={`text-sm font-bold ${m.statusColor}`}>
              {m.rating}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {m.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Real Accessible Route on Google Map */}
      <div className="rounded-2xl bg-[#0f172a]/95 border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Recommended Accessible Route
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified step-free path with minimal gradient slope and continuous pedestrian infrastructure.
            </p>
          </div>

          <button
            onClick={() => navigate('/live-tracker')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <span>Track in Live Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="h-80 w-full rounded-xl overflow-hidden border border-slate-800 relative">
          <MapView
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            showTrafficOverlay={false}
          />
        </div>

        {activeRoute && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Corridor</span>
              <span className="font-bold text-white truncate block">{activeRoute.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Distance</span>
              <span className="font-mono font-bold text-cyan-300">{activeRoute.distanceKm} km</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Step-Free ETA</span>
              <span className="font-mono font-bold text-emerald-400">{activeRoute.eta}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Accessibility Rating</span>
              <span className="font-mono font-bold text-cyan-300">{activeRoute.accessibilityScore}/100</span>
            </div>
          </div>
        )}
      </div>

      {/* Reported Obstacles Section */}
      <div className="rounded-2xl bg-[#0f172a]/95 border border-slate-800 p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Active Urban Mobility Alerts & Obstacles
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {obstacles.map((obs, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{obs.title}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {obs.severity} Risk
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-cyan-400">
                <MapPin className="w-3 h-3" />
                <span>{obs.location}</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                {obs.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
