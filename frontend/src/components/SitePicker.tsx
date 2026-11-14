import { useState } from 'react';
import type { FC } from 'react';
import type { LandingSite } from '../data/types';
import { MapPin, Sliders, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SitePickerProps {
  sites: LandingSite[];
  selectedId: string;
  onSelect: (siteId: string) => void;
  label?: string;
  allowCustom?: boolean;
  onCustomCoords?: (lat: number, lon: number, name: string) => void;
}

export const SitePicker: FC<SitePickerProps> = ({
  sites,
  selectedId,
  onSelect,
  label = 'Primary Landing Site',
  allowCustom = true,
  onCustomCoords,
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customLat, setCustomLat] = useState('-89.0');
  const [customLon, setCustomLon] = useState('0.0');

  // Find currently selected site
  const currentSite = sites.find((s) => s.id === selectedId);

  // Group sites by region
  const regions: Record<string, LandingSite[]> = {
    'South Pole Candidates (Artemis / CLPS)': sites.filter((s) => s.region === 'south-pole'),
    'Equatorial & Historic (Apollo)': sites.filter((s) => s.region === 'equatorial' || s.region === 'near-side'),
    'Far Side Explorations': sites.filter((s) => s.region === 'far-side'),
  };

  const isVerifiedSpice = ['shackleton-rim', 'malapert-massif', 'nobile-rim', 'apollo-11'].includes(selectedId);

  const handleApplyCustom = () => {
    const lat = parseFloat(customLat);
    const lon = parseFloat(customLon);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      if (onCustomCoords) {
        onCustomCoords(lat, lon, `Custom Target (${lat >= 0 ? `+${lat.toFixed(2)}` : lat.toFixed(2)}°, ${lon >= 0 ? `+${lon.toFixed(2)}` : lon.toFixed(2)}°)`);
      }
    }
  };

  return (
    <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 shadow-xl backdrop-blur space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
          <MapPin className="h-3.5 w-3.5 text-cyan-400" />
          <span>{label}</span>
        </label>
        {allowCustom && (
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
          >
            <Sliders className="h-3 w-3" />
            <span>{showCustom ? 'Select Preset' : 'Custom Coords'}</span>
          </button>
        )}
      </div>

      {!showCustom ? (
        <>
          {/* Site Selector Dropdown */}
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            >
              {Object.entries(regions).map(([groupName, groupSites]) => (
                <optgroup key={groupName} label={groupName} className="bg-slate-900 text-slate-300 font-mono">
                  {groupSites.map((site) => (
                    <option key={site.id} value={site.id} className="bg-slate-950 text-slate-100">
                      {site.name} ({site.latitude >= 0 ? `+${site.latitude.toFixed(2)}` : site.latitude.toFixed(2)}°, {site.longitude >= 0 ? `+${site.longitude.toFixed(2)}` : site.longitude.toFixed(2)}°)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Detailed Selected Site Card */}
          {currentSite && (
            <div className="mt-2 bg-slate-900/70 border border-slate-800/80 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-300 font-semibold">{currentSite.nation}</span>
                <span className="text-cyan-400 font-semibold">{currentSite.mission}</span>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 font-sans">
                {currentSite.description}
              </p>

              {/* Coordinates & Provenance Row */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 font-mono text-[10.5px]">
                <div>
                  <span className="text-slate-500 block text-[9.5px]">Latitude</span>
                  <span className="text-slate-200 font-bold">
                    {currentSite.latitude >= 0 ? `+${currentSite.latitude.toFixed(4)}°N` : `${Math.abs(currentSite.latitude).toFixed(4)}°S`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9.5px]">Longitude</span>
                  <span className="text-slate-200 font-bold">
                    {currentSite.longitude >= 0 ? `+${currentSite.longitude.toFixed(4)}°E` : `${Math.abs(currentSite.longitude).toFixed(4)}°W`}
                  </span>
                </div>
              </div>

              {/* Badges Row */}
              <div className="pt-1.5 flex flex-wrap gap-1.5 items-center justify-between text-[9.5px] font-mono">
                <span className="text-slate-500">Frame: {currentSite.frame}</span>
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`px-2 py-0.5 rounded border font-semibold flex items-center space-x-1 ${
                      isVerifiedSpice
                        ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                        : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    {isVerifiedSpice ? (
                      <>
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>SPICE DE440 Verified</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-2.5 w-2.5" />
                        <span>Approximate Ephemeris</span>
                      </>
                    )}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded border ${
                      currentSite.terrainAvailability === 'available'
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {currentSite.terrainAvailability === 'available' ? 'LOLA Horizon' : 'Flat Horizon (0°)'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Latitude (-90° to +90°)
              </label>
              <input
                type="number"
                step="0.01"
                min="-90"
                max="90"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Longitude (-180° to +180°)
              </label>
              <input
                type="number"
                step="0.01"
                min="-180"
                max="180"
                value={customLon}
                onChange={(e) => setCustomLon(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyCustom}
            className="w-full bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-300 rounded py-1.5 text-xs font-mono font-semibold transition-all"
          >
            Apply Target Coordinates
          </button>
          <div className="flex items-start space-x-1.5 text-[10px] text-amber-400/90 bg-amber-950/30 border border-amber-500/20 p-2 rounded">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>Custom coordinates will compute analytical geometric illumination and use flat horizon approximation.</span>
          </div>
        </div>
      )}
    </div>
  );
};
