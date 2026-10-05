import React from 'react';

interface SmartScoreProps {
  score: number; // 0 - 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const SmartScore: React.FC<SmartScoreProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  // Dimensions based on size
  const config = {
    sm: { dimension: 70, stroke: 6, textClass: 'text-lg', labelClass: 'text-[10px]' },
    md: { dimension: 110, stroke: 8, textClass: 'text-2xl', labelClass: 'text-xs' },
    lg: { dimension: 150, stroke: 10, textClass: 'text-4xl', labelClass: 'text-sm' }
  }[size];

  const radius = (config.dimension - config.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 90) return { stroke: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)', text: 'text-cyan-400', label: 'Optimal AI Match' };
    if (s >= 75) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400', label: 'Good Alternative' };
    if (s >= 60) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400', label: 'Moderate Friction' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', text: 'text-rose-400', label: 'High Delay/Low Access' };
  };

  const scheme = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={config.dimension}
          height={config.dimension}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={config.stroke}
            fill="transparent"
          />
          {/* Dynamic Value Ring */}
          <circle
            cx={config.dimension / 2}
            cy={config.dimension / 2}
            r={radius}
            stroke={scheme.stroke}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 6px ${scheme.glow})`
            }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-bold font-mono tracking-tight ${config.textClass} text-white`}>
            {score}
          </span>
          <span className="text-[10px] text-slate-400 -mt-1 font-medium">/ 100</span>
        </div>
      </div>

      {showLabel && (
        <span className={`mt-2 font-medium ${config.labelClass} ${scheme.text} text-center`}>
          {scheme.label}
        </span>
      )}
    </div>
  );
};
