import type { FC } from 'react';
import { Calendar, Clock, RotateCcw, FastForward } from 'lucide-react';

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
  // Calculate effective mission date
  const computeEffectiveDate = (baseDate: string, slipDays: number): string => {
    try {
      const d = new Date(`${baseDate}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + slipDays);
      return d.toISOString().slice(0, 10);
    } catch {
      return baseDate;
    }
  };

  const effectiveDate = computeEffectiveDate(missionDate, dateSlipDays);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Calendar className="h-3.5 w-3.5 text-cyan-400" />
          <span>Mission Timeline</span>
        </label>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          UTC Standard
        </span>
      </div>

      {/* Date & Time Inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
            Planned Landing Date
          </label>
          <input
            type="date"
            min="2026-11-01"
            max="2028-12-31"
            value={missionDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1 flex items-center space-x-1">
            <Clock className="h-2.5 w-2.5 text-slate-400" />
            <span>Time (UTC)</span>
          </label>
          <input
            type="time"
            value={landingTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Date Slip Control (P1 Feature / Demo Story Core) */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono text-slate-300 flex items-center space-x-1">
            <span>Launch Slip Offset:</span>
            <span
              className={`font-bold ${
                dateSlipDays === 0
                  ? 'text-slate-400'
                  : dateSlipDays > 0
                  ? 'text-amber-400'
                  : 'text-cyan-400'
              }`}
            >
              {dateSlipDays > 0 ? `+${dateSlipDays}` : dateSlipDays} d
            </span>
          </span>
          {dateSlipDays !== 0 && (
            <button
              type="button"
              onClick={() => onDateSlipChange(0)}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              <span>Reset</span>
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
        <div className="flex items-center justify-between mt-2 pt-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => onDateSlipChange(14)}
            className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 flex items-center space-x-1 transition-all"
            title="NASA Demo Story: Simulate a 14-day mission slip"
          >
            <FastForward className="h-3 w-3" />
            <span>+14d Slip (Demo Story)</span>
          </button>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onDateSlipChange(-7)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              -7d
            </button>
            <button
              type="button"
              onClick={() => onDateSlipChange(7)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              +7d
            </button>
            <button
              type="button"
              onClick={() => onDateSlipChange(28)}
              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              +28d (Lunar cycle)
            </button>
          </div>
        </div>
      </div>

      {/* Effective Mission Date Banner */}
      <div className="bg-slate-950 border border-cyan-500/30 rounded-lg p-2.5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-500">Effective Analysis Date</div>
          <div className="text-sm font-bold font-mono text-cyan-300">
            {effectiveDate} <span className="text-xs font-normal text-slate-400">{landingTime} UTC</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-500">Window</div>
          <div className="text-xs font-mono text-slate-300 font-medium">30 Days</div>
        </div>
      </div>
    </div>
  );
};

