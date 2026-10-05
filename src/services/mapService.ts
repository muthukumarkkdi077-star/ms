/**
 * Map Service for RouteMind AI
 * Clean provider abstraction for MapLibre GL JS operating on
 * OpenStreetMap (OSM) real-world road and geographic data.
 * Does not require a private API key for demo / development.
 */

import { StyleSpecification } from 'maplibre-gl';

export type MapStyleMode = 'dark' | 'streets' | 'satellite';

export interface MapConfig {
  initialCenter: [number, number]; // [lng, lat]
  initialZoom: number;
  minZoom: number;
  maxZoom: number;
  bounds?: [[number, number], [number, number]];
}

// Coimbatore geographic boundary
export const COIMBATORE_CENTER: [number, number] = [76.9630, 11.0020]; // [lng, lat]

class MapService {
  private mapApiKey?: string;
  private customStyleUrl?: string;

  constructor() {
    this.mapApiKey = import.meta.env.VITE_MAP_API_KEY;
    this.customStyleUrl = import.meta.env.VITE_MAP_STYLE_URL;
  }

  /**
   * Default map configuration centered around Coimbatore, Tamil Nadu, India
   */
  getDefaultConfig(): MapConfig {
    return {
      initialCenter: COIMBATORE_CENTER,
      initialZoom: 13.5,
      minZoom: 10,
      maxZoom: 19
    };
  }

  /**
   * Generates a MapLibre style specification using free real-world
   * OpenStreetMap tiles with no API key required or watermarks.
   */
  getMapStyle(mode: MapStyleMode = 'dark'): StyleSpecification | string {
    // If a custom vector style URL was provided via .env, use it
    if (this.customStyleUrl) {
      return this.customStyleUrl;
    }

    if (mode === 'satellite') {
      return {
        version: 8,
        name: 'RouteMind Real Satellite',
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    }

    if (mode === 'streets') {
      return {
        version: 8,
        name: 'RouteMind Real Streets (OpenStreetMap)',
        sources: {
          'osm-streets': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: 'streets-layer',
            type: 'raster',
            source: 'osm-streets',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      };
    }

    // Default: Dark Mode based on OpenStreetMap real road network (Carto Dark Matter)
    // High contrast, real Coimbatore roads, zero watermarks, no API key needed
    return {
      version: 8,
      name: 'RouteMind Dark Navigation (OpenStreetMap)',
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
            'https://d.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
      },
      layers: [
        {
          id: 'dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }

  /**
   * Has a private API key been configured
   */
  hasApiKey(): boolean {
    return Boolean(this.mapApiKey);
  }
}

export const mapService = new MapService();
