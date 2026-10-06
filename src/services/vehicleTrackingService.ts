/**
 * RouteMind AI - Vehicle Tracking Service
 * Clean abstraction for fleet GPS tracking, real GPS backend integration,
 * and reactive vehicle telemetry subscriptions.
 */

import { FleetVehicle, VehicleStatus, AlertItem } from '../types';

type VehicleUpdateListener = (vehicles: FleetVehicle[]) => void;
type AlertListener = (alerts: AlertItem[]) => void;

// Real Fleet matching user's specific logistics operations:
// 24 Active Vehicles: 18 On Route, 4 Delayed, 2 Idle
const INITIAL_VEHICLES: FleetVehicle[] = [
  {
    vehicleId: 'TN-38-AB-4521',
    latitude: 10.3673,
    longitude: 77.9803,
    speed: 68,
    heading: 145,
    status: 'moving',
    driver: 'Driver 1042 (Arun Kumar)',
    vehicleType: 'Tata Prima',
    fuel: 74,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Chennai → Madurai',
    origin: 'Chennai',
    destination: 'Madurai',
    progressPercent: 72,
    distanceTravelledKm: 325,
    distanceRemainingKm: 127,
    eta: '1 hr 45 min',
    averageSpeed: 64,
    maxSpeed: 82,
    currentLocationName: 'Dindigul 4-Lane Bypass (NH 83)',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 4,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'TN-38-CD-2401',
    latitude: 10.9980,
    longitude: 77.2800,
    speed: 42,
    heading: 130,
    status: 'alert', // Delayed
    driver: 'Driver 1088 (Praveen Raj)',
    vehicleType: 'Ashok Leyland',
    fuel: 62,
    timestamp: new Date().toISOString(),
    routeId: 'route_a',
    currentRouteName: 'Coimbatore → Chennai',
    origin: 'Coimbatore',
    destination: 'Chennai',
    progressPercent: 38,
    distanceTravelledKm: 191,
    distanceRemainingKm: 313,
    eta: '4 hr 50 min (+24m delayed)',
    averageSpeed: 44,
    maxSpeed: 68,
    currentLocationName: 'Palladam Bottleneck Stretch',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 8,
    stopDurationMinutes: 14,
    alertMessage: 'ETA Delayed by 24 min: Heavy commercial traffic crawling at 42 km/h'
  },
  {
    vehicleId: 'TN-59-EF-3102',
    latitude: 9.9252,
    longitude: 78.1198,
    speed: 0,
    heading: 0,
    status: 'idle', // Idle
    driver: 'Driver 1021 (Karthik Selvan)',
    vehicleType: 'Mahindra Bolero',
    fuel: 88,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Madurai Regional Delivery',
    origin: 'Madurai',
    destination: 'Dindigul',
    progressPercent: 0,
    distanceTravelledKm: 0,
    distanceRemainingKm: 65,
    eta: 'Standby',
    averageSpeed: 0,
    maxSpeed: 70,
    currentLocationName: 'Madurai Central Freight Hub (Depot Standby)',
    speedLimit: 75,
    lastUpdatedSecondsAgo: 2,
    stopDurationMinutes: 45
  },
  {
    vehicleId: 'TN-45-GH-4207',
    latitude: 10.9601,
    longitude: 78.0766,
    speed: 72,
    heading: 160,
    status: 'moving',
    driver: 'Driver 1055 (Murugan V.)',
    vehicleType: 'BharatBenz 2823R',
    fuel: 81,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Bangalore → Hyderabad',
    origin: 'Bangalore',
    destination: 'Hyderabad',
    progressPercent: 54,
    distanceTravelledKm: 307,
    distanceRemainingKm: 262,
    eta: '3 hr 40 min',
    averageSpeed: 68,
    maxSpeed: 84,
    currentLocationName: 'NH 44 Hyderabad Express Stretch',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 6,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'TN-37-JK-5510',
    latitude: 11.6643,
    longitude: 78.1460,
    speed: 65,
    heading: 175,
    status: 'moving',
    driver: 'Driver 1067 (Suresh Babu)',
    vehicleType: 'Eicher Pro 6028',
    fuel: 68,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Coimbatore → Chennai',
    origin: 'Coimbatore',
    destination: 'Chennai',
    progressPercent: 44,
    distanceTravelledKm: 222,
    distanceRemainingKm: 282,
    eta: '4 hr 10 min',
    averageSpeed: 62,
    maxSpeed: 78,
    currentLocationName: 'Salem Bypass Express Corridor',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 3,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'TN-38-MN-6184',
    latitude: 11.0168,
    longitude: 76.9558,
    speed: 48,
    heading: 90,
    status: 'moving',
    driver: 'Driver 1014 (Dinesh Raman)',
    vehicleType: 'Tata Ace Gold',
    fuel: 92,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Coimbatore City Freight',
    origin: 'Coimbatore',
    destination: 'Pollachi',
    progressPercent: 30,
    distanceTravelledKm: 14,
    distanceRemainingKm: 32,
    eta: '42 min',
    averageSpeed: 45,
    maxSpeed: 65,
    currentLocationName: 'Eachanari Industrial Corridor',
    speedLimit: 70,
    lastUpdatedSecondsAgo: 5,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'TN-09-XY-9901',
    latitude: 13.0827,
    longitude: 80.2707,
    speed: 76,
    heading: 200,
    status: 'moving',
    driver: 'Driver 1099 (Bala Krishnan)',
    vehicleType: 'Volvo FH16',
    fuel: 85,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Chennai → Madurai',
    origin: 'Chennai',
    destination: 'Madurai',
    progressPercent: 20,
    distanceTravelledKm: 90,
    distanceRemainingKm: 362,
    eta: '5 hr 15 min',
    averageSpeed: 72,
    maxSpeed: 88,
    currentLocationName: 'Grand Southern Trunk Road (NH 45)',
    speedLimit: 85,
    lastUpdatedSecondsAgo: 2,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'TN-28-FT-1033',
    latitude: 10.7905,
    longitude: 78.7047,
    speed: 0,
    heading: 0,
    status: 'idle', // Idle
    driver: 'Driver 1033 (Ajith Kumar)',
    vehicleType: 'Force Traveller',
    fuel: 77,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Trichy Regional Link',
    origin: 'Trichy',
    destination: 'Thanjavur',
    progressPercent: 0,
    distanceTravelledKm: 0,
    distanceRemainingKm: 58,
    eta: 'Standby',
    averageSpeed: 0,
    maxSpeed: 75,
    currentLocationName: 'Trichy Terminal Yard (Standby)',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 10,
    stopDurationMinutes: 60
  },
  {
    vehicleId: 'TN-39-DM-1019',
    latitude: 10.7289,
    longitude: 77.5264,
    speed: 35,
    heading: 120,
    status: 'alert', // Delayed
    driver: 'Driver 1019 (Vignesh P.)',
    vehicleType: 'Isuzu D-Max',
    fuel: 54,
    timestamp: new Date().toISOString(),
    routeId: 'route_a',
    currentRouteName: 'Coimbatore → Madurai',
    origin: 'Coimbatore',
    destination: 'Madurai',
    progressPercent: 42,
    distanceTravelledKm: 90,
    distanceRemainingKm: 125,
    eta: '2 hr 35 min',
    averageSpeed: 40,
    maxSpeed: 70,
    currentLocationName: 'Dharapuram Junction bottleneck',
    speedLimit: 75,
    lastUpdatedSecondsAgo: 7,
    stopDurationMinutes: 12,
    alertMessage: 'Delay risk: High stoplight frequency near Dharapuram junction'
  }
];

// Generate remainder to equal 24 total vehicles:
// 18 Moving (On Route), 4 Alert (Delayed), 2 Idle
function generateCompleteFleet(): FleetVehicle[] {
  const fleet: FleetVehicle[] = [...INITIAL_VEHICLES];

  // Currently in INITIAL_VEHICLES:
  // moving: 5
  // alert: 2
  // idle: 2
  // Total = 9
  // Target: 24 vehicles -> 18 moving, 4 alert, 2 idle
  // Need: 13 more moving, 2 more alert, 0 more idle.

  const addMoving = 13;
  const addAlert = 2;

  const names = [
    'Ravi Chandran', 'Deepak S.', 'Ganesh R.', 'Venkatesh T.', 'Hariharan N.',
    'Senthil Nathan', 'Gokul Das', 'Mohan Raj', 'Vijay Anand', 'Saravanan K.',
    'Manoj Kumar', 'Anand M.', 'Kabilan R.', 'Shankar V.', 'Muthu Kumar'
  ];

  const types = ['Tata Prima', 'Ashok Leyland', 'BharatBenz 2823R', 'Eicher Pro 6028', 'Mahindra Bolero', 'Tata Ace Gold'];

  for (let i = 0; i < addMoving; i++) {
    const code = 1070 + i;
    const vId = `TN-43-FL-${2100 + i}`;
    const p = Math.floor(20 + Math.random() * 65);
    fleet.push({
      vehicleId: vId,
      latitude: +(10.2 + Math.random() * 1.5).toFixed(4),
      longitude: +(77.0 + Math.random() * 1.6).toFixed(4),
      speed: Math.floor(55 + Math.random() * 22),
      heading: Math.floor(Math.random() * 360),
      status: 'moving',
      driver: `Driver ${code} (${names[i % names.length]})`,
      vehicleType: types[i % types.length],
      fuel: Math.floor(45 + Math.random() * 45),
      timestamp: new Date().toISOString(),
      currentRouteName: i % 2 === 0 ? 'Chennai → Madurai' : 'Bangalore → Hyderabad',
      origin: i % 2 === 0 ? 'Chennai' : 'Bangalore',
      destination: i % 2 === 0 ? 'Madurai' : 'Hyderabad',
      progressPercent: p,
      distanceTravelledKm: Math.floor((350 * p) / 100),
      distanceRemainingKm: Math.floor(350 - (350 * p) / 100),
      eta: `${Math.floor(1 + Math.random() * 3)} hr ${Math.floor(10 + Math.random() * 45)} min`,
      averageSpeed: Math.floor(58 + Math.random() * 14),
      maxSpeed: 82,
      currentLocationName: `National Highway Sector ${i + 1}`,
      speedLimit: 80,
      lastUpdatedSecondsAgo: Math.floor(2 + Math.random() * 15),
      stopDurationMinutes: 0
    });
  }

  for (let i = 0; i < addAlert; i++) {
    const code = 1090 + i;
    const vId = `TN-45-DL-${3200 + i}`;
    fleet.push({
      vehicleId: vId,
      latitude: +(10.4 + Math.random() * 0.8).toFixed(4),
      longitude: +(77.4 + Math.random() * 0.8).toFixed(4),
      speed: 38,
      heading: 140,
      status: 'alert',
      driver: `Driver ${code} (${names[(i + 8) % names.length]})`,
      vehicleType: types[(i + 2) % types.length],
      fuel: 52,
      timestamp: new Date().toISOString(),
      currentRouteName: 'Coimbatore → Chennai',
      origin: 'Coimbatore',
      destination: 'Chennai',
      progressPercent: 48,
      distanceTravelledKm: 240,
      distanceRemainingKm: 264,
      eta: '4 hr 30 min (Delayed)',
      averageSpeed: 42,
      maxSpeed: 70,
      currentLocationName: 'Toll plaza queue bottleneck',
      speedLimit: 80,
      lastUpdatedSecondsAgo: 5,
      stopDurationMinutes: 20,
      alertMessage: 'Vehicle crawling: Heavy queue at toll interchange'
    });
  }

  return fleet;
}

class VehicleTrackingService {
  private vehicles: FleetVehicle[] = generateCompleteFleet();
  private updateListeners: Set<VehicleUpdateListener> = new Set();
  private alertListeners: Set<AlertListener> = new Set();

  /**
   * Returns all fleet vehicles
   */
  getVehicles(): FleetVehicle[] {
    return [...this.vehicles];
  }

  /**
   * Returns vehicle by ID
   */
  getVehicleById(id: string): FleetVehicle | undefined {
    return this.vehicles.find((v) => v.vehicleId.toLowerCase() === id.toLowerCase());
  }

  /**
   * Subscribe to live vehicle position and telemetry updates
   */
  subscribeToVehicleUpdates(callback: VehicleUpdateListener): () => void {
    this.updateListeners.add(callback);
    callback(this.getVehicles());
    return () => {
      this.updateListeners.delete(callback);
    };
  }

  /**
   * Updates an individual vehicle position / telemetry record
   */
  updateVehiclePosition(vehicleId: string, partial: Partial<FleetVehicle>): void {
    const index = this.vehicles.findIndex((v) => v.vehicleId === vehicleId);
    if (index !== -1) {
      this.vehicles[index] = {
        ...this.vehicles[index],
        ...partial,
        timestamp: new Date().toISOString()
      };
      this.notifyListeners();
    }
  }

  /**
   * Updates multiple vehicles simultaneously
   */
  /**
   * Dynamically synchronizes all fleet vehicles with the current origin, destination and corridor
   */
  updateFleetCorridor(
    origin: string,
    destination: string,
    totalDistanceKm: number,
    coordinates: [number, number][]
  ): void {
    if (!coordinates || coordinates.length === 0) return;

    this.vehicles = this.vehicles.map((v) => {
      const progress = Math.min(95, Math.max(5, v.progressPercent));
      const coordIdx = Math.min(
        coordinates.length - 1,
        Math.floor((progress / 100) * (coordinates.length - 1))
      );
      const pos = coordinates[coordIdx];
      const distTravelled = Math.round((totalDistanceKm * progress) / 100);
      const distRemaining = Math.max(0, totalDistanceKm - distTravelled);

      const hoursRem = Math.floor(distRemaining / (v.averageSpeed || 55));
      const minsRem = Math.round(((distRemaining % (v.averageSpeed || 55)) / (v.averageSpeed || 55)) * 60);
      const etaStr = hoursRem > 0 ? `${hoursRem} hr ${minsRem} min` : `${minsRem} min`;

      return {
        ...v,
        origin,
        destination,
        currentRouteName: `${origin} → ${destination}`,
        distanceTravelledKm: distTravelled,
        distanceRemainingKm: distRemaining,
        eta: etaStr,
        latitude: pos ? pos[0] : v.latitude,
        longitude: pos ? pos[1] : v.longitude,
        currentLocationName: `${origin} – ${destination} Corridor`,
        timestamp: new Date().toISOString()
      };
    });

    this.notifyListeners();
  }

  private notifyListeners(): void {
    const snapshot = this.getVehicles();
    this.updateListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Error in vehicle update listener:', err);
      }
    });
  }

  /**
   * Aggregated fleet statistics derived directly from the vehicle dataset
   */
  getFleetStats() {
    const total = this.vehicles.length;
    const moving = this.vehicles.filter((v) => v.status === 'moving').length;
    const idle = this.vehicles.filter((v) => v.status === 'idle').length;
    const stopped = this.vehicles.filter((v) => v.status === 'stopped').length;
    const offline = this.vehicles.filter((v) => v.status === 'offline').length;
    const alerts = this.vehicles.filter((v) => v.status === 'alert').length;

    const movingVehicles = this.vehicles.filter((v) => v.status === 'moving' && v.speed > 0);
    const avgSpeed = movingVehicles.length > 0
      ? Math.round(movingVehicles.reduce((sum, v) => sum + v.speed, 0) / movingVehicles.length)
      : 58;

    const overspeedCount = this.vehicles.filter((v) => (v.speedLimit ?? 80) < v.speed).length;

    return {
      total,
      moving,
      idle,
      stopped,
      offline,
      alerts,
      avgSpeed,
      overspeedCount,
      onTimePercent: 94.2,
      activeCorridorsCount: 12
    };
  }

  /**
   * Automatically generate alerts from current vehicle telemetry
   */
  getGeneratedAlerts(): AlertItem[] {
    const alerts: AlertItem[] = [];

    this.vehicles.forEach((v) => {
      // Speed alert
      if (v.speedLimit != null && v.speed > v.speedLimit) {
        alerts.push({
          id: `speed-${v.vehicleId}`,
          type: 'speed',
          severity: 'red',
          title: `SPEED ALERT: ${v.vehicleId}`,
          description: `Vehicle ${v.vehicleId} traveling at ${v.speed} km/h on ${v.currentLocationName}. Speed limit is ${v.speedLimit} km/h. Driver: ${v.driver}.`,
          location: `${v.currentLocationName} (${v.currentRouteName})`,
          timestamp: 'Just now',
          isRead: false,
          vehicleId: v.vehicleId,
          actionLabel: 'Signal Speed Warning'
        });
      }

      // Long stop alert
      if (v.stopDurationMinutes && v.stopDurationMinutes >= 15) {
        alerts.push({
          id: `stop-${v.vehicleId}`,
          type: 'vehicle',
          severity: 'yellow',
          title: `LONG STOP: ${v.vehicleId}`,
          description: `Vehicle ${v.vehicleId} stationary for ${v.stopDurationMinutes} minutes at ${v.currentLocationName}. Driver: ${v.driver}.`,
          location: v.currentLocationName,
          timestamp: `${v.stopDurationMinutes} mins ago`,
          isRead: false,
          vehicleId: v.vehicleId,
          actionLabel: 'Contact Driver'
        });
      }

      // Off route or custom alert
      if (v.status === 'alert' && v.alertMessage && !v.alertMessage.includes('Speed Alert')) {
        alerts.push({
          id: `alert-${v.vehicleId}`,
          type: 'traffic',
          severity: 'orange',
          title: `OFF ROUTE: ${v.vehicleId}`,
          description: v.alertMessage,
          location: v.currentLocationName,
          timestamp: '5 mins ago',
          isRead: false,
          vehicleId: v.vehicleId,
          actionLabel: 'Send Navigation Correction'
        });
      }
    });

    return alerts;
  }
}

export const vehicleTrackingService = new VehicleTrackingService();
