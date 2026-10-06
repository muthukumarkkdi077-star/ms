import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Clock,
  Gauge,
  CloudRain,
  Fuel,
  TrendingUp,
  Sparkles,
  MapPin,
  Download,
  Share2,
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const TripReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [selectedTripId, setSelectedTripId] = useState<'trip-cbe-mdu' | 'trip-che-mdu' | 'trip-blr-hyd'>('trip-cbe-mdu');

  // The primary trip report requested by the user: Coimbatore → Madurai
  const tripsData = {
    'trip-cbe-mdu': {
      id: 'trip-cbe-mdu',
      title: 'Coimbatore → Madurai Commercial Freight Corridor',
      origin: 'Coimbatore Central Terminal',
      destination: 'Madurai Logistics Hub',
      vehicle: 'Tata Prima (TN-38-AB-4521)',
      driver: 'Driver 1042 (Arun Kumar)',
      date: 'Today, Completed 14:48 IST',
      distance: '215 km',
      time: '4h 32m',
      averageSpeed: '58 km/h',
      trafficDelay: '+18 min',
      weatherImpact: 'Low (Dry Pavement, 28°C)',
      fuelUsage: '66.8 Liters (Diesel)',
      routeEfficiency: '94.2%',
      etaAccuracy: '91.5%',
      // User's exact requested AI Trip Summary:
      aiTripSummary:
        'The vehicle reached 18 minutes later than the estimated arrival time due to heavy traffic near Dindigul.',
      tollPaid: '₹340 (FASTag Auto-cleared)',
      carbonFootprint: '176.4 kg CO2e'
    },
    'trip-che-mdu': {
      id: 'trip-che-mdu',
      title: 'Chennai → Madurai Long-Haul Express',
      origin: 'Chennai Port Freight Terminal',
      destination: 'Madurai Ring Hub',
      vehicle: 'Volvo FH16 (TN-09-XY-9901)',
      driver: 'Driver 1099 (Bala Krishnan)',
      date: 'Yesterday, Completed 22:15 IST',
      distance: '452 km',
      time: '7h 12m',
      averageSpeed: '64 km/h',
      trafficDelay: '+12 min',
      weatherImpact: 'None (Clear Night Driving)',
      fuelUsage: '142.5 Liters (Diesel)',
      routeEfficiency: '96.0%',
      etaAccuracy: '95.2%',
      aiTripSummary:
        'The vehicle maintained consistent highway velocity along NH 45 with minimal delay at Villupuram toll plaza.',
      tollPaid: '₹680 (FASTag Auto-cleared)',
      carbonFootprint: '376.2 kg CO2e'
    },
    'trip-blr-hyd': {
      id: 'trip-blr-hyd',
      title: 'Bangalore → Hyderabad Interstate Corridor',
      origin: 'Bangalore Electronic City Hub',
      destination: 'Hyderabad Shamshabad Depot',
      vehicle: 'BharatBenz 2823R (TN-45-GH-4207)',
      driver: 'Driver 1055 (Murugan V.)',
      date: 'Oct 04, Completed 19:30 IST',
      distance: '569 km',
      time: '9h 08m',
      averageSpeed: '67 km/h',
      trafficDelay: '+6 min',
      weatherImpact: 'Light Drizzle near Anantapur',
      fuelUsage: '178.4 Liters (Diesel)',
      routeEfficiency: '97.5%',
      etaAccuracy: '96.8%',
      aiTripSummary:
        'Excellent corridor adherence along NH 44 with continuous 4-lane grade separation. Telemetry signal stayed 100% active.',
      tollPaid: '₹890 (FASTag Auto-cleared)',
      carbonFootprint: '471.0 kg CO2e'
    }
  };

  const activeTrip = tripsData[selectedTripId];

  const handleExportPDF = () => {
    addToast('success', 'Report Exported', 'Trip audit record compiled and downloaded as PDF.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/95 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
              Trip Reports
            </h1>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
            Post-transit telemetry analytics, speed variance, fuel consumption, and AI journey explanations.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 light:bg-slate-100 light:hover:bg-slate-200 text-emerald-400 font-bold text-xs uppercase tracking-wider border border-slate-700 dark:border-slate-700 light:border-slate-300 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit PDF</span>
        </button>
      </div>

      {/* Trip Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setSelectedTripId('trip-cbe-mdu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            selectedTripId === 'trip-cbe-mdu'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/80 dark:bg-slate-900/80 light:bg-white text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Coimbatore → Madurai (Completed)</span>
        </button>

        <button
          onClick={() => setSelectedTripId('trip-che-mdu')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            selectedTripId === 'trip-che-mdu'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/80 dark:bg-slate-900/80 light:bg-white text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Chennai → Madurai (Completed)</span>
        </button>

        <button
          onClick={() => setSelectedTripId('trip-blr-hyd')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            selectedTripId === 'trip-blr-hyd'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/80 dark:bg-slate-900/80 light:bg-white text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Bangalore → Hyderabad (Completed)</span>
        </button>
      </div>

      {/* Main Report Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/95 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl space-y-6">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 dark:border-slate-800 light:border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span>● Completed Journey Audit</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-400">{activeTrip.date}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
              {activeTrip.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Vehicle: <span className="text-white dark:text-white light:text-slate-900 font-bold">{activeTrip.vehicle}</span> • Driver: <span className="text-emerald-400 font-semibold">{activeTrip.driver}</span>
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
            100% AUDIT VERIFIED
          </span>
        </div>

        {/* ── KEY METRICS GRID (Exact parameters requested by user) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Distance */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Distance
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 block">
              {activeTrip.distance}
            </span>
            <span className="text-[10px] text-slate-500">Verified odometer track</span>
          </div>

          {/* Total Time */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Time
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 dark:text-emerald-400 light:text-emerald-700 block">
              {activeTrip.time}
            </span>
            <span className="text-[10px] text-emerald-500">Departure to arrival</span>
          </div>

          {/* Average Speed */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Average Speed
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 block">
              {activeTrip.averageSpeed}
            </span>
            <span className="text-[10px] text-slate-500">Highway cruising average</span>
          </div>

          {/* Traffic Delay */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Traffic Delay
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 block">
              {activeTrip.trafficDelay}
            </span>
            <span className="text-[10px] text-amber-500">Dindigul bottleneck</span>
          </div>

          {/* Weather Impact */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Weather Impact
            </span>
            <span className="text-sm font-bold text-white dark:text-white light:text-slate-900 block mt-1">
              {activeTrip.weatherImpact}
            </span>
            <span className="text-[10px] text-slate-500">Normal surface traction</span>
          </div>

          {/* Estimated Fuel Usage */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Fuel Usage
            </span>
            <span className="font-mono text-lg font-black text-teal-400 dark:text-teal-400 light:text-teal-700 block mt-1">
              {activeTrip.fuelUsage}
            </span>
            <span className="text-[10px] text-slate-500">3.22 km per Liter</span>
          </div>

          {/* Route Efficiency */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Route Efficiency
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 block">
              {activeTrip.routeEfficiency}
            </span>
            <span className="text-[10px] text-emerald-500">Corridor adherence</span>
          </div>

          {/* ETA Accuracy */}
          <div className="p-4 rounded-2xl bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              ETA Accuracy
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-white dark:text-white light:text-slate-900 block">
              {activeTrip.etaAccuracy}
            </span>
            <span className="text-[10px] text-slate-500">Model prediction score</span>
          </div>
        </div>

        {/* ── AI TRIP SUMMARY (Exact text requested by user!) ── */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-2 border-emerald-500/40 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-400">
              AI Trip Summary
            </h3>
          </div>
          <p className="text-base sm:text-lg font-medium text-white dark:text-white light:text-slate-900 leading-relaxed italic">
            "{activeTrip.aiTripSummary}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default TripReportsPage;
