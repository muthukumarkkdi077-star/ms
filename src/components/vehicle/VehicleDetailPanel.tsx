import React from 'react';
import { FleetVehicle } from '../../types';
import { Speedometer } from '../common/Speedometer';
import {
  X,
  Truck,
  Compass,
  MapPin,
  Clock,
  Fuel,
  User,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Navigation,
  Activity,
  ArrowRight,
  Phone,
  Crosshair
} from 'lucide-react';

interface VehicleDetailPanelProps {
  vehicle: FleetVehicle;
  onClose: () => void;
  onFocusMap?: (vehicle: FleetVehicle) => void;
}

export const VehicleDetailPanel: React.FC<VehicleDetailPanelProps> = ({
  vehicle,
  onClose,
  onFocusMap
}) => {
  // Status badge styling
  const statusConfig = {
    moving: { label: 'MOVING', color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    idle: { label: 'IDLE', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30', dot: 'bg-amber-400' },
    stopped: { label: 'STOPPED', color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30', dot: 'bg-rose-400' },
    offline: { label: 'OFFLINE', color: 'text-slate-400', bg: 'bg-slate-500/15', border: 'border-slate-500/30', dot: 'bg-slate-400' },
    alert: { label: 'ALERT', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', dot: 'bg-rose-400' }
  }[vehicle.status] || {
    label: vehicle.status.toUpperCase(),
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-400'
  };

  // Convert heading in degrees to cardinal direction name
  const getHeadingDirection = (deg: number): string => {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] text-slate-100 overflow-hidden border-l border-slate-800 shadow-2xl">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                LIVE VEHICLE
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-200">
                {vehicle.vehicleType}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{vehicle.vehicleId}</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} animate-pulse`} />
                {statusConfig.label}
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Close Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Active Alert Banner if in alert status */}
        {vehicle.alertMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-pulse">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <span className="font-bold block">Vehicle Alert Active</span>
              <span className="text-[11px] leading-relaxed text-rose-200">{vehicle.alertMessage}</span>
            </div>
          </div>
        )}

        {/* Circular Speedometer */}
        <Speedometer
          speed={vehicle.speed}
          maxSpeed={120}
          speedLimit={vehicle.speedLimit || 80}
          averageSpeed={vehicle.averageSpeed}
        />

        {/* Route Progress Bar */}
        <div className="p-3.5 rounded-xl bg-[#090d16]/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 uppercase text-[10px] tracking-wider">
              Route Progress
            </span>
            <span className="font-mono font-extrabold text-cyan-400 text-sm">
              {vehicle.progressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-cyan-400/50"
              style={{ width: `${Math.min(100, Math.max(2, vehicle.progressPercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-semibold text-slate-200">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {vehicle.origin}
            </span>
            <span className="text-slate-600">━━━━━━━━</span>
            <span className="flex items-center gap-1 font-semibold text-slate-200">
              <Navigation className="w-3 h-3 text-cyan-400" />
              {vehicle.destination}
            </span>
          </div>
        </div>

        {/* Live Corridor & Location Info */}
        <div className="p-3.5 rounded-xl bg-[#090d16]/90 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400">Current Location:</span>
            <span className="font-bold text-white text-right truncate max-w-[200px]">
              {vehicle.currentLocationName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Travelled</span>
              <span className="font-mono font-bold text-sm text-cyan-300">
                {vehicle.distanceTravelledKm} km
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Remaining</span>
              <span className="font-mono font-bold text-sm text-emerald-400">
                {vehicle.distanceRemainingKm} km
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated ETA</span>
              <span className="font-mono font-bold text-sm text-white">
                {vehicle.eta}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Max Speed</span>
              <span className="font-mono font-bold text-sm text-slate-200">
                {vehicle.maxSpeed} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Breakdown Details */}
        <div className="p-3.5 rounded-xl bg-[#090d16]/90 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Last Update:
            </span>
            <span className="font-mono text-cyan-300 font-semibold">
              {vehicle.lastUpdatedSecondsAgo} seconds ago
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Compass
                className="w-3.5 h-3.5 text-amber-400 transform transition-transform"
                style={{ transform: `rotate(${vehicle.heading}deg)` }}
              />
              Heading:
            </span>
            <span className="font-medium text-white flex items-center gap-1">
              <span>{getHeadingDirection(vehicle.heading)}</span>
              <span className="font-mono text-slate-400 text-[10px]">({vehicle.heading}°)</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Assigned Driver:
            </span>
            <span className="font-semibold text-white">{vehicle.driver}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-emerald-400" />
              Fuel Level:
            </span>
            <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
              <span>{Math.round(vehicle.fuel)}%</span>
              <span className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden inline-block">
                <span
                  className="h-full bg-emerald-400 block"
                  style={{ width: `${vehicle.fuel}%` }}
                />
              </span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          {onFocusMap && (
            <button
              onClick={() => onFocusMap(vehicle)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Center Vehicle</span>
            </button>
          )}

          <button
            onClick={() => alert(`Contacting driver ${vehicle.driver} (${vehicle.vehicleId}) via dispatch radio...`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Radio Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
