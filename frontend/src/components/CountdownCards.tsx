import type { FC } from 'react';
import type { Countdown } from '../data/types';
import { Sunrise, Sunset, Globe, Radio, Eye, EyeOff, ShieldCheck, Moon } from 'lucide-react';

interface CountdownCardsProps {
  countdowns: Countdown[];
  cursorTime?: string;
  useTerrainHorizon?: boolean;
}

export const CountdownCards: FC<CountdownCardsProps> = ({
  countdowns,
  useTerrainHorizon = false,
}) => {
  // Map countdown types to icons, titles, and aerospace color themes
  const getCardDetails = (type: Countdown['type']) => {
    switch (type) {
      case 'sunrise':
        return {
          title: 'Sunrise (AOS)',
          sub: 'Solar Power Recovery',
          icon: <Sunrise className="h-4 w-4 text-amber-300" />,
          cardBg: 'from-amber-950/25 to-slate-950/90 border-amber-500/30 hover:border-amber-500/50',
          accent: 'text-amber-300',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)]',
          continuousText: 'Continuous Daylight (Polar Peak)',
          occludedText: 'Permanent Shadow (PSR)',
        };
      case 'sunset':
        return {
          title: 'Sunset (LOS)',
          sub: 'Nightfall / Battery Drain',
          icon: <Sunset className="h-4 w-4 text-amber-400" />,
          cardBg: 'from-amber-950/30 to-slate-950/90 border-amber-500/35 hover:border-amber-500/60',
          accent: 'text-amber-400',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.12)]',
          continuousText: 'Continuous Daylight (Polar Peak)',
          occludedText: 'Permanent Shadow (PSR)',
        };
      case 'earthrise':
        return {
          title: 'Earthrise (AOS)',
          sub: 'Direct Comm Acquisition',
          icon: <Globe className="h-4 w-4 text-cyan-300" />,
          cardBg: 'from-cyan-950/25 to-slate-950/90 border-cyan-500/30 hover:border-cyan-500/50',
          accent: 'text-cyan-300',
          glow: 'shadow-[0_0_15px_rgba(6,182,212,0.1)]',
          continuousText: 'Continuous Direct Line-of-Sight',
          occludedText: 'Continuous Earth Occlusion',
        };
      case 'earthset':
        return {
          title: 'Earthset (LOS)',
          sub: 'Direct Comm Outage',
          icon: <Radio className="h-4 w-4 text-blue-400" />,
          cardBg: 'from-blue-950/30 to-slate-950/90 border-blue-500/35 hover:border-blue-500/60',
          accent: 'text-blue-400',
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.12)]',
          continuousText: 'Continuous Direct Line-of-Sight',
          occludedText: 'Continuous Earth Occlusion',
        };
    }
  };

  const formatHours = (hours: number | null): string => {
    if (hours === null || isNaN(hours)) return '';
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remHours = (hours % 24).toFixed(1);
      return `${days}d ${remHours}h`;
    }
    return `${hours.toFixed(1)} h`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {countdowns.map((cd) => {
        const details = getCardDetails(cd.type);
        const isSun = cd.type === 'sunrise' || cd.type === 'sunset';
        const hasTime = cd.hoursRemaining !== null && !isNaN(cd.hoursRemaining);

        return (
          <div
            key={cd.type}
            className={`relative overflow-hidden bg-gradient-to-b ${details.cardBg} border rounded-xl p-3.5 backdrop-blur transition-all duration-300 ${details.glow} group hover:translate-y-[-1px]`}
          >
            {/* Top row: Title & Live Visibility Status */}
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center space-x-1.5 text-xs font-mono font-semibold tracking-wide text-slate-200">
                {details.icon}
                <span>{details.title}</span>
              </span>

              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center space-x-1 font-semibold ${
                  cd.isCurrentlyVisible
                    ? isSun
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700'
                }`}
              >
                {cd.isCurrentlyVisible ? (
                  <>
                    <Eye className="h-2.5 w-2.5" />
                    <span>{isSun ? 'ILLUMINATED' : 'IN SIGHT'}</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-2.5 w-2.5" />
                    <span>{isSun ? 'OCCLUDED' : 'NO COMM'}</span>
                  </>
                )}
              </span>
            </div>

            {/* Main Telemetry Value */}
            <div className="my-1.5 min-h-[46px] flex flex-col justify-center">
              {hasTime ? (
                <div className={`text-2xl font-bold font-mono tracking-tight ${details.accent}`}>
                  {formatHours(cd.hoursRemaining)}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 py-1">
                  {cd.isCurrentlyVisible ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Moon className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-mono font-semibold text-slate-300 leading-tight">
                    {cd.isCurrentlyVisible ? details.continuousText : details.occludedText}
                  </span>
                </div>
              )}
            </div>

            {/* Subtext: Operational event description & timestamp */}
            <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="truncate pr-1">{details.sub}</span>
              {cd.eventTime ? (
                <span className="text-[9px] text-slate-400 shrink-0">
                  {new Date(cd.eventTime).toISOString().slice(5, 16).replace('T', ' ')} UTC
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 shrink-0">30d window</span>
              )}
            </div>

            {/* Horizon calculation badge */}
            <div className="mt-1.5 text-[8.5px] font-mono text-slate-500 truncate">
              {useTerrainHorizon
                ? 'Terrain-Masked Horizon (LOLA 1° Profile)'
                : 'Geometric Horizon (Spherical R=1,737.4 km)'}
            </div>
          </div>
        );
      })}
    </div>
  );
};
