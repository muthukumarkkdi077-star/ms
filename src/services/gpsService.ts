/**
 * RouteMind AI - Real-Time Vehicle GPS Telematics Service
 * 
 * Production-ready abstraction for vehicle GPS tracking.
 * Designed to ingest telemetry from:
 * - Hardware IoT Trackers (OBD-II, AIS-140 standard GPS)
 * - Mobile Driver App Geolocation (HTML5 / native sensor)
 * - Realtime streams (WebSocket / SSE / Supabase Realtime / MQTT)
 * 
 * Provides clear tracking modes:
 * - 'live_device': Real connected GPS hardware / mobile telemetry stream
 * - 'simulated': Deterministic road corridor simulation (demo / testing)
 * - 'pending': Vehicle registered, waiting for hardware GPS ping
 */

export interface VehicleTelemetryPacket {
  vehicleId: string;
  driverId?: string;
  driverName?: string;
  registrationNumber?: string;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // degrees 0-360
  timestamp: string; // ISO 8601
  destination?: string;
  origin?: string;
  locationName?: string;
  altitude?: number;
  accuracy?: number; // meters
  batteryPercent?: number;
  fuelPercent?: number;
  sourceType: 'iot_hardware' | 'mobile_gps' | 'simulation' | 'api_push';
}

export type GPSConnectionStatus = 'connected' | 'pending' | 'disconnected' | 'simulation';

export interface GPSListener {
  (packet: VehicleTelemetryPacket): void;
}

class GPSService {
  private activePackets: Map<string, VehicleTelemetryPacket> = new Map();
  private listeners: Set<GPSListener> = new Set();
  private connectionStatus: GPSConnectionStatus = 'simulation';
  private sseSource: EventSource | null = null;
  private watchPositionId: number | null = null;

  constructor() {
    this.initDefaultTelemetries();
  }

  private initDefaultTelemetries() {
    // Initial sample positions for enrolled vehicles (labeled as sample/simulation)
    const seed: VehicleTelemetryPacket[] = [
      {
        vehicleId: 'veh_01',
        registrationNumber: 'TN-38-AB-4521',
        driverName: 'Arun Kumar',
        driverId: 'drv_01',
        latitude: 10.3624,
        longitude: 77.9695,
        speed: 62,
        heading: 145,
        timestamp: new Date().toISOString(),
        origin: 'Coimbatore',
        destination: 'Madurai',
        locationName: 'Dindigul Bypass (NH 83)',
        sourceType: 'simulation'
      },
      {
        vehicleId: 'veh_02',
        registrationNumber: 'TN-38-CD-2401',
        driverName: 'Praveen Raj',
        driverId: 'drv_02',
        latitude: 10.7300,
        longitude: 77.5200,
        speed: 0,
        heading: 130,
        timestamp: new Date().toISOString(),
        origin: 'Coimbatore',
        destination: 'Madurai',
        locationName: 'Dharapuram Rest Plaza',
        sourceType: 'simulation'
      },
      {
        vehicleId: 'veh_03',
        registrationNumber: 'TN-59-EF-3102',
        driverName: 'Karthik Selvan',
        driverId: 'drv_03',
        latitude: 10.8200,
        longitude: 77.0100,
        speed: 70,
        heading: 155,
        timestamp: new Date().toISOString(),
        origin: 'Coimbatore',
        destination: 'Madurai',
        locationName: 'Kinathukadavu Corridor',
        sourceType: 'simulation'
      }
    ];

    seed.forEach((p) => this.activePackets.set(p.vehicleId, p));
  }

  /**
   * Subscribe to incoming vehicle GPS packets
   */
  public subscribe(listener: GPSListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Ingest a GPS packet from an external provider (IoT hardware, WebSocket, Supabase, or Mobile)
   */
  public ingestPacket(packet: VehicleTelemetryPacket): void {
    this.activePackets.set(packet.vehicleId, packet);
    if (packet.sourceType === 'iot_hardware' || packet.sourceType === 'mobile_gps') {
      this.connectionStatus = 'connected';
    }
    this.notifyListeners(packet);
  }

  /**
   * Broadcast packet to all registered UI views
   */
  private notifyListeners(packet: VehicleTelemetryPacket): void {
    this.listeners.forEach((listener) => {
      try {
        listener(packet);
      } catch (err) {
        console.warn('[GPSService] Error notifying listener:', err);
      }
    });
  }

  /**
   * Get latest telemetry packet for a specific vehicle
   */
  public getLatestPacket(vehicleId: string): VehicleTelemetryPacket | undefined {
    return this.activePackets.get(vehicleId);
  }

  /**
   * Get all active vehicle telemetry packets
   */
  public getAllActivePackets(): VehicleTelemetryPacket[] {
    return Array.from(this.activePackets.values());
  }

  /**
   * Connect browser mobile sensor / device GPS for field live testing
   */
  public startDeviceGeolocationTracking(assignedVehicleId: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        resolve(false);
        return;
      }

      this.stopDeviceGeolocationTracking();

      this.watchPositionId = navigator.geolocation.watchPosition(
        (pos) => {
          const packet: VehicleTelemetryPacket = {
            vehicleId: assignedVehicleId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            speed: Math.round((pos.coords.speed || 0) * 3.6), // convert m/s to km/h
            heading: pos.coords.heading || 0,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude || undefined,
            timestamp: new Date(pos.timestamp).toISOString(),
            sourceType: 'mobile_gps',
            locationName: 'Active Mobile GPS Sensor'
          };
          this.ingestPacket(packet);
          resolve(true);
        },
        (err) => {
          console.warn('[GPSService] Geolocation watch error:', err);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 10000
        }
      );
    });
  }

  /**
   * Disconnect device GPS sensor
   */
  public stopDeviceGeolocationTracking(): void {
    if (this.watchPositionId !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchPositionId);
      this.watchPositionId = null;
    }
  }

  /**
   * Connect to server SSE telemetry feed
   */
  public connectSSEFeed(endpoint: string = '/api/telemetry/stream'): void {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (this.sseSource) {
      this.sseSource.close();
    }

    try {
      this.sseSource = new EventSource(endpoint);
      this.sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.latitude && data.longitude) {
            this.ingestPacket({
              vehicleId: data.vehicleId || 'veh_01',
              driverId: data.driverId,
              latitude: Number(data.latitude),
              longitude: Number(data.longitude),
              speed: Number(data.speed || 0),
              heading: Number(data.heading || 0),
              timestamp: data.timestamp || new Date().toISOString(),
              destination: data.destination,
              locationName: data.locationName,
              sourceType: 'api_push'
            });
          }
        } catch (e) {}
      };

      this.sseSource.onerror = () => {
        this.connectionStatus = 'disconnected';
      };
    } catch (e) {
      this.connectionStatus = 'disconnected';
    }
  }

  public getConnectionStatus(): GPSConnectionStatus {
    return this.connectionStatus;
  }

  public setConnectionStatus(status: GPSConnectionStatus): void {
    this.connectionStatus = status;
  }
}

export const gpsService = new GPSService();
