import React from 'react';
import { Accessibility, Check } from 'lucide-react';

interface AccessibilityScoreProps {
  score: number; // 0-100
  label?: string;
  compact?: boolean;
}

export const AccessibilityScore: React.FC<AccessibilityScoreProps> = ({
  score,
  label = 'Accessibility',
  compact = false
}) => {
  const getTone = (s: number) => {
    if (s >= 90) return { text: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30', bar: 'bg-cyan-400' };
    if (s >= 75) return { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', bar: 'bg-emerald-400' };
    if (s >= 65) return { text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', bar: 'bg-amber-400' };
    return { text: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', bar: 'bg-rose-400' };
  };

  const tone = getTone(score);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tone.bg}`}>
        <Accessibility className={`w-3.5 h-3.5 ${tone.text}`} />
        <span className="text-slate-300">{label}:</span>
        <span className={`font-mono ${tone.text}`}>{score}/100</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-400 flex items-center gap-1.5 font-medium">
          <Accessibility className={`w-4 h-4 ${tone.text}`} />
          {label}
        </span>
        <span className={`font-mono font-bold ${tone.text}`}>{score} / 100</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${tone.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
