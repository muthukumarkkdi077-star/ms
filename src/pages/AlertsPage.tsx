import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertItem } from '../types';
import { alertService } from '../services/alertService';
import {
  Bell,
  AlertTriangle,
  CloudRain,
  Accessibility,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Trash2,
  Navigation,
  MapPin,
  Truck
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>(alertService.getAlerts());
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'traffic' | 'weather' | 'accessibility' | 'speed' | 'vehicle'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedFilter === 'all') return true;
    return a.type === selectedFilter;
  });

  const handleAction = (alert: AlertItem) => {
    if (alert.type === 'traffic' || alert.type === 'speed') {
      addToast('info', 'Live Tracker Dispatched', 'Navigating to live corridor monitoring.');
      navigate('/live-tracker');
    } else if (alert.type === 'accessibility') {
      addToast('info', 'Accessibility Center', 'Opening audited accessible corridor view.');
      navigate('/accessibility');
    } else if (alert.type === 'vehicle') {
      addToast('info', 'Fleet Asset Registry', 'Opening fleet unit management.');
      navigate('/fleet');
    } else {
      addToast('info', 'Weather Advisory', 'Weather radar checked for active transport corridor.');
      navigate('/live-tracker');
    }
  };

  const handleDismiss = (id: string) => {
    const updated = alertService.dismissAlert(id);
    setAlerts(updated);
    addToast('info', 'Alert Dismissed', 'Item cleared from active incident feed.');
  };

  const handleMarkAllRead = () => {
    const updated = alertService.markAllAsRead();
    setAlerts(updated);
    addToast('success', 'All Marked as Read', 'No unread alerts remaining.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            <span>Incident Telematics & Exception Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            System Alerts & Operational Feed
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time highway bottlenecks, speed governor alerts, precipitation warnings, and telemetry heartbeats.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
        {[
          { id: 'all', label: `All Alerts (${alerts.length})` },
          { id: 'traffic', label: 'Traffic' },
          { id: 'speed', label: 'Speed Governor' },
          { id: 'weather', label: 'Weather' },
          { id: 'accessibility', label: 'Accessibility' },
          { id: 'vehicle', label: 'Fleet' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              selectedFilter === f.id
                ? 'bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No active alerts in this category</p>
            <p className="text-xs text-slate-500 mt-1">All commercial corridors operating normally.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isRed = alert.severity === 'red';
            const isOrange = alert.severity === 'orange';
            const isYellow = alert.severity === 'yellow';

            const severityBadge = isRed
              ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30'
              : isOrange
              ? 'bg-orange-50 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30'
              : isYellow
              ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'
              : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.isRead
                    ? 'bg-slate-50/70 dark:bg-[#0f172a]/60 border-slate-200 dark:border-slate-800/80 opacity-75'
                    : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isRed
                          ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                          : isOrange
                          ? 'bg-orange-500/20 text-orange-500 dark:text-orange-400 border border-orange-500/30'
                          : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {alert.type === 'speed' ? (
                        <Truck className="w-5 h-5" />
                      ) : alert.type === 'traffic' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : alert.type === 'weather' ? (
                        <CloudRain className="w-5 h-5" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${severityBadge}`}
                        >
                          {alert.severity}
                        </span>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                        {alert.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </span>
                        {alert.location && (
                          <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                            <MapPin className="w-3 h-3" />
                            {alert.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {alert.actionLabel && (
                      <button
                        onClick={() => handleAction(alert)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <span>{alert.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDismiss(alert.id)}
                      title="Dismiss Alert"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
