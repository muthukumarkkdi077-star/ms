import React, { useState, useEffect, useRef } from 'react';
import { RouteOption, FleetVehicle, VehicleStatus } from '../types';
import { routeService } from '../services/routeService';
import { vehicleTrackingService } from '../services/vehicleTrackingService';
import { simulationService, TrackingMode } from '../services/simulationService';
import { MapView } from '../components/map/MapView';
import { RoutePlanner } from '../components/route/RoutePlanner';
import { RouteCard } from '../components/route/RouteCard';
import { VehicleDetailPanel } from '../components/vehicle/VehicleDetailPanel';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Navigation,
  MapPin,
  ArrowRight,
  Radio,
  Truck,
  Search,
  Activity,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useLocation } from 'react-router-dom';

export const SmartRoutePage: React.FC = () => {
  const { addToast } = useToast();
  const location = useLocation();

  // State
  const [routes, setRoutes] = useState<RouteOption[]>(routeService.getAllRoutes());
  const [selectedRouteId, setSelectedRouteId] = useState<string>(() => {
    const all = routeService.getAllRoutes();
    return all.find((r) => r.isRecommended)?.id || all[0]?.id || '';
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(true);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('Coimbatore');
  const [currentDest, setCurrentDest] = useState('Madurai');

  // Race condition token
  const latestRequestIdRef = useRef<number>(0);

  // Tracking & Telemetry
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(simulationService.getMode());
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(vehicleTrackingService.getVehicles());
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleStatus>('all');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [trafficInfo, setTrafficInfo] = useState(routeService.getLiveTrafficInfo());
  const [lastSyncSeconds, setLastSyncSeconds] = useState(6);

  // Subscribe to vehicle tracking updates
  useEffect(() => {
    const unsubscribe = vehicleTrackingService.subscribeToVehicleUpdates((latestVehicles) => {
      setVehicles(latestVehicles);
      if (selectedVehicle) {
        const updatedSelected = latestVehicles.find((v) => v.vehicleId === selectedVehicle.vehicleId);
        if (updatedSelected) {
          setSelectedVehicle(updatedSelected);
        }
      }
    });

    const syncInterval = setInterval(() => {
      setLastSyncSeconds((prev) => (prev % 7) + 1);
    }, 1500);

    return () => {
      unsubscribe();
      clearInterval(syncInterval);
    };
  }, [selectedVehicle]);

  // Handle focus from route state (e.g. from LogisticsPage vehicle click)
  useEffect(() => {
    if (location.state && (location.state as any).focusVehicleId) {
      const targetId = (location.state as any).focusVehicleId;
      const found = vehicleTrackingService.getVehicleById(targetId);
      if (found) {
        setSelectedVehicle(found);
        addToast('info', 'Vehicle Focused', `Tracking active for ${found.vehicleId} (${found.driver})`);
      }
    }
  }, [location.state]);

  // Trigger search with immediate state invalidation and race-condition protection
  const handleFindRoute = async (params: { from: string; to: string }) => {
    const fromClean = params.from.trim();
    const toClean = params.to.trim();
    if (!fromClean || !toClean) return;

    setCurrentOrigin(fromClean);
    setCurrentDest(toClean);

    // CRITICAL: IMMEDIATELY wipe old route, old polylines, and old markers
    setRoutes([]);
    setSelectedRouteId('');
    setHasCalculated(false);
    setIsLoading(true);

    const requestId = ++latestRequestIdRef.current;

    try {
      const calculated = await routeService.calculateRoutes({
        from: fromClean,
        to: toClean
      });

      // Race condition protection: ensure older delayed response does NOT overwrite newest search
      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      if (!calculated || calculated.length === 0) {
        throw new Error('Unable to compute driving corridor. Please check place names.');
      }

      setRoutes(calculated);
      const rec = calculated.find((r) => r.isRecommended) || calculated[0];
      setSelectedRouteId(rec?.id || calculated[0]?.id || '');
      setHasCalculated(true);
      setTrafficInfo(routeService.getLiveTrafficInfo());

      // Focus leading vehicle on corridor
      const vehiclesNow = vehicleTrackingService.getVehicles();
      if (vehiclesNow.length > 0) {
        setSelectedVehicle(vehiclesNow[0]);
      }

      addToast(
        'success',
        'Corridor Evaluated & Live Tracking Active',
        `${rec?.name || 'Corridor'} • ${rec?.distanceKm} km • ETA: ${rec?.eta}`
      );
    } catch (err: any) {
      if (requestId !== latestRequestIdRef.current) return;
      setRoutes([]);
      setSelectedRouteId('');
      addToast(
        'error',
        'Route Calculation Failed',
        err.message || 'Unable to locate corridor between specified points. Please verify spelling.'
      );
    } finally {
      if (requestId === latestRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleOriginChange = (val: string) => {
    setCurrentOrigin(val);
    if (!val) {
      setRoutes([]);
      setSelectedRouteId('');
      setHasCalculated(false);
    }
  };

  const handleDestinationChange = (val: string) => {
    setCurrentDest(val);
    if (!val) {
      setRoutes([]);
      setSelectedRouteId('');
      setHasCalculated(false);
    }
  };

  const handleModeToggle = (mode: TrackingMode) => {
    setTrackingMode(mode);
    simulationService.setMode(mode);
    if (mode === 'simulation') {
      addToast('info', 'Simulation Mode Active', 'Realistic vehicle movement along active corridor.');
    } else {
      addToast('success', 'Live GPS Mode', 'Awaiting live telematics feed from IoT hardware.');
    }
  };

  // Filtered vehicles based on search and status filter
  const filteredVehicles = vehicles.filter((v) => {
    const matchesFilter = vehicleFilter === 'all' || v.status === vehicleFilter;
    const matchesSearch =
      !vehicleSearchQuery ||
      v.vehicleId.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
      v.driver.toLowerCase().includes(vehicleSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const fleetStats = vehicleTrackingService.getFleetStats();
  const currentSelectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0] || null;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0c1117] transition-colors">
      {/* 1. LARGE FULL-CANVAS MAP AREA */}
      <div className="absolute inset-0 z-0 h-full w-full">
        <MapView
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(id) => setSelectedRouteId(id)}
          vehicles={filteredVehicles}
          selectedVehicleId={selectedVehicle?.vehicleId || null}
          onSelectVehicle={(v) => setSelectedVehicle(v)}
          showTrafficOverlay={true}
          className="h-full w-full"
        />

        {/* LOADING STATE OVERLAY */}
        {isLoading && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#0c1117]/95 border border-emerald-500/40 rounded-3xl shadow-2xl backdrop-blur-xl max-w-md w-full mx-auto text-center">
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <Navigation className="w-8 h-8 animate-pulse text-emerald-400" />
                </div>
                <div className="absolute -inset-2 rounded-2xl border border-emerald-400/20 animate-ping opacity-25" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Calculating New Route...
              </h3>
              <p className="text-xs text-slate-300 mt-1 mb-4">
                Evaluating optimal corridor from <strong className="text-emerald-400">{currentOrigin}</strong> to <strong className="text-emerald-400">{currentDest}</strong>
              </p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 h-full rounded-full animate-pulse w-3/4 mx-auto" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. TOP HUD: GPS vs SIMULATION TOGGLE & LIVE TRAFFIC CARD */}
      <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-4 z-20 flex flex-wrap items-center justify-between sm:justify-end gap-2.5 pointer-events-auto">
        {/* Floating Live Traffic Card */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#0c1117]/95 dark:bg-[#0c1117]/95 light:bg-white border border-slate-800 shadow-2xl backdrop-blur-xl text-xs text-white dark:text-white light:text-slate-900">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: trafficInfo.statusColor }}
            />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span
                  className="text-[10px] font-extrabold uppercase tracking-wider"
                  style={{ color: trafficInfo.statusColor }}
                >
                  LIVE TRAFFIC
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  • {trafficInfo.routeSummary}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 font-medium">
                <span>{trafficInfo.status}</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-emerald-400 font-semibold">{trafficInfo.averageSpeedKmH} km/h avg</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-amber-400 font-semibold">{trafficInfo.congestionPercent}% congestion</span>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Mode vs SIMULATION Switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0c1117]/95 dark:bg-[#0c1117]/95 light:bg-white border border-slate-800 shadow-2xl backdrop-blur-xl text-xs">
          <button
            onClick={() => handleModeToggle('live')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
              trackingMode === 'live'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE GPS</span>
          </button>

          <button
            onClick={() => handleModeToggle('simulation')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
              trackingMode === 'simulation'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>SIMULATION MODE</span>
          </button>
        </div>
      </div>

      {/* 3. FLOATING LEFT PANEL: ROUTE PLANNER, VEHICLE FILTERS & ROUTE CARDS */}
      <div
        className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-20 transition-all duration-300 pointer-events-auto ${
          isLeftPanelCollapsed
            ? 'w-auto'
            : 'w-[calc(100%-1.5rem)] sm:w-[420px] max-h-[calc(100vh-8.5rem)] flex flex-col'
        }`}
      >
        {isLeftPanelCollapsed ? (
          /* Sleek Collapsed Pill */
          <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#0c1117]/95 dark:bg-[#0c1117]/95 light:bg-white border border-slate-800 shadow-2xl backdrop-blur-xl text-white dark:text-white light:text-slate-900">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[100px]">{currentOrigin}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <Navigation className="w-3.5 h-3.5 text-teal-400" />
              <span className="truncate max-w-[100px]">{currentDest}</span>
            </div>

            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Planner & Fleet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded Floating Navigation & Fleet Control Panel */
          <div className="rounded-2xl bg-[#0c1117]/95 dark:bg-[#0c1117]/95 light:bg-white border border-slate-800/90 dark:border-slate-800/90 light:border-slate-200 shadow-2xl backdrop-blur-xl flex flex-col max-h-[calc(100vh-8.5rem)] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md">
                  <Navigation className="w-3.5 h-3.5 fill-current transform -rotate-45" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-white dark:text-white light:text-slate-900 flex items-center gap-1.5">
                    <span>Logistics Dispatcher</span>
                    {trackingMode === 'simulation' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 dark:text-amber-300 light:text-amber-700 border border-amber-500/30">
                        SIMULATION
                      </span>
                    )}
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
                    {currentOrigin} → {currentDest} • Corridor Active
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsLeftPanelCollapsed(true)}
                title="Collapse panel"
                className="p-1.5 rounded-lg bg-slate-800/70 dark:bg-slate-800/70 light:bg-slate-100 hover:bg-slate-700 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-4">
              {/* Top Route Planner */}
              <RoutePlanner
                onFindRoute={handleFindRoute}
                onOriginChange={handleOriginChange}
                onDestinationChange={handleDestinationChange}
                isLoading={isLoading}
                initialFrom={currentOrigin}
                initialTo={currentDest}
              />

              {/* FLEET VEHICLE FILTER & SEARCH SECTION */}
              <div className="p-3 rounded-xl bg-slate-950/60 dark:bg-slate-950/60 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300 light:text-slate-700 text-[10px]">
                    <Truck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Filter Fleet Vehicles</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
                    {filteredVehicles.length} / {fleetStats.total} Units
                  </span>
                </div>

                {/* Search Vehicle ID */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={vehicleSearchQuery}
                    onChange={(e) => setVehicleSearchQuery(e.target.value)}
                    placeholder="Search vehicle ID (e.g. TN-38-AB-4521) or driver..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 dark:bg-slate-900 light:bg-white border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-lg text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  {vehicleSearchQuery && (
                    <button
                      onClick={() => setVehicleSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1">
                  {(['all', 'moving', 'idle', 'stopped', 'alert'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setVehicleFilter(st)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                        vehicleFilter === st
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 dark:bg-slate-900 light:bg-white text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 border border-slate-800 dark:border-slate-800 light:border-slate-300'
                      }`}
                    >
                      {st === 'all'
                        ? `All (${fleetStats.total})`
                        : `${st} (${
                            st === 'moving'
                              ? fleetStats.moving
                              : st === 'idle'
                              ? fleetStats.idle
                              : st === 'stopped'
                              ? fleetStats.stopped
                              : fleetStats.alerts
                          })`}
                    </button>
                  ))}
                </div>

                {/* Quick Fleet Vehicle Selection List (Horizontal chips) */}
                <div className="pt-1 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {filteredVehicles.slice(0, 6).map((v) => {
                    const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
                    const dotColor =
                      v.status === 'moving'
                        ? 'bg-emerald-400'
                        : v.status === 'idle'
                        ? 'bg-amber-400'
                        : v.status === 'alert'
                        ? 'bg-rose-400'
                        : 'bg-slate-400';

                    return (
                      <button
                        key={v.vehicleId}
                        onClick={() => setSelectedVehicle(v)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg font-mono text-[10px] font-bold border transition-all shrink-0 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 dark:text-emerald-300 light:text-emerald-700 shadow-md'
                            : 'bg-slate-900 dark:bg-slate-900 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        <span>{v.vehicleId}</span>
                        <span className="text-slate-400 font-normal">({v.speed}k)</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ROUTE COMPARISON CARDS */}
              {hasCalculated && !isLoading && routes.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 dark:text-slate-300 light:text-slate-700 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Route Comparison</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      OPTIMAL CORRIDOR
                    </span>
                  </div>

                  {routes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isSelected={selectedRouteId === route.id}
                      onSelect={() => setSelectedRouteId(route.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. SLIDING RIGHT DRAWER: LIVE VEHICLE DETAIL PANEL */}
      {selectedVehicle && (
        <div className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[420px] xl:w-[440px] shadow-2xl bg-[#0c1117] border-l border-slate-800 animate-slideLeft flex flex-col pointer-events-auto">
          <VehicleDetailPanel
            vehicle={selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
            onFocusMap={(v) => {
              addToast('info', 'Vehicle Centered', `Targeting ${v.vehicleId} on map.`);
            }}
          />
        </div>
      )}

      {/* 5. BOTTOM ROUTE PROGRESS & FLEET STATUS BAR */}
      <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-4 z-20 pointer-events-auto">
        <div className="p-3 sm:px-5 sm:py-2.5 rounded-2xl bg-[#0c1117]/95 dark:bg-[#0c1117]/95 light:bg-white border border-slate-800/90 dark:border-slate-800/90 light:border-slate-200 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-300 dark:text-slate-300 light:text-slate-700 text-xs">
          {/* Corridor Progress */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 dark:text-emerald-400 light:text-emerald-700 shrink-0">
              TRACKING CORRIDOR
            </span>
            <div className="flex items-center gap-2 font-bold text-white dark:text-white light:text-slate-900 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {currentOrigin}
              </span>
              <span className="text-slate-600 font-mono">●━━━━━━━━━━━━━━●</span>
              <span className="flex items-center gap-1 text-teal-400">
                <Navigation className="w-3 h-3 text-teal-400" />
                {currentDest}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-extrabold">
              {currentSelectedRoute ? `${currentSelectedRoute.distanceKm} km` : 'Awaiting Route'}
            </span>
            {currentSelectedRoute && (
              <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 font-mono text-amber-400 dark:text-amber-400 light:text-amber-700 font-semibold">
                ETA: {currentSelectedRoute.eta}
              </span>
            )}
          </div>

          {/* Telemetry Summary Stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px]">
            <span className="text-white dark:text-white light:text-slate-900 font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{fleetStats.total} fleet units</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-emerald-400 font-semibold">
              {fleetStats.moving} moving
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-amber-400 font-semibold">
              {fleetStats.idle} idle
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {fleetStats.alerts} alerts
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 font-mono text-[10px]">
              Sync: {lastSyncSeconds}s ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRoutePage;
