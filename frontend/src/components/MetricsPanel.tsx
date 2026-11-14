import type { FC } from 'react';
import type { MissionMetrics, AppMode } from '../data/types';
import { Sun, Radio, Activity, Moon, ShieldAlert, Wifi } from 'lucide-react';

interface MetricsPanelProps {
  metrics: MissionMetrics | null;
  mode: AppMode;
}

export const MetricsPanel: FC<MetricsPanelProps> = ({ metrics, mode }) => {
  if (!metrics) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center text-slate-500 font-mono text-xs">
        Calculating mission metrics...
      </div>
    );
  }

  const isExplorer = mode === 'explorer';

  const formatHours = (hours: number): string => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const rem = (hours % 24).toFixed(1);
      return `${days}d ${rem}h`;
    }
    return `${hours.toFixed(1)} h`;
  };

  const metricCards = [
    {
      title: 'Solar Availability',
      value: `${metrics.solarAvailabilityPct.toFixed(1)}%`,
      unit: 'of 30-day window',
      icon: <Sun className="h-4 w-4 text-amber-400" />,
      color: 'text-amber-400',
      description: isExplorer
        ? 'Percentage of time the sun provides solar power to recharge lander batteries.'
        : 'Integrated optical line-of-sight including solar limb +0.27°.',
      status: metrics.solarAvailabilityPct > 60 ? 'optimal' : metrics.solarAvailabilityPct > 30 ? 'marginal' : 'critical',
    },
    {
      title: 'Direct-to-Earth Comm',
      value: `${metrics.earthVisibilityPct.toFixed(1)}%`,
      unit: 'line-of-sight',
      icon: <Radio className="h-4 w-4 text-blue-400" />,
      color: 'text-blue-400',
      description: isExplorer
        ? 'Percentage of time mission operators can talk directly to Earth without a relay satellite.'
        : 'Direct-to-Earth line-of-sight including Earth limb +0.95° and parallax.',
      status: metrics.earthVisibilityPct > 70 ? 'optimal' : metrics.earthVisibilityPct > 40 ? 'marginal' : 'critical',
    },
    {
      title: 'Peak Solar Elevation',
      value: `${metrics.peakSolarElevation.toFixed(2)}°`,
      unit: 'above horizon',
      icon: <Activity className="h-4 w-4 text-amber-300" />,
      color: 'text-amber-300',
      description: isExplorer
        ? 'Maximum height of the sun in the lunar sky. Higher angles provide stronger solar panel charge.'
        : 'Sub-solar peak elevation angle over the 30-day duration.',
      status: metrics.peakSolarElevation > 1.5 ? 'optimal' : metrics.peakSolarElevation > 0 ? 'marginal' : 'critical',
    },
    {
      title: 'Longest Continuous Darkness',
      value: formatHours(metrics.longestDarknessHours),
      unit: 'max battery drain',
      icon: <Moon className="h-4 w-4 text-indigo-400" />,
      color: metrics.longestDarknessHours > 72 ? 'text-red-400' : 'text-slate-200',
      description: isExplorer
        ? 'The longest stretch without sunlight. Your lander must survive on internal heaters & batteries.'
        : 'Contiguous solar occlusion interval requiring secondary power storage.',
      status: metrics.longestDarknessHours < 48 ? 'optimal' : metrics.longestDarknessHours < 120 ? 'marginal' : 'critical',
    },
    {
      title: 'Longest Comm Outage',
      value: formatHours(metrics.longestCommOutageHours),
      unit: 'blackout period',
      icon: <ShieldAlert className="h-4 w-4 text-rose-400" />,
      color: metrics.longestCommOutageHours > 48 ? 'text-rose-400' : 'text-slate-200',
      description: isExplorer
        ? 'The longest time without telemetry to Earth. Autonomous lander operations required.'
        : 'Earth occultation duration without optical line-of-sight.',
      status: metrics.longestCommOutageHours < 24 ? 'optimal' : metrics.longestCommOutageHours < 72 ? 'marginal' : 'critical',
    },
    {
      title: 'Longest Comm Window',
      value: formatHours(metrics.longestCommWindowHours),
      unit: 'continuous link',
      icon: <Wifi className="h-4 w-4 text-emerald-400" />,
      color: 'text-emerald-400',
      description: isExplorer
        ? 'Continuous window available for high-bandwidth data downlink and payload command sequences.'
        : 'Maximum continuous direct-to-Earth communication link.',
      status: metrics.longestCommWindowHours > 120 ? 'optimal' : 'marginal',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
          Mission Viability Telemetry (30-Day Analysis Window)
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {isExplorer ? 'Explorer Mode (Simplified)' : 'Planner Mode (Engineering)'}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metricCards.map((m) => (
          <div
            key={m.title}
            className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 space-y-1.5 transition-all hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center space-x-1">
                {m.icon}
                <span>{m.title}</span>
              </span>
            </div>

            <div className="flex items-baseline space-x-1.5">
              <span className={`text-xl font-bold font-mono tracking-tight ${m.color}`}>
                {m.value}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{m.unit}</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-sans line-clamp-2">
              {m.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
