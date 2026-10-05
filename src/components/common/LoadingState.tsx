import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, Loader2, Navigation, ShieldCheck, Clock, Activity } from 'lucide-react';

interface LoadingStateProps {
  onComplete?: () => void;
  speedMs?: number;
}

const STEPS = [
  { text: 'Analyzing traffic', icon: Activity, detail: 'Querying real-time traffic telemetry and congestion nodes' },
  { text: 'Comparing routes', icon: Navigation, detail: 'Evaluating primary highway and bypass alternatives' },
  { text: 'Calculating ETA', icon: Clock, detail: 'Computing traffic-aware optimal duration and speeds' },
  { text: 'Optimizing vehicle flow', icon: Cpu, detail: 'Synchronizing fleet positioning and dispatch routing' }
];

export const LoadingState: React.FC<LoadingStateProps> = ({
  onComplete,
  speedMs = 380
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          if (onComplete) {
            setTimeout(onComplete, 350);
          }
          return prev;
        }
      });
    }, speedMs);

    return () => clearInterval(timer);
  }, [onComplete, speedMs]);

  const progressPercent = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-[#0f172a]/95 border border-cyan-500/40 rounded-2xl shadow-2xl backdrop-blur-xl max-w-md w-full mx-auto text-center">
      {/* Animated Core Icon */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
          <Cpu className="w-8 h-8 animate-pulse text-cyan-400" />
        </div>
        <div className="absolute -inset-2 rounded-2xl border border-cyan-400/20 animate-ping opacity-25" />
      </div>

      <h3 className="text-base font-extrabold uppercase tracking-wider text-white">
        CALCULATING BEST ROUTE...
      </h3>
      <p className="text-xs text-slate-400 mt-1 mb-5">
        Traffic-aware optimal route calculation in progress
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300 ease-out shadow-sm shadow-cyan-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="w-full space-y-2.5 text-left">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.text}
              className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                isCurrent
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : isDone
                  ? 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                  : 'bg-transparent border-transparent opacity-40 text-slate-500'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <StepIcon className="w-4 h-4 text-slate-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold ${isCurrent ? 'text-cyan-200' : 'text-slate-200'}`}>
                  ● {step.text}
                </p>
                {isCurrent && (
                  <p className="text-[11px] text-cyan-400/80 mt-0.5 animate-fadeIn">
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
