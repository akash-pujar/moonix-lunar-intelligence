import type { FC } from 'react';
import { Mountain, AlertCircle } from 'lucide-react';

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
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 shadow-lg backdrop-blur space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Mountain className="h-3.5 w-3.5 text-cyan-400" />
          <span>Horizon Elevation Model</span>
        </label>
        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
            terrainAvailable
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
          }`}
        >
          {terrainAvailable ? 'LOLA 1° Profile' : 'Flat 0° Fallback'}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="space-y-0.5">
          <div className="text-xs font-mono text-slate-200">
            {useTerrainHorizon && terrainAvailable ? 'Terrain-Aware Horizon' : 'Ideal Flat Horizon'}
          </div>
          <div className="text-[10px] text-slate-400 font-sans">
            {useTerrainHorizon && terrainAvailable
              ? 'Applies NASA LOLA 360° ray-marched ridge & crater mask.'
              : 'Assumes smooth spherical lunar horizon at 0° elevation.'}
          </div>
        </div>

        <button
          type="button"
          disabled={!terrainAvailable}
          onClick={() => onChange(!useTerrainHorizon)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            useTerrainHorizon && terrainAvailable ? 'bg-cyan-500' : 'bg-slate-700'
          } ${!terrainAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              useTerrainHorizon && terrainAvailable ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {!terrainAvailable && (
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-amber-400/90 pt-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>LOLA ray-marched horizon pending for this site. Using flat horizon.</span>
        </div>
      )}
    </div>
  );
};
