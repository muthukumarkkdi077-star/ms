import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  Accessibility,
  Truck,
  Compass,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  Layers,
  Radio
} from 'lucide-react';
import { alertService } from '../../services/alertService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const unreadAlerts = alertService.getUnreadCount();

  const handleLogout = async () => {
    await logout();
    addToast('info', 'Session Ended', 'You have been signed out.');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live-tracker', label: 'Live Vehicle Tracking', icon: Navigation, badge: 'Live GPS' },
    { to: '/plan-trip', label: 'Plan a Trip', icon: Compass },
    { to: '/vehicles', label: 'My Vehicles', icon: Truck },
    { to: '/trip-reports', label: 'Trip Reports', icon: BarChart3 },
    { to: '/alerts', label: 'Alerts', icon: Bell, alertCount: unreadAlerts },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#0c1117] dark:bg-[#0c1117] light:bg-[#fcfbf9] border-r border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="p-5 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
              <Navigation className="w-5 h-5 fill-current transform -rotate-45 text-slate-950" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0c1117]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white dark:text-white light:text-slate-900">
                  RouteMind
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 light:text-emerald-700 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium tracking-tight truncate max-w-[150px]">
                Logistics Intelligence Grid
              </p>
            </div>
          </div>

          <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-50 border border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Telemetry API Live
            </span>
            <span className="font-mono text-emerald-400 dark:text-emerald-400 light:text-emerald-700 font-semibold">
              Port 3001
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-500">
            Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-500/15 dark:bg-emerald-500/20 light:bg-emerald-50 text-emerald-400 dark:text-emerald-300 light:text-emerald-700 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200 dark:hover:text-slate-200 light:hover:text-slate-900 hover:bg-slate-900/60 dark:hover:bg-slate-900/60 light:hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 dark:text-amber-300 light:text-amber-700 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                  {item.alertCount !== undefined && item.alertCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                      {item.alertCount}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 space-y-3">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-xs text-slate-950 shadow-md shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RM'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white dark:text-white light:text-slate-900 truncate">
                {user?.name || 'Dispatcher Operator'}
              </div>
              <div className="text-[10px] text-emerald-400 dark:text-emerald-400 light:text-emerald-600 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{user?.hub || 'India Command Hub'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of RouteMind AI"
            className="p-1.5 rounded-lg bg-slate-900 dark:bg-slate-900 light:bg-slate-100 hover:bg-rose-500/20 text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-rose-400 border border-slate-800 dark:border-slate-800 light:border-slate-300 hover:border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
