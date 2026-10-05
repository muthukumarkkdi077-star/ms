import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip, TripReport } from '../types';
import { tripService } from '../services/tripService';
import { useToast } from '../context/ToastContext';
import {
  Navigation,
  MapPin,
  Clock,
  Truck,
  FileText,
  Activity,
  CheckCircle2,
  RefreshCw,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';

export const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Trip Report Modal state
  const [selectedTripReport, setSelectedTripReport] = useState<TripReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchTrips = async () => {
    setIsLoading(true);
    const data = await tripService.getTrips();
    setTrips(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleViewReport = async (tripId: string) => {
    setIsLoadingReport(true);
    setShowReportModal(true);
    const report = await tripService.getTripReport(tripId);
    setSelectedTripReport(report);
    setIsLoadingReport(false);
  };

  const filteredTrips = trips.filter((t) => {
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'ACTIVE' && (t.status === 'ACTIVE' || t.status === 'IN_TRANSIT')) ||
      (filterStatus === 'COMPLETED' && t.status === 'COMPLETED');
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      t.origin.toLowerCase().includes(query) ||
      t.destination.toLowerCase().includes(query) ||
      (t.vehicleRegistration && t.vehicleRegistration.toLowerCase().includes(query)) ||
      (t.driverName && t.driverName.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#090d16] text-slate-100 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Commercial Trip Sessions
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {trips.length} Recorded
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real trip tracking sessions, telemetry histories, route adherence, and dispatch intelligence reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTrips}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Refresh Trips"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/live-tracker')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4" />
            <span>Launch Live Tracker</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by origin, destination, registration, or driver..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Trips' },
            { id: 'ACTIVE', label: 'Active & In Transit' },
            { id: 'COMPLETED', label: 'Completed' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterStatus(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Content */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
          <p className="text-xs">Loading trip records from database...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Navigation className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-white">No trip records found</p>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch a route in the Live Tracker to create a real tracking session.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map((trip) => {
            const isActive = trip.status === 'ACTIVE' || trip.status === 'IN_TRANSIT';
            return (
              <div
                key={trip.id}
                className="rounded-2xl bg-[#0f172a]/95 border border-slate-800 hover:border-slate-700/80 p-5 space-y-4 shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      TRIP #{trip.id.slice(0, 8)}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {trip.status}
                  </span>
                </div>

                {/* Corridor Origin -> Destination */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{trip.origin}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{trip.destination}</span>
                    </div>
                  </div>

                  {trip.recommendedRoadName && (
                    <p className="text-[10px] text-slate-400 font-medium truncate pt-1 border-t border-slate-800/80">
                      Corridor: <span className="text-slate-300">{trip.recommendedRoadName}</span>
                    </p>
                  )}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Asset</span>
                    <span className="font-mono font-bold text-white">{trip.vehicleRegistration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Operator</span>
                    <span className="font-semibold text-slate-200 truncate block">{trip.driverName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Distance</span>
                    <span className="font-mono font-semibold text-cyan-300">{trip.distanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated ETA</span>
                    <span className="font-mono font-semibold text-emerald-400">{trip.eta || '—'}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => handleViewReport(trip.id)}
                    className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Audit Report</span>
                  </button>

                  <button
                    onClick={() => navigate('/live-tracker')}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
                  >
                    <span>Live Tracking</span>
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TRIP REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 bg-[#090d16] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white">
                  RouteMind AI Logistics Trip Report
                </h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {isLoadingReport ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                  Compiling trip report data from database...
                </div>
              ) : selectedTripReport ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Origin</span>
                      <span className="font-bold text-white text-sm">{selectedTripReport.summary.origin}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Destination</span>
                      <span className="font-bold text-white text-sm">{selectedTripReport.summary.destination}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Registration</span>
                      <span className="font-mono font-bold text-cyan-300 text-sm">
                        {selectedTripReport.summary.vehicleRegistration}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Driver</span>
                      <span className="font-bold text-white">{selectedTripReport.summary.driverName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Distance</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {selectedTripReport.summary.totalDistance}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated ETA</span>
                      <span className="font-mono font-bold text-white">{selectedTripReport.summary.eta}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
                      Performance & Safety Assessment
                    </h4>
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Traffic Risk</span>
                        <span className="font-bold text-emerald-400">{selectedTripReport.riskAssessment.trafficRisk}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Weather Risk</span>
                        <span className="font-bold text-cyan-400">{selectedTripReport.riskAssessment.weatherRisk}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Safety Grade</span>
                        <span className="font-bold text-white">{selectedTripReport.riskAssessment.roadSafetyGrade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-200 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="font-extrabold text-xs uppercase tracking-wider text-cyan-400">
                        AI Dispatch Recommendation
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-300">
                      {selectedTripReport.aiDispatcherRecommendation}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">Trip report not available.</div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#090d16] flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
