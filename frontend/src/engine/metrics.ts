/**
 * MOONIX Metrics Engine
 *
 * Computes aggregate mission metrics from pre-computed visibility intervals
 * and celestial events within a given analysis window.
 *
 * All durations are reported in **hours**.
 */

import type {
  VisibilityInterval,
  CelestialEvent,
  MissionMetrics,
} from '../data/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamp an interval to the analysis window [start, end]. */
function clampInterval(
  interval: VisibilityInterval,
  windowStart: number,
  windowEnd: number,
): VisibilityInterval | null {
  const s = Math.max(new Date(interval.start).getTime(), windowStart);
  const e = Math.min(new Date(interval.end).getTime(), windowEnd);
  if (s >= e) return null;
  return {
    start: new Date(s).toISOString(),
    end: new Date(e).toISOString(),
    durationHours: (e - s) / 3_600_000,
  };
}

function longestDuration(intervals: VisibilityInterval[]): number {
  return intervals.reduce((max, iv) => Math.max(max, iv.durationHours), 0);
}

function totalDuration(intervals: VisibilityInterval[]): number {
  return intervals.reduce((sum, iv) => sum + iv.durationHours, 0);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the full set of mission metrics for a given analysis window.
 *
 * @param sunIntervals   Object containing `visibleIntervals` and
 *                       `occludedIntervals` for the Sun.
 * @param earthIntervals Same structure for the Earth.
 * @param events         Ordered list of all celestial events (sun + earth).
 * @param analysisStart  ISO 8601 start of the analysis window.
 * @param analysisEnd    ISO 8601 end of the analysis window.
 */
export function computeMissionMetrics(
  sunIntervals: {
    visibleIntervals: VisibilityInterval[];
    occludedIntervals: VisibilityInterval[];
  },
  earthIntervals: {
    visibleIntervals: VisibilityInterval[];
    occludedIntervals: VisibilityInterval[];
  },
  events: CelestialEvent[],
  analysisStart: string,
  analysisEnd: string,
): MissionMetrics {
  const wStart = new Date(analysisStart).getTime();
  const wEnd = new Date(analysisEnd).getTime();
  const windowHours = (wEnd - wStart) / 3_600_000;

  // Clamp all intervals to the analysis window.
  const sunlit = sunIntervals.visibleIntervals
    .map((iv) => clampInterval(iv, wStart, wEnd))
    .filter((iv): iv is VisibilityInterval => iv !== null);

  const darkness = sunIntervals.occludedIntervals
    .map((iv) => clampInterval(iv, wStart, wEnd))
    .filter((iv): iv is VisibilityInterval => iv !== null);

  const earthVis = earthIntervals.visibleIntervals
    .map((iv) => clampInterval(iv, wStart, wEnd))
    .filter((iv): iv is VisibilityInterval => iv !== null);

  const earthOcc = earthIntervals.occludedIntervals
    .map((iv) => clampInterval(iv, wStart, wEnd))
    .filter((iv): iv is VisibilityInterval => iv !== null);

  // Filter events to the window.
  const windowEvents = events.filter((e) => {
    const t = new Date(e.time).getTime();
    return t >= wStart && t <= wEnd;
  });

  // Sort events chronologically.
  windowEvents.sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  // Compute peak solar elevation from events-adjacent sunlit intervals (we
  // do not have per-point elevation here, so we derive it from interval
  // durations as a proxy — but since the caller also has the ephemeris the
  // peak is set to 0 as a default and should be overridden by the caller if
  // raw data is available).
  // NOTE: peakSolarElevation is set to 0 here; callers with access to the raw
  // ephemeris should override this value by scanning the data array directly.
  const peakSolarElevation = 0;

  const solarHours = totalDuration(sunlit);
  const earthHours = totalDuration(earthVis);

  return {
    solarAvailabilityPct: windowHours > 0 ? (solarHours / windowHours) * 100 : 0,
    earthVisibilityPct: windowHours > 0 ? (earthHours / windowHours) * 100 : 0,
    peakSolarElevation,
    longestDarknessHours: longestDuration(darkness),
    longestCommOutageHours: longestDuration(earthOcc),
    longestCommWindowHours: longestDuration(earthVis),
    sunlightIntervals: sunlit,
    darknessIntervals: darkness,
    earthVisibleIntervals: earthVis,
    earthOccludedIntervals: earthOcc,
    events: windowEvents,
  };
}

/**
 * Scan ephemeris data tuples and return the peak Sun elevation in degrees
 * within the analysis window. Use this to patch `MissionMetrics.peakSolarElevation`.
 */
export function computePeakSolarElevation(
  data: [number, number, number, number][],
  timestamps: string[],
  analysisStart: string,
  analysisEnd: string,
): number {
  const wStart = new Date(analysisStart).getTime();
  const wEnd = new Date(analysisEnd).getTime();
  let peak = -Infinity;

  for (let i = 0; i < data.length; i++) {
    const t = new Date(timestamps[i]).getTime();
    if (t < wStart || t > wEnd) continue;
    const sunEl = data[i][1];
    if (sunEl > peak) peak = sunEl;
  }

  return peak === -Infinity ? 0 : peak;
}
