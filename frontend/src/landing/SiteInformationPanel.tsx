// SiteInformationPanel.tsx — Displays featured landing site intelligence and launch CTA
import type { FC } from 'react';
import type { SiteMarkerData } from './LunarGlobe';
import { Compass, Cpu, ArrowRight, ShieldCheck } from 'lucide-react';

interface SiteInformationPanelProps {
  site: SiteMarkerData;
  onLaunchPlanner: (siteId: string) => void;
}

export const SiteInformationPanel: FC<SiteInformationPanelProps> = ({
  site,
  onLaunchPlanner,
}) => {
  const latFormatted =
    site.latitude < 0
      ? `${Math.abs(site.latitude).toFixed(3)}° S`
      : `${site.latitude.toFixed(3)}° N`;
  const lonFormatted =
    site.longitude < 0
      ? `${Math.abs(site.longitude).toFixed(3)}° W`
      : `${site.longitude.toFixed(3)}° E`;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-[#42D9F5]/20 bg-[#0A1222]/85 backdrop-blur-xl p-5 shadow-2xl shadow-cyan-950/30 space-y-4">
      {/* Header Eyebrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#42D9F5]">
          <Compass className="h-3.5 w-3.5" />
          <span>Featured Candidate</span>
        </div>
        <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="h-2.5 w-2.5" /> SPICE VERIFIED
        </span>
      </div>

      {/* Site Name */}
      <div>
        <h3
          className="text-2xl sm:text-3xl font-normal text-[#F4F7FC] tracking-tight"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          {site.name}
        </h3>
        <p className="text-xs text-[#9AA9BF] font-light mt-0.5">{site.mission}</p>
      </div>

      {/* Coordinate Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-[#101B2D]/80 border border-[#42D9F5]/10 font-mono text-xs">
        <div>
          <div className="text-[9px] text-[#9AA9BF]/60 uppercase tracking-wider">Latitude</div>
          <div className="text-sm font-semibold text-[#42D9F5] mt-0.5">{latFormatted}</div>
        </div>
        <div>
          <div className="text-[9px] text-[#9AA9BF]/60 uppercase tracking-wider">Longitude</div>
          <div className="text-sm font-semibold text-[#42D9F5] mt-0.5">{lonFormatted}</div>
        </div>
        <div>
          <div className="text-[9px] text-[#9AA9BF]/60 uppercase tracking-wider">Region</div>
          <div className="text-xs text-[#F4F7FC] mt-0.5 uppercase tracking-wide">
            {site.region === 'south-pole' ? 'Lunar South Pole' : 'Equatorial Near-Side'}
          </div>
        </div>
        <div>
          <div className="text-[9px] text-[#9AA9BF]/60 uppercase tracking-wider">Coordinate Frame</div>
          <div className="text-xs text-[#F4F7FC] mt-0.5 uppercase">MOON_ME (IAU)</div>
        </div>
      </div>

      {/* Data Status Strip */}
      <div className="flex items-center justify-between text-[10px] font-mono px-3 py-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300">
        <div className="flex items-center gap-1.5">
          <Cpu className="h-3 w-3 text-emerald-400" />
          <span>DATA STATUS: SPICE EPHEMERIS</span>
        </div>
        <span className="text-[9px] text-emerald-400/70">DE440 / LT+S</span>
      </div>

      {/* Launch Action */}
      <button
        type="button"
        onClick={() => onLaunchPlanner(site.id)}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#42D9F5] hover:bg-[#5ee4f8] text-[#050914] font-mono font-semibold text-xs tracking-wider transition-all duration-200 shadow-lg shadow-cyan-500/25 cursor-pointer group"
      >
        <span>PLAN MISSION FOR THIS SITE</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};
