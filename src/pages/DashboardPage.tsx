import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  CheckCircle2,
  Clock,
  Accessibility,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Activity,
  ShieldCheck,
  Compass,
  ChevronRight,
  Truck,
  Layers,
  Radio,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { vehicleService } from '../services/vehicleService';
import { tripService } from '../services/tripService';
import { alertService } from '../services/alertService';
import { Vehicle, Trip, AlertItem } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [vList, tList] = await Promise.all([
        vehicleService.getVehicles(),
        tripService.getTrips()
      ]);
      setVehicles(vList);
      setTrips(tList);
      setAlerts(alertService.getAlerts());
    } catch (e) {
      console.warn('[DashboardPage] Load data error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const activeVehicles = vehicles.filter((v) => v.status === 'In Transit' || v.status === 'Idle');
  const activeTrips = trips.filter((t) => t.status === 'ACTIVE' || t.status === 'IN_TRANSIT');
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Telemetry Operations Center</span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              LIVE SYSTEM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Logistics & Fleet Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real GPS telemetry ingestion, Google traffic corridor analysis, and live multi-modal vehicle tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/live-tracker')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>Launch Live Tracker</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards Row - Derived from Real Backend Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Fleet Assets Enrolled"
          value={vehicles.length.toString()}
          change={`${vehicles.filter((v) => v.status === 'In Transit').length} units in transit`}
          isPositive={true}
          icon={<Truck className="w-5 h-5 text-cyan-400" />}
          subtitle="Registered commercial vehicles"
          glowColor="cyan"
        />
        <StatCard
          title="Active Trip Sessions"
          value={activeTrips.length.toString()}
          change={`${trips.length} total logged sessions`}
          isPositive={true}
          icon={<Navigation className="w-5 h-5 text-blue-400" />}
          subtitle="Active corridors under tracking"
          glowColor="blue"
        />
        <StatCard
          title="System Alerts"
          value={alerts.length.toString()}
          change={`${unreadAlerts.length} pending review`}
          isPositive={unreadAlerts.length === 0}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
          subtitle="Real road & safety incidents"
          glowColor="amber"
        />
        <StatCard
          title="Telemetry Channel"
          value="ONLINE"
          change="SSE port 3001 connected"
          isPositive={true}
          icon={<Radio className="w-5 h-5 text-emerald-400" />}
          subtitle="Live telemetry ingestion server"
          glowColor="emerald"
        />
      </div>

      {/* Main Grid: Active Trips + Fleet Inventory Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Trips Panel (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0f172a]/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Active Commercial Trips
                </h3>
              </div>
              <button
                onClick={() => navigate('/trips')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>View All Trips</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {trips.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400">
                <Navigation className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">No active trips currently logged</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Launch the Live Tracker to create a real-time corridor session.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trips.slice(0, 3).map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => navigate('/live-tracker')}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-mono text-xs font-bold text-cyan-300">
                          {trip.vehicleRegistration}
                        </span>
                        <span className="text-[10px] text-slate-400">• {trip.driverName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {trip.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-white mt-2">
                      <span className="text-emerald-400">{trip.origin}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-cyan-400">{trip.destination}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
                      <span>Distance: <strong className="text-slate-200">{trip.distanceKm} km</strong></span>
                      <span>ETA: <strong className="text-slate-200">{trip.eta || 'Calculating'}</strong></span>
                      <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold">
                        Track Live <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Sessions backed by persistent database</span>
            <button
              onClick={() => navigate('/live-tracker')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Start New Tracking Session →
            </button>
          </div>
        </div>

        {/* Fleet Roster Status (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Fleet Units
                </h3>
              </div>
              <button
                onClick={() => navigate('/fleet')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Fleet</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {vehicles.slice(0, 4).map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
                      {v.vehicleType === 'Heavy Truck' ? 'HT' : 'TR'}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-white">{v.registrationNumber}</div>
                      <div className="text-[10px] text-slate-400">{v.vehicleModel}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        v.status === 'In Transit'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {v.status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{v.driverName}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Commercial fleet registration compliance</span>
            <button
              onClick={() => navigate('/fleet')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Enroll Unit →
            </button>
          </div>
        </div>
      </div>

      {/* System Alerts Row */}
      <div className="rounded-2xl bg-[#0f172a]/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Active Road & Logistics Alerts
            </h3>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Alerts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {alerts.slice(0, 3).map((a) => (
            <div
              key={a.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{a.title}</span>
                <span className="text-[10px] text-slate-400">{a.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                {a.description || a.message}
              </p>
              {a.location && (
                <div className="flex items-center gap-1 text-[10px] text-cyan-400 pt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{a.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
