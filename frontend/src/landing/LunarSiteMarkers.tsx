// LunarSiteMarkers.tsx — Coordinate transformation and accessible controls for landing markers
import type { FC } from 'react';
import type { SiteMarkerData } from './LunarGlobe';
import { latLonToVector3 } from './LunarGlobe';

export { latLonToVector3 };

interface LunarSiteMarkersProps {
  sites: SiteMarkerData[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
  className?: string;
}

export const LunarSiteMarkers: FC<LunarSiteMarkersProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
  className = '',
}) => {
  return (
    <nav
      className={`flex items-center gap-2 overflow-x-auto py-2 px-1 ${className}`}
      aria-label="Lunar landing candidate site selector tabs"
    >
      {sites.map((site) => {
        const isSelected = site.id === selectedSiteId;
        return (
          <button
            key={site.id}
            type="button"
            onClick={() => onSelectSite(site.id)}
            aria-pressed={isSelected}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 border whitespace-nowrap cursor-pointer ${
              isSelected
                ? 'bg-[#42D9F5]/20 border-[#42D9F5] text-[#F4F7FC] shadow-md shadow-cyan-500/20'
                : 'bg-black/60 border-white/10 text-[#9AA9BF] hover:text-[#F4F7FC] hover:border-[#42D9F5]/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSelected ? 'bg-[#FFB547] animate-ping' : 'bg-[#42D9F5]/60'
              }`}
            />
            <span>{site.name}</span>
            <span className="text-[10px] text-white/40">
              ({site.latitude < 0 ? `${Math.abs(site.latitude).toFixed(1)}°S` : `${site.latitude.toFixed(1)}°N`})
            </span>
          </button>
        );
      })}
    </nav>
  );
};
