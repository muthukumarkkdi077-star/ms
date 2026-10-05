import { TelemetryPoint } from '../types';

type TelemetryListener = (data: TelemetryPoint) => void;

class TrackingService {
  private activeEventSource: EventSource | null = null;
  private listeners: Set<TelemetryListener> = new Set();
  private lastTelemetry: TelemetryPoint | null = null;
  private currentTripId: string | null = null;

  /**
   * Subscribe to real-time live GPS telemetry stream for a specific trip
   */
  subscribeToTrip(tripId: string, onUpdate: TelemetryListener): () => void {
    this.currentTripId = tripId;
    this.listeners.add(onUpdate);

    // If we have an existing connection to a different trip, close it
    if (this.activeEventSource) {
      this.activeEventSource.close();
      this.activeEventSource = null;
    }

    try {
      const url = `/api/telemetry/stream/${encodeURIComponent(tripId)}`;
      const es = new EventSource(url);
      this.activeEventSource = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.latitude !== undefined && parsed.longitude !== undefined) {
            this.lastTelemetry = parsed;
            this.listeners.forEach((cb) => cb(parsed));
          }
        } catch (e) {
          console.warn('[trackingService] SSE parse warning:', e);
        }
      };

      es.onerror = (err) => {
        // EventSource will automatically retry in modern browsers
      };
    } catch (err) {
      console.warn('[trackingService] EventSource setup notice:', err);
    }

    return () => {
      this.listeners.delete(onUpdate);
      if (this.listeners.size === 0 && this.activeEventSource) {
        this.activeEventSource.close();
        this.activeEventSource = null;
      }
    };
  }

  getLastTelemetry(): TelemetryPoint | null {
    return this.lastTelemetry;
  }

  clearTelemetry(): void {
    this.lastTelemetry = null;
  }

  /**
   * Sends real GPS telemetry from mobile device or GPS tracker to backend
   * Endpoint: POST /api/telemetry/location
   */
  async sendTelemetry(packet: {
    vehicleId: string;
    tripId?: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    fuel?: number;
    locationName?: string;
  }): Promise<{ success: boolean; telemetry?: TelemetryPoint }> {
    try {
      const res = await fetch('/api/telemetry/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...packet,
          timestamp: new Date().toISOString()
        })
      });
      const data = await res.json();
      return { success: true, telemetry: data.telemetry };
    } catch (err) {
      console.error('[trackingService] Failed to send telemetry:', err);
      return { success: false };
    }
  }
}

export const trackingService = new TrackingService();
