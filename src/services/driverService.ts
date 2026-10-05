import { Driver } from '../types';

export const driverService = {
  async getDrivers(): Promise<Driver[]> {
    try {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      return data.drivers || [];
    } catch (err) {
      console.warn('[driverService] Falling back to registry:', err);
      return [];
    }
  },

  async addDriver(driver: Partial<Driver>): Promise<Driver | null> {
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driver)
      });
      const data = await res.json();
      return data.driver || null;
    } catch (err) {
      return null;
    }
  }
};
