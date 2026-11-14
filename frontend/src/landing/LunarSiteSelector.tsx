// LunarSiteSelector.tsx — Interactive candidate site selector cards inspired by SpaceEdu
import type { FC } from 'react';
import type { SiteMarkerData } from './LunarGlobe';
import { MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

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
  // Filter out the currently featured site so only the 3 alternatives appear here
  const alternativeSites = sites.filter((s) => s.id !== selectedSiteId);

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs" role="region" aria-label="Alternative landing site selection">
      <div className="text-[10px] font-mono text-[#42D9F5]/70 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-1">
        <MapPin className="h-3 w-3 text-[#42D9F5]" />
        <span>Alternative Candidates</span>
      </div>

      {alternativeSites.map((site) => (
        <button
          key={site.id}
          type="button"
          onClick={() => onSelectSite(site.id)}
          className="group text-left p-3.5 rounded-xl border border-[#42D9F5]/15 bg-[#101B2D]/70 hover:bg-[#101B2D] hover:border-[#42D9F5]/40 transition-all duration-300 backdrop-blur shadow-lg shadow-black/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#42D9F5]/60"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#F4F7FC] group-hover:text-[#42D9F5] transition-colors">
              {site.name}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-[#9AA9BF] group-hover:text-[#42D9F5] group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA9BF]/80">
            <span>
              {site.latitude > 0 ? `+${site.latitude.toFixed(2)}°` : `${site.latitude.toFixed(2)}°`},{' '}
              {site.longitude > 0 ? `+${site.longitude.toFixed(2)}°` : `${site.longitude.toFixed(2)}°`}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-[#42D9F5]/80 bg-[#42D9F5]/10 px-1.5 py-0.5 rounded border border-[#42D9F5]/20">
              {site.region === 'south-pole' ? 'South Pole' : 'Equatorial'}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-[#9AA9BF]/50">
            <span>{site.mission}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" /> SPICE
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
