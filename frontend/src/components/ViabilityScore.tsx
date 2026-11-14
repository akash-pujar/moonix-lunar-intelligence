import type { FC } from 'react';
import type { ViabilityScore as ViabilityScoreType } from '../data/types';
import { ShieldCheck, AlertCircle, XCircle, Sliders, Info, Zap, Radio, Target } from 'lucide-react';

interface ViabilityScoreProps {
  viability: ViabilityScoreType | null;
  onWeightChange: (powerWeight: number, commWeight: number) => void;
}

export const ViabilityScore: FC<ViabilityScoreProps> = ({ viability, onWeightChange }) => {
  if (!viability) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center text-slate-500 font-mono text-xs">
        Calculating landing viability index...
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
          border: 'border-emerald-500/40 bg-emerald-950/50 text-emerald-300',
          ring: 'text-emerald-400',
          gaugeStroke: '#10b981',
        };
      case 'amber':
        return {
          label: 'MARGINAL CONDITIONS',
          icon: <AlertCircle className="h-4 w-4 text-amber-400" />,
          border: 'border-amber-500/40 bg-amber-950/50 text-amber-300',
          ring: 'text-amber-400',
          gaugeStroke: '#f59e0b',
        };
      case 'red':
        return {
          label: 'HIGH RISK / SEVERE OUTAGES',
          icon: <XCircle className="h-4 w-4 text-rose-400" />,
          border: 'border-rose-500/40 bg-rose-950/50 text-rose-300',
          ring: 'text-rose-400',
          gaugeStroke: '#f43f5e',
        };
    }
  };

  const badge = getStatusBadge();

  // SVG Radial Gauge Calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, overall)) / 100) * circumference;

  return (
    <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 shadow-xl backdrop-blur space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
            Landing Site Viability Index
          </span>
        </div>
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-mono font-semibold ${badge.border}`}
        >
          {badge.icon}
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Main Score & Component Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Radial Gauge Display (4 cols on md) */}
        <div className="md:col-span-4 flex items-center justify-center p-3 bg-slate-900/70 border border-slate-800/80 rounded-xl">
          <div className="relative flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke="#1e293b"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress circle */}
              <circle
                cx="56"
                cy="56"
                r={radius}
                stroke={badge.gaugeStroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-extrabold font-mono tracking-tight ${badge.ring}`}>
                {overall.toFixed(1)}
              </span>
              <span className="text-[9px] font-mono uppercase text-slate-400">/ 100</span>
            </div>
          </div>
        </div>

        {/* Sub-scores (8 cols on md) */}
        <div className="md:col-span-8 space-y-3">
          {/* Power Sub-score */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-lg p-2.5 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 flex items-center space-x-1.5 font-medium">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Solar Power Availability</span>
              </span>
              <span className="text-amber-400 font-bold">{powerScore.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, powerScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>Weight: {(powerWeight * 100).toFixed(0)}%</span>
              <span>Threshold: &ge; 50%</span>
            </div>
          </div>

          {/* Comm Sub-score */}
          <div className="bg-slate-900/60 border border-slate-800/60 rounded-lg p-2.5 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300 flex items-center space-x-1.5 font-medium">
                <Radio className="h-3.5 w-3.5 text-cyan-400" />
                <span>Direct-to-Earth Comm Link</span>
              </span>
              <span className="text-cyan-400 font-bold">{commScore.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, commScore))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>Weight: {(commWeight * 100).toFixed(0)}%</span>
              <span>Threshold: &ge; 40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Adjuster Slider */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="flex items-center space-x-1">
            <Sliders className="h-3 w-3 text-cyan-400" />
            <span className="font-semibold">Mission Objective Trade Weights</span>
          </span>
          <div className="flex items-center space-x-2 text-[10px]">
            <button
              type="button"
              onClick={() => onWeightChange(0.5, 0.5)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              50/50
            </button>
            <button
              type="button"
              onClick={() => onWeightChange(0.7, 0.3)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Power 70/30
            </button>
            <button
              type="button"
              onClick={() => onWeightChange(0.3, 0.7)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Comm 30/70
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-[10px] font-mono text-amber-400 shrink-0 font-semibold">
            Power: {(powerWeight * 100).toFixed(0)}%
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(powerWeight * 100)}
            onChange={(e) => handlePowerSlider(parseInt(e.target.value, 10))}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <span className="text-[10px] font-mono text-cyan-400 shrink-0 font-semibold">
            Comm: {(commWeight * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Explanation Box with Mandatory Disclaimer */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-lg p-3 text-xs font-mono space-y-1.5 text-slate-300">
        <div className="text-[11px] text-cyan-300 font-semibold flex items-center space-x-1.5">
          <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span>Screening Assessment Summary</span>
        </div>
        <p className="leading-relaxed whitespace-pre-line text-[11px] text-slate-400">
          {explanation}
        </p>
        <div className="text-[9.5px] text-slate-500 pt-1.5 border-t border-slate-800/60 leading-tight">
          PRE-PHASE A SCREENING ONLY — NOT AN OPERATIONAL FLIGHT COMMITMENT.
          High-resolution LOLA DEM topographic horizon masking is pending Milestone 5.
        </div>
      </div>
    </div>
  );
};
