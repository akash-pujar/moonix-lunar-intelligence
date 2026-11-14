import type { FC } from 'react';
import { Mountain, AlertCircle, ShieldAlert } from 'lucide-react';

interface TerrainToggleProps {
  useTerrainHorizon: boolean;
  onChange: (value: boolean) => void;
  terrainAvailable: boolean;
}

export const TerrainToggle: FC<TerrainToggleProps> = ({
  useTerrainHorizon,
  onChange,
  terrainAvailable,
}) => {
  return (
    <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 shadow-xl backdrop-blur space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
          <Mountain className="h-3.5 w-3.5 text-cyan-400" />
          <span>Horizon Occlusion Model</span>
        </label>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${
            terrainAvailable
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}
        >
          {terrainAvailable ? 'LOLA 1° Profile Available' : 'Flat Horizon (0°) Fallback'}
        </span>
      </div>

      {/* Toggle Control */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="space-y-0.5 pr-2">
          <div className="text-xs font-mono font-semibold text-slate-100">
            {useTerrainHorizon && terrainAvailable ? 'Topographic Terrain Mask (LOLA)' : 'Ideal Flat Horizon (R=1,737.4 km)'}
          </div>
          <div className="text-[10px] text-slate-400 font-sans leading-tight">
            {useTerrainHorizon && terrainAvailable
              ? 'Applies NASA LOLA 360° ray-marched crater rim and ridge elevation mask.'
              : 'Calculates geometric line-of-sight against mean spherical Moon (R=1,737.4 km, h=2.0 m).'}
          </div>
        </div>

        <button
          type="button"
          disabled={!terrainAvailable}
          onClick={() => onChange(!useTerrainHorizon)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            useTerrainHorizon && terrainAvailable ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' : 'bg-slate-800'
          } ${!terrainAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              useTerrainHorizon && terrainAvailable ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Honest Scientific Disclosure */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2 text-[10px] font-mono text-slate-400 space-y-1">
        <div className="text-slate-300 font-semibold flex items-center space-x-1">
          <ShieldAlert className="h-3 w-3 text-amber-400" />
          <span>FLAT HORIZON APPROXIMATION R=1,737.4 km</span>
        </div>
        <p className="text-[9.5px] leading-tight text-slate-400">
          Geometric dip is -0.087° for 2.0 m observer height. Full high-resolution LOLA DEM 20m ray-tracing is scheduled for Milestone 5.
        </p>
      </div>

      {!terrainAvailable && (
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-amber-400/90 pt-0.5">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>LOLA ray-marched horizon pending for this site. Using flat horizon model.</span>
        </div>
      )}
    </div>
  );
};
