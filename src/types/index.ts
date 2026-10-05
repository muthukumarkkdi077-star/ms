export type UserType = 'general' | 'elderly' | 'wheelchair' | 'mobility';
export type TravelMode = 'car' | 'bike' | 'walking' | 'transit' | 'delivery';
export type PriorityType = 'fastest' | 'lowest_cost' | 'most_accessible' | 'balanced';
export type VehicleStatus = 'In Transit' | 'Idle' | 'Stopped' | 'Offline' | 'Alert' | 'moving' | 'idle' | 'stopped' | 'offline' | 'alert';

export type VehicleType =
  | 'Heavy Truck'
  | 'Truck'
  | 'Light Commercial Vehicle'
  | 'Medium Van'
  | 'Light Carrier'
  | 'Electric Vehicle'
  | 'Van'
  | 'Pickup'
  | 'Car'
  | string;

export interface FleetVehicle {
  vehicleId: string;
  vehicleType: VehicleType;
  driver: string;
  status: 'moving' | 'idle' | 'stopped' | 'offline' | 'alert';
  speed: number;
  speedLimit?: number;
  averageSpeed?: number;
  maxSpeed?: number;
  heading: number;
  fuel: number;
  batteryPercent?: number;
  latitude: number;
  longitude: number;
  origin: string;
  destination: string;
  currentLocationName: string;
  distanceTravelledKm: number;
  distanceRemainingKm: number;
  eta: string;
  progressPercent: number;
  lastUpdatedSecondsAgo: number;
  alertMessage?: string;
  cargoWeightKg?: number;
  temperatureC?: number;
  timestamp?: string;
  routeId?: string;
  currentRouteName?: string;
  stopDurationMinutes?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hub?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface TrafficSegment {
  coordinates: [number, number][];
  level: 'low' | 'moderate' | 'heavy';
}

export interface RouteFeature {
  type: 'ramp' | 'stairs' | 'slope' | 'crossing' | 'construction' | 'shelter';
  location: [number, number];
  name: string;
  status: 'safe' | 'warning' | 'danger';
  description: string;
}

export interface RouteOption {
  id: string;
  name: string;
  codeName: string; // E.g. 'Recommended', 'Via NH 83'
  distanceKm: number;
  durationMin: number;
  trafficLevel: 'low' | 'moderate' | 'heavy';
  accessibilityScore: number; // 0-100
  elderlyFriendlinessScore: number; // 0-100
  delayRiskPercent: number; // 0-100
  estimatedCostInr: number;
  smartScore: number; // 0-100
  isRecommended: boolean;
  tagline?: string;
  reasons: string[];
  aiExplanation: string;
  eta: string;
  roadCondition: 'Smooth' | 'Moderate' | 'Uneven' | 'Under Maintenance';
  weatherImpact: 'None' | 'Light Drizzle' | 'Moderate Rain' | 'High Winds';
  color: string;
  coordinates: [number, number][];
  trafficSegments: TrafficSegment[];
  features?: RouteFeature[];
  turnByTurn?: {
    instruction: string;
    distance: string;
    icon: 'turn-left' | 'turn-right' | 'straight' | 'ramp' | 'destination';
    accessibilityNote?: string;
  }[];
  majorRoads?: string[];
  tollInfo?: string;
}

export interface Driver {
  id: string;
  driverCode: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedVehicleId?: string | null;
  status: 'Active' | 'On Break' | 'Off Duty';
  experienceYears?: number;
}

export interface TelemetryPoint {
  vehicleId: string;
  registrationNumber: string;
  tripId?: string | null;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  fuelPercent: number;
  locationName: string;
  timestamp: string;
  accuracy?: number;
}

export interface Vehicle {
  id: string;
  registrationNumber: string; // Real Indian registration e.g. TN-38-AB-1204
  vehicleName: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  fuelType: 'Diesel' | 'Petrol' | 'Electric' | 'CNG';
  driverId?: string | null;
  driverName?: string;
  status: 'In Transit' | 'Idle' | 'Stopped' | 'Offline' | 'Alert';
  speedLimit: number;
  fuelCapacityLiters?: number;
  lastKnownLocation?: TelemetryPoint | null;
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  originCoords: [number, number];
  destCoords: [number, number];
  vehicleId: string;
  vehicleRegistration: string;
  driverName: string;
  status: 'ACTIVE' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  distanceKm: number;
  estimatedDurationMinutes: number;
  recommendedRoadName: string;
  startTime: string;
  eta: string;
  distanceCompletedKm: number;
  distanceRemainingKm: number;
}

export interface TripReport {
  reportTitle: string;
  generatedAt: string;
  summary: {
    origin: string;
    destination: string;
    vehicleRegistration: string;
    vehicleModel: string;
    driverName: string;
    totalDistance: string;
    distanceCompleted: string;
    distanceRemaining: string;
    status: string;
    eta: string;
    recommendedRoad: string;
  };
  performance: {
    averageSpeed: string;
    maximumSpeed: string;
    routeAdherenceScore: string;
    fuelConsumedEstimated: string;
    carbonEmissionSavedKg: string;
  };
  riskAssessment: {
    trafficRisk: string;
    weatherRisk: string;
    roadSafetyGrade: string;
  };
  aiDispatcherRecommendation: string;
}

export interface DeliveryItem {
  id: string;
  code: string;
  location: string;
  recipient: string;
  address: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  eta: string;
  distanceKm: number;
  vehicle: string;
  status: 'Pending' | 'In Transit' | 'Optimized' | 'Delivered';
  cargoType: string;
  coordinates: [number, number];
}

export interface AlertItem {
  id: string;
  type: 'traffic' | 'weather' | 'accessibility' | 'optimization' | 'speed' | 'vehicle';
  severity: 'red' | 'yellow' | 'orange' | 'green';
  title: string;
  description?: string;
  message?: string;
  location?: string;
  timestamp: string;
  impactMinutes?: number;
  isRead: boolean;
  actionLabel?: string;
  vehicleId?: string;
  vehicleRegistration?: string;
  status?: string;
}

export interface LiveTrafficInfo {
  routeSummary: string;
  status: 'Normal' | 'Moderate Traffic' | 'Heavy Traffic' | 'Severe Congestion' | 'Traffic data unavailable';
  statusColor: string;
  averageSpeedKmH: number;
  congestionPercent: number;
  lastUpdatedSecondsAgo: number;
  incidentCount: number;
  delayMinutes: number;
}
