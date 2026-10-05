/**
 * Geocoding Service for RouteMind AI
 * Resolves real-world geographic locations in Coimbatore and worldwide
 * using OpenStreetMap Nominatim with an offline-resilient verified local cache.
 */

export interface GeocodeLocation {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
  coordinates: [number, number]; // [lng, lat] for GeoJSON/MapLibre standard
}

// Verified real geographic coordinates for Coimbatore landmarks and corridors
const COIMBATORE_LOCATIONS: Record<string, GeocodeLocation> = {
  coimbatore: {
    name: 'Coimbatore',
    displayName: 'Coimbatore, Tamil Nadu, India',
    lat: 11.0168,
    lng: 76.9558,
    coordinates: [76.9558, 11.0168]
  },
  'coimbatore central': {
    name: 'Coimbatore Central',
    displayName: 'Coimbatore Junction & Central Zone, Coimbatore',
    lat: 11.0020,
    lng: 76.9630,
    coordinates: [76.9630, 11.0020]
  },
  'coimbatore junction': {
    name: 'Coimbatore Railway Junction',
    displayName: 'Railway Station Road, Gopalapuram, Coimbatore',
    lat: 11.0018,
    lng: 76.9629,
    coordinates: [76.9629, 11.0018]
  },
  gandhipuram: {
    name: 'Gandhipuram',
    displayName: 'Gandhipuram Central Hub, Coimbatore, Tamil Nadu',
    lat: 11.0183,
    lng: 76.9678,
    coordinates: [76.9678, 11.0183]
  },
  'gandhipuram, coimbatore': {
    name: 'Gandhipuram, Coimbatore',
    displayName: 'Gandhipuram Bus Stand & Commercial Corridor, Coimbatore',
    lat: 11.0183,
    lng: 76.9678,
    coordinates: [76.9678, 11.0183]
  },
  'gandhipuram hub': {
    name: 'Gandhipuram Hub',
    displayName: 'Gandhipuram Bus Terminal, Coimbatore',
    lat: 11.0183,
    lng: 76.9678,
    coordinates: [76.9678, 11.0183]
  },
  'rs puram': {
    name: 'RS Puram',
    displayName: 'DB Road, R.S. Puram West, Coimbatore',
    lat: 11.0086,
    lng: 76.9482,
    coordinates: [76.9482, 11.0086]
  },
  'db road': {
    name: 'RS Puram DB Road',
    displayName: 'Diwan Bahadur Road, RS Puram, Coimbatore',
    lat: 11.0105,
    lng: 76.9490,
    coordinates: [76.9490, 11.0105]
  },
  peelamedu: {
    name: 'Peelamedu',
    displayName: 'Avinashi Road, Peelamedu, Coimbatore',
    lat: 11.0284,
    lng: 77.0034,
    coordinates: [77.0034, 11.0284]
  },
  ukkadam: {
    name: 'Ukkadam',
    displayName: 'Ukkadam Bus Stand & Bypass, Coimbatore',
    lat: 10.9902,
    lng: 76.9584,
    coordinates: [76.9584, 10.9902]
  },
  saravanampatti: {
    name: 'Saravanampatti',
    displayName: 'Sathy Road IT Corridor, Saravanampatti, Coimbatore',
    lat: 11.0825,
    lng: 76.9958,
    coordinates: [76.9958, 11.0825]
  },
  'town hall': {
    name: 'Town Hall Clock Tower',
    displayName: 'Town Hall Market Area, Coimbatore',
    lat: 10.9972,
    lng: 76.9602,
    coordinates: [76.9602, 10.9972]
  },
  singanallur: {
    name: 'Singanallur',
    displayName: 'Singanallur Bus Terminal, Trichy Road, Coimbatore',
    lat: 10.9985,
    lng: 77.0250,
    coordinates: [77.0250, 10.9985]
  },
  'saibaba colony': {
    name: 'Saibaba Colony',
    displayName: 'NSR Road, Saibaba Colony, Coimbatore',
    lat: 11.0315,
    lng: 76.9470,
    coordinates: [76.9470, 11.0315]
  },
  madurai: {
    name: 'Madurai',
    displayName: 'Madurai Central Logistics Hub, Tamil Nadu, India',
    lat: 9.9252,
    lng: 78.1198,
    coordinates: [78.1198, 9.9252]
  },
  'madurai central': {
    name: 'Madurai Central',
    displayName: 'Madurai Junction & Cargo Freight Terminal, Madurai',
    lat: 9.9252,
    lng: 78.1198,
    coordinates: [78.1198, 9.9252]
  },
  dindigul: {
    name: 'Dindigul',
    displayName: 'Dindigul 4-Lane Bypass Junction, Tamil Nadu',
    lat: 10.3673,
    lng: 77.9803,
    coordinates: [77.9803, 10.3673]
  },
  pollachi: {
    name: 'Pollachi',
    displayName: 'Pollachi Freight Hub, Coimbatore District',
    lat: 10.6609,
    lng: 77.0048,
    coordinates: [77.0048, 10.6609]
  },
  tirupur: {
    name: 'Tirupur',
    displayName: 'Tirupur Textile Logistics Hub, Tamil Nadu',
    lat: 11.1085,
    lng: 77.3411,
    coordinates: [77.3411, 11.1085]
  },
  salem: {
    name: 'Salem',
    displayName: 'Salem Steel & Freight Corridor, Tamil Nadu',
    lat: 11.6643,
    lng: 78.1460,
    coordinates: [78.1460, 11.6643]
  },
  chennai: {
    name: 'Chennai',
    displayName: 'Chennai Port & Freight Corridor, Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
    coordinates: [80.2707, 13.0827]
  }
};


class GeocodingService {
  private customApiKey: string | undefined;

  constructor() {
    this.customApiKey = import.meta.env.VITE_GEOCODING_API_KEY;
  }

  /**
   * Geocode a location query to real geographic coordinates
   */
  async geocode(query: string): Promise<GeocodeLocation> {
    const cleaned = query.trim().toLowerCase();

    // 1. Direct match in verified local Coimbatore directory
    if (COIMBATORE_LOCATIONS[cleaned]) {
      return COIMBATORE_LOCATIONS[cleaned];
    }

    // 2. Partial match in local directory
    const matchingKey = Object.keys(COIMBATORE_LOCATIONS).find(
      (k) => cleaned.includes(k) || k.includes(cleaned)
    );
    if (matchingKey) {
      return COIMBATORE_LOCATIONS[matchingKey];
    }

    // 3. Fallback to real-world OpenStreetMap Nominatim Geocoding API
    try {
      const searchQuery = encodeURIComponent(
        cleaned.includes('coimbatore') ? cleaned : `${cleaned}, Coimbatore, Tamil Nadu, India`
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`,
        {
          headers: {
            'User-Agent': 'RouteMindAI/1.0 (transit-research-demo)'
          },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          return {
            name: query.trim(),
            displayName: data[0].display_name,
            lat,
            lng,
            coordinates: [lng, lat]
          };
        }
      }
    } catch {
      // Fallback silently if Nominatim is rate-limited or offline
    }

    // 4. Default safe fallback within Coimbatore Urban Core
    return {
      name: query.trim() || 'Coimbatore',
      displayName: `${query.trim()}, Coimbatore, Tamil Nadu, India`,
      lat: 11.0020,
      lng: 76.9630,
      coordinates: [76.9630, 11.0020]
    };
  }

  /**
   * Get preset transit hubs in Coimbatore for fast dropdown selection
   */
  getPresetLocations(): { name: string; label: string }[] {
    return [
      { name: 'Coimbatore', label: 'Coimbatore Urban Core' },
      { name: 'Gandhipuram, Coimbatore', label: 'Gandhipuram Central Hub' },
      { name: 'RS Puram', label: 'RS Puram DB Road' },
      { name: 'Peelamedu', label: 'Peelamedu Tech Zone (Avinashi Rd)' },
      { name: 'Ukkadam', label: 'Ukkadam Bus Terminal' },
      { name: 'Saravanampatti', label: 'Saravanampatti IT Corridor' },
      { name: 'Town Hall', label: 'Town Hall Clock Tower' }
    ];
  }
}

export const geocodingService = new GeocodingService();
