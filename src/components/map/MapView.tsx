import React, { useEffect, useRef, useState } from 'react';
import { RouteOption, Vehicle, TelemetryPoint, FleetVehicle } from '../../types';
import { googleMapsService, GOOGLE_MAPS_DARK_STYLE } from '../../services/googleMapsService';
import { useTheme } from '../../context/ThemeContext';
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
  Maximize2,
  Minimize2,
  Navigation
} from 'lucide-react';
import L from 'leaflet';

export const GOOGLE_MAPS_LIGHT_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f8fafc' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#0f172a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#bae6fd' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#7dd3fc' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f1f5f9' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e0f2fe' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0284c7' }] }
];

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
  const { theme, isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const outerWrapperRef = useRef<HTMLDivElement>(null);

  // Google Maps references
  const googleMapRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const googlePolylinesRef = useRef<any[]>([]);
  const googleMarkersRef = useRef<any[]>([]);

  // Leaflet references
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletPolyGroupRef = useRef<L.LayerGroup | null>(null);
  const leafletMarkerGroupRef = useRef<L.LayerGroup | null>(null);
  const leafletTileRef = useRef<L.TileLayer | null>(null);

  // States
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState(false);
  const [isTrafficActive, setIsTrafficActive] = useState(showTrafficOverlay);
  const [currentLayerMode, setCurrentLayerMode] = useState<'theme' | 'satellite' | 'street'>('theme');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasApiKey = googleMapsService.isConfigured();

  // Helper for tile URL in Leaflet
  const getTileUrl = (mode: 'theme' | 'satellite' | 'street', dark: boolean) => {
    if (mode === 'satellite') {
      return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
    if (mode === 'street' || !dark) {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
    return 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png';
  };

  // 1. Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (hasApiKey) {
        const loaded = await googleMapsService.load();
        if (loaded && isMounted && window.google?.maps && mapContainerRef.current) {
          try {
            const center = { lat: 10.45, lng: 77.55 };
            const map = new window.google.maps.Map(mapContainerRef.current, {
              center,
              zoom: 8,
              styles: isDark ? GOOGLE_MAPS_DARK_STYLE : GOOGLE_MAPS_LIGHT_STYLE,
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

      // High-precision Leaflet fallback
      if (mapContainerRef.current && !leafletMapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [10.45, 77.55],
          zoom: 8,
          zoomControl: false,
          attributionControl: false
        });

        const tileUrl = getTileUrl(currentLayerMode, isDark);
        const tileLayer = L.tileLayer(tileUrl, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);

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

  // 2. Automatically sync Map Style with Application Light/Dark Mode
  useEffect(() => {
    if (googleMapRef.current && window.google?.maps) {
      if (currentLayerMode === 'theme') {
        googleMapRef.current.setOptions({
          styles: isDark ? GOOGLE_MAPS_DARK_STYLE : GOOGLE_MAPS_LIGHT_STYLE
        });
      }
    } else if (leafletMapRef.current && leafletTileRef.current) {
      if (currentLayerMode === 'theme') {
        leafletMapRef.current.removeLayer(leafletTileRef.current);
        const newUrl = getTileUrl('theme', isDark);
        const newTile = L.tileLayer(newUrl, { subdomains: 'abcd', maxZoom: 19 }).addTo(leafletMapRef.current);
        leafletTileRef.current = newTile;
      }
    }
  }, [isDark, currentLayerMode]);

  // 3. Toggle Traffic Layer
  useEffect(() => {
    if (googleMapRef.current && trafficLayerRef.current) {
      if (isTrafficActive) {
        trafficLayerRef.current.setMap(googleMapRef.current);
      } else {
        trafficLayerRef.current.setMap(null);
      }
    }
  }, [isTrafficActive]);

  // 4. Render Google Maps Polylines & Markers
  useEffect(() => {
    if (!isGoogleMapsReady || !googleMapRef.current || !window.google?.maps) return;

    const map = googleMapRef.current;

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

      // Professional route colors:
      // Recommended: Emerald green #10b981
      // Alternative / Selected: Teal #14b8a6
      // Inactive: Slate Gray #64748b / #94a3b8
      const routeBaseColor = route.isRecommended
        ? '#10b981'
        : isSelected
        ? '#14b8a6'
        : isDark
        ? '#475569'
        : '#94a3b8';

      if (isSelected) {
        const glow = new window.google.maps.Polyline({
          path,
          strokeColor: routeBaseColor,
          strokeOpacity: 0.3,
          strokeWeight: 10,
          map
        });
        googlePolylinesRef.current.push(glow);
      }

      const poly = new window.google.maps.Polyline({
        path,
        strokeColor: routeBaseColor,
        strokeOpacity: isSelected ? 1.0 : 0.5,
        strokeWeight: isSelected ? 5.5 : 3.5,
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
      title: 'Origin Point',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: isDark ? '#090d16' : '#ffffff',
        strokeWeight: 2.5
      }
    });
    googleMarkersRef.current.push(originMarker);

    const destMarker = new window.google.maps.Marker({
      position: { lat: destCoords[0], lng: destCoords[1] },
      map,
      title: 'Destination Point',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#14b8a6',
        fillOpacity: 1,
        strokeColor: isDark ? '#0c1117' : '#ffffff',
        strokeWeight: 2.5
      }
    });
    googleMarkersRef.current.push(destMarker);

    // Active Vehicle Live Marker
    if (activeTelemetry && activeVehicle) {
      const pos = { lat: activeTelemetry.latitude, lng: activeTelemetry.longitude };
      bounds.extend(pos);

      const statusColor = activeTelemetry.speed > 3 ? '#10b981' : '#f59e0b';
      const svgIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46">
            <circle cx="23" cy="23" r="20" fill="none" stroke="${statusColor}" stroke-width="2" opacity="0.6">
              <animate attributeName="r" values="16;22;16" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="23" cy="23" r="16" fill="${isDark ? '#090d16' : '#ffffff'}" stroke="${statusColor}" stroke-width="2.5"/>
            <g transform="rotate(${activeTelemetry.heading || 0} 23 23)">
              <path d="M23 10 L29 27 L23 23 L17 27 Z" fill="${statusColor}"/>
            </g>
          </svg>
        `)}`,
        scaledSize: new window.google.maps.Size(46, 46),
        anchor: new window.google.maps.Point(23, 23)
      };

      const vehicleReg =
        'registrationNumber' in activeVehicle ? activeVehicle.registrationNumber : activeVehicle.vehicleId;
      const driverName =
        'driverName' in activeVehicle
          ? activeVehicle.driverName
          : 'driver' in activeVehicle
          ? (activeVehicle as any).driver
          : 'Driver';

      const vMarker = new window.google.maps.Marker({
        position: pos,
        map,
        title: `${vehicleReg} • ${driverName} (${activeTelemetry.speed} km/h)`,
        icon: svgIcon,
        zIndex: 100
      });
      googleMarkersRef.current.push(vMarker);
    }

    // Render Fleet Vehicles
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
            strokeColor: isDark ? '#090d16' : '#ffffff',
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

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 60);
    }
  }, [
    isGoogleMapsReady,
    routes,
    selectedRouteId,
    activeTelemetry,
    activeVehicle,
    isTrafficActive,
    vehicles,
    selectedVehicleId,
    isDark
  ]);

  // 5. Render Leaflet Map
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
      const routeBaseColor = route.isRecommended
        ? '#10b981'
        : isSelected
        ? '#14b8a6'
        : isDark
        ? '#475569'
        : '#94a3b8';

      if (isSelected) {
        const glow = L.polyline(route.coordinates, {
          color: routeBaseColor,
          weight: 10,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round'
        });
        polyGroup.addLayer(glow);
      }

      const poly = L.polyline(route.coordinates, {
        color: routeBaseColor,
        weight: isSelected ? 5.5 : 3.5,
        opacity: isSelected ? 1 : 0.5,
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
        <div style="width:22px; height:22px; border-radius:50%; background:#10b981; border:2.5px solid ${
          isDark ? '#0c1117' : '#ffffff'
        }; box-shadow:0 2px 8px rgba(16,185,129,0.5); display:flex; align-items:center; justify-content:center; color:#fff; font-size:9px; font-weight:bold;">
          A
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });
    markerGroup.addLayer(L.marker(originCoords, { icon: originIcon }));

    const destIcon = L.divIcon({
      className: 'dest-marker',
      html: `
        <div style="width:24px; height:24px; border-radius:50%; background:#14b8a6; border:2.5px solid ${
          isDark ? '#0c1117' : '#ffffff'
        }; box-shadow:0 2px 8px rgba(20,184,166,0.5); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:9px; font-weight:bold;">
          B
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    markerGroup.addLayer(L.marker(destCoords, { icon: destIcon }));

    // Real GPS Vehicle Marker
    if (activeTelemetry && activeVehicle) {
      const statusColor = activeTelemetry.speed > 3 ? '#10b981' : '#f59e0b';
      const vIcon = L.divIcon({
        className: 'vehicle-marker',
        html: `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="width:28px; height:28px; border-radius:50%; background:${
              isDark ? '#090d16' : '#ffffff'
            }; border:2.5px solid ${statusColor}; box-shadow:0 2px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; transform:rotate(${
          activeTelemetry.heading
        }deg);">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="${statusColor}">
                <path d="M12 2 L19 21 L12 17 L5 21 Z"/>
              </svg>
            </div>
            <div style="margin-top:2px; padding:1px 5px; border-radius:4px; background:${
              isDark ? '#0f172a' : '#ffffff'
            }; border:1px solid ${statusColor}; color:${
          isDark ? '#ffffff' : '#0f172a'
        }; font-size:9px; font-weight:bold; font-family:monospace; white-space:nowrap; box-shadow:0 2px 4px rgba(0,0,0,0.2);">
              ${
                'registrationNumber' in activeVehicle
                  ? activeVehicle.registrationNumber
                  : activeVehicle.vehicleId
              }
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      markerGroup.addLayer(L.marker([activeTelemetry.latitude, activeTelemetry.longitude], { icon: vIcon }));
    }

    // Render Fleet Vehicles
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach((v) => {
        const isSelected = selectedVehicleId === v.vehicleId;
        const statusColor = v.speed > 3 ? '#10b981' : v.status === 'alert' ? '#ef4444' : '#f59e0b';
        const vIcon = L.divIcon({
          className: 'fleet-marker',
          html: `
            <div style="width:${isSelected ? '20px' : '14px'}; height:${isSelected ? '20px' : '14px'}; border-radius:50%; background:${statusColor}; border:2px solid ${
            isDark ? '#090d16' : '#ffffff'
          }; box-shadow:0 0 ${isSelected ? '8px #06b6d4' : '3px rgba(0,0,0,0.3)'}; display:flex; align-items:center; justify-content:center; cursor:pointer;">
            </div>
          `,
          iconSize: [isSelected ? 20 : 14, isSelected ? 20 : 14],
          iconAnchor: [isSelected ? 10 : 7, isSelected ? 10 : 7]
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
  }, [
    isGoogleMapsReady,
    routes,
    selectedRouteId,
    activeTelemetry,
    activeVehicle,
    isTrafficActive,
    vehicles,
    selectedVehicleId,
    isDark
  ]);

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

  const toggleFullscreen = () => {
    if (!outerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      outerWrapperRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleLayerSwitch = (mode: 'theme' | 'satellite' | 'street') => {
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
        googleMapRef.current.setOptions({
          styles: isDark ? GOOGLE_MAPS_DARK_STYLE : GOOGLE_MAPS_LIGHT_STYLE
        });
      }
    } else if (leafletMapRef.current && leafletTileRef.current) {
      leafletMapRef.current.removeLayer(leafletTileRef.current);
      const url = getTileUrl(mode, isDark);
      const newTile = L.tileLayer(url, { maxZoom: 19 }).addTo(leafletMapRef.current);
      leafletTileRef.current = newTile;
    }
  };

  return (
    <div
      ref={outerWrapperRef}
      className={`relative overflow-hidden bg-[#090d16] dark:bg-[#090d16] light:bg-[#f1f5f9] transition-colors ${className}`}
    >
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Real-time Telemetry Status Overlay */}
      {isAwaitingTelemetry && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-[#090d16]/95 light:bg-white/95 border border-amber-500/40 text-amber-500 dark:text-amber-300 light:text-amber-700 text-xs shadow-xl backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-500" />
            <span className="font-semibold text-[11px]">
              GPS connection pending for{' '}
              {activeVehicle
                ? 'registrationNumber' in activeVehicle
                  ? activeVehicle.registrationNumber
                  : activeVehicle.vehicleId
                : 'assigned vehicle'}
            </span>
          </div>
        </div>
      )}

      {/* Floating Right Map Controls */}
      <div className="absolute top-16 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        {/* Layer Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            title="Map Style"
            className="p-2.5 rounded-xl bg-slate-900/95 dark:bg-[#090d16]/95 light:bg-white/95 border border-slate-700 dark:border-slate-700 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:text-cyan-400 shadow-xl backdrop-blur-md transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#0f172a] dark:bg-[#0f172a] light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-200 p-2 shadow-2xl backdrop-blur-md text-xs space-y-1 z-30">
              <span className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider block">
                Map Style
              </span>
              {(['theme', 'satellite', 'street'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleLayerSwitch(mode)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl capitalize transition-colors cursor-pointer ${
                    currentLayerMode === mode
                      ? 'bg-cyan-500/20 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 font-bold'
                      : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100'
                  }`}
                >
                  <span>{mode === 'theme' ? (isDark ? 'Dark Command' : 'Light Clean') : mode}</span>
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
              ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-400 dark:text-cyan-300 light:text-cyan-700'
              : 'bg-slate-900/95 dark:bg-[#090d16]/95 light:bg-white/95 border-slate-700 dark:border-slate-700 light:border-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900'
          }`}
        >
          <span className="text-[10px] font-bold tracking-tight">TRAF</span>
        </button>

        {/* Fit Route */}
        <button
          onClick={handleFitRoute}
          title="Fit Route to Viewport"
          className="p-2.5 rounded-xl bg-slate-900/95 dark:bg-[#090d16]/95 light:bg-white/95 border border-slate-700 dark:border-slate-700 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:text-cyan-400 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen Map'}
          className="p-2.5 rounded-xl bg-slate-900/95 dark:bg-[#090d16]/95 light:bg-white/95 border border-slate-700 dark:border-slate-700 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:text-cyan-400 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 rounded-xl bg-slate-900/95 dark:bg-[#090d16]/95 light:bg-white/95 border border-slate-700 dark:border-slate-700 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:text-cyan-400 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 rounded-xl bg-slate-900/95 dark:bg-[#090d16]/95 light:bg-white/95 border border-slate-700 dark:border-slate-700 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-700 hover:text-cyan-400 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Bottom Left Legend */}
      <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/95 dark:bg-[#090d16]/95 light:bg-white/95 border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl backdrop-blur-md text-[11px] text-slate-300 dark:text-slate-300 light:text-slate-700 pointer-events-auto">
        <div className="flex items-center gap-1.5 font-bold text-white dark:text-white light:text-slate-900">
          <span className="w-3 h-1 rounded bg-[#10b981]" />
          <span>Recommended Route</span>
        </div>
        <div className="border-l border-slate-700 dark:border-slate-700 light:border-slate-200 h-3" />
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Normal
          </span>
          <span className="flex items-center gap-1 text-amber-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Moderate
          </span>
          <span className="flex items-center gap-1 text-rose-500 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Heavy
          </span>
        </div>
      </div>
    </div>
  );
};
