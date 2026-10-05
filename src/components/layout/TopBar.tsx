import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Crosshair,
  MapPin,
  Bell,
  Menu,
  CloudSun,
  Loader2,
  ExternalLink,
  Navigation
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { alertService } from '../../services/alertService';
import { googleMapsService } from '../../services/googleMapsService';
import { weatherService } from '../../services/weatherService';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onToggleSidebar?: () => void;
  onSearchSelect?: (location: string) => void;
  onCurrentLocation?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onToggleSidebar,
  onSearchSelect,
  onCurrentLocation
}) => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{ name: string; description: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [weatherText, setWeatherText] = useState('28°C • Clear');

  const debounceRef = useRef<any>(null);

  const alerts = alertService.getAlerts();
  const unreadCount = alertService.getUnreadCount();

  // Load live weather for the hub
  useEffect(() => {
    async function loadWeather() {
      const w = await weatherService.getWeather(11.0168, 76.9558);
      if (w) {
        setWeatherText(`${w.temperatureC}°C • ${w.conditionLabel}`);
      }
    }
    loadWeather();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setIsDropdownOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await googleMapsService.searchPlaces(val);
      setSuggestions(results);
      setIsSearching(false);
    }, 300);
  };

  const handleSelectLocation = (loc: string) => {
    setSearchTerm(loc);
    setIsDropdownOpen(false);
    setSuggestions([]);
    addToast('info', 'Location Selected', `Dispatched focus to ${loc}`);
    if (onSearchSelect) {
      onSearchSelect(loc);
    } else {
      navigate('/live-tracker');
    }
  };

  const handleGPSClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          addToast('success', 'Device GPS Acquired', `Pinpointed coordinates: ${lat}° N, ${lng}° E`);
          if (onCurrentLocation) onCurrentLocation();
        },
        (err) => {
          addToast('warning', 'GPS Notice', 'Using hub reference: 11.0168° N, 76.9558° E (Coimbatore)');
          if (onCurrentLocation) onCurrentLocation();
        }
      );
    } else {
      addToast('info', 'GPS Reference', 'Coimbatore Central Transit Core');
      if (onCurrentLocation) onCurrentLocation();
    }
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#090d16]/95 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-4 z-30 sticky top-0">
      {/* Left: Mobile Menu Toggle & Whole-India Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Bar with Whole-India Google Places autocomplete */}
        <div className="relative flex-1">
          <div className="relative flex items-center">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-cyan-400 absolute left-3 animate-spin pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            )}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search any Indian city, highway, landmark, or hub..."
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSuggestions([]);
                }}
                className="absolute right-3 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-[#0f172a] border border-slate-700/80 shadow-2xl p-2 z-50 text-xs max-h-60 overflow-y-auto space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Google Places Indian Corridors
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={`${item.name}-${idx}`}
                  onClick={() => handleSelectLocation(item.name)}
                  className="w-full flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-left text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-semibold block truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{item.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Weather Widget */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <CloudSun className="w-4 h-4 text-amber-400" />
          <span>{weatherText}</span>
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleGPSClick}
          title="Acquire Current GPS Location"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-400 transition-all text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">My GPS</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="System Alerts"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-4 z-50 text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-sm">System Alerts</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold">
                    {unreadCount} active
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  View All <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="divide-y divide-slate-800/80 max-h-72 overflow-y-auto mt-2 space-y-1">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="py-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-white leading-tight">
                        {alert.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {alert.description || alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Profile in TopBar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xs text-slate-950 shadow-md">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RM'}
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-white leading-none">
              {user?.name || 'Dispatcher Operator'}
            </div>
            <div className="text-[10px] text-cyan-400 leading-none mt-1">
              {user?.role || 'Logistics Lead'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
