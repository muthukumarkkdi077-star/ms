import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RouteOption, Vehicle, TelemetryPoint, Trip, TripReport } from '../types';
import { googleMapsService } from '../services/googleMapsService';
import { tripService } from '../services/tripService';
import { vehicleService } from '../services/vehicleService';
import { trackingService } from '../services/trackingService';
import { MapView } from '../components/map/MapView';
import { RoutePlanner } from '../components/route/RoutePlanner';
import { RouteCard } from '../components/route/RouteCard';
import { Speedometer } from '../components/common/Speedometer';
import { useToast } from '../context/ToastContext';
import {
  Navigation,
  MapPin,
  Truck,
  Radio,
  Clock,
  Gauge,
  Activity,
  AlertTriangle,
  FileText,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Send,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Compass,
  X,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';

export const LiveTrackerPage: React.FC = () => {
  const { addToast } = useToast();
  const location = useLocation();

  // Route & Trip State
  const [origin, setOrigin] = useState<string>('Coimbatore');
  const [destination, setDestination] = useState<string>('Madurai');
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Fleet & Telemetry State
  const [fleetVehicles, setFleetVehicles] = useState<Vehicle[]>([]);
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null);
  const [activeTelemetry, setActiveTelemetry] = useState<TelemetryPoint | null>(null);
  const [isAwaitingTelemetry, setIsAwaitingTelemetry] = useState<boolean>(true);

  // UI Panels State
  const [showDriverTransmitter, setShowDriverTransmitter] = useState<boolean>(false);
  const [showTripReport, setShowTripReport] = useState<boolean>(false);
  const [tripReport, setTripReport] = useState<TripReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);

  // Telemetry Transmitter Inputs (for mobile GPS / field test)
  const [txSpeed, setTxSpeed] = useState<number>(64);
  const [txHeading, setTxHeading] = useState<number>(142);
  const [isTransmittingGps, setIsTransmittingGps] = useState<boolean>(false);
  const [simulatedWaypointIdx, setSimulatedWaypointIdx] = useState<number>(0);

  // 1. Fetch real fleet vehicles on mount
  useEffect(() => {
    async function loadFleet() {
      const vehicles = await vehicleService.getVehicles();
      setFleetVehicles(vehicles);
      if (vehicles.length > 0) {
        setAssignedVehicle(vehicles[0]);
      }
    }
    loadFleet();
  }, []);

  // 1b. Check query params (from & to) from navigation or auto-initialize
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const f = params.get('from');
    const t = params.get('to');
    if (f && t) {
      setOrigin(f);
      setDestination(t);
      handleDispatchRoute({ from: f, to: t });
    } else {
      // Calculate initial route between current origin and destination
      handleDispatchRoute({ from: origin, to: destination });
    }
  }, [location.search]);

  // 2. Origin change
  const handleOriginChange = (newOrigin: string) => {
    setOrigin(newOrigin);
  };

  // 3. Destination change
  const handleDestinationChange = (newDest: string) => {
    setDestination(newDest);
  };

  // 4. Calculate real Google Routes and create new Trip Session
  const handleDispatchRoute = async (params: { from: string; to: string }) => {
    if (!params.from || !params.to) return;
    setIsCalculating(true);
    setSimulatedWaypointIdx(0);

    try {
      // Step A: Calculate Google Routes
      const calculatedRoutes = await googleMapsService.calculateRoutes(params.from, params.to);

      if (!calculatedRoutes || calculatedRoutes.length === 0) {
        addToast('error', 'Route Calculation Failed', 'Unable to compute driving corridor. Check location names.');
        setIsCalculating(false);
        return;
      }

      setRoutes(calculatedRoutes);
      const recommended = calculatedRoutes.find((r) => r.isRecommended) || calculatedRoutes[0];
      setSelectedRouteId(recommended.id);

      // Step B: Geocode coordinates for origin and destination
      const originCoords = (await googleMapsService.geocode(params.from)) || [11.0168, 76.9558];
      const destCoords = (await googleMapsService.geocode(params.to)) || [9.9252, 78.1198];

      // Step C: Create Real Trip Session on Backend
      const vehicleToAssign = assignedVehicle || fleetVehicles[0];
      const newTrip = await tripService.createTrip({
        origin: params.from,
        destination: params.to,
        originCoords,
        destCoords,
        vehicleId: vehicleToAssign?.id || 'veh-1',
        distanceKm: recommended.distanceKm,
        durationMinutes: recommended.durationMin,
        roadName: recommended.name
      });

      if (newTrip) {
        setCurrentTrip(newTrip);
        addToast(
          'success',
          'Trip Session Initiated',
          `Session #${newTrip.id.slice(0, 8)} created for ${vehicleToAssign?.registrationNumber || 'Fleet Vehicle'}`
        );
      }
    } catch (err) {
      console.error('[LiveTrackerPage] Error calculating route:', err);
      addToast('error', 'Routing Error', 'An unexpected error occurred during corridor calculation.');
    } finally {
      setIsCalculating(false);
    }
  };

  // 5. Subscribe to real-time telemetry stream (SSE) for the active trip
  useEffect(() => {
    if (!currentTrip?.id) return;

    setIsAwaitingTelemetry(true);

    const unsubscribe = trackingService.subscribeToTrip(currentTrip.id, (telemetry) => {
      setActiveTelemetry(telemetry);
      setIsAwaitingTelemetry(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentTrip?.id]);

  // Selected route object
  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // 6. Transmit Real Telemetry Packet (Driver Phone GPS or Route Waypoint)
  const handleTransmitGps = async (useDeviceGps: boolean = false) => {
    if (!currentTrip) {
      addToast('warning', 'No Active Trip', 'Please search and dispatch a route first.');
      return;
    }

    setIsTransmittingGps(true);

    try {
      let lat = 11.0168;
      let lng = 76.9558;
      let locName = `${origin} Corridor`;

      if (useDeviceGps && navigator.geolocation) {
        // Real HTML5 Geolocation from Driver's actual phone / laptop
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        locName = 'Driver Mobile GPS Telemetry';
      } else if (activeRoute?.coordinates?.length) {
        // Send next waypoint along the real Google route polyline
        const coords = activeRoute.coordinates;
        const nextIdx = Math.min(coords.length - 1, simulatedWaypointIdx + Math.max(1, Math.floor(coords.length / 10)));
        lat = coords[nextIdx][0];
        lng = coords[nextIdx][1];
        locName = activeRoute.majorRoads?.[0] || activeRoute.name;
        setSimulatedWaypointIdx(nextIdx);
      }

      const res = await trackingService.sendTelemetry({
        vehicleId: currentTrip.vehicleId,
        tripId: currentTrip.id,
        latitude: lat,
        longitude: lng,
        speed: txSpeed,
        heading: txHeading,
        locationName: locName
      });

      if (res.success) {
        addToast(
          'success',
          'GPS Telemetry Ingested',
          `Position ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E streamed at ${txSpeed} km/h`
        );
      }
    } catch (err: any) {
      addToast('error', 'GPS Transmission Error', err.message || 'Failed to acquire location');
    } finally {
      setIsTransmittingGps(false);
    }
  };

  // 7. Open Trip Report Modal
  const handleOpenReport = async () => {
    if (!currentTrip?.id) return;
    setIsLoadingReport(true);
    setShowTripReport(true);
    const report = await tripService.getTripReport(currentTrip.id);
    setTripReport(report);
    setIsLoadingReport(false);
  };

  // Current speed from telemetry or 0 if waiting
  const displaySpeed = activeTelemetry ? activeTelemetry.speed : 0;
  const displayHeading = activeTelemetry ? activeTelemetry.heading : 0;
  const displayProgress = activeRoute?.distanceKm && activeTelemetry
    ? Math.min(100, Math.round((simulatedWaypointIdx / (activeRoute.coordinates.length || 1)) * 100))
    : 0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#090d16] dark:bg-[#090d16] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-800 relative transition-colors">
      {/* Top Banner Status Bar */}
      <div className="h-12 px-4 sm:px-6 bg-[#0c1220] dark:bg-[#0c1220] light:bg-white border-b border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${!isAwaitingTelemetry ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
            <span className="font-bold text-white dark:text-white light:text-slate-900 uppercase tracking-wider text-[11px]">
              Live GPS Telemetry:
            </span>
          </div>

          {!isAwaitingTelemetry && activeTelemetry ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 dark:text-emerald-300 light:text-emerald-700 font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Connected • {activeTelemetry.latitude.toFixed(4)}° N, {activeTelemetry.longitude.toFixed(4)}° E
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 dark:text-amber-300 light:text-amber-700 font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              GPS Simulation Mode • Ready for live telemetry
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentTrip && (
            <button
              onClick={handleOpenReport}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 dark:bg-slate-800 light:bg-slate-100 hover:bg-slate-700 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:text-white dark:hover:text-white light:hover:text-slate-900 border border-slate-700 dark:border-slate-700 light:border-slate-300 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Trip Report</span>
            </button>
          )}

          <button
            onClick={() => setShowDriverTransmitter(!showDriverTransmitter)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-[11px] shadow-sm shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Driver GPS Transmitter</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: Left Controls + Center Map + Right Analytics */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT COLUMN: Route Dispatcher & Route Options */}
        <div className="w-full lg:w-96 p-4 border-r border-slate-800 dark:border-slate-800 light:border-slate-200 bg-[#090d16]/95 dark:bg-[#090d16]/95 light:bg-white overflow-y-auto space-y-4 shrink-0 z-10">
          {/* 1. Whole India Route Search Component */}
          <RoutePlanner
            onFindRoute={handleDispatchRoute}
            onOriginChange={handleOriginChange}
            onDestinationChange={handleDestinationChange}
            isLoading={isCalculating}
            initialFrom={origin}
            initialTo={destination}
          />

          {/* 2. Vehicle Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 dark:bg-[#0f172a]/90 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                Assigned Fleet Vehicle
              </span>
              <span className="text-[10px] text-cyan-500 dark:text-cyan-400 light:text-cyan-600 font-mono font-bold">
                {fleetVehicles.length} Registered
              </span>
            </div>

            <select
              value={assignedVehicle?.id || ''}
              onChange={(e) => {
                const found = fleetVehicles.find((v) => v.id === e.target.value);
                if (found) setAssignedVehicle(found);
              }}
              className="w-full px-3 py-2 text-xs bg-slate-950/60 dark:bg-slate-900 light:bg-white border border-slate-700/80 dark:border-slate-700 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 focus:outline-none focus:border-cyan-400 font-mono font-semibold"
            >
              {fleetVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} • {v.vehicleModel} ({v.driverName})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Calculated Routes with Real Road Names */}
          {routes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Google Traffic Corridors
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    const url = googleMapsService.getGoogleMapsUrl(origin, destination);
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold cursor-pointer transition-colors"
                >
                  <span>See on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isSelected={route.id === selectedRouteId}
                  onSelect={() => setSelectedRouteId(route.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State when no search conducted */}
          {routes.length === 0 && !isCalculating && (
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
              <Compass className="w-8 h-8 text-cyan-400/60 mx-auto" />
              <div>
                <p className="text-xs font-bold text-white">No Active Corridor</p>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Enter Origin & Destination anywhere across India and click "Search Fastest Route" to compute real Google Directions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: Real Interactive Google Map */}
        <div className="flex-1 relative flex flex-col min-h-[350px]">
          <MapView
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            activeVehicle={assignedVehicle}
            activeTelemetry={activeTelemetry}
            fleetVehicles={fleetVehicles}
            showTrafficOverlay={true}
            isAwaitingTelemetry={isAwaitingTelemetry}
          />
        </div>

        {/* RIGHT COLUMN: Real-Time Telemetry & Trip Analytics */}
        <div className="w-full lg:w-80 p-4 border-l border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-[#090d16]/95 overflow-y-auto space-y-4 shrink-0 z-10 text-slate-800 dark:text-slate-100">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Live Trip Telemetry
            </h3>
            <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {currentTrip ? 'SESSION_ACTIVE' : 'IDLE'}
            </span>
          </div>

          {/* Speedometer */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
            <Speedometer
              speed={displaySpeed}
              maxSpeed={120}
              speedLimit={assignedVehicle?.speedLimit || 80}
              averageSpeed={displaySpeed > 0 ? Math.round(displaySpeed * 0.88) : 0}
            />
          </div>

          {/* Route Progress */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                Trip Progress
              </span>
              <span className="font-mono font-extrabold text-cyan-600 dark:text-cyan-400 text-sm">
                {displayProgress}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-300 dark:border-slate-700/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(3, displayProgress)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{origin}</span>
              <span className="text-slate-400 dark:text-slate-600">━━━━</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{destination}</span>
            </div>
          </div>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Distance</span>
              <span className="font-mono font-extrabold text-slate-900 dark:text-white text-base">
                {activeRoute?.distanceKm ? `${activeRoute.distanceKm} km` : '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Estimated ETA</span>
              <span className="font-mono font-extrabold text-sky-600 dark:text-cyan-300 text-base">
                {activeRoute?.eta || '—'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Traffic State</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs capitalize mt-1 block">
                {activeRoute?.trafficLevel || 'Normal'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Delay Risk</span>
              <span className="font-mono font-bold text-sky-600 dark:text-cyan-400 text-xs mt-1 block">
                {activeRoute?.delayRiskPercent ? `${activeRoute.delayRiskPercent}% (Low)` : 'Minimal'}
              </span>
            </div>
          </div>

          {/* Assigned Driver Card */}
          {assignedVehicle && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0f172a]/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Operator in Transit
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{assignedVehicle.driverName || 'Designated Driver'}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{assignedVehicle.registrationNumber}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                    {assignedVehicle.fuelType}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DRIVER GPS TRANSMITTER DRAWER (Mobile GPS / Hardware Telemetry simulator) */}
      {showDriverTransmitter && (
        <div className="absolute bottom-4 right-4 sm:right-8 w-96 rounded-2xl bg-white dark:bg-[#0f172a] border border-cyan-500/40 shadow-2xl p-4 text-slate-900 dark:text-slate-100 z-30 space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Driver Telemetry Transmitter
              </h4>
            </div>
            <button
              onClick={() => setShowDriverTransmitter(false)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Transmit real GPS telemetry to backend endpoint <code className="text-cyan-600 dark:text-cyan-400 font-mono">POST /api/telemetry/location</code>. Real markers and speedometer will update dynamically over SSE stream.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Speed (km/h):</span>
              <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{txSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              value={txSpeed}
              onChange={(e) => setTxSpeed(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleTransmitGps(false)}
              disabled={isTransmittingGps || !currentTrip}
              className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Step Next Waypoint</span>
            </button>

            <button
              onClick={() => handleTransmitGps(true)}
              disabled={isTransmittingGps || !currentTrip}
              title="Use Phone/Device Geolocation Sensor"
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-cyan-700 dark:text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Use Device GPS</span>
            </button>
          </div>
        </div>
      )}

      {/* TRIP REPORT MODAL */}
      {showTripReport && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d16] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  RouteMind AI Logistics Trip Report
                </h3>
              </div>
              <button
                onClick={() => setShowTripReport(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 dark:text-slate-300">
              {isLoadingReport ? (
                <div className="text-center py-12 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600 dark:text-cyan-400" />
                  Generating verified trip audit...
                </div>
              ) : tripReport ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Origin</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{tripReport.summary.origin}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Destination</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{tripReport.summary.destination}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Registration</span>
                      <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300 text-sm">{tripReport.summary.vehicleRegistration}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Assigned Driver</span>
                      <span className="font-bold text-slate-900 dark:text-white">{tripReport.summary.driverName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Distance</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{tripReport.summary.totalDistance}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Estimated ETA</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{tripReport.summary.eta}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                      Corridor Performance & Risk
                    </h4>
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Traffic Risk</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{tripReport.riskAssessment.trafficRisk}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Weather Risk</span>
                        <span className="font-bold text-sky-600 dark:text-cyan-400">{tripReport.riskAssessment.weatherRisk}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Safety Grade</span>
                        <span className="font-bold text-slate-900 dark:text-white">{tripReport.riskAssessment.roadSafetyGrade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 text-cyan-900 dark:text-cyan-200 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="font-extrabold text-xs uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                        AI Dispatch Intelligence Recommendation
                      </span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {tripReport.aiDispatcherRecommendation}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">No report available for this session.</div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#090d16] flex justify-end">
              <button
                onClick={() => setShowTripReport(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold cursor-pointer"
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
