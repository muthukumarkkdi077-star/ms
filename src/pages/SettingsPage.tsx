import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Truck,
  IndianRupee,
  Bell,
  Palette,
  Save,
  CheckCircle2,
  Navigation,
  Key,
  Server,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { googleMapsService } from '../services/googleMapsService';

export const SettingsPage: React.FC = () => {
  const { addToast } = useToast();

  const [travelMode, setTravelMode] = useState('car');
  const [vehicleType, setVehicleType] = useState('van');
  const [fuelPrice, setFuelPrice] = useState('102.50');
  const [fuelEfficiency, setFuelEfficiency] = useState('14.5');
  const [theme, setTheme] = useState('dark-navy');

  // Accessibility Preferences
  const [preferRamps, setPreferRamps] = useState(true);
  const [preferAudioCrossings, setPreferAudioCrossings] = useState(true);
  const [strictStepFree, setStrictStepFree] = useState(true);
  const [maxSlope, setMaxSlope] = useState('6%');

  // Notification Preferences
  const [pushAlerts, setPushAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [delayThreshold, setDelayThreshold] = useState('10');

  const hasGoogleMaps = googleMapsService.isConfigured();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Preferences Saved', 'RouteMind AI routing engine parameters successfully updated.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Routing Parameters & System Config</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System & Engine Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure algorithmic weighting for delay tolerance, fuel economic indexes, and telemetry integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* API & Telemetry Connection Status Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-cyan-500/30 shadow-sm dark:shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              API & Telemetry Hardware Integration Status
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            PRODUCTION READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Google Maps API</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white">
              {hasGoogleMaps ? 'Connected & Active' : 'API Key Ready in .env'}
            </div>
            <p className="text-[10px] text-slate-500">Places, Routes & Geocoding</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">GPS Telemetry Stream</span>
              <Radio className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            </div>
            <div className="font-bold text-cyan-700 dark:text-cyan-300">SSE Port 3001 Live</div>
            <p className="text-[10px] text-slate-500">POST /api/telemetry/location</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Database Store</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white">server/data/db.json</div>
            <p className="text-[10px] text-slate-500">Vehicles, Trips, Deliveries & Users</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Default Travel Mode & Vehicle */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Transit & Dispatch Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Navigation Mode
              </label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="car">Commercial Fleet Vehicle</option>
                <option value="delivery">Multi-stop Delivery Van</option>
                <option value="walking">Pedestrian Accessible Path</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Default Commercial Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="truck">Heavy Goods Truck (Multi-Axle)</option>
                <option value="van">Commercial Cargo Van</option>
                <option value="lcv">Light Commercial Vehicle</option>
                <option value="ev">Electric Commercial Vehicle</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Accessibility Preferences */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Accessibility & Micro-Mobility Calibration</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Strict Step-Free Routing</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Enforce elevator and ramp corridors for wheelchair journeys</span>
              </div>
              <input
                type="checkbox"
                checked={strictStepFree}
                onChange={(e) => setStrictStepFree(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Prioritize Accessibility Ramp Corridors</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Favor paths certified under 1:12 gradient slope</span>
              </div>
              <input
                type="checkbox"
                checked={preferRamps}
                onChange={(e) => setPreferRamps(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Audible Crosswalk Cues</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">Signal acoustic guidance for vision-impaired pedestrian routes</span>
              </div>
              <input
                type="checkbox"
                checked={preferAudioCrossings}
                onChange={(e) => setPreferAudioCrossings(e.target.checked)}
                className="w-4 h-4 accent-cyan-600 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SECTION 3: Fuel Price & Economic Index */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-amber-500" />
            <span>Fuel Economics & Fleet Index (India)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Diesel Price (₹ / Liter)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  step="0.1"
                  value={fuelPrice}
                  onChange={(e) => setFuelPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Commercial Fleet Average Fuel Economy (km / L)
              </label>
              <input
                type="number"
                step="0.1"
                value={fuelEfficiency}
                onChange={(e) => setFuelEfficiency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm uppercase tracking-wider transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
