import type { FC } from 'react';
import { Calendar, Clock, RotateCcw, FastForward, AlertCircle } from 'lucide-react';

interface DatePickerProps {
  missionDate: string;
  onDateChange: (date: string) => void;
  landingTime: string;
  onTimeChange: (time: string) => void;
  dateSlipDays: number;
  onDateSlipChange: (days: number) => void;
}

export const DatePicker: FC<DatePickerProps> = ({
  missionDate,
  onDateChange,
  landingTime,
  onTimeChange,
  dateSlipDays,
  onDateSlipChange,
}) => {
  // Calculate effective mission start & end dates
  const computeEffectiveDates = (baseDate: string, slipDays: number) => {
    try {
      const start = new Date(`${baseDate}T00:00:00Z`);
      start.setUTCDate(start.getUTCDate() + slipDays);
      const end = new Date(start.getTime() + 30 * 86_400_000);
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
        isOutsideSpice: start.toISOString().slice(0, 10) < '2027-01-01' || end.toISOString().slice(0, 10) > '2027-06-30',
      };
    } catch {
      return {
        startDate: baseDate,
        endDate: baseDate,
        isOutsideSpice: false,
      };
    }
  };

  const { startDate, endDate, isOutsideSpice } = computeEffectiveDates(missionDate, dateSlipDays);

  return (
    <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 shadow-xl backdrop-blur space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-1.5">
          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
          <span>Mission Timeline & Launch Slip</span>
        </label>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          UTC Standard
        </span>
      </div>

      {/* Date & Time Inputs */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 font-semibold">
            Planned Landing Date
          </label>
          <input
            type="date"
            min="2026-11-01"
            max="2028-12-31"
            value={missionDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 flex items-center space-x-1 font-semibold">
            <Clock className="h-2.5 w-2.5 text-slate-400" />
            <span>Touchdown UTC</span>
          </label>
          <input
            type="time"
            value={landingTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Date Slip Control (NASA Demo Story Core) */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
            <span className="font-semibold">Launch Date Slip:</span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${
                dateSlipDays === 0
                  ? 'bg-slate-800 text-slate-300'
                  : dateSlipDays > 0
                  ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                  : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
              }`}
            >
              {dateSlipDays > 0 ? `+${dateSlipDays} d` : `${dateSlipDays} d`}
            </span>
          </span>
          {dateSlipDays !== 0 && (
            <button
              type="button"
              onClick={() => onDateSlipChange(0)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>Reset Slip</span>
            </button>
          )}
        </div>

        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={dateSlipDays}
          onChange={(e) => onDateSlipChange(parseInt(e.target.value, 10))}
          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
        />

        {/* Quick Demo Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => onDateSlipChange(14)}
            className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 flex items-center space-x-1 transition-all shadow-sm"
            title="Simulate a 14-day launch slip trade study"
          >
            <FastForward className="h-3 w-3" />
            <span>+14d Slip (Demo Story)</span>
          </button>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onDateSlipChange(-7)}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            >
              -7d
            </button>
            <button
              type="button"
              onClick={() => onDateSlipChange(7)}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            >
              +7d
            </button>
            <button
              type="button"
              onClick={() => onDateSlipChange(28)}
              className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            >
              +28d (Lunar cycle)
            </button>
          </div>
        </div>
      </div>

      {/* Effective Mission Window Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
        <div>
          <div className="text-[9.5px] uppercase text-slate-400">Effective Analysis Window</div>
          <div className="text-cyan-300 font-bold">
            {startDate} &rarr; {endDate}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9.5px] text-slate-400">Touchdown</div>
          <div className="text-slate-200 font-medium">{landingTime} UTC</div>
        </div>
      </div>

      {/* Boundary Notice if outside precomputed SPICE window */}
      {isOutsideSpice && (
        <div className="flex items-start space-x-1.5 text-[10px] text-amber-300/90 bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg font-mono">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Window extends outside precomputed SPICE archive (2027-01-01 to 2027-06-30). Analytical geometric kinematics will be used for dates outside the boundary.
          </span>
        </div>
      )}
    </div>
  );
};
