import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import type { AppMode, EphemerisSource } from '../data/types';
import { Compass, Sparkles, Activity, ShieldAlert, Cpu, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  dataSource: EphemerisSource | null;
  isSimulated?: boolean;
  loading?: boolean;
  siteName?: string;
}

export const Header: FC<HeaderProps> = ({
  mode,
  onModeChange,
  dataSource,
  isSimulated = false,
  loading = false,
  siteName,
}) => {
  // Real-time ticking UTC clock (updates once per second)
  const [nowUtc, setNowUtc] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowUtc(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const utcTimeString = nowUtc.toISOString().slice(11, 19) + ' UTC';
  const utcDateString = nowUtc.toISOString().slice(0, 10);

  // Determine exact provenance hierarchy
  const renderProvenanceBadge = () => {
    if (loading) {
      return (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono animate-pulse">
          <Cpu className="h-3.5 w-3.5 text-cyan-400" />
          <span>QUERYING SPICE ARCHIVE...</span>
        </div>
      );
    }

    if (dataSource === 'SPICE') {
      return (
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold text-emerald-200">SPICE DATA AVAILABLE</span>
          <span className="text-emerald-400/80 hidden lg:inline">| DE440 / MOON_ME / LT+S</span>
        </div>
      );
    }

    if (dataSource === 'HORIZONS') {
      return (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/50 text-blue-300 text-xs font-mono shadow-[0_0_12px_rgba(59,130,246,0.2)]">
          <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-semibold text-blue-200">HORIZONS DATA AVAILABLE</span>
          <span className="text-blue-400/80 hidden lg:inline">| JPL SSD OBSERVER</span>
        </div>
      );
    }

    if (dataSource === 'APPROXIMATE') {
      return (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-300 text-xs font-mono shadow-[0_0_10px_rgba(245,158,11,0.15)]">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-semibold text-amber-200">APPROXIMATE MODEL</span>
          <span className="text-amber-400/80 hidden lg:inline">| GEOMETRIC KINEMATICS</span>
        </div>
      );
    }

    if (isSimulated) {
      return (
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-mono">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          <span className="font-semibold text-rose-200">SIMULATED DATA</span>
          <span className="text-rose-400/80 hidden lg:inline">| SYNTHETIC FALLBACK</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-xs font-mono">
        <span>DATA UNAVAILABLE</span>
      </div>
    );
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand with Link to Landing Page */}
        <Link
          to="/"
          className="flex items-center space-x-3 group hover:opacity-95 transition-opacity shrink-0"
          title="Return to Landing Page"
        >
          <div className="h-9 w-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] group-hover:border-cyan-400 transition-colors">
            <Compass className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-wider text-slate-100 font-mono">
                MOON<span className="text-cyan-400">IX</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 font-mono font-medium">
                CLPS NAV-10
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono flex items-center gap-1.5">
              <span>Mission Control</span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-cyan-400/80 group-hover:underline flex items-center gap-0.5">
                <ArrowLeft className="h-2.5 w-2.5 inline" /> Overview
              </span>
            </p>
          </div>
        </Link>

        {/* Live UTC Clock */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-900/90 border border-slate-800/90 text-slate-300 font-mono text-xs shadow-inner">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-cyan-300 font-bold tracking-wider">{utcTimeString}</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400 text-[11px]">{utcDateString}</span>
        </div>

        {/* Active Target Site Tag (Desktop) */}
        {siteName && (
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">TARGET:</span>
            <span className="text-cyan-300 font-bold">{siteName}</span>
          </div>
        )}

        {/* Center / Data Provenance Status */}
        <div className="hidden sm:flex items-center space-x-2">
          {renderProvenanceBadge()}
        </div>

        {/* Right: Mode Switcher */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs font-mono shadow-inner">
            <button
              type="button"
              onClick={() => onModeChange('planner')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                mode === 'planner'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
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
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-semibold'
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
