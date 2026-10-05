/**
 * RouteMind AI - Google Maps JavaScript API & Routing Service
 * Supports Google Maps JS API, Traffic Layer, Routes Library, Advanced Markers,
 * and dark logistics command center styling.
 */

// Global window declaration for Google Maps
declare global {
  interface Window {
    google?: any;
    initGoogleMapsCallback?: () => void;
  }
}

export const GOOGLE_MAPS_DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#090d16' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0c1a2e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#0284c7' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0369a1' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#060c18' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#00f0ff' }]
  }
];

class MapsService {
  private apiKey: string;
  private isLoaded: boolean = false;
  private loadPromise: Promise<boolean> | null = null;

  constructor() {
    const rawKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    this.apiKey = rawKey.trim();
  }

  /**
   * Returns true if a valid non-placeholder API key is set
   */
  isConfigured(): boolean {
    if (!this.apiKey) return false;
    if (this.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') return false;
    if (this.apiKey.startsWith('YOUR_')) return false;
    return this.apiKey.length > 10;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Dynamically loads Google Maps JavaScript API with routes, marker, places, and geometry libraries
   */
  async loadGoogleMaps(): Promise<boolean> {
    if (this.isLoaded && window.google?.maps) {
      return true;
    }

    if (!this.isConfigured()) {
      return false;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<boolean>((resolve) => {
      // Check if already in DOM
      if (window.google?.maps) {
        this.isLoaded = true;
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          this.isLoaded = true;
          resolve(true);
        });
        existingScript.addEventListener('error', () => resolve(false));
        return;
      }

      const callbackName = `googleMapsCallback_${Date.now()}`;
      (window as any)[callbackName] = () => {
        this.isLoaded = true;
        delete (window as any)[callbackName];
        resolve(true);
      };

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        this.apiKey
      )}&libraries=routes,places,marker,geometry&v=weekly&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      script.onerror = (err) => {
        console.warn('Failed to load Google Maps script:', err);
        delete (window as any)[callbackName];
        resolve(false);
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }
}

export const mapsService = new MapsService();
