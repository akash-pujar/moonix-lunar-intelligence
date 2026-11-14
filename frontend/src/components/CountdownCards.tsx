import type { FC } from 'react';
import type { Countdown } from '../data/types';
import { Sunrise, Sunset, Globe, Radio, Eye, EyeOff } from 'lucide-react';

interface CountdownCardsProps {
  countdowns: Countdown[];
  cursorTime?: string;
}

export const CountdownCards: FC<CountdownCardsProps> = ({ countdowns }) => {
  // Map countdown types to icons and color themes
  const getCardDetails = (type: Countdown['type']) => {
    switch (type) {
      case 'sunset':
        return {
          title: 'Sunset (Darkness)',
          sub: 'Solar Power Loss',
          icon: <Sunset className="h-4 w-4 text-amber-400" />,
          color: 'border-amber-500/30 bg-amber-950/20 text-amber-300',
          accent: 'text-amber-400',
        };
      case 'sunrise':
        return {
          title: 'Sunrise',
          sub: 'Solar Power Recovery',
          icon: <Sunrise className="h-4 w-4 text-amber-300" />,
          color: 'border-amber-500/20 bg-amber-950/10 text-amber-200',
          accent: 'text-amber-300',
        };
      case 'earthset':
        return {
          title: 'Earthset (LOS)',
          sub: 'Direct Comm Outage',
          icon: <Radio className="h-4 w-4 text-blue-400" />,
          color: 'border-blue-500/30 bg-blue-950/20 text-blue-300',
          accent: 'text-blue-400',
        };
      case 'earthrise':
        return {
          title: 'Earthrise (AOS)',
          sub: 'Direct Comm Recovery',
          icon: <Globe className="h-4 w-4 text-blue-300" />,
          color: 'border-blue-500/20 bg-blue-950/10 text-blue-200',
          accent: 'text-blue-300',
        };
    }
  };

  const formatHours = (hours: number | null): string => {
    if (hours === null || isNaN(hours)) return '—';
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remHours = (hours % 24).toFixed(1);
      return `${days}d ${remHours}h`;
    }
    return `${hours.toFixed(1)} h`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {countdowns.map((cd) => {
        const details = getCardDetails(cd.type);
        const isSun = cd.type === 'sunrise' || cd.type === 'sunset';

        return (
          <div
            key={cd.type}
            className={`border rounded-xl p-3.5 backdrop-blur transition-all shadow-md ${details.color}`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center space-x-1.5 text-xs font-mono font-semibold">
                {details.icon}
                <span>{details.title}</span>
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center space-x-1 ${
                  cd.isCurrentlyVisible
                    ? isSun
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
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

            {/* Countdown Value */}
            <div className="mt-1">
              <div className={`text-2xl font-bold font-mono tracking-tight ${details.accent}`}>
                {formatHours(cd.hoursRemaining)}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center justify-between">
                <span>{details.sub}</span>
                {cd.eventTime && (
                  <span className="text-[9px] text-slate-500">
                    {new Date(cd.eventTime).toISOString().slice(5, 16).replace('T', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
