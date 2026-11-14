import type { FC } from 'react';
import { CalendarRange } from 'lucide-react';

interface DateSlipHeatmapProps {
  baseDate: string;
  siteName: string;
}

export const DateSlipHeatmap: FC<DateSlipHeatmapProps> = ({ baseDate, siteName }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center space-y-2 backdrop-blur">
      <div className="flex items-center justify-center space-x-2 text-xs font-mono text-cyan-400">
        <CalendarRange className="h-4 w-4" />
        <span className="font-semibold uppercase tracking-wider">30-Day Viability Heatmap Matrix</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
          P1 Feature
        </span>
      </div>
      <p className="text-xs text-slate-400 max-w-md mx-auto">
        Automated ±30 day landing window optimization for <strong>{siteName}</strong> starting from {baseDate}.
        Evaluates daily illumination and comm scores across 60 days to highlight the optimal slip date.
      </p>
    </div>
  );
};
