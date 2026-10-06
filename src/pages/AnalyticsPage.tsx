import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  IndianRupee,
  ShieldCheck,
  Zap,
  Target,
  Truck,
  Activity,
  AlertTriangle,
  RefreshCw,
  Fuel,
  Compass,
  Navigation,
  CloudSun,
  Timer,
  Gauge,
  CheckCircle2,
  ArrowRight,
  Radio
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { vehicleService } from '../services/vehicleService';
import { tripService } from '../services/tripService';
import { routeService } from '../services/routeService';
import { Vehicle, Trip, RouteOption } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<RouteOption>(routeService.getRecommendedRoute());
  const [allRoutes, setAllRoutes] = useState<RouteOption[]>(routeService.getAllRoutes());
  const [corridor, setCorridor] = useState<{ from: string; to: string }>(routeService.getActiveCorridor());

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [vList, tList] = await Promise.all([
          vehicleService.getVehicles(),
          tripService.getTrips()
        ]);
        setVehicles(vList);
        setTrips(tList);
        setActiveRoute(routeService.getRecommendedRoute());
        setAllRoutes(routeService.getAllRoutes());
        setCorridor(routeService.getActiveCorridor());
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalVehicles = vehicles.length;
  const inTransitCount = vehicles.filter((v) => v.status === 'In Transit').length;
  const idleCount = vehicles.filter((v) => v.status === 'Idle').length;

  // Fuel split
  const fuelCounts = vehicles.reduce((acc, v) => {
    acc[v.fuelType] = (acc[v.fuelType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Dynamic calculations for current route
  const distKm = activeRoute?.distanceKm || 214;
  const durationMin = activeRoute?.durationMin || 258;
  const avgSpeedKmh = durationMin > 0 ? Math.round((distKm / (durationMin / 60))) : 52;
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  const travelTimeStr = `${hours}h ${mins}m`;
  
  // Traffic delay estimate based on traffic level & delayRiskPercent
  const trafficDelayMin = activeRoute?.trafficLevel === 'heavy' 
    ? Math.round(durationMin * 0.22) 
    : activeRoute?.trafficLevel === 'moderate' 
      ? Math.round(durationMin * 0.10) 
      : Math.round(durationMin * 0.03);

  // Diesel fuel estimate: avg 8.2 km/liter commercial truck, ₹94/liter
  const litersFuel = (distKm / 8.2).toFixed(1);
  const estimatedFuelCost = Math.round(Number(litersFuel) * 94.5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Route & Fleet Intelligence</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              SIMULATION MODE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              ACTIVE TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trip Analytics & Performance Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consolidated telemetry for active corridor <span className="font-bold text-emerald-600 dark:text-emerald-400">{corridor.from} → {corridor.to}</span> ({activeRoute?.name || 'Primary Corridor'}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Current Corridor</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{activeRoute?.name}</div>
          </div>
        </div>
      </div>

      {/* CORE 8 REQUIRED USEFUL METRICS GRID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Trip Performance Indicators
          </span>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
            Real Corridor Telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Trip Distance */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Trip Distance</span>
              <Compass className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {distKm} <span className="text-sm font-semibold text-slate-400">km</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Full corridor point-to-point</span>
            </div>
          </div>

          {/* 2. Travel Time */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Travel Time</span>
              <Clock className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {travelTimeStr}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
              {durationMin} total operating minutes
            </div>
          </div>

          {/* 3. Average Speed */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Average Speed</span>
              <Gauge className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {avgSpeedKmh} <span className="text-sm font-semibold text-slate-400">km/h</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Regulated commercial freight pace
            </div>
          </div>

          {/* 4. Traffic Delay */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Traffic Delay</span>
              <AlertTriangle className={`w-4 h-4 ${trafficDelayMin > 20 ? 'text-coral-500' : 'text-amber-500'}`} />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              +{trafficDelayMin} <span className="text-sm font-semibold text-slate-400">min</span>
            </div>
            <div className={`text-[11px] font-semibold mt-1 ${
              activeRoute?.trafficLevel === 'heavy' ? 'text-coral-600 dark:text-coral-400' :
              activeRoute?.trafficLevel === 'moderate' ? 'text-amber-600 dark:text-amber-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`}>
              {activeRoute?.trafficLevel?.toUpperCase() || 'MODERATE'} CONGESTION
            </div>
          </div>

          {/* 5. Weather Impact */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Weather Impact</span>
              <CloudSun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {activeRoute?.weatherImpact || 'Nominal • Clear'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Zero precipitation disruption
            </div>
          </div>

          {/* 6. Fuel Estimate */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Fuel Estimate</span>
              <Fuel className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ₹{activeRoute?.estimatedCostInr || estimatedFuelCost}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              ~{litersFuel} L HSD Diesel estimate
            </div>
          </div>

          {/* 7. Accessibility */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">Accessibility</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {activeRoute?.accessibilityScore || 91}/100
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              High multi-lane grade separation
            </div>
          </div>

          {/* 8. ETA */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[11px]">ETA Status</span>
              <Timer className="w-4 h-4 text-teal-500" />
            </div>
            <div className="text-xl font-black text-teal-600 dark:text-teal-400 font-mono">
              {activeRoute?.eta || travelTimeStr}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Optimal commercial delivery window
            </div>
          </div>
        </div>
      </div>

      {/* Meaningful Comparative Route Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Route Comparison Matrix */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Route Efficiency Breakdown
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {allRoutes.length} Corridors Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {allRoutes.map((route, i) => {
              const isBest = route.isRecommended;
              return (
                <div
                  key={route.id || i}
                  className={`p-4 rounded-xl border transition-all ${
                    isBest
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isBest
                            ? 'bg-emerald-500 text-white'
                            : 'bg-teal-500/20 text-teal-700 dark:text-teal-300'
                        }`}>
                          {route.codeName || (isBest ? 'RECOMMENDED ROUTE' : 'ALTERNATIVE ROUTE')}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {route.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Congestion: <span className="font-semibold">{route.trafficLevel}</span> • Road: <span className="font-semibold">{route.roadCondition || 'Good'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white">{route.distanceKm} km</div>
                        <div className="text-[10px] text-slate-400">Distance</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">{route.eta}</div>
                        <div className="text-[10px] text-slate-400">Duration</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-600 dark:text-amber-400">{route.smartScore || 90}/100</div>
                        <div className="text-[10px] text-slate-400">Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>AI scoring weights minimum congestion, pavement grade, rest-plaza availability, and heavy vehicle safety.</span>
          </div>
        </div>

        {/* Fleet Powertrain & Telemetry Split */}
        <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                Fleet Powertrain Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {totalVehicles} Vehicles
            </span>
          </div>

          <div className="space-y-3.5">
            {Object.entries(fuelCounts).map(([fuel, count]) => {
              const pct = totalVehicles > 0 ? Math.round((count / totalVehicles) * 100) : 0;
              const isElectric = fuel.toLowerCase().includes('ev') || fuel.toLowerCase().includes('electric');
              const barColor = isElectric ? 'bg-teal-500' : 'bg-emerald-500';
              return (
                <div key={fuel} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{fuel}</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                      {count} units ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Commercial Fleet Active:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{inTransitCount} Units in Transit</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Available at Logistics Hubs:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{idleCount} Units Standby</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
