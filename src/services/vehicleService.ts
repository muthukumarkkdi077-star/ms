import { Vehicle } from '../types';

export const DEFAULT_FLEET_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    registrationNumber: 'TN-38-AB-4521',
    vehicleName: 'Tata Prima 5530.S',
    vehicleModel: 'Tata Prima',
    vehicleType: 'Heavy Truck',
    fuelType: 'Diesel',
    driverId: 'drv-1042',
    driverName: 'Driver 1042 (Arun Kumar)',
    status: 'In Transit',
    speedLimit: 80,
    fuelCapacityLiters: 400,
    lastKnownLocation: {
      vehicleId: 'veh-1',
      registrationNumber: 'TN-38-AB-4521',
      latitude: 10.3673,
      longitude: 77.9803,
      speed: 68,
      heading: 145,
      fuelPercent: 74,
      locationName: 'Dindigul 4-Lane Bypass (NH 83)',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-2',
    registrationNumber: 'TN-38-CD-2401',
    vehicleName: 'Ashok Leyland Captain 40i',
    vehicleModel: 'Ashok Leyland',
    vehicleType: 'Heavy Truck',
    fuelType: 'Diesel',
    driverId: 'drv-1088',
    driverName: 'Driver 1088 (Praveen Raj)',
    status: 'Alert',
    speedLimit: 80,
    fuelCapacityLiters: 375,
    lastKnownLocation: {
      vehicleId: 'veh-2',
      registrationNumber: 'TN-38-CD-2401',
      latitude: 10.9980,
      longitude: 77.2800,
      speed: 42,
      heading: 130,
      fuelPercent: 62,
      locationName: 'Palladam Bottleneck Sector',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-3',
    registrationNumber: 'TN-59-EF-3102',
    vehicleName: 'Mahindra Bolero Maxi Truck Plus',
    vehicleModel: 'Mahindra Bolero',
    vehicleType: 'Pickup',
    fuelType: 'Diesel',
    driverId: 'drv-1021',
    driverName: 'Driver 1021 (Karthik Selvan)',
    status: 'Idle',
    speedLimit: 75,
    fuelCapacityLiters: 60,
    lastKnownLocation: {
      vehicleId: 'veh-3',
      registrationNumber: 'TN-59-EF-3102',
      latitude: 9.9252,
      longitude: 78.1198,
      speed: 0,
      heading: 0,
      fuelPercent: 88,
      locationName: 'Madurai Central Terminal (Depot Standby)',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-4',
    registrationNumber: 'TN-45-GH-4207',
    vehicleName: 'BharatBenz 2823R Haulage',
    vehicleModel: 'BharatBenz 2823R',
    vehicleType: 'Heavy Truck',
    fuelType: 'Diesel',
    driverId: 'drv-1055',
    driverName: 'Driver 1055 (Murugan V.)',
    status: 'In Transit',
    speedLimit: 80,
    fuelCapacityLiters: 380,
    lastKnownLocation: {
      vehicleId: 'veh-4',
      registrationNumber: 'TN-45-GH-4207',
      latitude: 10.9601,
      longitude: 78.0766,
      speed: 72,
      heading: 160,
      fuelPercent: 81,
      locationName: 'Karur Highway Corridor (NH 44)',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-5',
    registrationNumber: 'TN-37-JK-5510',
    vehicleName: 'Eicher Pro 6028 Cargo',
    vehicleModel: 'Eicher Pro 6028',
    vehicleType: 'Heavy Truck',
    fuelType: 'Diesel',
    driverId: 'drv-1067',
    driverName: 'Driver 1067 (Suresh Babu)',
    status: 'In Transit',
    speedLimit: 80,
    fuelCapacityLiters: 350,
    lastKnownLocation: {
      vehicleId: 'veh-5',
      registrationNumber: 'TN-37-JK-5510',
      latitude: 11.6643,
      longitude: 78.1460,
      speed: 65,
      heading: 175,
      fuelPercent: 68,
      locationName: 'Salem Bypass Express Link',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-6',
    registrationNumber: 'TN-38-MN-6184',
    vehicleName: 'Tata Ace Gold Plus',
    vehicleModel: 'Tata Ace Gold',
    vehicleType: 'Light Carrier',
    fuelType: 'CNG',
    driverId: 'drv-1014',
    driverName: 'Driver 1014 (Dinesh Raman)',
    status: 'In Transit',
    speedLimit: 70,
    fuelCapacityLiters: 70,
    lastKnownLocation: {
      vehicleId: 'veh-6',
      registrationNumber: 'TN-38-MN-6184',
      latitude: 11.0168,
      longitude: 76.9558,
      speed: 48,
      heading: 90,
      fuelPercent: 92,
      locationName: 'Coimbatore Industrial Belt',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-7',
    registrationNumber: 'TN-09-XY-9901',
    vehicleName: 'Volvo FH16 520 Heavy',
    vehicleModel: 'Volvo FH16',
    vehicleType: 'Heavy Truck',
    fuelType: 'Diesel',
    driverId: 'drv-1099',
    driverName: 'Driver 1099 (Bala Krishnan)',
    status: 'In Transit',
    speedLimit: 85,
    fuelCapacityLiters: 450,
    lastKnownLocation: {
      vehicleId: 'veh-7',
      registrationNumber: 'TN-09-XY-9901',
      latitude: 13.0827,
      longitude: 80.2707,
      speed: 76,
      heading: 200,
      fuelPercent: 85,
      locationName: 'Chennai Outer Ring Road',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-8',
    registrationNumber: 'TN-28-FT-1033',
    vehicleName: 'Force Traveller 4020',
    vehicleModel: 'Force Traveller',
    vehicleType: 'Medium Van',
    fuelType: 'Diesel',
    driverId: 'drv-1033',
    driverName: 'Driver 1033 (Ajith Kumar)',
    status: 'Idle',
    speedLimit: 80,
    fuelCapacityLiters: 90,
    lastKnownLocation: {
      vehicleId: 'veh-8',
      registrationNumber: 'TN-28-FT-1033',
      latitude: 10.7905,
      longitude: 78.7047,
      speed: 0,
      heading: 0,
      fuelPercent: 77,
      locationName: 'Trichy Cargo Yard (Scheduled Break)',
      timestamp: new Date().toISOString()
    }
  },
  {
    id: 'veh-9',
    registrationNumber: 'TN-39-DM-1019',
    vehicleName: 'Isuzu D-Max V-Cross',
    vehicleModel: 'Isuzu D-Max',
    vehicleType: 'Pickup',
    fuelType: 'Diesel',
    driverId: 'drv-1019',
    driverName: 'Driver 1019 (Vignesh P.)',
    status: 'Alert',
    speedLimit: 80,
    fuelCapacityLiters: 76,
    lastKnownLocation: {
      vehicleId: 'veh-9',
      registrationNumber: 'TN-39-DM-1019',
      latitude: 10.7289,
      longitude: 77.5264,
      speed: 35,
      heading: 120,
      fuelPercent: 54,
      locationName: 'Dharapuram Town Junction',
      timestamp: new Date().toISOString()
    }
  }
];

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        const data = await res.json();
        if (data.vehicles && data.vehicles.length > 0) {
          return data.vehicles;
        }
      }
    } catch (err) {
      // Fallback
    }
    return DEFAULT_FLEET_VEHICLES;
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const res = await fetch(`/api/vehicles/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        return data.vehicle || null;
      }
    } catch (err) {}
    const found = DEFAULT_FLEET_VEHICLES.find((v) => v.id === id || v.registrationNumber === id);
    return found || null;
  },

  async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicle)
      });
      if (res.ok) {
        const data = await res.json();
        return data.vehicle || null;
      }
    } catch (err) {}
    return null;
  },

  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
    return this.addVehicle(vehicle);
  }
};
