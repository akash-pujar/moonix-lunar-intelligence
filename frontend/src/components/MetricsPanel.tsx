import type { FC } from 'react';
import type { MissionMetrics, AppMode } from '../data/types';
import { Sun, Radio, Moon, ShieldAlert, Wifi, BatteryCharging, TrendingUp, RadioTower } from 'lucide-react';

interface MetricsPanelProps {
  metrics: MissionMetrics | null;
  mode: AppMode;
}

export const MetricsPanel: FC<MetricsPanelProps> = ({ metrics, mode }) => {
  if (!metrics) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 text-center text-slate-500 font-mono text-xs">
        Synthesizing mission trajectory metrics...
      </div>
    );
  }

  const isExplorer = mode === 'explorer';

  const formatHours = (hours: number): string => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const rem = (hours % 24).toFixed(1);
      return `${days}d ${rem}h`;
    }
    return `${hours.toFixed(1)} h`;
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Mission Telemetry & Resource Budgets (30-Day Window)
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          {isExplorer ? 'Explorer Mode (Simplified)' : 'Planner Mode (Aerospace Spec)'}
        </span>
      </div>

      {/* Two Main Telemetry Clusters: Solar Power & Direct Communication */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Solar Power & Illumination Availability */}
        <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-4 shadow-xl backdrop-blur space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300">
                <Sun className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-100 uppercase">
                  Solar Power & Illumination
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {isExplorer ? 'Battery charging and solar array power generation' : 'Optical LOS with solar limb +0.27° and penumbra threshold'}
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                metrics.solarAvailabilityPct > 60
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : metrics.solarAvailabilityPct > 30
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {metrics.solarAvailabilityPct > 60 ? 'FAVORABLE' : metrics.solarAvailabilityPct > 30 ? 'MARGINAL' : 'SEVERE RISK'}
            </span>
          </div>

          {/* Primary Progress Bar: Illumination % */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 space-y-2">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xs text-slate-300 flex items-center space-x-1.5">
                <BatteryCharging className="h-3.5 w-3.5 text-amber-400" />
                <span>Overall Solar Availability</span>
              </span>
              <span className="text-xl font-bold text-amber-400">
                {metrics.solarAvailabilityPct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, metrics.solarAvailabilityPct))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9.5px] font-mono text-slate-400">
              <span>0% Darkness</span>
              <span>100% Continuous Daylight</span>
            </div>
          </div>

          {/* Sub-metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Peak Solar Elevation */}
            <div className="bg-slate-900/60 border border-slate-800/70 rounded-lg p-2.5 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-amber-400" />
                <span>Peak Solar Elevation</span>
              </div>
              <div className="text-base font-bold font-mono text-amber-300">
                +{metrics.peakSolarElevation.toFixed(2)}°
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">
                {isExplorer ? 'Higher angles increase panel efficiency' : 'Maximum sub-solar altitude in analysis window'}
              </div>
            </div>

            {/* Longest Continuous Darkness */}
            <div className="bg-slate-900/60 border border-slate-800/70 rounded-lg p-2.5 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                <Moon className="h-3 w-3 text-rose-400" />
                <span>Longest Darkness Duration</span>
              </div>
              <div
                className={`text-base font-bold font-mono ${
                  metrics.longestDarknessHours > 72 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {formatHours(metrics.longestDarknessHours)}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">
                {isExplorer ? 'Requires internal lander battery reserve' : 'Continuous solar occlusion interval'}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Direct-to-Earth Communication Availability */}
        <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4 shadow-xl backdrop-blur space-y-3.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300">
                <Radio className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-slate-100 uppercase">
                  Direct-to-Earth Communication (DTE)
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {isExplorer ? 'Direct telemetry link to Deep Space Network stations' : 'Line-of-sight with Earth limb +0.95° and topocentric parallax'}
                </div>
              </div>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                metrics.earthVisibilityPct > 70
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : metrics.earthVisibilityPct > 40
                  ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              {metrics.earthVisibilityPct > 70 ? 'NOMINAL LINK' : metrics.earthVisibilityPct > 40 ? 'INTERMITTENT' : 'CRITICAL OUTAGES'}
            </span>
          </div>

          {/* Primary Progress Bar: DTE % */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3 space-y-2">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xs text-slate-300 flex items-center space-x-1.5">
                <RadioTower className="h-3.5 w-3.5 text-cyan-400" />
                <span>Overall Direct Comm Visibility</span>
              </span>
              <span className="text-xl font-bold text-cyan-400">
                {metrics.earthVisibilityPct.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-300 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, metrics.earthVisibilityPct))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9.5px] font-mono text-slate-400">
              <span>0% Blackout</span>
              <span>100% Continuous Contact</span>
            </div>
          </div>

          {/* Sub-metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Longest Comm Window */}
            <div className="bg-slate-900/60 border border-slate-800/70 rounded-lg p-2.5 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                <Wifi className="h-3 w-3 text-cyan-400" />
                <span>Longest Continuous Link</span>
              </div>
              <div className="text-base font-bold font-mono text-cyan-300">
                {formatHours(metrics.longestCommWindowHours)}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">
                {isExplorer ? 'High-speed science and command window' : 'Maximum continuous optical line-of-sight window'}
              </div>
            </div>

            {/* Longest Comm Outage */}
            <div className="bg-slate-900/60 border border-slate-800/70 rounded-lg p-2.5 space-y-1">
              <div className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                <ShieldAlert className="h-3 w-3 text-rose-400" />
                <span>Longest Comm Outage</span>
              </div>
              <div
                className={`text-base font-bold font-mono ${
                  metrics.longestCommOutageHours > 48 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {formatHours(metrics.longestCommOutageHours)}
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">
                {isExplorer ? 'Requires autonomous surface operations' : 'Maximum occultation period without Earth LOS'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
