import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Navigation,
  User,
  MapPin,
  Clock,
  Gauge,
  Activity,
  X,
  Phone,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText
} from 'lucide-react';
import { vehicleTrackingService } from '../services/vehicleTrackingService';
import { FleetVehicle } from '../types';

export const MyVehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const [vehicles] = useState<FleetVehicle[]>(vehicleTrackingService.getVehicles());
  const [selectedVehicle, setSelectedVehicle] = useState<FleetVehicle | null>(vehicles[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'on_route' | 'delayed' | 'idle'>('all');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.vehicleType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicleId.toLowerCase().includes(searchQuery.toLowerCase());

    const isDelayed = v.status === 'alert';
    const isIdle = v.status === 'idle';
    const isOnRoute = v.status === 'moving';

    if (filterStatus === 'on_route') return matchesSearch && isOnRoute;
    if (filterStatus === 'delayed') return matchesSearch && isDelayed;
    if (filterStatus === 'idle') return matchesSearch && isIdle;
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/95 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
              My Vehicles
            </h1>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Real-time fleet inventory, designated driver assignments, and live telemetry status.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-white dark:text-white light:text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({vehicles.length})
          </button>

          <button
            onClick={() => setFilterStatus('on_route')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'on_route'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span>🟢 On Route</span>
            <span className="font-mono text-[10px]">
              ({vehicles.filter((v) => v.status === 'moving').length})
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('delayed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'delayed'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-400'
            }`}
          >
            <span>🟠 Delayed</span>
            <span className="font-mono text-[10px]">
              ({vehicles.filter((v) => v.status === 'alert').length})
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('idle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'idle'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-sky-400'
            }`}
          >
            <span>🔵 Idle</span>
            <span className="font-mono text-[10px]">
              ({vehicles.filter((v) => v.status === 'idle').length})
            </span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Vehicle List + Right Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: VEHICLES TABLE / CARDS (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vehicle (Tata Prima, Bolero...), driver, or plate..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 rounded-2xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Vehicle List */}
          <div className="space-y-2.5">
            {filteredVehicles.map((v) => {
              const isSelected = selectedVehicle?.vehicleId === v.vehicleId;
              const isDelayed = v.status === 'alert';
              const isIdle = v.status === 'idle';

              const statusBadge = isDelayed
                ? { label: '🟠 Delayed', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' }
                : isIdle
                ? { label: '🔵 Idle', color: 'bg-sky-500/15 text-sky-400 border-sky-500/30' }
                : { label: '🟢 On Route', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };

              return (
                <div
                  key={v.vehicleId}
                  onClick={() => setSelectedVehicle(v)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-slate-850 dark:bg-[#151f2e] light:bg-emerald-50/50 border-emerald-500/60 shadow-lg'
                      : 'bg-slate-900/90 dark:bg-[#111822]/90 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 dark:bg-[#0c1117] light:bg-slate-100 border border-slate-800 dark:border-slate-800 light:border-slate-300 flex items-center justify-center shrink-0">
                      <Truck className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white dark:text-white light:text-slate-900 truncate">
                          {v.vehicleType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {v.vehicleId}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 dark:text-slate-300 light:text-slate-600 truncate flex items-center gap-1.5 mt-0.5">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{v.driver}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="font-mono font-bold text-xs text-emerald-400 block">
                        {v.speed} km/h
                      </span>
                      <span className="text-[10px] text-slate-400">{v.eta}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: VEHICLE DETAILS DRAWER (5 Cols) */}
        {selectedVehicle ? (
          <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-900/95 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl space-y-5 sticky top-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Telematics Inspection
                </span>
                <h3 className="text-lg font-black text-white dark:text-white light:text-slate-900">
                  {selectedVehicle.vehicleType}
                </h3>
              </div>

              <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200">
                {selectedVehicle.vehicleId}
              </span>
            </div>

            {/* Live Status Indicators (Speed, ETA, Distance) */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Speed</span>
                <span className="font-mono text-xl font-black text-emerald-400">
                  {selectedVehicle.speed} <span className="text-[10px] font-normal">km/h</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ETA</span>
                <span className="font-mono text-sm font-black text-white dark:text-white light:text-slate-900 block truncate mt-1">
                  {selectedVehicle.eta}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Distance</span>
                <span className="font-mono text-sm font-black text-teal-400 block truncate mt-1">
                  {selectedVehicle.distanceRemainingKm} km left
                </span>
              </div>
            </div>

            {/* Location & Current Trip (As requested) */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Live Location</span>
                  <span className="font-bold text-white dark:text-white light:text-slate-900">
                    {selectedVehicle.currentLocationName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    {selectedVehicle.latitude.toFixed(4)}° N, {selectedVehicle.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Trip</span>
                  <span className="font-semibold text-white dark:text-white light:text-slate-900">
                    {selectedVehicle.currentRouteName || `${selectedVehicle.origin} → ${selectedVehicle.destination}`}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedVehicle.destination}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver Details (As requested) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Driver Details</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Verified Commercial Driver
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="font-bold text-white dark:text-white light:text-slate-900 text-sm">
                    {selectedVehicle.driver}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Lic: TN-38-COMM-2018-042
                  </div>
                </div>

                <a
                  href="tel:+919842100000"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Contact</span>
                </a>
              </div>
            </div>

            {/* Vehicle Details (As requested) */}
            <div className="p-4 rounded-2xl bg-slate-950/60 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Vehicle Specifications
              </span>

              <div className="grid grid-cols-2 gap-2 text-slate-300 dark:text-slate-300 light:text-slate-700 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">Model:</span>
                  <span className="font-bold text-white dark:text-white light:text-slate-900">
                    {selectedVehicle.vehicleType}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Fuel Level:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedVehicle.fuel}% Capacity
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Speed Limit:</span>
                  <span className="font-mono font-bold text-slate-300">
                    {selectedVehicle.speedLimit || 80} km/h
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Odometer:</span>
                  <span className="font-mono font-bold text-slate-300">
                    {selectedVehicle.distanceTravelledKm} km
                  </span>
                </div>
              </div>
            </div>

            {/* Track on Live Map CTA */}
            <button
              onClick={() => navigate('/live-tracker')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-current transform -rotate-45" />
              <span>Track Live on India Map</span>
            </button>
          </div>
        ) : (
          <div className="lg:col-span-5 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <Truck className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-bold text-white">Select a vehicle</p>
            <p className="text-xs text-slate-400">Click any vehicle in the list to inspect its live telemetry</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVehiclesPage;
