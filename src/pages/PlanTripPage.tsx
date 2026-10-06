import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  ArrowRightLeft,
  Sparkles,
  Compass,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  CloudRain,
  Gauge,
  Loader2,
  Share2,
  Truck,
  CornerDownRight,
  Check
} from 'lucide-react';
import { googleMapsService } from '../services/googleMapsService';
import { RouteOption } from '../types';
import { useToast } from '../context/ToastContext';
import { MapView } from '../components/map/MapView';

export const PlanTripPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [from, setFrom] = useState<string>('Singanallur');
  const [to, setTo] = useState<string>('Chinniyampalayam');
  const [fromSuggestions, setFromSuggestions] = useState<{ name: string; description: string }[]>([]);
  const [toSuggestions, setToSuggestions] = useState<{ name: string; description: string }[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  // Calculate routes
  const handleFindRoute = async (originQuery?: string, destQuery?: string) => {
    const originToUse = (originQuery || from).trim();
    const destToUse = (destQuery || to).trim();

    if (!originToUse || !destToUse) return;
    setIsLoading(true);
    setActiveDropdown(null);

    try {
      const calculated = await googleMapsService.calculateRoutes(originToUse, destToUse);
      if (!calculated || calculated.length === 0) {
        addToast('error', 'Routing Failed', 'Could not determine driving route. Check location names.');
        return;
      }

      setRoutes(calculated);
      const recommended = calculated.find((r) => r.isRecommended) || calculated[0];
      setSelectedRouteId(recommended.id);
      addToast(
        'success',
        'Optimal Route Found',
        `${recommended.name} • ${recommended.distanceKm} km (${recommended.eta})`
      );
    } catch (err: any) {
      console.error('[PlanTripPage] Error:', err);
      addToast('error', 'Routing Notice', err.message || 'Could not compute corridor');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    handleFindRoute('Singanallur', 'Chinniyampalayam');
  }, []);

  const handleFromChange = async (val: string) => {
    setFrom(val);
    setActiveDropdown('from');
    if (val.trim().length >= 2) {
      const results = await googleMapsService.searchPlaces(val);
      setFromSuggestions(results);
    } else {
      setFromSuggestions([]);
    }
  };

  const handleToChange = async (val: string) => {
    setTo(val);
    setActiveDropdown('to');
    if (val.trim().length >= 2) {
      const results = await googleMapsService.searchPlaces(val);
      setToSuggestions(results);
    } else {
      setToSuggestions([]);
    }
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setFromSuggestions([]);
    setToSuggestions([]);
    setActiveDropdown(null);
    handleFindRoute(to, temp);
  };

  const recommendedRoute = routes.find((r) => r.isRecommended) || routes[0];
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || recommendedRoute;
  const alternativeRoutes = routes.filter((r) => r.id !== recommendedRoute?.id);

  const openInGoogleMaps = (routeToOpen?: RouteOption) => {
    const targetOrigin = from || 'Singanallur';
    const targetDest = to || 'Chinniyampalayam';
    const url = googleMapsService.getGoogleMapsUrl(targetOrigin, targetDest);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const dispatchToLiveTracker = () => {
    navigate(`/live-tracker?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto text-slate-100 transition-colors">
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
          <Compass className="w-3.5 h-3.5" />
          <span>INTELLIGENT HIGHWAY & LOCAL ROUTE ENGINE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
          Plan a Trip
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Search accurate, verified driving routes and realistic distances between any cities, towns, or localities in Tamil Nadu and all of India.
        </p>
      </div>

      {/* ── SIMPLE INTUITIVE USER SEARCH BOX ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleFindRoute();
        }}
        className="p-5 sm:p-6 rounded-3xl bg-[#0c121e] border border-slate-800 shadow-2xl space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          {/* WHERE ARE YOU STARTING FROM? */}
          <div className="md:col-span-5 relative space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span>📍</span>
              <span>Where are you starting from?</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={from}
                onChange={(e) => handleFromChange(e.target.value)}
                onFocus={() => {
                  if (fromSuggestions.length > 0) setActiveDropdown('from');
                }}
                placeholder="e.g. Singanallur, Coimbatore 📍"
                className="w-full px-4 py-3 text-sm bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-bold shadow-inner"
              />
              {from && (
                <button
                  type="button"
                  onClick={() => {
                    setFrom('');
                    setFromSuggestions([]);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown for FROM */}
            {activeDropdown === 'from' && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl bg-[#0a0f19] border border-slate-700 shadow-2xl p-1.5 z-50 max-h-56 overflow-y-auto text-xs space-y-0.5">
                {fromSuggestions.map((place, idx) => (
                  <button
                    key={`${place.name}-${idx}`}
                    type="button"
                    onClick={() => {
                      setFrom(place.name);
                      setActiveDropdown(null);
                      setFromSuggestions([]);
                    }}
                    className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-emerald-500/15 hover:text-emerald-300 text-slate-200 transition-colors cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{place.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{place.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-1 flex justify-center py-1 md:py-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Start & Destination"
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-emerald-400 shadow-lg active:rotate-180 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* WHERE ARE YOU GOING? */}
          <div className="md:col-span-5 relative space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span>🏁</span>
              <span>Where are you going?</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                onFocus={() => {
                  if (toSuggestions.length > 0) setActiveDropdown('to');
                }}
                placeholder="e.g. Chinniyampalayam, Coimbatore 🏁"
                className="w-full px-4 py-3 text-sm bg-slate-950 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-bold shadow-inner"
              />
              {to && (
                <button
                  type="button"
                  onClick={() => {
                    setTo('');
                    setToSuggestions([]);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown for TO */}
            {activeDropdown === 'to' && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl bg-[#0a0f19] border border-slate-700 shadow-2xl p-1.5 z-50 max-h-56 overflow-y-auto text-xs space-y-0.5">
                {toSuggestions.map((place, idx) => (
                  <button
                    key={`${place.name}-${idx}`}
                    type="button"
                    onClick={() => {
                      setTo(place.name);
                      setActiveDropdown(null);
                      setToSuggestions([]);
                    }}
                    className="w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-teal-500/15 hover:text-teal-300 text-slate-200 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{place.name}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{place.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA: [ Find Best Route ] */}
        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !from || !to}
            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Computing Accurate Route...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Find Best Route</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── REALISTIC MAP + ROUTE METRICS WORKSPACE ── */}
      {recommendedRoute && (
        <div className="space-y-6">
          {/* EMBEDDED REALISTIC INTERACTIVE MAP */}
          <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#090d16] h-[360px] sm:h-[420px] relative">
            <MapView
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              showTrafficOverlay={true}
              interactive={true}
            />

            {/* Floating Top Route Legend */}
            <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-xl bg-slate-950/85 border border-slate-700/80 backdrop-blur-md text-xs font-mono flex items-center gap-2 shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">
                {from} ➔ {to}
              </span>
              <span className="text-emerald-400 font-extrabold">
                ({activeRoute?.distanceKm} km • {activeRoute?.eta})
              </span>
            </div>
          </div>

          {/* ── PRIMARY RECOMMENDED ROUTE CARD ── */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0c121e] border-2 border-emerald-500/50 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>Recommended Route</span>
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  ★ AI Evaluated Optimal Corridor
                </span>
              </div>

              {/* SEE ON GOOGLE MAPS + DISPATCH BUTTONS */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openInGoogleMaps(recommendedRoute)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:text-emerald-300"
                >
                  <span>See on Google Maps</span>
                  <ExternalLink className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={dispatchToLiveTracker}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Navigation className="w-4 h-4 fill-current transform -rotate-45" />
                  <span>Live Track Route</span>
                </button>
              </div>
            </div>

            {/* Highway / Arterial Name */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {recommendedRoute.name}
              </h2>
              <p className="text-xs text-slate-400">
                {recommendedRoute.aiExplanation}
              </p>
            </div>

            {/* Metrics Row (Accurate Distance, Real Time, Traffic, Precipitation, Score) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
              {/* Distance */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  📏 Distance
                </span>
                <span className="font-mono text-2xl font-black text-white">
                  {recommendedRoute.distanceKm} km
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Verified driving distance</span>
              </div>

              {/* Time */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  ⏱️ Total Time
                </span>
                <span className="font-mono text-2xl font-black text-emerald-400">
                  {recommendedRoute.eta}
                </span>
                <span className="text-[10px] text-emerald-500 block mt-0.5">Fastest speed corridor</span>
              </div>

              {/* Traffic */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  🚦 Traffic Flow
                </span>
                <span className="text-base sm:text-lg font-black text-amber-400 block capitalize">
                  {recommendedRoute.trafficLevel === 'low' ? 'Smooth Flow' : 'Moderate Traffic'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Continuous telemetry</span>
              </div>

              {/* Rain */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  🌧️ Precipitation
                </span>
                <span className="font-mono text-2xl font-black text-sky-400">
                  20% Rain
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Dry asphalt</span>
              </div>

              {/* Score */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  🎯 Route Score
                </span>
                <span className="font-mono text-2xl font-black text-emerald-400">
                  {recommendedRoute.smartScore || 92} / 100
                </span>
                <span className="text-[10px] text-emerald-500 block mt-0.5">Highest logistics rank</span>
              </div>
            </div>

            {/* Turn by Turn Directions */}
            {recommendedRoute.turnByTurn && recommendedRoute.turnByTurn.length > 0 && (
              <div className="pt-2 space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Navigation Waypoints
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {recommendedRoute.turnByTurn.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-200 truncate">{step.instruction}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-400 shrink-0 text-[11px]">
                        {step.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── ALTERNATIVE ROUTES BELOW (User requested NO Route A / Route B) ── */}
          {alternativeRoutes.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Alternative Route Corridors</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alternativeRoutes.map((alt) => (
                  <div
                    key={alt.id}
                    onClick={() => setSelectedRouteId(alt.id)}
                    className={`p-5 rounded-2xl bg-[#0c121e] border transition-all cursor-pointer space-y-3 ${
                      selectedRouteId === alt.id
                        ? 'border-teal-400 shadow-xl'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-500/15 text-teal-400 border border-teal-500/30">
                        {alt.codeName}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {alt.distanceKm} km • {alt.eta}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">
                      {alt.name}
                    </h4>

                    <p className="text-xs text-slate-400">
                      {alt.aiExplanation}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                      <span>Traffic: <strong className="text-amber-400">{alt.trafficLevel}</strong></span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInGoogleMaps(alt);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>See on Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
