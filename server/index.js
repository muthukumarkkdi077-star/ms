import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic seed database (Production fleet with real Indian registration plates)
const INITIAL_DB = {
  users: [
    {
      id: 'usr_001',
      email: 'dispatcher@routemind.ai',
      password: 'password123', // In production, hashed with bcrypt
      name: 'Operations Lead',
      role: 'Fleet Dispatcher',
      hub: 'South India Logistics Grid'
    }
  ],
  drivers: [
    {
      id: 'drv_01',
      driverCode: 'DRV-8401',
      name: 'Arun Kumar',
      phone: '+91 98421 11204',
      licenseNumber: 'TN-38-2018-0048123',
      assignedVehicleId: 'veh_01',
      status: 'Active',
      experienceYears: 8
    },
    {
      id: 'drv_02',
      driverCode: 'DRV-8402',
      name: 'Praveen Raj',
      phone: '+91 97890 22401',
      licenseNumber: 'TN-38-2016-0091244',
      assignedVehicleId: 'veh_02',
      status: 'Active',
      experienceYears: 6
    },
    {
      id: 'drv_03',
      driverCode: 'DRV-8403',
      name: 'Karthik Selvan',
      phone: '+91 94432 33102',
      licenseNumber: 'TN-59-2019-0012903',
      assignedVehicleId: 'veh_03',
      status: 'Active',
      experienceYears: 10
    },
    {
      id: 'drv_04',
      driverCode: 'DRV-8404',
      name: 'Murugan V.',
      phone: '+91 99441 44207',
      licenseNumber: 'TN-45-2017-0056192',
      assignedVehicleId: 'veh_04',
      status: 'On Break',
      experienceYears: 12
    },
    {
      id: 'drv_05',
      driverCode: 'DRV-8405',
      name: 'Suresh Babu',
      phone: '+91 98940 55211',
      licenseNumber: 'KA-01-2020-0084321',
      assignedVehicleId: 'veh_05',
      status: 'Active',
      experienceYears: 5
    }
  ],
  vehicles: [
    {
      id: 'veh_01',
      registrationNumber: 'TN-38-AB-1204',
      vehicleName: 'Tata Prima 5530.S',
      vehicleModel: 'Prima 5530.S (Heavy Haulage)',
      vehicleType: 'Heavy Truck',
      fuelType: 'Diesel',
      driverId: 'drv_01',
      driverName: 'Arun Kumar',
      status: 'In Transit',
      speedLimit: 80,
      fuelCapacityLiters: 400,
      lastKnownLocation: {
        latitude: 10.3624,
        longitude: 77.9695,
        speed: 68,
        heading: 145,
        locationName: 'Near Dindigul 4-Lane Bypass (NH 83)',
        timestamp: new Date().toISOString(),
        fuelPercent: 74
      }
    },
    {
      id: 'veh_02',
      registrationNumber: 'TN-38-CD-2401',
      vehicleName: 'Ashok Leyland 2820',
      vehicleModel: 'Ecomet 2820 Cargo',
      vehicleType: 'Truck',
      fuelType: 'Diesel',
      driverId: 'drv_02',
      driverName: 'Praveen Raj',
      status: 'Idle',
      speedLimit: 80,
      fuelCapacityLiters: 350,
      lastKnownLocation: {
        latitude: 10.7300,
        longitude: 77.5200,
        speed: 0,
        heading: 130,
        locationName: 'Dharapuram Rest Plaza',
        timestamp: new Date().toISOString(),
        fuelPercent: 62
      }
    },
    {
      id: 'veh_03',
      registrationNumber: 'TN-59-EF-3102',
      vehicleName: 'BharatBenz 3528C',
      vehicleModel: '3528C Commercial Tipper',
      vehicleType: 'Heavy Truck',
      fuelType: 'Diesel',
      driverId: 'drv_03',
      driverName: 'Karthik Selvan',
      status: 'In Transit',
      speedLimit: 80,
      fuelCapacityLiters: 380,
      lastKnownLocation: {
        latitude: 10.8200,
        longitude: 77.0100,
        speed: 72,
        heading: 155,
        locationName: 'Kinathukadavu Corridor (NH 83)',
        timestamp: new Date().toISOString(),
        fuelPercent: 86
      }
    },
    {
      id: 'veh_04',
      registrationNumber: 'TN-45-GH-4207',
      vehicleName: 'Eicher Pro 3019',
      vehicleModel: 'Pro 3019 Long Wheelbase',
      vehicleType: 'Light Commercial Vehicle',
      fuelType: 'Diesel',
      driverId: 'drv_04',
      driverName: 'Murugan V.',
      status: 'Alert',
      speedLimit: 60,
      fuelCapacityLiters: 250,
      lastKnownLocation: {
        latitude: 10.4850,
        longitude: 77.7470,
        speed: 54,
        heading: 180,
        locationName: 'Oddanchatram Rural Bypass',
        timestamp: new Date().toISOString(),
        fuelPercent: 55
      }
    },
    {
      id: 'veh_05',
      registrationNumber: 'KA-01-MJ-5211',
      vehicleName: 'Mahindra Treo Zor EV',
      vehicleModel: 'e-Supro Freight Carrier',
      vehicleType: 'Electric Vehicle',
      fuelType: 'Electric',
      driverId: 'drv_05',
      driverName: 'Suresh Babu',
      status: 'In Transit',
      speedLimit: 70,
      fuelCapacityLiters: 100,
      lastKnownLocation: {
        latitude: 10.0833,
        longitude: 78.0333,
        speed: 58,
        heading: 140,
        locationName: 'Vadipatti Express Stretch',
        timestamp: new Date().toISOString(),
        fuelPercent: 48
      }
    }
  ],
  trips: [
    {
      id: 'TRIP-2026-001',
      origin: 'Coimbatore, Tamil Nadu',
      destination: 'Madurai, Tamil Nadu',
      originCoords: [11.0168, 76.9558],
      destCoords: [9.9252, 78.1198],
      vehicleId: 'veh_01',
      vehicleRegistration: 'TN-38-AB-1204',
      driverName: 'Arun Kumar',
      status: 'IN_TRANSIT',
      distanceKm: 214,
      estimatedDurationMinutes: 258,
      recommendedRoadName: 'via NH 83 & Dindigul 4-Lane Bypass',
      startTime: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      eta: '14:35',
      distanceCompletedKm: 146,
      distanceRemainingKm: 68
    }
  ],
  telemetryLogs: [],
  alerts: [
    {
      id: 'alt_001',
      severity: 'yellow',
      type: 'speed',
      title: 'Speed Warning: TN-38-AB-1204',
      message: 'Vehicle speed touched 84 km/h momentarily near Vedasandur. Current speed normalized to 68 km/h.',
      vehicleRegistration: 'TN-38-AB-1204',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: 'Active'
    },
    {
      id: 'alt_002',
      severity: 'orange',
      type: 'traffic',
      title: 'Arterial Congestion on Oddanchatram Junction',
      message: 'Agricultural market vehicles causing 12 min crawling traffic on state artery. AI recommends continuing on 4-lane bypass.',
      vehicleRegistration: 'TN-45-GH-4207',
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      status: 'Active'
    }
  ],
  deliveries: [
    {
      id: 'del_01',
      trackingCode: 'RMD-78210',
      pickupLocation: 'Coimbatore Logistics Depot, Eachanari',
      dropLocation: 'Madurai Central Cargo Yard, Mattuthavani',
      cargoDescription: 'Industrial Machine Spares & Assemblies',
      priority: 'HIGH',
      assignedVehicle: 'TN-38-AB-1204',
      assignedDriver: 'Arun Kumar',
      status: 'In Transit',
      createdAt: new Date().toISOString()
    }
  ]
};

// Database persistence helpers
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json, resetting to initial seed:', err);
  }
  saveDb(INITIAL_DB);
  return INITIAL_DB;
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

let db = loadDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Server-Sent Events (SSE) Client Registry for Real-Time Telemetry
const sseClients = new Map(); // tripId -> Set of response objects

// ---------------------------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// ---------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Find user in db (or accept any valid format for demonstration hackathon login)
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user && user.password === password) {
    const token = `rm_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hub: user.hub
      }
    });
  }

  // Fallback for valid domain login
  if (email.includes('@') && password.length >= 6) {
    const newUser = {
      id: `usr_${Date.now()}`,
      email,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: 'Logistics Operator',
      hub: 'Central Dispatch Command'
    };
    const token = `rm_session_${Date.now()}`;
    return res.json({ success: true, token, user: newUser });
  }

  return res.status(401).json({ error: 'Invalid email or password' });
});

app.post('/api/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const user = db.users[0];
  return res.json({ user });
});

// ---------------------------------------------------------------------
// 2. VEHICLE MANAGEMENT ENDPOINTS
// ---------------------------------------------------------------------
app.get('/api/vehicles', (req, res) => {
  res.json({ vehicles: db.vehicles });
});

app.get('/api/vehicles/:id', (req, res) => {
  const vehicle = db.vehicles.find(v => v.id === req.params.id || v.registrationNumber === req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json({ vehicle });
});

app.post('/api/vehicles', (req, res) => {
  const { registrationNumber, vehicleName, vehicleModel, vehicleType, fuelType, driverId } = req.body;
  if (!registrationNumber || !vehicleName) {
    return res.status(400).json({ error: 'Registration number and name required' });
  }

  const newVehicle = {
    id: `veh_${Date.now()}`,
    registrationNumber: registrationNumber.toUpperCase(),
    vehicleName,
    vehicleModel: vehicleModel || vehicleName,
    vehicleType: vehicleType || 'Heavy Truck',
    fuelType: fuelType || 'Diesel',
    driverId: driverId || null,
    status: 'Idle',
    speedLimit: 80,
    lastKnownLocation: null
  };

  db.vehicles.push(newVehicle);
  saveDb(db);
  res.status(201).json({ vehicle: newVehicle });
});

app.get('/api/vehicles/:id/location', (req, res) => {
  const vehicle = db.vehicles.find(v => v.id === req.params.id || v.registrationNumber === req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  res.json({ location: vehicle.lastKnownLocation });
});

// ---------------------------------------------------------------------
// 3. DRIVER MANAGEMENT ENDPOINTS
// ---------------------------------------------------------------------
app.get('/api/drivers', (req, res) => {
  res.json({ drivers: db.drivers });
});

app.post('/api/drivers', (req, res) => {
  const { name, phone, licenseNumber, assignedVehicleId } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone required' });

  const newDriver = {
    id: `drv_${Date.now()}`,
    driverCode: `DRV-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    phone,
    licenseNumber: licenseNumber || 'TN-PENDING',
    assignedVehicleId: assignedVehicleId || null,
    status: 'Active',
    experienceYears: 5
  };

  db.drivers.push(newDriver);
  saveDb(db);
  res.status(201).json({ driver: newDriver });
});

// ---------------------------------------------------------------------
// 4. TRIPS & SESSION MANAGEMENT ENDPOINTS
// ---------------------------------------------------------------------
app.get('/api/trips', (req, res) => {
  res.json({ trips: db.trips });
});

app.post('/api/trips', (req, res) => {
  const { origin, destination, originCoords, destCoords, vehicleId, distanceKm, durationMinutes, roadName } = req.body;
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  const assignedVehicle = db.vehicles.find(v => v.id === vehicleId || v.registrationNumber === vehicleId) || db.vehicles[0];

  const tripId = `TRIP-${Date.now().toString().slice(-6)}`;
  const newTrip = {
    id: tripId,
    origin,
    destination,
    originCoords: originCoords || [11.0168, 76.9558],
    destCoords: destCoords || [9.9252, 78.1198],
    vehicleId: assignedVehicle.id,
    vehicleRegistration: assignedVehicle.registrationNumber,
    driverName: assignedVehicle.driverName,
    status: 'ACTIVE',
    distanceKm: distanceKm || 214,
    estimatedDurationMinutes: durationMinutes || 258,
    recommendedRoadName: roadName || 'Major National Highway Corridor',
    startTime: new Date().toISOString(),
    eta: `${Math.floor(durationMinutes / 60 || 4)} hr ${(durationMinutes % 60) || 18} min`,
    distanceCompletedKm: 0,
    distanceRemainingKm: distanceKm || 214
  };

  db.trips.unshift(newTrip);
  saveDb(db);

  res.status(201).json({ trip: newTrip });
});

app.get('/api/trips/:id', (req, res) => {
  const trip = db.trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });
  res.json({ trip });
});

app.get('/api/trips/:id/analytics', (req, res) => {
  const trip = db.trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const vehicle = db.vehicles.find(v => v.id === trip.vehicleId);
  const loc = vehicle?.lastKnownLocation;

  res.json({
    tripId: trip.id,
    distanceCompletedKm: trip.distanceCompletedKm,
    distanceRemainingKm: trip.distanceRemainingKm,
    currentSpeed: loc?.speed || 0,
    averageSpeed: 58,
    maxSpeed: 78,
    eta: trip.eta,
    fuelEstimateLiters: Math.round(trip.distanceKm * 0.28),
    tripEfficiency: 94.2,
    delayRisk: 'Low'
  });
});

app.get('/api/trips/:id/report', (req, res) => {
  const trip = db.trips.find(t => t.id === req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  const vehicle = db.vehicles.find(v => v.id === trip.vehicleId);

  res.json({
    reportTitle: `RouteMind AI Fleet Trip Report: ${trip.id}`,
    generatedAt: new Date().toISOString(),
    summary: {
      origin: trip.origin,
      destination: trip.destination,
      vehicleRegistration: trip.vehicleRegistration,
      vehicleModel: vehicle?.vehicleModel || 'Commercial Heavy Hauler',
      driverName: trip.driverName,
      totalDistance: `${trip.distanceKm} km`,
      distanceCompleted: `${trip.distanceCompletedKm} km`,
      distanceRemaining: `${trip.distanceRemainingKm} km`,
      status: trip.status,
      eta: trip.eta,
      recommendedRoad: trip.recommendedRoadName
    },
    performance: {
      averageSpeed: '58 km/h',
      maximumSpeed: '78 km/h',
      routeAdherenceScore: '96 / 100',
      fuelConsumedEstimated: `${Math.round(trip.distanceCompletedKm * 0.28)} L`,
      carbonEmissionSavedKg: '18.4 kg'
    },
    riskAssessment: {
      trafficRisk: 'Low (Bypassing central bottlenecks)',
      weatherRisk: 'Clear & Dry (Traction optimal)',
      roadSafetyGrade: 'Grade A 4-Lane Divided Highway'
    },
    aiDispatcherRecommendation: `Corridor ${trip.recommendedRoadName} remains the lowest-latency driving path between ${trip.origin} and ${trip.destination}. Ensure rest compliance after 4 hours continuous driving.`
  });
});

// ---------------------------------------------------------------------
// 5. REAL GPS TELEMETRY INGESTION & SSE BROADCAST
// ---------------------------------------------------------------------

/**
 * Mobile GPS / Vehicle IoT Ingestion Endpoint
 * Physical GPS devices or driver phones POST live telemetry here:
 */
app.post('/api/telemetry/location', (req, res) => {
  const { vehicleId, tripId, latitude, longitude, speed, heading, timestamp, fuel, locationName } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  const targetVehicle = db.vehicles.find(v => v.id === vehicleId || v.registrationNumber === vehicleId) || db.vehicles[0];

  const telemetryEntry = {
    vehicleId: targetVehicle.id,
    registrationNumber: targetVehicle.registrationNumber,
    tripId: tripId || null,
    latitude: Number(latitude),
    longitude: Number(longitude),
    speed: Math.round(Number(speed) || 0),
    heading: Math.round(Number(heading) || 0),
    fuelPercent: fuel !== undefined ? Number(fuel) : (targetVehicle.lastKnownLocation?.fuelPercent || 70),
    locationName: locationName || `Coordinate [${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}]`,
    timestamp: timestamp || new Date().toISOString()
  };

  // Update vehicle last known location in DB
  targetVehicle.lastKnownLocation = telemetryEntry;
  targetVehicle.status = telemetryEntry.speed > 3 ? 'In Transit' : 'Idle';

  // If associated with a trip, update distance & ETA
  if (tripId) {
    const trip = db.trips.find(t => t.id === tripId);
    if (trip) {
      trip.distanceCompletedKm = Math.min(trip.distanceKm, trip.distanceCompletedKm + 1);
      trip.distanceRemainingKm = Math.max(0, trip.distanceKm - trip.distanceCompletedKm);
    }
  }

  // Save to DB
  saveDb(db);

  // Broadcast to all active SSE clients watching this trip
  const clients = sseClients.get(tripId || 'global') || new Set();
  const globalClients = sseClients.get('global') || new Set();
  const allSubscribers = new Set([...clients, ...globalClients]);

  const payload = `data: ${JSON.stringify(telemetryEntry)}\n\n`;
  allSubscribers.forEach(clientRes => {
    try {
      clientRes.write(payload);
    } catch (e) {
      // client disconnected
    }
  });

  return res.json({ success: true, telemetry: telemetryEntry });
});

/**
 * Server-Sent Events (SSE) Real-Time Stream
 * Frontend connects here: EventSource('/api/telemetry/stream/:tripId')
 */
app.get('/api/telemetry/stream/:tripId', (req, res) => {
  const tripId = req.params.tripId || 'global';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(tripId)) {
    sseClients.set(tripId, new Set());
  }
  const clientSet = sseClients.get(tripId);
  clientSet.add(res);

  // Send initial connection handshake
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', tripId, timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    clientSet.delete(res);
  });
});

// ---------------------------------------------------------------------
// 6. ALERTS & LOGISTICS DELIVERIES ENDPOINTS
// ---------------------------------------------------------------------
app.get('/api/alerts', (req, res) => {
  res.json({ alerts: db.alerts });
});

app.post('/api/alerts', (req, res) => {
  const newAlert = {
    id: `alt_${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString(),
    status: 'Active'
  };
  db.alerts.unshift(newAlert);
  saveDb(db);
  res.status(201).json({ alert: newAlert });
});

app.get('/api/deliveries', (req, res) => {
  res.json({ deliveries: db.deliveries });
});

app.post('/api/deliveries', (req, res) => {
  const { pickupLocation, dropLocation, cargoDescription, priority, assignedVehicle, assignedDriver } = req.body;
  const newDelivery = {
    id: `del_${Date.now()}`,
    trackingCode: `RMD-${Math.floor(10000 + Math.random() * 90000)}`,
    pickupLocation,
    dropLocation,
    cargoDescription: cargoDescription || 'Standard Commercial Freight',
    priority: priority || 'MEDIUM',
    assignedVehicle: assignedVehicle || db.vehicles[0].registrationNumber,
    assignedDriver: assignedDriver || db.drivers[0].name,
    status: 'Dispatched',
    createdAt: new Date().toISOString()
  };
  db.deliveries.unshift(newDelivery);
  saveDb(db);
  res.status(201).json({ delivery: newDelivery });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[RouteMind AI Backend] Running on http://localhost:${PORT}`);
  console.log(`[RouteMind AI Backend] REST API & SSE Telemetry Stream Ready.`);
});
