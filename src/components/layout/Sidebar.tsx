import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Navigation,
  Accessibility,
  Truck,
  Layers,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  User,
  ShieldCheck
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
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live-tracker', label: 'Live Tracker', icon: Navigation, badge: 'Main' },
    { to: '/fleet', label: 'Fleet Registry', icon: Truck },
    { to: '/trips', label: 'Trips & Sessions', icon: Layers },
    { to: '/logistics', label: 'Logistics Planner', icon: Truck },
    { to: '/accessibility', label: 'Accessibility', icon: Accessibility },
    { to: '/analytics', label: 'Fleet Analytics', icon: BarChart3 },
    { to: '/alerts', label: 'System Alerts', icon: Bell, alertCount: unreadAlerts },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
              <Navigation className="w-5 h-5 fill-current transform -rotate-45" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#090d16]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  RouteMind
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[150px]">
                Smart Logistics & Accessibility
              </p>
            </div>
          </div>

          <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Telemetry API Live
            </span>
            <span className="font-mono text-cyan-400 font-semibold">Port 3001</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Modules
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
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 shadow-md shadow-cyan-950/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-cyan-500/20 text-cyan-300">
                      {item.badge}
                    </span>
                  )}
                  {item.alertCount !== undefined && item.alertCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white animate-pulse">
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

      {/* Bottom Tagline & User Profile / Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-xs text-slate-950 shadow-md shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RM'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {user?.name || 'Dispatcher Operator'}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{user?.hub || 'India Command Hub'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out of RouteMind AI"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
