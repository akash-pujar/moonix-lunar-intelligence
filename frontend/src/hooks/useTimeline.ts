/**
 * MOONIX Timeline Computation Hook
 *
 * Takes loaded ephemeris/terrain data plus the current mission state and
 * produces all derived metrics, viability scores, countdowns, and interval
 * data. Results are memoised so components only re-render when inputs change.
 */

import { useMemo } from 'react';
import type {
  SiteEphemeris,
  TerrainHorizon,
  MissionState,
  MissionMetrics,
  ViabilityScore,
  Countdown,
  VisibilityInterval,
} from '../data/types';
import {
  computeVisibilityIntervals,
  flatHorizon,
} from '../engine/visibility';
import {
  computeMissionMetrics,
  computePeakSolarElevation,
} from '../engine/metrics';
import { computeCountdowns } from '../engine/countdown';
import { computeViability } from '../engine/viability';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseTimelineResult {
  metrics: MissionMetrics | null;
  viability: ViabilityScore | null;
  countdowns: Countdown[];
  sunIntervals: VisibilityInterval[];
  earthIntervals: VisibilityInterval[];
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTimeline(
  ephemeris: SiteEphemeris | null,
  terrain: TerrainHorizon | null,
  missionState: MissionState,
): UseTimelineResult {
  return useMemo(() => {
    if (!ephemeris) {
      return {
        metrics: null,
        viability: null,
        countdowns: [],
        sunIntervals: [],
        earthIntervals: [],
      };
    }

    // Choose horizon model.
    const horizon =
      missionState.useTerrainHorizon && terrain ? terrain : flatHorizon();

    // --- Analysis window ---
    const effectiveDate = addDays(
      missionState.missionDate,
      missionState.dateSlipDays,
    );
    const analysisStart = `${effectiveDate}T${missionState.landingTime}:00Z`;
    const analysisEnd = new Date(
      new Date(analysisStart).getTime() +
        missionState.analysisWindowDays * 86_400_000,
    ).toISOString();

    // --- Visibility intervals ---
    const sunResult = computeVisibilityIntervals(ephemeris, horizon, 'sun');
    const earthResult = computeVisibilityIntervals(ephemeris, horizon, 'earth');

    // Merge events and sort chronologically.
    const allEvents = [...sunResult.events, ...earthResult.events].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    );

    // --- Metrics ---
    const metrics = computeMissionMetrics(
      sunResult,
      earthResult,
      allEvents,
      analysisStart,
      analysisEnd,
    );

    // Patch peak solar elevation from the raw data.
    metrics.peakSolarElevation = computePeakSolarElevation(
      ephemeris.data,
      ephemeris.timestamps,
      analysisStart,
      analysisEnd,
    );

    // --- Viability ---
    const viability = computeViability(
      metrics,
      missionState.powerWeight,
      missionState.commWeight,
    );

    // --- Countdowns ---
    const countdowns = computeCountdowns(missionState.cursorTime, metrics.events);

    return {
      metrics,
      viability,
      countdowns,
      sunIntervals: sunResult.visibleIntervals,
      earthIntervals: earthResult.visibleIntervals,
    };
  }, [ephemeris, terrain, missionState]);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Add `days` to a YYYY-MM-DD date string and return YYYY-MM-DD.
 */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
