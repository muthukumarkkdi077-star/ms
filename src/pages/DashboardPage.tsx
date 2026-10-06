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
  Activity,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { vehicleTrackingService } from '../services/vehicleTrackingService';
import { FleetVehicle } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles] = useState<FleetVehicle[]>(vehicleTrackingService.getVehicles());
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_time' | 'delayed' | 'critical'>('all');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quick dispatch state on dashboard
  const [quickOrigin, setQuickOrigin] = useState<string>('Singanallur');
  const [quickDest, setQuickDest] = useState<string>('Chinniyampalayam');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter vehicles
  const onTimeVehicles = vehicles.filter((v) => v.status === 'moving' && !v.alertMessage);
  const delayedVehicles = vehicles.filter((v) => v.status === 'alert' || (v.alertMessage && v.alertMessage.includes('Delayed')));
  const criticalVehicles = vehicles.filter((v) => v.status === 'idle' || (v.alertMessage && v.alertMessage.includes('deviated')));

  const filteredVehicles = vehicles.filter((v) => {
    const matchesFilter =
      statusFilter === 'all'
        ? true
        : statusFilter === 'on_time'
        ? v.status === 'moving' && !v.alertMessage
        : statusFilter === 'delayed'
        ? v.status === 'alert' || (v.alertMessage && v.alertMessage.includes('Delayed'))
        : v.status === 'idle' || (v.alertMessage && v.alertMessage.includes('deviated'));

    const matchesSearch =
      !searchQuery ||
      v.vehicleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.currentRouteName && v.currentRouteName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  // User-requested Today's Trips
  const todaysTrips = [
    {
      id: 'trip-1',
      from: 'Chennai',
      to: 'Madurai',
      vehicle: 'Tata Prima 5530.S',
      reg: 'TN-38-AB-4521',
      driver: 'Driver 1042 (Arun Kumar)',
      distance: '452 km',
      duration: '7h 15m',
      eta: '18:30',
      status: 'On time',
      isDelayed: false,
      corridor: 'via Grand Southern Trunk Rd (NH 45) & NH 38',
      progress: 74
    },
    {
      id: 'trip-2',
      from: 'Coimbatore',
      to: 'Chennai',
      vehicle: 'Ashok Leyland 4220',
      reg: 'TN-38-CD-2401',
      driver: 'Driver 1088 (Praveen Raj)',
      distance: '504 km',
      duration: '8h 45m',
      eta: '20:15 (+24m)',
      status: 'Delayed by 24 min',
      isDelayed: true,
      corridor: 'via Palladam Bottleneck & Salem NH 544',
      progress: 38
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
      isDelayed: false,
      corridor: 'via NH 44 Express Freight Corridor',
      progress: 58
    }
  ];

  const handleLaunchQuickDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickOrigin || !quickDest) return;
    navigate(`/live-tracker?from=${encodeURIComponent(quickOrigin.trim())}&to=${encodeURIComponent(quickDest.trim())}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto text-slate-100 transition-colors">
      {/* ── TOP HERO BANNER: SLEEK EXECUTIVE BAR ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d1322] via-[#0f192c] to-[#091220] border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-emerald-400">
                Logistics Telemetry Grid • Active
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">
                {currentTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Fleet Operations Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time Indian highway corridor tracking, Google Traffic telemetry, and intelligent multi-route dispatch across 38 districts of Tamil Nadu and all of India.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/live-tracker')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-current transform -rotate-45" />
              <span>Live Vehicle Tracking</span>
            </button>

            <button
              onClick={() => navigate('/plan-trip')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md hover:border-emerald-500/50"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Plan a Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 1. FLEET OVERVIEW KPIS (Clean, Unified 4-Card Grid: 24 Active, 18 On Route, 4 Delayed, 2 Idle) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: 24 Vehicles Active */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-slate-700 shadow-xl transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">Fleet Registered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-black text-white">
            24
          </div>
          <div className="text-xs text-emerald-400 font-bold mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span>Vehicles Active & Monitored</span>
          </div>
        </div>

        {/* Metric 2: 18 On Route */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-emerald-500/30 hover:border-emerald-500/50 shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-400">Transit Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-pulse">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-400">
            18
          </div>
          <div className="text-xs text-emerald-300 font-bold mt-1.5 flex items-center gap-1.5">
            <span>🟢</span>
            <span>On Route (Normal Speed)</span>
          </div>
        </div>

        {/* Metric 3: 4 Delayed */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-amber-500/30 hover:border-amber-500/50 shadow-xl transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-amber-400">Bottlenecks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-black text-amber-400">
            4
          </div>
          <div className="text-xs text-amber-300 font-bold mt-1.5 flex items-center gap-1.5">
            <span>🟠</span>
            <span>Delayed (Traffic / Highway)</span>
          </div>
        </div>

        {/* Metric 4: 2 Idle */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-slate-700 shadow-xl transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider text-[11px]">Standby Fleet</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-3xl sm:text-4xl font-black text-sky-400">
            2
          </div>
          <div className="text-xs text-sky-300 font-bold mt-1.5 flex items-center gap-1.5">
            <span>🔵</span>
            <span>Idle at Depot (Coimbatore)</span>
          </div>
        </div>
      </div>

      {/* ── 2. TWO-COLUMN WORKSPACE: TODAY'S TRIPS (65%) + QUICK ROUTE DISPATCH (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: TODAY'S TRIPS */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Today's Active Trips
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              3 High-Priority Freight Corridors
            </span>
          </div>

          <div className="space-y-3.5">
            {todaysTrips.map((trip) => (
              <div
                key={trip.id}
                className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-slate-700 shadow-lg space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 font-black">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-black text-base sm:text-lg text-white">
                        <span>{trip.from}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                        <span>{trip.to}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {trip.corridor}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-extrabold font-mono ${
                      trip.isDelayed
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Vehicle</span>
                    <span className="font-bold text-white font-mono">{trip.vehicle}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver</span>
                    <span className="font-bold text-emerald-400 truncate block">{trip.driver}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Distance</span>
                    <span className="font-bold text-white font-mono">{trip.distance}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Arrival</span>
                    <span className="font-bold text-sky-400 font-mono">{trip.eta}</span>
                  </div>
                </div>

                {/* Progress bar + Action Button */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        trip.isDelayed ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      }`}
                      style={{ width: `${trip.progress}%` }}
                    />
                  </div>

                  <button
                    onClick={() => navigate(`/live-tracker?from=${trip.from}&to=${trip.to}`)}
                    className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white hover:text-emerald-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Live Track</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: QUICK ROUTE DISPATCH HUB (Allows typing Singanallur -> Chinniyampalayam directly!) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Quick Route Dispatch</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              FAST ENGINE
            </span>
          </div>

          <form
            onSubmit={handleLaunchQuickDispatch}
            className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-xl space-y-3.5"
          >
            <p className="text-xs text-slate-400">
              Calculate the fastest driving route between any two places in Tamil Nadu or across India:
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Origin (Starting Point)
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 absolute left-3" />
                  <input
                    type="text"
                    value={quickOrigin}
                    onChange={(e) => setQuickOrigin(e.target.value)}
                    placeholder="e.g. Singanallur"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Destination (Ending Point)
                </label>
                <div className="relative flex items-center">
                  <Navigation className="w-3.5 h-3.5 text-teal-400 absolute left-3" />
                  <input
                    type="text"
                    value={quickDest}
                    onChange={(e) => setQuickDest(e.target.value)}
                    placeholder="e.g. Chinniyampalayam"
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-current transform -rotate-45" />
              <span>Search Fastest Route</span>
            </button>
          </form>

          {/* Live Telemetry Health Box */}
          <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                Network Telemetry
              </span>
              <span className="font-mono text-emerald-400 text-[10px] font-bold">
                Port 3001 Connected
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">GPS Ping Frequency:</span>
                <span className="font-mono font-bold text-white">1.0 sec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Corridor Accuracy:</span>
                <span className="font-mono font-bold text-emerald-400">99.8% (Google Maps)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Transmitters:</span>
                <span className="font-mono font-bold text-cyan-300">24 Hardware Beacons</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. FLEET STATUS & VEHICLE ROSTER (Clean Filter Tabs: All, On time, Delayed, Critical) ── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#0c121e] border border-slate-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-black text-white">
                Fleet Vehicle Status
              </h2>
              <p className="text-xs text-slate-400">
                Live monitoring for all 24 registered commercial transport units.
              </p>
            </div>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Vehicles ({vehicles.length})
            </button>

            <button
              onClick={() => setStatusFilter('on_time')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'on_time'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <span>🟢</span>
              <span>On time ({onTimeVehicles.length})</span>
            </button>

            <button
              onClick={() => setStatusFilter('delayed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'delayed'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              }`}
            >
              <span>🟠</span>
              <span>Delayed ({delayedVehicles.length})</span>
            </button>

            <button
              onClick={() => setStatusFilter('critical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'critical'
                  ? 'bg-rose-500 text-white font-black'
                  : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <span>🔴</span>
              <span>Critical / Idle ({criticalVehicles.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle model, driver name, or active route..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredVehicles.slice(0, 9).map((veh) => {
            const isDelayed = veh.status === 'alert' || (veh.alertMessage && veh.alertMessage.includes('Delayed'));
            const isCritical = veh.status === 'idle' || (veh.alertMessage && veh.alertMessage.includes('deviated'));

            return (
              <div
                key={veh.vehicleId}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-white text-xs block">
                      {veh.vehicleId}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {veh.vehicleType}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                      isDelayed
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : isCritical
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isDelayed ? 'Delayed' : isCritical ? 'Critical' : 'On Route'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Driver:</span>
                    <span className="font-semibold text-emerald-400">{veh.driver}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Route:</span>
                    <span className="truncate max-w-[140px] text-white">{veh.currentRouteName}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Speed:</span>
                    <span className="font-mono font-bold text-cyan-300">{veh.speed} km/h</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/live-tracker?from=${veh.origin}&to=${veh.destination}`)}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-slate-300 hover:text-white border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3 h-3 text-emerald-400" />
                  <span>Track Vehicle</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
