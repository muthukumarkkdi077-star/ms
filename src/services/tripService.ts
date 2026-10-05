import { Trip, TripReport } from '../types';

export const tripService = {
  async getTrips(): Promise<Trip[]> {
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      return data.trips || [];
    } catch (err) {
      return [];
    }
  },

  async getTripById(id: string): Promise<Trip | null> {
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.trip || null;
    } catch (err) {
      return null;
    }
  },

  async createTrip(params: {
    origin: string;
    destination: string;
    originCoords?: [number, number];
    destCoords?: [number, number];
    vehicleId?: string;
    distanceKm?: number;
    durationMinutes?: number;
    roadName?: string;
  }): Promise<Trip | null> {
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      return data.trip || null;
    } catch (err) {
      console.error('[tripService] Failed to create trip:', err);
      return null;
    }
  },

  async getTripAnalytics(tripId: string) {
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/analytics`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async getTripReport(tripId: string): Promise<TripReport | null> {
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/report`);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }
};
