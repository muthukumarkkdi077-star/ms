import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle, VehicleType } from '../types';
import { vehicleService } from '../services/vehicleService';
import { driverService } from '../services/driverService';
import { useToast } from '../context/ToastContext';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Navigation,
  Fuel,
  Gauge,
  User,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  X,
  Radio,
  CheckCircle2
} from 'lucide-react';

export const FleetPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New vehicle form state
  const [newReg, setNewReg] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState<VehicleType>('Heavy Truck');
  const [newFuel, setNewFuel] = useState<'Diesel' | 'Petrol' | 'Electric' | 'CNG'>('Diesel');
  const [newDriver, setNewDriver] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVehicles = async () => {
    setIsLoading(true);
    const data = await vehicleService.getVehicles();
    setVehicles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg || !newModel) {
      addToast('warning', 'Missing Details', 'Registration number and model are required.');
      return;
    }

    setIsSubmitting(true);
    const created = await vehicleService.createVehicle({
      registrationNumber: newReg.toUpperCase().trim(),
      vehicleName: newModel,
      vehicleModel: newModel,
      vehicleType: newType,
      fuelType: newFuel,
      driverName: newDriver || 'Unassigned',
      status: 'Idle',
      speedLimit: 80
    });

    if (created) {
      addToast('success', 'Vehicle Enrolled', `${created.registrationNumber} has joined active fleet registry.`);
      setShowAddModal(false);
      setNewReg('');
      setNewModel('');
      setNewDriver('');
      fetchVehicles();
    } else {
      addToast('error', 'Enrollment Error', 'Failed to register vehicle on backend.');
    }
    setIsSubmitting(false);
  };

  const filteredVehicles = vehicles.filter((v) => {
    const matchesFilter = filterStatus === 'all' || v.status.toLowerCase() === filterStatus.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      v.registrationNumber.toLowerCase().includes(query) ||
      v.vehicleModel.toLowerCase().includes(query) ||
      (v.driverName && v.driverName.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-[#090d16] text-slate-100 overflow-y-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Fleet Operations Inventory
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {vehicles.length} Units
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real Indian commercial registrations, active telematics hardware, and driver rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchVehicles}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Vehicle</span>
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
            placeholder="Search registration (e.g. TN-38), model, or driver..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0f172a] border border-slate-800 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'In Transit', 'Idle', 'Stopped', 'Offline'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'all' ? 'All Vehicles' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-cyan-400" />
          <p className="text-xs">Querying fleet registry from database...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
          <Truck className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-white">No fleet assets match your filter</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria or register a new vehicle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => {
            const isTransit = vehicle.status === 'In Transit';
            return (
              <div
                key={vehicle.id}
                className="rounded-2xl bg-[#0f172a]/95 border border-slate-800 hover:border-slate-700/80 p-5 space-y-4 shadow-xl transition-all group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-extrabold text-sm text-white tracking-wide">
                          {vehicle.registrationNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {vehicle.vehicleModel}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isTransit
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : vehicle.status === 'Idle'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Vehicle Type</span>
                    <span className="font-semibold text-slate-200">{vehicle.vehicleType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Fuel / Powertrain</span>
                    <span className="font-semibold text-cyan-300">{vehicle.fuelType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Assigned Driver</span>
                    <span className="font-semibold text-white truncate block">{vehicle.driverName || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Speed Governor</span>
                    <span className="font-mono font-semibold text-slate-200">{vehicle.speedLimit} km/h</span>
                  </div>
                </div>

                {/* Telemetry Status Line */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Radio className={`w-3.5 h-3.5 ${vehicle.lastKnownLocation ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span>{vehicle.lastKnownLocation ? `${vehicle.lastKnownLocation.locationName || 'Telemetry Active'}` : 'GPS Telemetry Standby'}</span>
                  </span>

                  <button
                    onClick={() => navigate('/live-tracker')}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
                  >
                    <span>Track on Map</span>
                    <Navigation className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ENROLL VEHICLE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-base text-white">Enroll Fleet Commercial Asset</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Registration Number (Indian Standard)
                </label>
                <input
                  type="text"
                  required
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  placeholder="e.g. TN-38-AB-1204, KA-01-MJ-4050"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono uppercase font-semibold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Make & Model
                </label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. Tata Prima 5530.S, Ashok Leyland 2820"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Heavy Truck">Heavy Truck</option>
                    <option value="Truck">Truck</option>
                    <option value="Light Commercial Vehicle">Light Commercial Vehicle</option>
                    <option value="Electric Vehicle">Electric Vehicle</option>
                    <option value="Van">Van</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="CNG">CNG</option>
                    <option value="Petrol">Petrol</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Assigned Driver Name
                </label>
                <input
                  type="text"
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  placeholder="e.g. R. Subramanian, K. Muthukumar"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/25"
                >
                  {isSubmitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
