/**
 * MOONIX Visibility Engine
 *
 * Determines whether the Sun or Earth is above the local horizon at a lunar
 * landing site, accounting for an optional terrain-horizon profile and the
 * angular radius of the celestial body.
 *
 * ## Key formulas
 *
 * ### Horizon interpolation
 * The `TerrainHorizon.elevations` array stores one elevation value per integer
 * degree of azimuth (index 0 → 0°, index 1 → 1°, …, index 359 → 359°).
 * For non-integer azimuths we linearly interpolate between the two bounding
 * entries:
 *
 *     idx_lo = floor(az) mod 360
 *     idx_hi = (idx_lo + 1) mod 360
 *     frac   = az - floor(az)
 *     h(az)  = elevations[idx_lo] × (1 − frac) + elevations[idx_hi] × frac
 *
 * ### Body visibility test
 * A body is *visible* when the upper limb (centre elevation + angular radius)
 * exceeds the local horizon elevation at the body's azimuth:
 *
 *     visible ⟺ bodyEl + angularRadius > h(bodyAz)
 *
 * ### Angular radii (constant)
 * | Body  | Angular radius (deg) |
 * |-------|---------------------|
 * | Sun   | 0.27                |
 * | Earth | 0.95                |
 */

import type {
  SiteEphemeris,
  TerrainHorizon,
  VisibilityInterval,
  CelestialEvent,
} from '../data/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Angular radius of the Sun as seen from the Moon (degrees). */
export const SUN_ANGULAR_RADIUS_DEG = 0.27;

/** Angular radius of the Earth as seen from the Moon (degrees). */
export const EARTH_ANGULAR_RADIUS_DEG = 0.95;

// ---------------------------------------------------------------------------
// Horizon helpers
// ---------------------------------------------------------------------------

/**
 * Create a flat (all-zeros) horizon with 360 entries — one per degree.
 */
export function flatHorizon(): TerrainHorizon {
  return {
    siteId: 'flat',
    observerHeightM: 0,
    azimuthStepDeg: 1,
    rayRangeKm: 0,
    source: 'flat-horizon-fallback',
    isTerrain: false,
    elevations: new Array<number>(360).fill(0),
  };
}

/**
 * Interpolate the horizon elevation at an arbitrary azimuth.
 *
 * The `elevations` array is indexed by integer degree (0–359).  For
 * fractional azimuths we linearly interpolate between the two neighbours,
 * wrapping around 360°.
 */
export function getHorizonElevation(
  azimuth: number,
  horizon: TerrainHorizon,
): number {
  // Normalise azimuth to [0, 360)
  const az = ((azimuth % 360) + 360) % 360;

  const lo = Math.floor(az) % 360;
  const hi = (lo + 1) % 360;
  const frac = az - Math.floor(az);

  return horizon.elevations[lo] * (1 - frac) + horizon.elevations[hi] * frac;
}

/**
 * Test whether a celestial body is visible above the local horizon.
 *
 * @param bodyEl       Body centre elevation in degrees.
 * @param bodyAz       Body azimuth in degrees.
 * @param horizon      Terrain (or flat) horizon model.
 * @param angularRadius Body angular radius in degrees (upper-limb offset).
 * @returns `true` when the upper limb clears the horizon.
 */
export function isBodyVisible(
  bodyEl: number,
  bodyAz: number,
  horizon: TerrainHorizon,
  angularRadius: number,
): boolean {
  const horizonEl = getHorizonElevation(bodyAz, horizon);
  return bodyEl + angularRadius > horizonEl;
}

// ---------------------------------------------------------------------------
// Interval computation
// ---------------------------------------------------------------------------

/**
 * Walk through the hourly ephemeris and build contiguous visibility (and
 * occlusion) intervals for the requested body, together with rise/set events.
 *
 * The function returns two arrays — *visible* and *occluded* intervals — plus
 * an event list marking every rise and set boundary.
 */
export function computeVisibilityIntervals(
  ephemeris: SiteEphemeris,
  horizon: TerrainHorizon,
  body: 'sun' | 'earth',
): {
  visibleIntervals: VisibilityInterval[];
  occludedIntervals: VisibilityInterval[];
  events: CelestialEvent[];
} {
  const angularRadius = body === 'sun' ? SUN_ANGULAR_RADIUS_DEG : EARTH_ANGULAR_RADIUS_DEG;
  const riseEvent: CelestialEvent['type'] = body === 'sun' ? 'sunrise' : 'earthrise';
  const setEvent: CelestialEvent['type'] = body === 'sun' ? 'sunset' : 'earthset';

  const visibleIntervals: VisibilityInterval[] = [];
  const occludedIntervals: VisibilityInterval[] = [];
  const events: CelestialEvent[] = [];

  if (ephemeris.data.length === 0) {
    return { visibleIntervals, occludedIntervals, events };
  }

  // Helper: extract (az, el) pair for the chosen body from a data tuple.
  const bodyAzEl = (idx: number): [number, number] => {
    const row = ephemeris.data[idx];
    return body === 'sun' ? [row[0], row[1]] : [row[2], row[3]];
  };

  // Determine initial visibility.
  const [firstAz, firstEl] = bodyAzEl(0);
  let wasVisible = isBodyVisible(firstEl, firstAz, horizon, angularRadius);
  let intervalStart = ephemeris.timestamps[0];

  for (let i = 1; i < ephemeris.data.length; i++) {
    const [az, el] = bodyAzEl(i);
    const nowVisible = isBodyVisible(el, az, horizon, angularRadius);

    if (nowVisible !== wasVisible) {
      // Transition detected — close previous interval, emit event.
      const prevTime = ephemeris.timestamps[i - 1];
      const curTime = ephemeris.timestamps[i];

      // Use midpoint of the two bounding samples as the event time.
      const midMs =
        (new Date(prevTime).getTime() + new Date(curTime).getTime()) / 2;
      const eventTime = new Date(midMs).toISOString();

      if (nowVisible) {
        // Was occluded → now visible  ⟹  rise event.
        events.push({ type: riseEvent, time: eventTime });
        // Close the occluded interval.
        occludedIntervals.push(makeInterval(intervalStart, eventTime));
      } else {
        // Was visible → now occluded  ⟹  set event.
        events.push({ type: setEvent, time: eventTime });
        // Close the visible interval.
        visibleIntervals.push(makeInterval(intervalStart, eventTime));
      }

      intervalStart = eventTime;
      wasVisible = nowVisible;
    }
  }

  // Close the final open interval with the last timestamp.
  const lastTime = ephemeris.timestamps[ephemeris.timestamps.length - 1];
  if (wasVisible) {
    visibleIntervals.push(makeInterval(intervalStart, lastTime));
  } else {
    occludedIntervals.push(makeInterval(intervalStart, lastTime));
  }

  return { visibleIntervals, occludedIntervals, events };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function makeInterval(start: string, end: string): VisibilityInterval {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return {
    start,
    end,
    durationHours: ms / 3_600_000,
  };
}
