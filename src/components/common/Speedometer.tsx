import React from 'react';
import { Gauge, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SpeedometerProps {
  speed: number; // Current speed in km/h
  maxSpeed?: number; // Gauge maximum (default 120)
  speedLimit?: number; // Speed limit (default 80)
  averageSpeed?: number;
  size?: number; // Pixel width/height (default 200)
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  speed,
  maxSpeed = 120,
  speedLimit = 80,
  averageSpeed = 61,
  size = 200
}) => {
  const isOverLimit = speed > speedLimit;
  const clampedSpeed = Math.max(0, Math.min(speed, maxSpeed));

  // Gauge angle sweep: from -135° to +135° (270 degrees total)
  const startAngle = -135;
  const totalSweep = 270;
  const speedFraction = clampedSpeed / maxSpeed;
  const needleAngle = startAngle + speedFraction * totalSweep;

  // SVG Geometry
  const radius = 70;
  const center = 100;
  const strokeWidth = 10;

  // Arc path generator
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad)
    };
  };

  const describeArc = (cx: number, cy: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(cx, cy, r, endA);
    const end = polarToCartesian(cx, cy, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const backgroundArc = describeArc(center, center, radius, startAngle, startAngle + totalSweep);
  const activeSweep = Math.max(0.1, speedFraction * totalSweep);
  const activeArc = describeArc(center, center, radius, startAngle, startAngle + activeSweep);

  // Speed limit marker angle
  const speedLimitFraction = Math.min(1, speedLimit / maxSpeed);
  const speedLimitAngle = startAngle + speedLimitFraction * totalSweep;
  const limitPoint1 = polarToCartesian(center, center, radius - 6, speedLimitAngle);
  const limitPoint2 = polarToCartesian(center, center, radius + 8, speedLimitAngle);

  // Ticks at 0, 20, 40, 60, 80, 100, 120
  const ticks = [0, 20, 40, 60, 80, 100, 120];

  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-white dark:bg-[#090d16]/90 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl text-slate-900 dark:text-slate-100">
      {/* Gauge SVG Canvas */}
      <div className="relative" style={{ width: size, height: size * 0.85 }}>
        <svg viewBox="0 0 200 175" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="speedGaugeNormal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="speedGaugeAlert" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={backgroundArc}
            fill="none"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Speed Arc with Glow */}
          <path
            d={activeArc}
            fill="none"
            stroke={isOverLimit ? 'url(#speedGaugeAlert)' : 'url(#speedGaugeNormal)'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#gaugeGlow)"
            className="transition-all duration-300 ease-out"
          />

          {/* Speed Limit Red Line */}
          <line
            x1={limitPoint1.x}
            y1={limitPoint1.y}
            x2={limitPoint2.x}
            y2={limitPoint2.y}
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Tick Labels */}
          {ticks.map((t) => {
            const frac = t / maxSpeed;
            const angle = startAngle + frac * totalSweep;
            const pt = polarToCartesian(center, center, radius - 16, angle);
            return (
              <text
                key={t}
                x={pt.x}
                y={pt.y + 3}
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[8px] font-bold"
                textAnchor="middle"
              >
                {t}
              </text>
            );
          })}

          {/* Needle Pointer */}
          <g
            transform={`rotate(${needleAngle}, ${center}, ${center})`}
            className="transition-transform duration-300 ease-out"
          >
            <polygon
              points={`${center - 2},${center} ${center + 2},${center} ${center},${center - radius + 8}`}
              fill={isOverLimit ? '#ef4444' : '#0284c7'}
              filter="url(#gaugeGlow)"
            />
            <circle cx={center} cy={center} r="6" className="fill-white dark:fill-slate-900" stroke={isOverLimit ? '#ef4444' : '#0284c7'} strokeWidth="2.5" />
          </g>

          {/* Digital Readout inside Center */}
          <text
            x={center}
            y={center + 28}
            className="fill-slate-900 dark:fill-white font-mono font-black text-[26px] tracking-tight"
            textAnchor="middle"
          >
            {Math.round(speed)}
          </text>
          <text
            x={center}
            y={center + 42}
            className={`text-[10px] font-bold tracking-wider ${isOverLimit ? 'fill-rose-500' : 'fill-sky-600 dark:fill-sky-400'}`}
            textAnchor="middle"
          >
            KM / H
          </text>
        </svg>
      </div>

      {/* Speed Metrics Table */}
      <div className="w-full grid grid-cols-3 gap-2 mt-1 pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Current</span>
          <span className={`font-mono font-extrabold text-sm ${isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-sky-600 dark:text-cyan-300'}`}>
            {speed} km/h
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Average</span>
          <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
            {averageSpeed} km/h
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Speed Limit</span>
          <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-300">
            {speedLimit} km/h
          </span>
        </div>
      </div>

      {/* Speed Status Badge */}
      <div className="mt-3 w-full">
        {isOverLimit ? (
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-bold animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400" />
            <span>SPEED ALERT: OVERSPEEDING (+{speed - speedLimit} km/h)</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Status: Within Safe Limit</span>
          </div>
        )}
      </div>
    </div>
  );
};
