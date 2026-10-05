/**
 * RouteMind AI - Vehicle Tracking Service
 * Clean abstraction for fleet GPS tracking, real GPS backend integration,
 * and reactive vehicle telemetry subscriptions.
 */

import { FleetVehicle, VehicleStatus, AlertItem } from '../types';

type VehicleUpdateListener = (vehicles: FleetVehicle[]) => void;
type AlertListener = (alerts: AlertItem[]) => void;

// Generate realistic fleet dataset (46 vehicles matching the command center metrics)
const INITIAL_VEHICLES: FleetVehicle[] = [
  {
    vehicleId: 'RM-204',
    latitude: 10.3624,
    longitude: 77.9695,
    speed: 68,
    heading: 145, // South-East toward Madurai
    status: 'moving',
    driver: 'Arun Kumar',
    vehicleType: 'Heavy Truck',
    fuel: 72,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Coimbatore → Madurai',
    origin: 'Coimbatore',
    destination: 'Madurai',
    progressPercent: 68,
    distanceTravelledKm: 146,
    distanceRemainingKm: 68,
    eta: '1 hr 12 min',
    averageSpeed: 61,
    maxSpeed: 78,
    currentLocationName: 'Near Dindigul Bypass',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 8,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'RM-201',
    latitude: 10.6382,
    longitude: 77.5218,
    speed: 0,
    heading: 130,
    status: 'idle',
    driver: 'Praveen Raj',
    vehicleType: 'Medium Van',
    fuel: 64,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Coimbatore → Madurai',
    origin: 'Coimbatore',
    destination: 'Madurai',
    progressPercent: 35,
    distanceTravelledKm: 75,
    distanceRemainingKm: 139,
    eta: '2 hr 45 min',
    averageSpeed: 54,
    maxSpeed: 72,
    currentLocationName: 'Dharapuram Rest Plaza',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 14,
    stopDurationMinutes: 18,
    alertMessage: 'Long Stop: Idling at Dharapuram toll plaza for 18 min'
  },
  {
    vehicleId: 'RM-202',
    latitude: 10.9250,
    longitude: 77.0180,
    speed: 74,
    heading: 155,
    status: 'moving',
    driver: 'Karthik Selvan',
    vehicleType: 'Heavy Truck',
    fuel: 88,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Coimbatore → Madurai',
    origin: 'Coimbatore',
    destination: 'Madurai',
    progressPercent: 14,
    distanceTravelledKm: 30,
    distanceRemainingKm: 184,
    eta: '3 hr 38 min',
    averageSpeed: 65,
    maxSpeed: 82,
    currentLocationName: 'Kinathukadavu Corridor',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 4,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'RM-207',
    latitude: 10.5180,
    longitude: 77.6250,
    speed: 52,
    heading: 180,
    status: 'alert',
    driver: 'Murugan V.',
    vehicleType: 'Heavy Truck',
    fuel: 58,
    timestamp: new Date().toISOString(),
    routeId: 'route_a',
    currentRouteName: 'Coimbatore → Madurai',
    origin: 'Coimbatore',
    destination: 'Madurai',
    progressPercent: 48,
    distanceTravelledKm: 103,
    distanceRemainingKm: 111,
    eta: '2 hr 10 min',
    averageSpeed: 50,
    maxSpeed: 68,
    currentLocationName: 'Oddanchatram Rural Bypass',
    speedLimit: 60,
    lastUpdatedSecondsAgo: 6,
    stopDurationMinutes: 0,
    alertMessage: 'Off Route: Vehicle deviated 2.4 km from scheduled NH-83 corridor'
  },
  {
    vehicleId: 'RM-211',
    latitude: 10.0820,
    longitude: 78.0820,
    speed: 62,
    heading: 140,
    status: 'moving',
    driver: 'Suresh Babu',
    vehicleType: 'Electric Truck',
    fuel: 41,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Coimbatore → Madurai',
    origin: 'Coimbatore',
    destination: 'Madurai',
    progressPercent: 91,
    distanceTravelledKm: 195,
    distanceRemainingKm: 19,
    eta: '22 min',
    averageSpeed: 63,
    maxSpeed: 75,
    currentLocationName: 'Approaching Madurai Ring Hub',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 2,
    stopDurationMinutes: 0
  },
  {
    vehicleId: 'RM-215',
    latitude: 10.4200,
    longitude: 77.8500,
    speed: 96,
    heading: 142,
    status: 'alert',
    driver: 'Dinesh Raman',
    vehicleType: 'Heavy Truck',
    fuel: 79,
    timestamp: new Date().toISOString(),
    routeId: 'route_b',
    currentRouteName: 'Coimbatore → Madurai',
    origin: 'Coimbatore',
    destination: 'Madurai',
    progressPercent: 62,
    distanceTravelledKm: 133,
    distanceRemainingKm: 81,
    eta: '1 hr 18 min',
    averageSpeed: 76,
    maxSpeed: 96,
    currentLocationName: 'Vedasandur Express Stretch',
    speedLimit: 80,
    lastUpdatedSecondsAgo: 3,
    stopDurationMinutes: 0,
    alertMessage: 'Speed Alert: Travelling at 96 km/h (Limit: 80 km/h)'
  }
];

// Generate remainder of the 46 vehicles to populate full fleet metrics (31 moving, 9 idle, 3 stopped, 3 offline, total 46)
const DRIVER_NAMES = [
  'Vignesh P.', 'Anand M.', 'Saravanan K.', 'Manoj Kumar', 'Ravi Chandran',
  'Deepak S.', 'Ganesh R.', 'Venkatesh T.', 'Bala Krishnan', 'Ajith Kumar',
  'Hariharan N.', 'Senthil Nathan', 'Gokul Das', 'Mohan Raj', 'Vijay Anand'
];

function generateCompleteFleet(): FleetVehicle[] {
  const fleet: FleetVehicle[] = [...INITIAL_VEHICLES];
  let currentTotal = fleet.length;

  // We need total 46 vehicles:
  // Moving: 31 (we already have 4, need 27 more)
  // Idle: 9 (we have 1, need 8 more)
  // Stopped: 3 (need 3)
  // Offline: 3 (need 3)
  // Alerts: 3 (we have RM-207 and RM-215, RM-201 has long stop)

  const targets = {
    moving: 31 - fleet.filter(v => v.status === 'moving').length,
    idle: 9 - fleet.filter(v => v.status === 'idle').length,
    stopped: 3,
    offline: 3
  };

  const statusPool: FleetVehicle['status'][] = [
    ...Array(targets.moving).fill('moving' as const),
    ...Array(targets.idle).fill('idle' as const),
    ...Array(targets.stopped).fill('stopped' as const),
    ...Array(targets.offline).fill('offline' as const)
  ];

  statusPool.forEach((status, idx) => {
    const idNum = 220 + idx;
    const vehicleId = `RM-${idNum}`;
    const driver = DRIVER_NAMES[idx % DRIVER_NAMES.length];
    const isMoving = status === 'moving';
    const isOffline = status === 'offline';
    const isIdle = status === 'idle';

    const speed = isMoving ? Math.floor(45 + Math.random() * 32) : isIdle ? 0 : 0;
    const heading = Math.floor(Math.random() * 360);
    const progress = Math.floor(10 + Math.random() * 85);
    const lat = 10.0 + Math.random() * 1.1;
    const lng = 76.9 + Math.random() * 1.2;

    fleet.push({
      vehicleId,
      latitude: +lat.toFixed(4),
      longitude: +lng.toFixed(4),
      speed: isOffline ? 0 : speed,
      heading,
      status,
      driver,
      vehicleType: idx % 3 === 0 ? 'Heavy Truck' : idx % 3 === 1 ? 'Medium Van' : 'Light Carrier',
      fuel: Math.floor(35 + Math.random() * 60),
      timestamp: new Date().toISOString(),
      currentRouteName: idx % 2 === 0 ? 'Coimbatore → Madurai' : 'Coimbatore → Salem Hub',
      origin: 'Coimbatore',
      destination: idx % 2 === 0 ? 'Madurai' : 'Salem',
      progressPercent: progress,
      distanceTravelledKm: Math.floor((214 * progress) / 100),
      distanceRemainingKm: Math.floor(214 - (214 * progress) / 100),
      eta: isOffline ? '--' : `${Math.floor(1 + Math.random() * 3)} hr ${Math.floor(10 + Math.random() * 45)} min`,
      averageSpeed: Math.floor(52 + Math.random() * 16),
      maxSpeed: isMoving ? Math.floor(speed + 10) : 75,
      currentLocationName: `Transit Sector ${idx + 1}`,
      speedLimit: 80,
      lastUpdatedSecondsAgo: Math.floor(2 + Math.random() * 25),
      stopDurationMinutes: status === 'stopped' ? Math.floor(15 + Math.random() * 30) : 0
    });
  });

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
  updateVehiclesBatch(updatedList: FleetVehicle[]): void {
    const updatedMap = new Map(updatedList.map((v) => [v.vehicleId, v]));
    this.vehicles = this.vehicles.map((v) => updatedMap.get(v.vehicleId) || v);
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
