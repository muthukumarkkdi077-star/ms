import React, { useState, useEffect } from 'react';
import { RouteOption, FleetVehicle, VehicleStatus } from '../types';
import { routeService } from '../services/routeService';
import { vehicleTrackingService } from '../services/vehicleTrackingService';
import { simulationService, TrackingMode } from '../services/simulationService';
import { MapView } from '../components/map/MapView';
import { RoutePlanner } from '../components/route/RoutePlanner';
import { RouteCard } from '../components/route/RouteCard';
import { VehicleDetailPanel } from '../components/vehicle/VehicleDetailPanel';
import { LoadingState } from '../components/common/LoadingState';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Compass,
  Navigation,
  Clock,
  ShieldCheck,
  AlertTriangle,
  X,
  MapPin,
  ArrowRight,
  Radio,
  Truck,
  Search,
  Filter,
  Activity,
  Layers,
  Zap,
  Gauge
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { useLocation } from 'react-router-dom';

export const SmartRoutePage: React.FC = () => {
  const { addToast } = useToast();
  const location = useLocation();

  // State
  const [routes, setRoutes] = useState<RouteOption[]>(routeService.getAllRoutes());
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_b');
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(true);
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [currentOrigin, setCurrentOrigin] = useState('Coimbatore');
  const [currentDest, setCurrentDest] = useState('Madurai');

  // Tracking & Telemetry
  const [trackingMode, setTrackingMode] = useState<TrackingMode>(simulationService.getMode());
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(vehicleTrackingService.getVehicles());
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleStatus>('all');
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [trafficInfo, setTrafficInfo] = useState(routeService.getLiveTrafficInfo());
  const [lastSyncSeconds, setLastSyncSeconds] = useState(8);

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
      setLastSyncSeconds((prev) => (prev % 9) + 1);
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

  // Trigger search with 4-step loading sequence
  const handleFindRoute = async (params: { from: string; to: string }) => {
    setCurrentOrigin(params.from);
    setCurrentDest(params.to);
    setIsLoading(true);
    setHasCalculated(false);
  };

  const handleLoadingComplete = async () => {
    const calculated = await routeService.calculateRoutes({
      from: currentOrigin,
      to: currentDest
    });
    setRoutes(calculated);
    setSelectedRouteId('route_b');
    setIsLoading(false);
    setHasCalculated(true);
    setTrafficInfo(routeService.getLiveTrafficInfo());

    // Automatically select the leading vehicle on the corridor
    const leading = vehicleTrackingService.getVehicleById('RM-204');
    if (leading) setSelectedVehicle(leading);

    addToast(
      'success',
      'Corridor Evaluated & Live Tracking Active',
      `Best Route (NH 83) selected • 46 fleet units synchronized.`
    );
  };

  const handleModeToggle = (mode: TrackingMode) => {
    setTrackingMode(mode);
    simulationService.setMode(mode);
    if (mode === 'simulation') {
      addToast('info', 'Demo Simulation Active', 'Smooth route interpolation and real-time vehicle movement active.');
    } else {
      addToast('success', 'Live GPS Mode', 'Awaiting live telematics feed from vehicle IoT hardware.');
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
  const currentSelectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#090d16]">
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
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <LoadingState onComplete={handleLoadingComplete} />
          </div>
        )}
      </div>

      {/* 2. TOP HUD: GPS vs DEMO SIMULATION TOGGLE & LIVE TRAFFIC CARD */}
      <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-4 z-20 flex flex-wrap items-center justify-between sm:justify-end gap-2.5 pointer-events-auto">
        {/* Floating Live Traffic Card */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-[#090d16]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-xs text-white">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                  LIVE TRAFFIC
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  • {trafficInfo.routeSummary}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 font-medium">
                <span>{trafficInfo.status}</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-cyan-300">{trafficInfo.averageSpeedKmH} km/h avg</span>
                <span className="text-slate-500">•</span>
                <span className="font-mono text-amber-300">{trafficInfo.congestionPercent}% congestion</span>
              </div>
            </div>
          </div>
        </div>

        {/* GPS Mode vs DEMO SIMULATION Switch */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090d16]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-xs">
          <button
            onClick={() => handleModeToggle('live')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
              trackingMode === 'live'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE GPS</span>
          </button>

          <button
            onClick={() => handleModeToggle('simulation')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
              trackingMode === 'simulation'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            <span>DEMO SIMULATION</span>
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
          <div className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#090d16]/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-white">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[100px]">{currentOrigin}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[100px]">{currentDest}</span>
            </div>

            <button
              onClick={() => setIsLeftPanelCollapsed(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Planner & Fleet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Expanded Floating Navigation & Fleet Control Panel */
          <div className="rounded-2xl bg-[#090d16]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl flex flex-col max-h-[calc(100vh-8.5rem)] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
                  <Navigation className="w-3.5 h-3.5 fill-current transform -rotate-45" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <span>Live Tracker Command</span>
                    {trackingMode === 'simulation' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        SIMULATION
                      </span>
                    )}
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {currentOrigin} → {currentDest} • 46 Fleet Units
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsLeftPanelCollapsed(true)}
                title="Collapse panel"
                className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-4">
              {/* Top Route Planner */}
              <RoutePlanner
                onFindRoute={handleFindRoute}
                isLoading={isLoading}
                initialFrom={currentOrigin}
                initialTo={currentDest}
              />

              {/* FLEET VEHICLE FILTER & SEARCH SECTION */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300 text-[10px]">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Filter Fleet Vehicles</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-300">
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
                    placeholder="Search vehicle ID (e.g. RM-204) or driver..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
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
                          ? 'bg-cyan-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {st === 'all' ? `All (${fleetStats.total})` : `${st} (${st === 'moving' ? fleetStats.moving : st === 'idle' ? fleetStats.idle : st === 'stopped' ? fleetStats.stopped : fleetStats.alerts})`}
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
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
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

              {/* 3 ROUTE COMPARISON CARDS */}
              {hasCalculated && !isLoading && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Route Comparison</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      TRAFFIC_AWARE_OPTIMAL
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

      {/* 4. SLIDING RIGHT DRAWER: LIVE VEHICLE DETAIL PANEL WITH SPEEDOMETER */}
      {selectedVehicle && (
        <div className="absolute top-0 right-0 bottom-0 z-30 w-full sm:w-[420px] xl:w-[440px] shadow-2xl bg-[#0f172a] border-l border-slate-800 animate-slideLeft flex flex-col pointer-events-auto">
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
        <div className="p-3 sm:px-5 sm:py-2.5 rounded-2xl bg-[#090d16]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-300 text-xs">
          {/* Corridor Progress */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 shrink-0">
              TRACKING ROUTE
            </span>
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {currentOrigin}
              </span>
              <span className="text-slate-600 font-mono">●━━━━━━━━━━━━━━●</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Navigation className="w-3 h-3 text-cyan-400" />
                {currentDest}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 font-mono text-cyan-300 font-extrabold">
              {currentSelectedRoute.distanceKm} km
            </span>
          </div>

          {/* Telemetry Summary Stats */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px]">
            <span className="text-white font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{fleetStats.total} vehicles detected</span>
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
              Last sync: {lastSyncSeconds} sec ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRoutePage;
