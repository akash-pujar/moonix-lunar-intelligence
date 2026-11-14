// LunarSiteSelector.tsx — Compact candidate site switcher cards framing the Moon
import type { FC } from 'react';
import type { SiteMarkerData } from './LunarGlobe';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface LunarSiteSelectorProps {
  sites: SiteMarkerData[];
  selectedSiteId: string;
  onSelectSite: (id: string) => void;
}

export const LunarSiteSelector: FC<LunarSiteSelectorProps> = ({
  sites,
  selectedSiteId,
  onSelectSite,
}) => {
  return (
    <div
      className="flex flex-col gap-2 w-full max-w-[260px]"
      role="region"
      aria-label="Candidate lunar landing site selector"
    >
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] mb-0.5 px-1">
        <span className="text-white/40">Landing Candidates</span>
        <span className="text-[#42D9F5]/80">4 Sites</span>
      </div>

      {sites.map((site, index) => {
        const isSelected = site.id === selectedSiteId;
        const latFormatted =
          site.latitude < 0
            ? `${Math.abs(site.latitude).toFixed(2)}° S`
            : `${site.latitude.toFixed(2)}° N`;
        const lonFormatted =
          site.longitude < 0
            ? `${Math.abs(site.longitude).toFixed(2)}° W`
            : `${site.longitude.toFixed(2)}° E`;

        return (
          <button
            key={site.id}
            type="button"
            onClick={() => onSelectSite(site.id)}
            aria-pressed={isSelected}
            className={`group text-left p-2.5 rounded-xl border transition-all duration-200 backdrop-blur-md cursor-pointer focus:outline-none ${
              isSelected
                ? 'bg-black/90 border-[#42D9F5]/70 shadow-[0_0_20px_rgba(66,217,245,0.12)]'
                : 'bg-black/50 border-white/10 hover:border-white/25 hover:bg-black/75'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`text-[9px] font-mono px-1 py-0.2 rounded border shrink-0 ${
                    isSelected
                      ? 'bg-[#42D9F5]/15 border-[#42D9F5]/40 text-[#42D9F5]'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}
                >
                  0{index + 1}
                </span>
                <span
                  className={`text-xs font-medium truncate transition-colors ${
                    isSelected ? 'text-[#F4F7FC]' : 'text-[#C4D1E2] group-hover:text-white'
                  }`}
                >
                  {site.name}
                </span>
              </div>
              {isSelected ? (
                <span className="flex h-1.5 w-1.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#42D9F5] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#42D9F5]" />
                </span>
              ) : (
                <ArrowRight className="h-3 w-3 text-white/20 group-hover:text-[#42D9F5] group-hover:translate-x-0.5 transition-all shrink-0" />
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono mt-1">
              <span className={isSelected ? 'text-[#42D9F5] font-medium' : 'text-white/50'}>
                {latFormatted}, {lonFormatted}
              </span>
              <span
                className={`text-[8px] uppercase tracking-wider px-1 py-0.2 rounded border ${
                  isSelected
                    ? 'text-[#42D9F5] bg-[#42D9F5]/10 border-[#42D9F5]/30'
                    : 'text-white/40 bg-white/5 border-white/10'
                }`}
              >
                {site.region === 'south-pole' ? 'South Pole' : 'Equatorial'}
              </span>
            </div>

            <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-white/40">
              <span className="truncate max-w-[130px]">{site.mission}</span>
              <span className="text-emerald-400 flex items-center gap-0.5 shrink-0">
                <ShieldCheck className="h-2 w-2" /> SPICE
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
