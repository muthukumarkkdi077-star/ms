/**
 * RouteMind AI - Vehicle Simulation Service
 * Animates fleet vehicles smoothly along actual calculated route polylines
 * using realistic geometric interpolation and heading calculations.
 */

import { FleetVehicle } from '../types';
import { vehicleTrackingService } from './vehicleTrackingService';

export type TrackingMode = 'simulation' | 'live';

interface VehicleSimState {
  vehicleId: string;
  progressPercent: number; // 0 to 100
  targetSpeed: number; // km/h
  isMoving: boolean;
}

// Haversine distance in kilometers
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing in degrees from point 1 to point 2
function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

class SimulationService {
  private mode: TrackingMode = 'simulation';
  private timer: number | null = null;
  private currentPolyline: [number, number][] = [];
  private cumulativeDistances: number[] = [];
  private totalRouteDistanceKm: number = 214;
  private secondsSinceUpdate: number = 0;

  // Active simulated fleet on the selected route
  private simStates: Map<string, VehicleSimState> = new Map([
    ['RM-204', { vehicleId: 'RM-204', progressPercent: 68, targetSpeed: 68, isMoving: true }],
    ['RM-201', { vehicleId: 'RM-201', progressPercent: 35, targetSpeed: 0, isMoving: false }],
    ['RM-202', { vehicleId: 'RM-202', progressPercent: 14, targetSpeed: 74, isMoving: true }],
    ['RM-207', { vehicleId: 'RM-207', progressPercent: 48, targetSpeed: 52, isMoving: true }],
    ['RM-211', { vehicleId: 'RM-211', progressPercent: 91, targetSpeed: 62, isMoving: true }],
    ['RM-215', { vehicleId: 'RM-215', progressPercent: 62, targetSpeed: 96, isMoving: true }]
  ]);

  constructor() {
    this.startSimulation();
  }

  getMode(): TrackingMode {
    return this.mode;
  }

  setMode(mode: TrackingMode) {
    this.mode = mode;
    if (mode === 'simulation' && !this.timer) {
      this.startSimulation();
    }
  }

  /**
   * Set the route coordinates along which vehicles should move
   */
  setRoutePolyline(coordinates: [number, number][], totalDistanceKm: number = 214) {
    if (!coordinates || coordinates.length < 2) return;
    this.currentPolyline = coordinates;
    this.totalRouteDistanceKm = totalDistanceKm;

    // Precalculate cumulative distances
    this.cumulativeDistances = [0];
    let sum = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const d = getDistanceKm(
        coordinates[i - 1][0],
        coordinates[i - 1][1],
        coordinates[i][0],
        coordinates[i][1]
      );
      sum += d;
      this.cumulativeDistances.push(sum);
    }
    this.totalRouteDistanceKm = sum > 0 ? sum : totalDistanceKm;

    // Immediately update initial positions along the new route
    this.stepSimulation(true);
  }

  /**
   * Find interpolated point and bearing along route polyline at a specific distance
   */
  private getPointAtDistance(distanceKm: number): {
    lat: number;
    lng: number;
    heading: number;
  } {
    if (this.currentPolyline.length < 2) {
      return { lat: 10.3624, lng: 77.9695, heading: 145 };
    }

    const clampedDist = Math.max(0, Math.min(distanceKm, this.totalRouteDistanceKm));

    // Find the segment containing this distance
    let segIndex = 0;
    while (
      segIndex < this.cumulativeDistances.length - 1 &&
      this.cumulativeDistances[segIndex + 1] < clampedDist
    ) {
      segIndex++;
    }

    const p1 = this.currentPolyline[segIndex];
    const p2 = this.currentPolyline[Math.min(segIndex + 1, this.currentPolyline.length - 1)];

    const segStart = this.cumulativeDistances[segIndex];
    const segEnd = this.cumulativeDistances[Math.min(segIndex + 1, this.cumulativeDistances.length - 1)];
    const segLen = segEnd - segStart;

    const fraction = segLen > 0 ? (clampedDist - segStart) / segLen : 0;

    const lat = p1[0] + (p2[0] - p1[0]) * fraction;
    const lng = p1[1] + (p2[1] - p1[1]) * fraction;
    const heading = calculateBearing(p1[0], p1[1], p2[0], p2[1]);

    return { lat, lng, heading: Math.round(heading) };
  }

  startSimulation() {
    if (this.timer) clearInterval(this.timer);

    // Update every 1.5 seconds for visible, fluid animation
    this.timer = window.setInterval(() => {
      if (this.mode === 'simulation') {
        this.stepSimulation();
      }
    }, 1500);
  }

  stopSimulation() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private stepSimulation(force: boolean = false) {
    this.secondsSinceUpdate = (this.secondsSinceUpdate % 3) + 1;

    this.simStates.forEach((state, vehicleId) => {
      const existing = vehicleTrackingService.getVehicleById(vehicleId);
      if (!existing) return;

      let newProgress = state.progressPercent;
      let newSpeed = state.targetSpeed;

      if (state.isMoving) {
        // Advance progress smoothly (simulated speed multiplier so motion is clearly observable)
        const progressIncrement = 0.22 + Math.random() * 0.15;
        newProgress = (newProgress + progressIncrement) % 100;
        state.progressPercent = newProgress;

        // Slight speed fluctuation around target
        newSpeed = Math.round(state.targetSpeed + (Math.random() * 6 - 3));
      } else {
        newSpeed = 0;
      }

      // Convert progress to distance along route
      const travelledKm = Math.round((this.totalRouteDistanceKm * newProgress) / 100);
      const remainingKm = Math.max(0, Math.round(this.totalRouteDistanceKm - travelledKm));

      let pos = { lat: existing.latitude, lng: existing.longitude, heading: existing.heading };
      if (this.currentPolyline.length >= 2) {
        pos = this.getPointAtDistance(travelledKm);
      }

      // Calculate realistic ETA
      const remainingHours = newSpeed > 0 ? remainingKm / newSpeed : remainingKm / 55;
      const hours = Math.floor(remainingHours);
      const mins = Math.round((remainingHours - hours) * 60);
      const etaStr = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

      // Determine location description along Coimbatore -> Madurai
      let locationDesc = existing.currentLocationName;
      if (newProgress < 20) locationDesc = 'Pollachi / Kinathukadavu Arterial';
      else if (newProgress < 40) locationDesc = 'Dharapuram Highway Junction';
      else if (newProgress < 60) locationDesc = 'Oddanchatram Agricultural Corridor';
      else if (newProgress < 80) locationDesc = 'Near Dindigul 4-Lane Bypass';
      else if (newProgress < 95) locationDesc = 'Vadipatti Express Stretch';
      else locationDesc = 'Madurai Ring Road Hub';

      // Update in vehicle tracking service
      vehicleTrackingService.updateVehiclePosition(vehicleId, {
        latitude: +pos.lat.toFixed(5),
        longitude: +pos.lng.toFixed(5),
        heading: pos.heading,
        speed: newSpeed,
        progressPercent: Math.round(newProgress),
        distanceTravelledKm: travelledKm,
        distanceRemainingKm: remainingKm,
        eta: etaStr,
        currentLocationName: locationDesc,
        lastUpdatedSecondsAgo: this.secondsSinceUpdate,
        fuel: Math.max(15, existing.fuel - (state.isMoving ? 0.05 : 0.01))
      });
    });
  }
}

export const simulationService = new SimulationService();
