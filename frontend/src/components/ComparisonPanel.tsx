import type { FC } from 'react';
import type { LandingSite, MissionMetrics, ViabilityScore } from '../data/types';
import { Trophy, CheckCircle2 } from 'lucide-react';

interface ComparisonPanelProps {
  primarySite: LandingSite | null;
  comparisonSite: LandingSite | null;
  primaryMetrics: MissionMetrics | null;
  comparisonMetrics: MissionMetrics | null;
  primaryViability: ViabilityScore | null;
  comparisonViability: ViabilityScore | null;
  onClearComparison: () => void;
}

export const ComparisonPanel: FC<ComparisonPanelProps> = ({
  primarySite,
  comparisonSite,
  primaryMetrics,
  comparisonMetrics,
  primaryViability,
  comparisonViability,
  onClearComparison,
}) => {
  if (!comparisonSite || !primarySite || !primaryMetrics || !comparisonMetrics || !primaryViability || !comparisonViability) {
    return null;
  }

  // Calculate Deltas
  const scoreDiff = comparisonViability.overall - primaryViability.overall;
  const solarDiff = comparisonMetrics.solarAvailabilityPct - primaryMetrics.solarAvailabilityPct;
  const earthDiff = comparisonMetrics.earthVisibilityPct - primaryMetrics.earthVisibilityPct;
  const darknessDiff = primaryMetrics.longestDarknessHours - comparisonMetrics.longestDarknessHours; // positive means comparison has shorter darkness (better)

  const isComparisonBetter = scoreDiff > 0;

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 shadow-xl backdrop-blur space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            Site-to-Site Trade Study & Comparison
          </span>
        </div>
        <button
          type="button"
          onClick={onClearComparison}
          className="text-[11px] font-mono text-slate-400 hover:text-slate-200"
        >
          Close Comparison
        </button>
      </div>

      {/* Sites Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Site Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-500">Primary Site</span>
            <span className="text-xs font-mono font-bold text-slate-300">
              Score: {primaryViability.overall.toFixed(1)}
            </span>
          </div>
          <div className="text-base font-bold text-slate-100 font-sans">{primarySite.name}</div>
          <div className="text-xs text-slate-400 font-mono">
            {primarySite.latitude.toFixed(2)}°N, {primarySite.longitude.toFixed(2)}°E &bull; {primarySite.mission}
          </div>
          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">Solar Availability</span>
              <span className="text-amber-400 font-bold">{primaryMetrics.solarAvailabilityPct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Earth LOS</span>
              <span className="text-blue-400 font-bold">{primaryMetrics.earthVisibilityPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Comparison Site Card */}
        <div
          className={`bg-slate-950/80 border rounded-lg p-3 space-y-2 ${
            isComparisonBetter ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-cyan-400">Alternative Candidate</span>
            <span className={`text-xs font-mono font-bold ${isComparisonBetter ? 'text-cyan-300' : 'text-slate-300'}`}>
              Score: {comparisonViability.overall.toFixed(1)}
            </span>
          </div>
          <div className="text-base font-bold text-slate-100 font-sans">{comparisonSite.name}</div>
          <div className="text-xs text-slate-400 font-mono">
            {comparisonSite.latitude.toFixed(2)}°N, {comparisonSite.longitude.toFixed(2)}°E &bull; {comparisonSite.mission}
          </div>
          <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] block">Solar Availability</span>
              <span className="text-amber-400 font-bold">{comparisonMetrics.solarAvailabilityPct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Earth LOS</span>
              <span className="text-blue-400 font-bold">{comparisonMetrics.earthVisibilityPct.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade Study Delta Highlights */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 space-y-2">
        <div className="text-[11px] font-mono font-semibold text-slate-300 flex items-center space-x-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
          <span>Delta Analysis ({comparisonSite.name} vs {primarySite.name})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-[10px] text-slate-500 block">Viability Index</span>
            <span className={`text-sm font-bold ${scoreDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {scoreDiff >= 0 ? `+${scoreDiff.toFixed(1)}` : scoreDiff.toFixed(1)} pts
            </span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-[10px] text-slate-500 block">Solar Power Delta</span>
            <span className={`text-sm font-bold ${solarDiff >= 0 ? 'text-amber-400' : 'text-slate-400'}`}>
              {solarDiff >= 0 ? `+${solarDiff.toFixed(1)}%` : `${solarDiff.toFixed(1)}%`}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-[10px] text-slate-500 block">Earth Line-of-Sight</span>
            <span className={`text-sm font-bold ${earthDiff >= 0 ? 'text-blue-400' : 'text-slate-400'}`}>
              {earthDiff >= 0 ? `+${earthDiff.toFixed(1)}%` : `${earthDiff.toFixed(1)}%`}
            </span>
          </div>

          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-[10px] text-slate-500 block">Darkness Reduction</span>
            <span className={`text-sm font-bold ${darknessDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {darknessDiff >= 0 ? `-${darknessDiff.toFixed(1)} h` : `+${Math.abs(darknessDiff).toFixed(1)} h`}
            </span>
          </div>
        </div>

        {/* Conclusion recommendation */}
        <div className="text-[11px] font-mono pt-1 text-slate-300">
          {isComparisonBetter ? (
            <span className="text-cyan-300 font-medium">
              &bull; Recommendation: <strong>{comparisonSite.name}</strong> offers superior conditions for this mission window (+{scoreDiff.toFixed(1)} score advantage).
            </span>
          ) : (
            <span className="text-slate-400">
              &bull; Recommendation: <strong>{primarySite.name}</strong> remains the favorable landing site for this mission profile.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
