import { Vehicle } from '../types';

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const res = await fetch('/api/vehicles');
      const data = await res.json();
      return data.vehicles || [];
    } catch (err) {
      console.warn('[vehicleService] Falling back to default vehicle registry:', err);
      return [];
    }
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const res = await fetch(`/api/vehicles/${encodeURIComponent(id)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.vehicle || null;
    } catch (err) {
      return null;
    }
  },

  async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle)
      });
      const data = await res.json();
      return data.vehicle || null;
    } catch (err) {
      return null;
    }
  },

  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    return this.addVehicle(vehicle);
  }
};
