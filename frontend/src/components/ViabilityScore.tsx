import type { FC } from 'react';
import type { ViabilityScore as ViabilityScoreType } from '../data/types';
import { ShieldCheck, AlertCircle, XCircle, Sliders, Info, Zap, Radio } from 'lucide-react';

interface ViabilityScoreProps {
  viability: ViabilityScoreType | null;
  onWeightChange: (powerWeight: number, commWeight: number) => void;
}

export const ViabilityScore: FC<ViabilityScoreProps> = ({ viability, onWeightChange }) => {
  if (!viability) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center text-slate-500 font-mono text-xs">
        Awaiting viability calculation...
      </div>
    );
  }

  const { overall, powerScore, commScore, powerWeight, commWeight, status, explanation } =
    viability;

  const handlePowerSlider = (val: number) => {
    const pw = val / 100;
    const cw = Number((1 - pw).toFixed(2));
    onWeightChange(pw, cw);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'green':
        return {
          label: 'VIABLE / FAVORABLE',
          icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
          border: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
          ring: 'text-emerald-400',
        };
      case 'amber':
        return {
          label: 'MARGINAL CONDITIONS',
          icon: <AlertCircle className="h-4 w-4 text-amber-400" />,
          border: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
          ring: 'text-amber-400',
        };
      case 'red':
        return {
          label: 'HIGH RISK / SEVERE OUTAGES',
          icon: <XCircle className="h-4 w-4 text-rose-400" />,
          border: 'border-rose-500/40 bg-rose-950/40 text-rose-300',
          ring: 'text-rose-400',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Landing Site Viability Index
        </span>
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-medium ${badge.border}`}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Main Score & Component Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Large Score Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-slate-800 rounded-xl text-center">
          <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">
            Overall Composite Index
          </div>
          <div className={`text-4xl font-extrabold font-mono tracking-tight ${badge.ring}`}>
            {overall.toFixed(1)}
            <span className="text-lg text-slate-500 font-normal"> / 100</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1">
            Weighted Power ({(powerWeight * 100).toFixed(0)}%) & Comm ({(commWeight * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Sub-scores */}
        <div className="md:col-span-2 space-y-3">
          {/* Power Sub-score */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Solar Power Availability</span>
              </span>
              <span className="text-amber-400 font-bold">{powerScore.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, powerScore))}%` }}
              />
            </div>
          </div>

          {/* Comm Sub-score */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 flex items-center space-x-1.5">
                <Radio className="h-3.5 w-3.5 text-blue-400" />
                <span>Direct-to-Earth Comm Link</span>
              </span>
              <span className="text-blue-400 font-bold">{commScore.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, commScore))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weight Adjuster Slider */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center space-x-1">
            <Sliders className="h-3 w-3 text-cyan-400" />
            <span>Mission Objective Weighting</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Solar: <span className="text-amber-400 font-bold">{(powerWeight * 100).toFixed(0)}%</span> | Comm:{' '}
            <span className="text-blue-400 font-bold">{(commWeight * 100).toFixed(0)}%</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono text-amber-400 shrink-0">100% Power</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(powerWeight * 100)}
            onChange={(e) => handlePowerSlider(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <span className="text-[10px] font-mono text-blue-400 shrink-0">100% Comm</span>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3 text-xs font-mono space-y-1 text-slate-400">
        <div className="text-[11px] text-slate-300 font-semibold mb-1 flex items-center space-x-1.5">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Screening Assessment Summary</span>
        </div>
        <p className="leading-relaxed whitespace-pre-line text-[11px]">
          {explanation}
        </p>
        <div className="text-[9px] text-slate-500 pt-1 border-t border-slate-800/50 italic">
          Note: This is a mathematical screening index, not a probability of mission success or engineering certification.
        </div>
      </div>
    </div>
  );
};

