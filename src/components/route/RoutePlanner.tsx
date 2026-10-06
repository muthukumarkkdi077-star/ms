import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  ArrowRightLeft,
  Sparkles,
  Search,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { googleMapsService } from '../../services/googleMapsService';

interface RoutePlannerProps {
  onFindRoute: (params: { from: string; to: string }) => void;
  onOriginChange?: (newOrigin: string) => void;
  onDestinationChange?: (newDest: string) => void;
  isLoading: boolean;
  initialFrom?: string;
  initialTo?: string;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  onFindRoute,
  onOriginChange,
  onDestinationChange,
  isLoading,
  initialFrom = '',
  initialTo = ''
}) => {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [fromSuggestions, setFromSuggestions] = useState<{ name: string; description: string }[]>([]);
  const [toSuggestions, setToSuggestions] = useState<{ name: string; description: string }[]>([]);
  const [isSearchingFrom, setIsSearchingFrom] = useState(false);
  const [isSearchingTo, setIsSearchingTo] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | null>(null);

  const fromDebounceRef = useRef<any>(null);
  const toDebounceRef = useRef<any>(null);

  useEffect(() => {
    if (initialFrom && initialFrom !== from) setFrom(initialFrom);
  }, [initialFrom]);

  useEffect(() => {
    if (initialTo && initialTo !== to) setTo(initialTo);
  }, [initialTo]);

  // Debounced search for Origin
  const handleFromChange = (val: string) => {
    setFrom(val);
    setActiveDropdown('from');
    if (onOriginChange) onOriginChange(val);

    if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
    if (!val || val.trim().length < 2) {
      setFromSuggestions([]);
      return;
    }

    setIsSearchingFrom(true);
    fromDebounceRef.current = setTimeout(async () => {
      const results = await googleMapsService.searchPlaces(val);
      setFromSuggestions(results);
      setIsSearchingFrom(false);
    }, 300);
  };

  // Debounced search for Destination
  const handleToChange = (val: string) => {
    setTo(val);
    setActiveDropdown('to');
    if (onDestinationChange) onDestinationChange(val);

    if (toDebounceRef.current) clearTimeout(toDebounceRef.current);
    if (!val || val.trim().length < 2) {
      setToSuggestions([]);
      return;
    }

    setIsSearchingTo(true);
    toDebounceRef.current = setTimeout(async () => {
      const results = await googleMapsService.searchPlaces(val);
      setToSuggestions(results);
      setIsSearchingTo(false);
    }, 300);
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    if (onOriginChange) onOriginChange(to);
    if (onDestinationChange) onDestinationChange(temp);
    setFromSuggestions([]);
    setToSuggestions([]);
    setActiveDropdown(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    setActiveDropdown(null);
    onFindRoute({ from: from.trim(), to: to.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/95 dark:bg-[#111822]/95 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl text-slate-100 dark:text-slate-100 light:text-slate-800 space-y-3"
    >
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-white dark:text-white light:text-slate-900">
            Smart Route Dispatcher
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          WHOLE INDIA SEARCH
        </span>
      </div>

      <div className="space-y-2.5 relative">
        {/* FROM INPUT */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold">
              <span>📍</span>
              <span>Origin (Any Indian City or Hub)</span>
            </span>
            {isSearchingFrom && <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />}
          </label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              onFocus={() => {
                if (fromSuggestions.length > 0) setActiveDropdown('from');
              }}
              placeholder="e.g. Coimbatore, Chennai, Bangalore, Delhi..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-medium transition-colors"
            />
            {from && (
              <button
                type="button"
                onClick={() => {
                  setFrom('');
                  setFromSuggestions([]);
                  if (onOriginChange) onOriginChange('');
                }}
                className="absolute right-3 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown for FROM */}
          {activeDropdown === 'from' && fromSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[#0c1117] dark:bg-[#0c1117] light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-200 shadow-2xl p-1.5 z-50 max-h-52 overflow-y-auto text-xs space-y-0.5">
              <span className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Verified Locations
              </span>
              {fromSuggestions.map((place, idx) => (
                <button
                  key={`${place.name}-${idx}`}
                  type="button"
                  onClick={() => {
                    setFrom(place.name);
                    setActiveDropdown(null);
                    setFromSuggestions([]);
                    if (onOriginChange) onOriginChange(place.name);
                  }}
                  className="w-full flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-emerald-500/15 hover:text-emerald-300 text-slate-200 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-semibold block truncate">{place.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{place.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SWAP BUTTON */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap Origin and Destination"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-emerald-400 shadow-md transition-all active:rotate-180 duration-200 cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TO INPUT */}
        <div className="relative">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-teal-400 font-extrabold">
              <span>🏁</span>
              <span>Destination (Any Indian City or Hub)</span>
            </span>
            {isSearchingTo && <Loader2 className="w-3 h-3 text-teal-400 animate-spin" />}
          </label>
          <div className="relative flex items-center">
            <Navigation className="w-4 h-4 text-teal-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              onFocus={() => {
                if (toSuggestions.length > 0) setActiveDropdown('to');
              }}
              placeholder="e.g. Madurai, Mumbai, Kochi, Hyderabad..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-slate-950/70 dark:bg-[#0c1117] light:bg-slate-50 border border-slate-700/80 dark:border-slate-700/80 light:border-slate-300 rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none focus:border-teal-400 font-medium transition-colors"
            />
            {to && (
              <button
                type="button"
                onClick={() => {
                  setTo('');
                  setToSuggestions([]);
                  if (onDestinationChange) onDestinationChange('');
                }}
                className="absolute right-3 text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-800 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown for TO */}
          {activeDropdown === 'to' && toSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[#0c1117] dark:bg-[#0c1117] light:bg-white border border-slate-700 dark:border-slate-700 light:border-slate-200 shadow-2xl p-1.5 z-50 max-h-52 overflow-y-auto text-xs space-y-0.5">
              <span className="px-2 py-1 text-[9px] font-bold text-slate-400 dark:text-slate-400 light:text-slate-500 uppercase tracking-wider block">
                Verified Locations
              </span>
              {toSuggestions.map((place, idx) => (
                <button
                  key={`${place.name}-${idx}`}
                  type="button"
                  onClick={() => {
                    setTo(place.name);
                    setActiveDropdown(null);
                    setToSuggestions([]);
                    if (onDestinationChange) onDestinationChange(place.name);
                  }}
                  className="w-full flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-left hover:bg-teal-500/15 text-slate-200 dark:text-slate-200 light:text-slate-800 hover:text-teal-300 dark:hover:text-teal-300 light:hover:text-teal-700 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="font-semibold block truncate">{place.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{place.description}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK PRESET CHIPS */}
      <div className="pt-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Popular Corridors:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setFrom('Singanallur');
              setTo('Chinniyampalayam');
              if (onOriginChange) onOriginChange('Singanallur');
              if (onDestinationChange) onDestinationChange('Chinniyampalayam');
              onFindRoute({ from: 'Singanallur', to: 'Chinniyampalayam' });
            }}
            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition-all cursor-pointer"
          >
            Singanallur ➔ Chinniyampalayam
          </button>
          <button
            type="button"
            onClick={() => {
              setFrom('Coimbatore');
              setTo('Madurai');
              if (onOriginChange) onOriginChange('Coimbatore');
              if (onDestinationChange) onDestinationChange('Madurai');
              onFindRoute({ from: 'Coimbatore', to: 'Madurai' });
            }}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
          >
            Coimbatore ➔ Madurai
          </button>
          <button
            type="button"
            onClick={() => {
              setFrom('Chennai');
              setTo('Madurai');
              if (onOriginChange) onOriginChange('Chennai');
              if (onDestinationChange) onDestinationChange('Madurai');
              onFindRoute({ from: 'Chennai', to: 'Madurai' });
            }}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
          >
            Chennai ➔ Madurai
          </button>
        </div>
      </div>

      {/* SEARCH FASTEST ROUTE SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isLoading || !from || !to}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            <span>Finding Fastest Route...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Search Fastest Route</span>
          </>
        )}
      </button>
    </form>
  );
};
