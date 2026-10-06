import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Navigation,
  Clock,
  Radio,
  AlertTriangle,
  ArrowRight,
  Compass,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  PhoneCall,
  Activity
} from 'lucide-react';
import { vehicleTrackingService } from '../services/vehicleTrackingService';
import { alertService } from '../services/alertService';
import { FleetVehicle } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles] = useState<FleetVehicle[]>(vehicleTrackingService.getVehicles());
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_time' | 'delayed' | 'critical'>('all');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = vehicleTrackingService.getFleetStats();
  const alerts = alertService.getAlerts();

  // Categorize vehicles for Quick Status
  const onTimeVehicles = vehicles.filter((v) => v.status === 'moving' && !v.alertMessage);
  const delayedVehicles = vehicles.filter((v) => v.status === 'alert' || (v.alertMessage && v.alertMessage.includes('Delayed')));
  const criticalVehicles = vehicles.filter((v) => v.status === 'idle' || (v.alertMessage && v.alertMessage.includes('deviated')));

  const displayedVehicles =
    statusFilter === 'on_time'
      ? onTimeVehicles
      : statusFilter === 'delayed'
      ? delayedVehicles
      : statusFilter === 'critical'
      ? criticalVehicles
      : vehicles;

  // Today's Trips requested by user
  const todaysTrips = [
    {
      id: 'trip-1',
      from: 'Chennai',
      to: 'Madurai',
      vehicle: 'Tata Prima',
      reg: 'TN-38-AB-4521',
      driver: 'Driver 1042 (Arun Kumar)',
      distance: '452 km',
      duration: '7h 15m',
      eta: '18:30',
      status: 'On time',
      statusType: 'on_time',
      corridor: 'via Grand Southern Trunk Rd (NH 45) & NH 38',
      progress: 72,
      delayMin: 0
    },
    {
      id: 'trip-2',
      from: 'Coimbatore',
      to: 'Chennai',
      vehicle: 'Ashok Leyland',
      reg: 'TN-38-CD-2401',
      driver: 'Driver 1088 (Praveen Raj)',
      distance: '504 km',
      duration: '8h 45m',
      eta: '20:15 (+24m)',
      status: 'Delayed by 24 min',
      statusType: 'delayed',
      corridor: 'via Palladam Bottleneck & Salem Bypass',
      progress: 38,
      delayMin: 24
    },
    {
      id: 'trip-3',
      from: 'Bangalore',
      to: 'Hyderabad',
      vehicle: 'BharatBenz 2823R',
      reg: 'TN-45-GH-4207',
      driver: 'Driver 1055 (Murugan V.)',
      distance: '569 km',
      duration: '9h 10m',
      eta: '22:40',
      status: 'On time',
      statusType: 'on_time',
      corridor: 'via NH 44 Express Freight Corridor',
      progress: 54,
      delayMin: 0
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors">
      {/* ── TOP HEADER: WELCOME & REAL-TIME SYSTEM BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/95 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
              Fleet Operations Command • Live
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
            Logistics Command Center
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Active Hub: South India Regional Command • Local Time: <span className="font-mono text-white dark:text-white light:text-slate-900 font-bold">{currentTime}</span>
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate('/live-tracker')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-current transform -rotate-45" />
            <span>Live Vehicle Tracking</span>
          </button>

          <button
            onClick={() => navigate('/plan-trip')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-200 text-white dark:text-white light:text-slate-900 border border-slate-700 dark:border-slate-700 light:border-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Plan a Trip</span>
          </button>
        </div>
      </div>

      {/* ── 1. FLEET OVERVIEW (Exactly as requested: 24 Active, 18 On Route, 4 Delayed, 2 Idle) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-white dark:text-white light:text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Fleet Overview</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-400">Real-time GPS Telemetry</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: 24 Vehicles Active */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Fleet Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-white dark:text-white light:text-slate-900">
              24
            </div>
            <div className="text-xs text-emerald-400 font-bold mt-1 flex items-center gap-1">
              <span>●</span> Vehicles Active
            </div>
          </div>

          {/* Card 2: 18 On Route */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">In Transit</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
              18
            </div>
            <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <span>🟢</span> On Route
            </div>
          </div>

          {/* Card 3: 4 Delayed */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Delay Alert</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400 dark:text-amber-400 light:text-amber-600">
              4
            </div>
            <div className="text-xs text-amber-500 font-bold mt-1 flex items-center gap-1">
              <span>🟠</span> Delayed
            </div>
          </div>

          {/* Card 4: 2 Idle */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-[10px]">Standby</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-black text-sky-400 dark:text-sky-400 light:text-sky-600">
              2
            </div>
            <div className="text-xs text-sky-500 font-bold mt-1 flex items-center gap-1">
              <span>🔵</span> Idle / Depot
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TODAY'S TRIPS (Chennai → Madurai, Coimbatore → Chennai, Bangalore → Hyderabad) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white dark:text-white light:text-slate-900 uppercase tracking-wider">
              Today's Trips
            </h2>
          </div>
          <button
            onClick={() => navigate('/plan-trip')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Plan New Route</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todaysTrips.map((trip) => {
            const isDelayed = trip.statusType === 'delayed';

            return (
              <div
                key={trip.id}
                className="p-5 rounded-2xl bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-lg space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Origin ➔ Destination */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
                    <div className="flex items-center gap-2 font-black text-base text-white dark:text-white light:text-slate-900">
                      <span>{trip.from}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                      <span>{trip.to}</span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                        isDelayed
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <div className="space-y-2 pt-3 text-xs">
                    <div className="flex items-center justify-between text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <span className="text-slate-400">Assigned Vehicle:</span>
                      <span className="font-bold text-white dark:text-white light:text-slate-900 font-mono">
                        {trip.vehicle} ({trip.reg})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <span className="text-slate-400">Driver:</span>
                      <span className="font-semibold text-emerald-400">{trip.driver}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300 dark:text-slate-300 light:text-slate-700">
                      <span className="text-slate-400">Distance & ETA:</span>
                      <span className="font-mono font-bold">
                        {trip.distance} • ETA: {trip.eta}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-1 leading-snug truncate">
                      {trip.corridor}
                    </p>
                  </div>
                </div>

                {/* Progress bar + Action Button */}
                <div className="space-y-3 pt-2">
                  <div className="w-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDelayed ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => navigate(`/live-tracker?from=${trip.from}&to=${trip.to}`)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-100 light:hover:bg-slate-200 text-xs font-bold text-white dark:text-white light:text-slate-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Track on Live Map</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. QUICK STATUS: 🚛 Vehicles (🟢 On time, 🟠 Delayed, 🔴 Critical) ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-extrabold text-white dark:text-white light:text-slate-900">
                Quick Status • 🚛 Vehicles
              </h2>
              <p className="text-xs text-slate-400">Live operational condition for all active units</p>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 dark:bg-[#0c1117] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-200 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-800 dark:bg-slate-800 light:bg-white text-white dark:text-white light:text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (24)
            </button>

            <button
              onClick={() => setStatusFilter('on_time')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'on_time'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <span>🟢 On time</span>
              <span className="font-mono text-[10px]">({onTimeVehicles.length})</span>
            </button>

            <button
              onClick={() => setStatusFilter('delayed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'delayed'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              <span>🟠 Delayed</span>
              <span className="font-mono text-[10px]">({delayedVehicles.length})</span>
            </button>

            <button
              onClick={() => setStatusFilter('critical')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                statusFilter === 'critical'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              <span>🔴 Critical</span>
              <span className="font-mono text-[10px]">({criticalVehicles.length})</span>
            </button>
          </div>
        </div>

        {/* Vehicles Quick List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayedVehicles.slice(0, 9).map((v) => {
            const isDelayed = v.status === 'alert' || (v.alertMessage && v.alertMessage.includes('Delayed'));
            const isIdle = v.status === 'idle';
            const statusLabel = isDelayed ? '🟠 Delayed' : isIdle ? '🔴 Critical / Idle' : '🟢 On time';

            return (
              <div
                key={v.vehicleId}
                onClick={() => navigate('/vehicles')}
                className="p-3.5 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800/80 dark:border-slate-800 light:border-slate-200 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-black text-white dark:text-white light:text-slate-900 block">
                      {v.vehicleType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{v.vehicleId}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isDelayed
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : isIdle
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-slate-400">{v.driver}</span>
                  <span className="font-mono font-bold text-emerald-400">{v.speed} km/h</span>
                </div>

                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{v.currentLocationName}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Footer CTA */}
        <div className="pt-2 flex justify-between items-center text-xs">
          <span className="text-slate-400 text-[11px]">
            Showing 9 of 24 fleet vehicles
          </span>
          <button
            onClick={() => navigate('/vehicles')}
            className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Open My Vehicles Panel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
