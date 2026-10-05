import React, { useEffect, useRef, useState } from 'react';
import { RouteOption, Vehicle, TelemetryPoint, FleetVehicle } from '../../types';
import { googleMapsService, GOOGLE_MAPS_DARK_STYLE } from '../../services/googleMapsService';
import {
  Layers,
  Compass,
  ZoomIn,
  ZoomOut,
  Truck,
  AlertTriangle,
  Radio,
  CheckCircle2,
  X,
  Key,
  ShieldCheck,
  Eye,
  Activity
} from 'lucide-react';
import L from 'leaflet';

interface MapViewProps {
  routes: RouteOption[];
  selectedRouteId: string;
  onSelectRoute?: (id: string) => void;
  activeVehicle?: Vehicle | FleetVehicle | null;
  activeTelemetry?: TelemetryPoint | null;
  fleetVehicles?: (Vehicle | FleetVehicle)[];
  vehicles?: FleetVehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (vehicle: any) => void;
  showTrafficOverlay?: boolean;
  interactive?: boolean;
  className?: string;
  isAwaitingTelemetry?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
  activeVehicle = null,
  activeTelemetry = null,
  fleetVehicles = [],
  vehicles = [],
  selectedVehicleId = null,
  onSelectVehicle,
  showTrafficOverlay = true,
  interactive = true,
  className = 'h-full w-full',
  isAwaitingTelemetry = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Google Maps instances & references
  const googleMapRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const googlePolylinesRef = useRef<any[]>([]);
  const googleMarkersRef = useRef<any[]>([]);
  const vehicleMarkerRef = useRef<any>(null);

  // Leaflet fallback instances (when Google API key is missing)
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletPolyGroupRef = useRef<L.LayerGroup | null>(null);
  const leafletMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const leafletTileRef = useRef<L.TileLayer | null>(null);

  // States
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [isTrafficActive, setIsTrafficActive] = useState(showTrafficOverlay);
  const [currentLayerMode, setCurrentLayerMode] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const hasApiKey = googleMapsService.isConfigured();

  // 1. Initialize Map (Google Maps if configured, Leaflet Dark as fallback)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (hasApiKey) {
        const loaded = await googleMapsService.load();
        if (loaded && isMounted && window.google?.maps && mapContainerRef.current) {
          try {
            // Default center India (20.5937, 78.9629) or route center
            const center = { lat: 10.45, lng: 77.55 };
            const map = new window.google.maps.Map(mapContainerRef.current, {
              center,
              zoom: 8,
              styles: GOOGLE_MAPS_DARK_STYLE,
              disableDefaultUI: true,
              zoomControl: false,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false
            });

            const traffic = new window.google.maps.TrafficLayer();
            if (isTrafficActive) traffic.setMap(map);
            trafficLayerRef.current = traffic;
            googleMapRef.current = map;
            setIsGoogleMapsReady(true);
            return;
          } catch (e) {
            console.warn('[MapView] Google Maps initialization notice:', e);
          }
        }
      }

      // High-precision Dark Leaflet fallback
      if (mapContainerRef.current && !leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [10.45, 77.55],
          zoom: 8,
          zoomControl: false,
          attributionControl: false
        });

        const tileLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
          { subdomains: 'abcd', maxZoom: 19 }
        ).addTo(map);

        leafletTileRef.current = tileLayer;
        leafletPolyGroupRef.current = L.layerGroup().addTo(map);
        leafletMarkerGroupRef.current = L.layerGroup().addTo(map);
        leafletMapRef.current = map;
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      googleMapRef.current = null;
    };
  }, [hasApiKey]);

  // 2. Toggle Traffic Layer
  useEffect(() => {
    if (googleMapRef.current && trafficLayerRef.current) {
      if (isTrafficActive) {
        trafficLayerRef.current.setMap(googleMapRef.current);
      } else {
        trafficLayerRef.current.setMap(null);
      }
    }
  }, [isTrafficActive]);

  // 3. Render Google Maps Polylines & Markers
  useEffect(() => {
    if (!isGoogleMapsReady || !googleMapRef.current || !window.google?.maps) return;

    const map = googleMapRef.current;

    // Clear previous polylines & markers
    googlePolylinesRef.current.forEach((p) => p.setMap(null));
    googlePolylinesRef.current = [];

    googleMarkersRef.current.forEach((m) => m.setMap(null));
    googleMarkersRef.current = [];

    if (routes.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;
      const path = route.coordinates.map((c) => ({ lat: c[0], lng: c[1] }));
      path.forEach((pt) => bounds.extend(pt));

      if (isSelected) {
        const glow = new window.google.maps.Polyline({
          path,
          strokeColor: route.color,
          strokeOpacity: 0.35,
          strokeWeight: 12,
          map
        });
        googlePolylinesRef.current.push(glow);
      }

      const poly = new window.google.maps.Polyline({
        path,
        strokeColor: isSelected ? route.color : '#475569',
        strokeOpacity: isSelected ? 1.0 : 0.45,
        strokeWeight: isSelected ? 6 : 4,
        zIndex: isSelected ? 20 : 10,
        map
      });

      if (onSelectRoute) {
        poly.addListener('click', () => onSelectRoute(route.id));
      }
      googlePolylinesRef.current.push(poly);

      // Traffic-colored segments
      if (isSelected && isTrafficActive && route.trafficSegments) {
        route.trafficSegments.forEach((seg) => {
          const segColor =
            seg.level === 'heavy' ? '#ef4444' : seg.level === 'moderate' ? '#f59e0b' : '#10b981';
          const segLine = new window.google.maps.Polyline({
            path: seg.coordinates.map((c) => ({ lat: c[0], lng: c[1] })),
            strokeColor: segColor,
            strokeOpacity: 0.95,
            strokeWeight: 3.5,
            zIndex: 25,
            map
          });
          googlePolylinesRef.current.push(segLine);
        });
      }
    });

    // Origin & Destination Markers
    const originCoords = routes[0].coordinates[0];
    const destCoords = routes[0].coordinates[routes[0].coordinates.length - 1];

    const originMarker = new window.google.maps.Marker({
      position: { lat: originCoords[0], lng: originCoords[1] },
      map,
      title: 'Trip Origin',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#090d16',
        strokeWeight: 3
      }
    });
    googleMarkersRef.current.push(originMarker);

    const destMarker = new window.google.maps.Marker({
      position: { lat: destCoords[0], lng: destCoords[1] },
      map,
      title: 'Trip Destination',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#00f0ff',
        fillOpacity: 1,
        strokeColor: '#090d16',
        strokeWeight: 3
      }
    });
    googleMarkersRef.current.push(destMarker);

    // Active Vehicle Live GPS Marker (Only when real telemetry is present!)
    if (activeTelemetry && activeVehicle) {
      const pos = { lat: activeTelemetry.latitude, lng: activeTelemetry.longitude };
      bounds.extend(pos);

      const statusColor =
        activeTelemetry.speed > 3 ? '#10b981' : activeTelemetry.speed === 0 ? '#f59e0b' : '#ef4444';

      const svgIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
            <circle cx="23" cy="23" r="20" fill="none" stroke="${statusColor}" stroke-width="2" opacity="0.6">
              <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="23" cy="23" r="16" fill="#090d16" stroke="${statusColor}" stroke-width="2.5"/>
            <g transform="rotate(${activeTelemetry.heading || 0} 23 23)">
              <path d="M23 10 L29 27 L23 23 L17 27 Z" fill="${statusColor}"/>
            </g>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(46, 46),
        anchor: new window.google.maps.Point(23, 23)
      };

      const vehicleReg = 'registrationNumber' in activeVehicle ? activeVehicle.registrationNumber : activeVehicle.vehicleId;
      const driverName = 'driverName' in activeVehicle ? activeVehicle.driverName : ('driver' in activeVehicle ? (activeVehicle as any).driver : 'Driver');

      const vMarker = new window.google.maps.Marker({
        position: pos,
        map,
        title: `${vehicleReg} • ${driverName || 'Driver'} (${activeTelemetry.speed} km/h)`,
        icon: svgIcon,
        zIndex: 100
      });
      googleMarkersRef.current.push(vMarker);
    }

    // Render Fleet Vehicles on Google Map
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach((v) => {
        const isSelected = selectedVehicleId === v.vehicleId;
        const statusColor = v.speed > 3 ? '#10b981' : v.status === 'alert' ? '#ef4444' : '#f59e0b';
        const marker = new window.google.maps.Marker({
          position: { lat: v.latitude, lng: v.longitude },
          map,
          title: `${v.vehicleId} • ${v.driver} (${v.speed} km/h)`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: isSelected ? 8 : 5,
            fillColor: statusColor,
            fillOpacity: 1,
            strokeColor: '#090d16',
            strokeWeight: 2
          },
          zIndex: isSelected ? 110 : 90
        });
        if (onSelectVehicle) {
          marker.addListener('click', () => onSelectVehicle(v));
        }
        googleMarkersRef.current.push(marker);
      });
    }

    // Auto-fit bounds to route and telemetry
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
    }
  }, [isGoogleMapsReady, routes, selectedRouteId, activeTelemetry, activeVehicle, isTrafficActive, vehicles, selectedVehicleId]);

  // 4. Render Leaflet Map (Fallback)
  useEffect(() => {
    if (isGoogleMapsReady || !leafletMapRef.current || !leafletPolyGroupRef.current || !leafletMarkerGroupRef.current)
      return;

    const map = leafletMapRef.current;
    const polyGroup = leafletPolyGroupRef.current;
    const markerGroup = leafletMarkerGroupRef.current;

    polyGroup.clearLayers();
    markerGroup.clearLayers();

    if (routes.length === 0) return;

    routes.forEach((route) => {
      const isSelected = route.id === selectedRouteId;

      if (isSelected) {
        const glow = L.polyline(route.coordinates, {
          color: route.color,
          weight: 12,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round'
        });
        polyGroup.addLayer(glow);
      }

      const poly = L.polyline(route.coordinates, {
        color: isSelected ? route.color : '#475569',
        weight: isSelected ? 6 : 4,
        opacity: isSelected ? 1 : 0.45,
        lineCap: 'round',
        lineJoin: 'round'
      });

      if (onSelectRoute) {
        poly.on('click', () => onSelectRoute(route.id));
      }
      polyGroup.addLayer(poly);

      if (isSelected && isTrafficActive && route.trafficSegments) {
        route.trafficSegments.forEach((seg) => {
          const segColor =
            seg.level === 'heavy' ? '#ef4444' : seg.level === 'moderate' ? '#f59e0b' : '#10b981';
          const segLine = L.polyline(seg.coordinates, {
            color: segColor,
            weight: 3.5,
            opacity: 0.95
          });
          polyGroup.addLayer(segLine);
        });
      }
    });

    // Origin and Destination markers
    const originCoords = routes[0].coordinates[0];
    const destCoords = routes[0].coordinates[routes[0].coordinates.length - 1];

    const originIcon = L.divIcon({
      className: 'origin-marker',
      html: `
        <div style="width:24px; height:24px; border-radius:50%; background:#10b981; border:3px solid #090d16; box-shadow:0 0 10px #10b981; display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px; font-weight:bold;">
          A
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    markerGroup.addLayer(L.marker(originCoords, { icon: originIcon }));

    const destIcon = L.divIcon({
      className: 'dest-marker',
      html: `
        <div style="width:26px; height:26px; border-radius:50%; background:#00f0ff; border:3px solid #090d16; box-shadow:0 0 12px #00f0ff; display:flex; align-items:center; justify-content:center; color:#090d16; font-size:10px; font-weight:bold;">
          B
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    markerGroup.addLayer(L.marker(destCoords, { icon: destIcon }));

    // Real GPS Vehicle Marker (Only when telemetry exists)
    if (activeTelemetry && activeVehicle) {
      const statusColor = activeTelemetry.speed > 3 ? '#10b981' : '#f59e0b';
      const vIcon = L.divIcon({
        className: 'vehicle-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="width:30px; height:30px; border-radius:50%; background:#090d16; border:2.5px solid ${statusColor}; box-shadow:0 2px 10px rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; transform:rotate(${activeTelemetry.heading}deg);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="${statusColor}">
                <path d="M12 2 L19 21 L12 17 L5 21 Z"/>
              </svg>
            </div>
            <div style="margin-top:2px; padding:1px 5px; border-radius:4px; background:#0f172a; border:1px solid ${statusColor}; color:#fff; font-size:9px; font-weight:bold; font-family:monospace; white-space:nowrap;">
              ${'registrationNumber' in activeVehicle ? activeVehicle.registrationNumber : activeVehicle.vehicleId}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      markerGroup.addLayer(L.marker([activeTelemetry.latitude, activeTelemetry.longitude], { icon: vIcon }));
    }

    // Render Fleet Vehicles on Leaflet Map
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach((v) => {
        const isSelected = selectedVehicleId === v.vehicleId;
        const statusColor = v.speed > 3 ? '#10b981' : v.status === 'alert' ? '#ef4444' : '#f59e0b';
        const vIcon = L.divIcon({
          className: 'fleet-marker',
          html: `
            <div style="width:${isSelected ? '22px' : '16px'}; height:${isSelected ? '22px' : '16px'}; border-radius:50%; background:${statusColor}; border:2.5px solid #090d16; box-shadow:0 0 ${isSelected ? '10px #00f0ff' : '5px rgba(0,0,0,0.5)'}; display:flex; align-items:center; justify-content:center; cursor:pointer;">
            </div>
          `,
          iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
          iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8]
        });
        const marker = L.marker([v.latitude, v.longitude], { icon: vIcon });
        if (onSelectVehicle) {
          marker.on('click', () => onSelectVehicle(v));
        }
        markerGroup.addLayer(marker);
      });
    }

    const bounds = L.latLngBounds(routes[0].coordinates);
    if (activeTelemetry) {
      bounds.extend([activeTelemetry.latitude, activeTelemetry.longitude]);
    }
    map.fitBounds(bounds, { padding: [60, 60], animate: true });
  }, [isGoogleMapsReady, routes, selectedRouteId, activeTelemetry, activeVehicle, isTrafficActive, vehicles, selectedVehicleId]);

  // Controls
  const handleZoomIn = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setZoom((googleMapRef.current.getZoom() || 8) + 1);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (googleMapRef.current) {
      googleMapRef.current.setZoom((googleMapRef.current.getZoom() || 8) - 1);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    }
  };

  const handleFitRoute = () => {
    if (routes.length === 0) return;
    const selected = routes.find((r) => r.id === selectedRouteId) || routes[0];

    if (googleMapRef.current && window.google?.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      selected.coordinates.forEach((c) => bounds.extend({ lat: c[0], lng: c[1] }));
      if (activeTelemetry) {
        bounds.extend({ lat: activeTelemetry.latitude, lng: activeTelemetry.longitude });
      }
      googleMapRef.current.fitBounds(bounds, 60);
    } else if (leafletMapRef.current) {
      const bounds = L.latLngBounds(selected.coordinates);
      if (activeTelemetry) {
        bounds.extend([activeTelemetry.latitude, activeTelemetry.longitude]);
      }
      leafletMapRef.current.fitBounds(bounds, { padding: [60, 60], animate: true });
    }
  };

  const handleLayerSwitch = (mode: 'dark' | 'satellite' | 'street') => {
    setCurrentLayerMode(mode);
    setShowLayerMenu(false);

    if (googleMapRef.current && window.google?.maps) {
      if (mode === 'satellite') {
        googleMapRef.current.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
      } else if (mode === 'street') {
        googleMapRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
        googleMapRef.current.setOptions({ styles: [] });
      } else {
        googleMapRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
        googleMapRef.current.setOptions({ styles: GOOGLE_MAPS_DARK_STYLE });
      }
    } else if (leafletMapRef.current && leafletTileRef.current) {
      leafletMapRef.current.removeLayer(leafletTileRef.current);
      let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
      if (mode === 'satellite') {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      } else if (mode === 'street') {
        url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      }
      const newTile = L.tileLayer(url, { maxZoom: 19 }).addTo(leafletMapRef.current);
      leafletTileRef.current = newTile;
    }
  };

  return (
    <div className={`relative overflow-hidden bg-[#090d16] ${className}`}>
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Real-time Telemetry Status Overlay */}
      {isAwaitingTelemetry && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#090d16]/95 border border-amber-500/40 text-amber-300 text-xs shadow-2xl backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span className="font-semibold">
              Waiting for live GPS telemetry from {activeVehicle ? ('registrationNumber' in activeVehicle ? activeVehicle.registrationNumber : activeVehicle.vehicleId) : 'assigned vehicle'}
            </span>
          </div>
        </div>
      )}

      {/* Floating Right Map Controls */}
      <div className="absolute top-16 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Layer Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Map Style"
            className="p-2.5 rounded-xl bg-[#090d16]/95 border border-slate-700/80 hover:border-cyan-400/60 text-slate-200 hover:text-cyan-300 shadow-xl backdrop-blur-md transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl bg-[#0f172a] border border-slate-700 p-2 shadow-2xl backdrop-blur-md text-xs space-y-1 z-30">
              <span className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Map View
              </span>
              {(['dark', 'satellite', 'street'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleLayerSwitch(mode)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg capitalize transition-colors ${
                    currentLayerMode === mode
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{mode === 'dark' ? 'Dark Command' : mode}</span>
                  {currentLayerMode === mode && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Traffic Toggle */}
        <button
          onClick={() => setIsTrafficActive(!isTrafficActive)}
          title={isTrafficActive ? 'Hide Live Traffic' : 'Show Live Traffic'}
          className={`p-2.5 rounded-xl border shadow-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center ${
            isTrafficActive
              ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300'
              : 'bg-[#090d16]/95 border-slate-700/80 text-slate-400 hover:text-white'
          }`}
        >
          <span className="text-[10px] font-bold tracking-tight">TRAF</span>
        </button>

        {/* Fit Route */}
        <button
          onClick={handleFitRoute}
          title="Fit Route to Viewport"
          className="p-2.5 rounded-xl bg-[#090d16]/95 border border-slate-700/80 hover:border-cyan-400/60 text-slate-200 hover:text-cyan-300 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 rounded-xl bg-[#090d16]/95 border border-slate-700/80 hover:border-cyan-400/60 text-slate-200 hover:text-cyan-300 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 rounded-xl bg-[#090d16]/95 border border-slate-700/80 hover:border-cyan-400/60 text-slate-200 hover:text-cyan-300 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Left Legend */}
      <div className="absolute bottom-16 sm:bottom-4 left-4 z-20 hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#090d16]/95 border border-slate-800 shadow-xl backdrop-blur-md text-[11px] text-slate-300 pointer-events-auto">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <span className="w-3 h-1 rounded bg-[#00f0ff] shadow-sm shadow-cyan-400" />
          <span>Optimal Route</span>
        </div>
        <div className="border-l border-slate-800 h-3" />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Smooth
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Moderate
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Heavy
          </span>
        </div>
      </div>
    </div>
  );
};
