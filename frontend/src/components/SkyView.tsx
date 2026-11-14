import type { FC } from 'react';
import { Compass } from 'lucide-react';

interface SkyViewProps {
  siteName: string;
}

export const SkyView: FC<SkyViewProps> = ({ siteName }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center space-y-2 backdrop-blur">
      <div className="flex items-center justify-center space-x-2 text-xs font-mono text-cyan-400">
        <Compass className="h-4 w-4" />
        <span className="font-semibold uppercase tracking-wider">Local Lunar Sky Dome (Polar Azimuth/Elevation)</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
          P1 Feature
        </span>
      </div>
      <p className="text-xs text-slate-400 max-w-md mx-auto">
        Interactive 360° celestial dome showing apparent Sun and Earth tracks against the local terrain silhouette for <strong>{siteName}</strong>.
      </p>
    </div>
  );
};
