import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Radio,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Compass,
  Cpu,
  Layers,
  MapPin
} from 'lucide-react';

export const EntrancePage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    'Connecting to GPS Satellite Telemetry Grid...',
    'Indexing 780+ All-India District Corridors...',
    'Calibrating 24 Active Commercial Fleet Units...',
    'Synchronizing Real-Time Google Traffic Engine...',
    'Command Center Online. Access Granted.'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            navigate('/dashboard');
          }, 450);
          return 100;
        }
        const next = prev + 2;
        if (next >= 20 && next < 45) setActiveStep(1);
        else if (next >= 45 && next < 70) setActiveStep(2);
        else if (next >= 70 && next < 95) setActiveStep(3);
        else if (next >= 95) setActiveStep(4);
        return next;
      });
    }, 38);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleEnterNow = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#080d17] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Animated Radar Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #10b981 1px, transparent 1px), linear-gradient(to right, rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.06) 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 80px 80px, 80px 80px'
          }}
        />
      </div>

      {/* Rotating Radar Scanner Pulse Rings */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] rounded-full border border-emerald-500/20 animate-ping duration-[3500ms]" />
        <div className="absolute inset-0 w-[240px] h-[240px] sm:w-[380px] sm:h-[380px] m-auto rounded-full border border-teal-500/30 animate-pulse duration-[2000ms]" />
        <div className="absolute inset-0 w-[140px] h-[140px] sm:w-[240px] sm:h-[240px] m-auto rounded-full border border-emerald-400/40" />
      </div>

      {/* Central Command Portal Box */}
      <div className="relative z-10 w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0d1522]/90 border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 backdrop-blur-xl flex flex-col items-center text-center space-y-6">
        {/* Animated Brand Badge */}
        <div className="relative">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/30 transform hover:scale-105 transition-transform duration-300">
            <Navigation className="w-9 h-9 sm:w-10 sm:h-10 fill-current transform -rotate-45" />
          </div>
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0d1522]" />
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              RouteMind
            </h1>
            <span className="px-2 py-0.5 rounded-md text-xs font-mono font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              AI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide">
            Autonomous Fleet Intelligence & Logistics Command
          </p>
        </div>

        {/* Telemetry Status Bar */}
        <div className="w-full bg-[#080d16] border border-slate-800 rounded-2xl p-4 text-left space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>SYSTEM INITIALIZATION</span>
            </span>
            <span className="font-extrabold text-white text-sm">
              {progress}%
            </span>
          </div>

          {/* Progress Track */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-150 ease-out shadow-lg shadow-emerald-400/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Current Step Description */}
          <div className="flex items-center gap-2 text-[11px] text-slate-300 min-h-[20px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{steps[activeStep]}</span>
          </div>
        </div>

        {/* Fast Enter CTA Button */}
        <div className="w-full pt-1 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleEnterNow}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Enter Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Footer Meta */}
        <div className="flex items-center justify-between w-full text-[10px] text-slate-500 font-mono border-t border-slate-800/80 pt-3">
          <span>PORT 3001 • SSE LIVE</span>
          <span>SOUTH INDIA GRID</span>
          <span>24 UNITS ACTIVE</span>
        </div>
      </div>
    </div>
  );
};

export default EntrancePage;
