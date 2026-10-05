import React, { ReactNode } from 'react';
import { Route } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Route className="w-10 h-10 text-cyan-400" />,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-800 bg-[#0f172a]/50 text-center max-w-sm mx-auto">
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 mb-4 shadow-inner">
        {icon}
      </div>
      <h4 className="text-base font-bold text-white mb-1.5">{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg shadow-cyan-500/20"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
