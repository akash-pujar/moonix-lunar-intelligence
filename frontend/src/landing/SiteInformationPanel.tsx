// SiteInformationPanel.tsx — Clean, compact aerospace HUD site intelligence card
import type { FC } from 'react';
import type { SiteMarkerData } from './LunarGlobe';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface SiteInformationPanelProps {
  site: SiteMarkerData;
  onLaunchPlanner: (siteId: string) => void;
}

const SITE_INTEL: Record<
  string,
  {
    illumination: string;
    earthVis: string;
    brief: string;
  }
> = {
  'shackleton-rim': {
    illumination: '86% Peak',
    earthVis: 'Direct LoS',
    brief: 'Elevated rim peak with near-permanent solar exposure adjacent to cryogenic water-ice cold traps.',
  },
  'malapert-massif': {
    illumination: '74% Peak',
    earthVis: 'Continuous Link',
    brief: 'Commanding 5,000 m massif ridge offering premier direct-to-Earth communication and solar power.',
  },
  'nobile-rim': {
    illumination: '68% Peak',
    earthVis: 'Periodic Link',
    brief: 'High-priority volatiles prospecting terrain with accessible micro-cold traps.',
  },
  'apollo-11': {
    illumination: '50% Diurnal',
    earthVis: 'Continuous (+57°)',
    brief: 'Historic Tranquility Base benchmark used to calibrate astrodynamics precision.',
  },
};

export const SiteInformationPanel: FC<SiteInformationPanelProps> = ({
  site,
  onLaunchPlanner,
}) => {
  const intel = SITE_INTEL[site.id] || SITE_INTEL['shackleton-rim'];
  const latFormatted =
    site.latitude < 0
      ? `${Math.abs(site.latitude).toFixed(3)}° S`
      : `${site.latitude.toFixed(3)}° N`;
  const lonFormatted =
    site.longitude < 0
      ? `${Math.abs(site.longitude).toFixed(3)}° W`
      : `${site.longitude.toFixed(3)}° E`;

  return (
    <div className="w-full max-w-[280px] rounded-2xl border border-white/10 bg-black/85 backdrop-blur-xl p-4 shadow-2xl shadow-black space-y-3">
      {/* Header Eyebrow */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#42D9F5]/90">
          Site Intelligence
        </span>
        <span className="text-[8px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="h-2 w-2" /> SPICE VERIFIED
        </span>
      </div>

      {/* Site Designation */}
      <div>
        <h3
          className="text-xl sm:text-2xl font-normal text-[#F4F7FC] tracking-tight leading-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {site.name}
        </h3>
        <p className="text-[11px] text-[#9AA9BF] font-light">{site.mission}</p>
      </div>

      {/* Primary Coordinates & Key Metrics */}
      <div className="grid grid-cols-2 gap-1.5 p-2 rounded-xl bg-black/60 border border-white/8 font-mono text-xs">
        <div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider">Latitude</div>
          <div className="text-xs font-semibold text-[#42D9F5]">{latFormatted}</div>
        </div>
        <div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider">Longitude</div>
          <div className="text-xs font-semibold text-[#42D9F5]">{lonFormatted}</div>
        </div>
        <div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider">Illumination</div>
          <div className="text-xs text-white/90">{intel.illumination}</div>
        </div>
        <div>
          <div className="text-[8px] text-white/40 uppercase tracking-wider">Earth Link</div>
          <div className="text-xs text-white/90 truncate">{intel.earthVis}</div>
        </div>
      </div>

      {/* Short Scientific Brief */}
      <p className="text-[11px] text-[#9AA9BF] leading-relaxed font-light">{intel.brief}</p>

      {/* Launch Action */}
      <button
        type="button"
        onClick={() => onLaunchPlanner(site.id)}
        className="group w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#42D9F5] hover:bg-[#5ee4f8] text-[#02050E] font-mono font-semibold text-xs tracking-wider transition-all duration-200 shadow-md shadow-cyan-500/20 cursor-pointer"
      >
        <span>OPEN IN PLANNER</span>
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};
