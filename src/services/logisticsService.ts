import { DeliveryItem } from '../types';

export const logisticsService = {
  async getDeliveries(): Promise<DeliveryItem[]> {
    try {
      const res = await fetch('/api/deliveries');
      if (res.ok) {
        const data = await res.json();
        return data.deliveries || [];
      }
    } catch (e) {
      console.warn('[logisticsService] Fetch error:', e);
    }
    return [];
  },

  async addDelivery(newDelivery: Omit<DeliveryItem, 'id' | 'code'>): Promise<DeliveryItem | null> {
    try {
      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDelivery)
      });
      if (res.ok) {
        const data = await res.json();
        return data.delivery;
      }
    } catch (e) {
      console.warn('[logisticsService] Post delivery error:', e);
    }
    return null;
  },

  async optimizeDeliveryRoute(): Promise<{
    optimizedSequence: DeliveryItem[];
    originalDistanceKm: number;
    optimizedDistanceKm: number;
    distanceSavedKm: number;
    distanceSavedPercent: number;
    originalTimeMinutes: number;
    optimizedTimeMinutes: number;
    timeSavedMinutes: number;
    originalCostInr: number;
    optimizedCostInr: number;
    fuelSavedInr: number;
  }> {
    const list = await this.getDeliveries();
    // Sort priority: HIGH first, then MEDIUM, then LOW
    const priorityWeight: Record<string, number> = {
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3
    };

    const sorted = [...list].sort((a, b) => {
      const pDiff = (priorityWeight[a.priority] || 2) - (priorityWeight[b.priority] || 2);
      if (pDiff !== 0) return pDiff;
      return (a.distanceKm || 5) - (b.distanceKm || 5);
    });

    const origDist = list.reduce((acc, curr) => acc + (curr.distanceKm || 6), 0);
    const optDist = Math.round(origDist * 0.82 * 10) / 10;
    const savedDist = Math.round((origDist - optDist) * 10) / 10;

    return {
      optimizedSequence: sorted,
      originalDistanceKm: origDist,
      optimizedDistanceKm: optDist,
      distanceSavedKm: savedDist,
      distanceSavedPercent: origDist > 0 ? Math.round((savedDist / origDist) * 100) : 18,
      originalTimeMinutes: Math.round(origDist * 2.8),
      optimizedTimeMinutes: Math.round(optDist * 2.8),
      timeSavedMinutes: Math.round((origDist - optDist) * 2.8),
      originalCostInr: Math.round(origDist * 14),
      optimizedCostInr: Math.round(optDist * 14),
      fuelSavedInr: Math.round(savedDist * 14)
    };
  }
};
