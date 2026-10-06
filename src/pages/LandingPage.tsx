import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  ArrowRight,
  ShieldCheck,
  Radio,
  Zap,
  Accessibility,
  Truck,
  Compass,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Sun,
  Moon,
  Clock,
  Layers,
  MapPin
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const scrollToOverview = () => {
    const el = document.getElementById('platform-overview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090d16] dark:bg-[#090d16] light:bg-[#f8fafc] text-slate-100 dark:text-slate-100 light:text-slate-800 transition-colors duration-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-4 bg-[#090d16]/90 dark:bg-[#090d16]/90 light:bg-white/90 backdrop-blur-md border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
            <Navigation className="w-5 h-5 fill-current transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black tracking-tight text-white dark:text-white light:text-slate-900">
                RouteMind
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500 font-medium">
              Logistics Intelligence & Routing Grid
            </p>
          </div>
        </div>

        {/* Center Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300 dark:text-slate-300 light:text-slate-600">
          <button onClick={scrollToOverview} className="hover:text-cyan-400 transition-colors cursor-pointer">
            Platform Overview
          </button>
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Intelligence Engine
          </a>
          <a href="#accessibility" className="hover:text-cyan-400 transition-colors">
            Accessibility
          </a>
          <a href="#network" className="hover:text-cyan-400 transition-colors">
            Indian Corridors
          </a>
        </nav>

        {/* Right CTA & Theme Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-slate-100 border border-slate-700 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button
            onClick={handleGetStarted}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>{isAuthenticated ? 'Open Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-8 py-16 sm:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Hero Messaging */}
        <div className="flex-1 space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 light:bg-cyan-50 border border-cyan-500/30 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Next-Generation Commercial Freight Telematics</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white dark:text-white light:text-slate-900 tracking-tight leading-tight">
            Intelligent Logistics.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Smarter Routes.
            </span>{' '}
            Safer Journeys.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 dark:text-slate-300 light:text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            AI-powered route optimization, real-time vehicle intelligence and accessibility-aware logistics for modern transportation fleets across India.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToOverview}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-slate-900 light:bg-white hover:bg-slate-800 dark:hover:bg-slate-800 light:hover:bg-slate-100 border border-slate-700 dark:border-slate-800 light:border-slate-300 text-slate-200 dark:text-slate-200 light:text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Explore Platform
            </button>
          </div>

          {/* Key Value Metrics */}
          <div className="pt-6 border-t border-slate-800 dark:border-slate-800 light:border-slate-200 grid grid-cols-3 gap-4 text-center lg:text-left">
            <div>
              <div className="font-mono text-2xl font-black text-white dark:text-white light:text-slate-900">
                214 km
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                Optimized NH Corridor
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-cyan-400 dark:text-cyan-400 light:text-cyan-600">
                94%
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                Route AI Accuracy
              </div>
            </div>
            <div>
              <div className="font-mono text-2xl font-black text-emerald-400 dark:text-emerald-400 light:text-emerald-600">
                91/100
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                Accessibility Score
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero Image Card */}
        <div className="flex-1 w-full relative z-10">
          <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 dark:border-slate-800 light:border-slate-200 shadow-2xl bg-slate-900">
            <img
              src="/images/logistics_hero.jpg"
              alt="RouteMind AI Connected Logistics Network"
              className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-700"
            />
            {/* Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-900/90 dark:bg-slate-900/90 light:bg-white/95 border border-slate-700 dark:border-slate-700 light:border-slate-200 backdrop-blur-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="font-bold text-white dark:text-white light:text-slate-900 block text-[11px]">
                    NH 83 Active Freight Corridor
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 light:text-slate-500">
                    Coimbatore ➔ Madurai Bypass • Telemetry Synchronized
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 dark:text-cyan-300 light:text-cyan-700 border border-cyan-500/30">
                PORT 3001
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PLATFORM PILLARS */}
      <section
        id="platform-overview"
        className="py-16 px-4 sm:px-8 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 bg-slate-950/40 dark:bg-slate-950/40 light:bg-slate-50"
      >
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              Enterprise Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white dark:text-white light:text-slate-900">
              Built for Commercial Logistics at Scale
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
              Seamless orchestration of real GPS hardware, Google traffic layers, accessibility audits, and voice intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                Real-Time Telematics & GPS Stream
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                Connect actual OBD-II GPS tracking devices, mobile driver GPS, or IoT sensors. Real-time updates push via Server-Sent Events (SSE) and WebSockets.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                Traffic-Aware Corridor Routing
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                Evaluates authentic Indian highway corridors (e.g. NH 83, NH 44, Oddanchatram Bypass) with delay risk analytics and dynamic road quality factors.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-xl space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Accessibility className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                Inclusive Accessibility Intelligence
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">
                Actionable scoring for step-free mobility, wheelchair accessibility, pedestrian crosswalk safety, and footpath surface audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 sm:px-8 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white dark:text-white light:text-slate-900">RouteMind AI</span>
            <span>• Enterprise Logistics & Inclusive Mobility Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Supported Corridors: All India Corridors</span>
            <span>•</span>
            <button onClick={handleGetStarted} className="text-cyan-400 hover:underline">
              Dispatcher Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
