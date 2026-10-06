import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Navigation,
  Radio,
  ArrowRight,
  Flame,
  Sparkles,
  Compass,
  Cpu,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const EntrancePage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [flightPhase, setFlightPhase] = useState<'entering' | 'crossing' | 'warp' | 'done'>('entering');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flaming Earth Animation Parameters
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Fire Particles Array
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
    }

    const particles: Particle[] = [];
    const flameColors = [
      '#ff2a00',
      '#ff5500',
      '#ff8800',
      '#ffaa00',
      '#ffdd33',
      '#ffffff'
    ];

    // Earth position starts at far right (1.15 * width) and moves to left (-0.2 * width)
    let earthX = canvas.width + 120;
    const earthY = canvas.height * 0.46;
    const earthRadius = Math.min(canvas.width, canvas.height) * 0.11; // proportional globe size
    const travelSpeed = canvas.width * 0.0035 + 2.8; // smooth blazing speed

    let rotationAngle = 0;
    let startTime = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move earth from right to left
      earthX -= travelSpeed;
      rotationAngle += 0.02;

      // Calculate progress (0% when at right, 100% when exited left)
      const totalDist = canvas.width + 240;
      const traveled = canvas.width + 120 - earthX;
      const pct = Math.max(0, Math.min(100, Math.round((traveled / totalDist) * 100)));
      setProgress(pct);

      if (pct > 75 && flightPhase !== 'warp') {
        setFlightPhase('warp');
      }

      // Generate trailing fire particles (flames shoot out behind the earth to the right)
      for (let i = 0; i < 18; i++) {
        const offsetAngle = (Math.random() - 0.5) * Math.PI * 0.8;
        const spawnX = earthX + Math.cos(offsetAngle) * (earthRadius * 0.85);
        const spawnY = earthY + Math.sin(offsetAngle) * (earthRadius * 0.85);

        particles.push({
          x: spawnX,
          y: spawnY,
          vx: Math.random() * 7 + 4, // fires backward to the right
          vy: (Math.random() - 0.5) * 5,
          size: Math.random() * (earthRadius * 0.45) + 12,
          color: flameColors[Math.floor(Math.random() * flameColors.length)],
          alpha: 1,
          decay: Math.random() * 0.035 + 0.02
        });
      }

      // Render Fire Particles
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.96;

        if (p.alpha <= 0 || p.size <= 1) {
          particles.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.4, p.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Render Outer Fiery Shockwave / Atmosphere Aura
      ctx.save();
      const auraGrad = ctx.createRadialGradient(
        earthX,
        earthY,
        earthRadius * 0.7,
        earthX,
        earthY,
        earthRadius * 2.2
      );
      auraGrad.addColorStop(0, 'rgba(255, 140, 0, 0.6)');
      auraGrad.addColorStop(0.4, 'rgba(255, 60, 0, 0.4)');
      auraGrad.addColorStop(0.8, 'rgba(255, 30, 0, 0.15)');
      auraGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Earth Globe Base with Atmospheric Gradient
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      // Deep Ocean Blue Base
      const oceanGrad = ctx.createRadialGradient(
        earthX - earthRadius * 0.3,
        earthY - earthRadius * 0.3,
        earthRadius * 0.1,
        earthX,
        earthY,
        earthRadius
      );
      oceanGrad.addColorStop(0, '#1e40af'); // vibrant royal blue
      oceanGrad.addColorStop(0.7, '#0f172a');
      oceanGrad.addColorStop(1, '#020617');
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Continents / Green & Golden Landmasses
      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.rotate(rotationAngle);

      // Continent shapes
      ctx.fillStyle = '#10b981'; // emerald green continents
      ctx.shadowColor = '#059669';
      ctx.shadowBlur = 10;

      // Draw stylized continents
      ctx.beginPath();
      ctx.ellipse(-earthRadius * 0.3, -earthRadius * 0.2, earthRadius * 0.45, earthRadius * 0.35, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(earthRadius * 0.25, earthRadius * 0.15, earthRadius * 0.5, earthRadius * 0.4, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(0, earthRadius * 0.4, earthRadius * 0.35, earthRadius * 0.25, 0.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(-earthRadius * 0.1, -earthRadius * 0.55, earthRadius * 0.3, earthRadius * 0.2, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Atmospheric Clouds
      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.rotate(-rotationAngle * 0.7);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(earthRadius * 0.1, -earthRadius * 0.3, earthRadius * 0.6, earthRadius * 0.18, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-earthRadius * 0.2, earthRadius * 0.25, earthRadius * 0.55, earthRadius * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Surface Heat / Fire Rim glow on leading edge (left)
      const fireRim = ctx.createLinearGradient(
        earthX - earthRadius,
        earthY,
        earthX + earthRadius,
        earthY
      );
      fireRim.addColorStop(0, 'rgba(255, 220, 100, 0.75)'); // incandescent leading shock
      fireRim.addColorStop(0.3, 'rgba(255, 100, 0, 0.35)');
      fireRim.addColorStop(1, 'transparent');
      ctx.fillStyle = fireRim;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Leading Shockwave Arc (Plasma Bow Shock in front of moving globe)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 240, 180, 0.9)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(earthX - 6, earthY, earthRadius * 1.15, Math.PI * 0.65, Math.PI * 1.35);
      ctx.stroke();
      ctx.restore();

      // Check if earth has completely crossed screen to the left
      if (earthX < -earthRadius * 2.5) {
        setFlightPhase('done');
        setTimeout(() => {
          navigate('/dashboard');
        }, 350);
        return;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [navigate, flightPhase]);

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#05070d] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden z-50">
      {/* Dynamic Starfield Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16,185,129,0.3) 1px, transparent 1px), radial-gradient(circle at 20% 30%, rgba(255,100,0,0.2) 1.5px, transparent 1.5px)`,
            backgroundSize: '48px 48px, 96px 96px'
          }}
        />
      </div>

      {/* Fiery Earth Canvas Layer (Animates 🌏 with Fire from Right to Left) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* TOP STATUS BAR */}
      <header className="relative z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-slate-950 shadow-lg shadow-orange-500/30">
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase">
                RouteMind AI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40">
                TELEMETRY IGNITION
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Orbital Vector: 110°E ➔ 76°E • Whole India Highway Matrix
            </p>
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white text-xs font-bold font-mono uppercase tracking-wider transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-95"
        >
          <span>Enter Dashboard</span>
          <ArrowRight className="w-4 h-4 text-emerald-400" />
        </button>
      </header>

      {/* CENTER HUD NOTIFICATION (Subtle and non-intrusive) */}
      <div className="relative z-20 pointer-events-none text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-orange-500/40 backdrop-blur-xl shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
          <span className="text-xs font-mono font-extrabold text-orange-400 tracking-wider">
            GLOBAL TELEMETRY STREAM ACQUIRED 🌏 🔥
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
          Synchronizing Real-Time Logistics Grid
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Calibrating 24 commercial fleet units and 780+ highway corridors across India.
        </p>
      </div>

      {/* BOTTOM TELEMETRY DOCK */}
      <footer className="relative z-20 max-w-2xl w-full mx-auto p-4 sm:p-5 rounded-2xl bg-slate-900/85 border border-slate-800/90 backdrop-blur-2xl shadow-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="flex items-center gap-2 text-emerald-400 font-bold">
            <Radio className="w-4 h-4 animate-pulse text-orange-400" />
            <span>GRID SYNCHRONIZATION</span>
          </span>
          <span className="font-mono text-base font-black text-white">
            {progress}%
          </span>
        </div>

        {/* Progress Track */}
        <div className="w-full h-2.5 rounded-full bg-slate-950 p-0.5 overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-75 shadow-lg shadow-orange-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Vector: Right ➔ Left (Earth Orbit)</span>
          <span className="text-emerald-400 font-bold">Status: Launching Command Center</span>
        </div>
      </footer>
    </div>
  );
};
