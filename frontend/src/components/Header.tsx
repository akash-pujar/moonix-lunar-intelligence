import type { FC } from 'react';
import type { AppMode, EphemerisSource } from '../data/types';
import { Compass, Sparkles, Activity, ShieldAlert, Cpu } from 'lucide-react';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  dataSource: EphemerisSource;
  isSimulated?: boolean;
}

export const Header: FC<HeaderProps> = ({
  mode,
  onModeChange,
  dataSource,
  isSimulated = true,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Compass className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-wider text-slate-100 font-mono">
                MOON<span className="text-cyan-400">IX</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono font-medium">
                CLPS NAV-10
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono">
              Lunar Landing Site Navigator &bull; NASA Space Apps 2026
            </p>
          </div>
        </div>

        {/* Center / Data Provenance Status */}
        <div className="hidden md:flex items-center space-x-2">
          {dataSource === 'SPICE' ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              <span>SPICE EPHEMERIS (DE440 / MOON_ME)</span>
            </div>
          ) : dataSource === 'HORIZONS' ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/50 text-blue-300 text-xs font-mono shadow-[0_0_12px_rgba(59,130,246,0.15)]">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              <span>HORIZONS EPHEMERIS (JPL SSD)</span>
            </div>
          ) : isSimulated ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
              <span>SIMULATED (M1 PLACEHOLDER)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs font-mono">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>APPROXIMATE (GEOMETRIC MODEL)</span>
            </div>
          )}
        </div>

        {/* Right: Mode Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => onModeChange('planner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                mode === 'planner'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>PLANNER</span>
            </button>
            <button
              type="button"
              onClick={() => onModeChange('explorer')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                mode === 'explorer'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>EXPLORER</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

