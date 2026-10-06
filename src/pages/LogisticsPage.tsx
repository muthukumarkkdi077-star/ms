import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeliveryItem, Vehicle } from '../types';
import { logisticsService } from '../services/logisticsService';
import { vehicleService } from '../services/vehicleService';
import { googleMapsService } from '../services/googleMapsService';
import {
  Truck,
  Zap,
  MapPin,
  Clock,
  Navigation,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Package,
  IndianRupee,
  Layers,
  Activity,
  Radio,
  ExternalLink,
  ChevronRight,
  X,
  RefreshCw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const LogisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);

  // Add delivery modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [recipient, setRecipient] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [selectedVehicle, setSelectedVehicle] = useState('Heavy Truck');
  const [cargoType, setCargoType] = useState('Standard Freight');
  const [deadline, setDeadline] = useState('17:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeliveries = async () => {
    setIsLoading(true);
    const [delList, vehList] = await Promise.all([
      logisticsService.getDeliveries(),
      vehicleService.getVehicles()
    ]);
    setDeliveries(delList);
    setVehicles(vehList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const res = await logisticsService.optimizeDeliveryRoute();
      setDeliveries(res.optimizedSequence);
      setHasOptimized(true);
      addToast(
        'success',
        'Multi-Stop Route Optimized',
        `Priority sequence calculated. Est. distance saved: ${res.distanceSavedKm} km`
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !destination || !recipient) {
      addToast('warning', 'Missing Details', 'Pickup, destination, and recipient are required.');
      return;
    }

    setIsSubmitting(true);

    // Compute real distance & ETA using Google Maps
    let distanceKm = 12.4;
    let eta = '03:30 PM';

    try {
      const routes = await googleMapsService.calculateRoutes(pickup, destination);
      if (routes && routes[0]) {
        distanceKm = routes[0].distanceKm;
        eta = routes[0].eta;
      }
    } catch (e) {}

    const created = await logisticsService.addDelivery({
      location: destination,
      recipient,
      address: `${destination} Terminal`,
      priority,
      eta,
      distanceKm,
      vehicle: selectedVehicle,
      status: 'Pending',
      cargoType,
      coordinates: [11.0180, 76.9650]
    });

    if (created) {
      setDeliveries([created, ...deliveries]);
      setShowAddModal(false);
      setPickup('');
      setDestination('');
      setRecipient('');
      addToast('success', 'Order Scheduled', `${created.code} dispatched to queue.`);
    } else {
      addToast('error', 'Schedule Error', 'Failed to store delivery record on backend.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Autonomous Dispatch & Route Sequencing</span>
            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              {deliveries.length} Consignments
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Logistics & Freight Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Multi-stop priority scheduling, vehicle payload matching, and traffic-aware dispatch orchestration across India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>New Consignment</span>
          </button>

          <button
            onClick={handleOptimizeRoute}
            disabled={isOptimizing || deliveries.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{isOptimizing ? 'Sequencing Corridors...' : 'Optimize Dispatch Order'}</span>
          </button>
        </div>
      </div>

      {/* Deliveries Table / List */}
      <div className="rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Active Consignments Roster
            </h3>
          </div>
          <button
            onClick={fetchDeliveries}
            className="p-1 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            title="Refresh Consignments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
            Querying active deliveries from backend database...
          </div>
        ) : deliveries.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
            No active consignments. Click "New Consignment" to add an order.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
            {deliveries.map((item) => {
              const isHigh = item.priority === 'HIGH';
              const isMed = item.priority === 'MEDIUM';

              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{item.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            isHigh
                              ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
                              : isMed
                              ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {item.priority} PRIORITY
                        </span>
                      </div>

                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                        {item.recipient}
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{item.address || item.location}</span>
                        <span>•</span>
                        <span className="text-teal-700 dark:text-teal-300">{item.cargoType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:text-right">
                    <div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Distance & ETA</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {item.distanceKm} km • <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{item.eta}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/live-tracker')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 text-xs font-semibold cursor-pointer"
                    >
                      <span>Track</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NEW CONSIGNMENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Create Logistics Consignment</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDelivery} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  required
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="e.g. Coimbatore Warehouse, Chennai CFS"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Delivery Destination
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Madurai Freight Terminal, Bengaluru Tech Park"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Consignee / Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Southern Freight Services, Apex Medical"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Delivery Deadline
                  </label>
                  <input
                    type="time"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Cargo Description
                </label>
                <input
                  type="text"
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  placeholder="e.g. Auto Spare Parts, Cold-chain Pharma"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-md shadow-emerald-500/25 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Calculating Route...' : 'Schedule Consignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
