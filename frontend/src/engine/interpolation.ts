/**
 * MOONIX Ephemeris Interpolation
 *
 * Provides two ways to obtain an `EphemerisPoint` at an arbitrary time:
 *
 * 1. **`interpolateEphemeris`** — linear interpolation between the hourly
 *    samples of a pre-computed `SiteEphemeris`.
 *
 * 2. **`approximateEphemeris`** — a purely geometric approximation that needs
 *    only the site coordinates and a timestamp. This is the fallback when no
 *    pre-computed data exists.
 *
 * ## Geometric model (approximateEphemeris)
 *
 * ### Elevation of a body above the horizon
 *
 *     sin(el₀) = sin(φ) · sin(φ₀) + cos(φ) · cos(φ₀) · cos(λ − λ₀)
 *
 * where:
 * - φ, λ   — selenographic latitude/longitude of the observer
 * - φ₀, λ₀ — sub-body (sub-solar or sub-Earth) selenographic
 *             latitude/longitude, themselves functions of time
 *
 * ### Earth parallax correction
 *
 *     el = asin((D · sin(el₀) − R) / √(D² + R² − 2·D·R·sin(el₀)))
 *
 * where:
 * - R = 1 737.4 km  (lunar radius)
 * - D ≈ 384 400 km  (mean Earth–Moon distance)
 *
 * The Sun is far enough that parallax is negligible — we use el₀ directly.
 *
 * ### Azimuth
 *
 * The approximate azimuth is derived from the hour-angle geometry:
 *
 *     az = atan2(sin(Δλ) · cos(φ₀),
 *               cos(φ) · sin(φ₀) − sin(φ) · cos(φ₀) · cos(Δλ))
 *
 * normalised to [0, 360).
 *
 * All results from this function carry `source = 'APPROXIMATE'`.
 */

import type { SiteEphemeris, EphemerisPoint } from '../data/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Lunar radius in km. */
const R_MOON_KM = 1737.4;

/** Mean Earth–Moon distance in km. */
const D_EARTH_MOON_KM = 384_400;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

// ---------------------------------------------------------------------------
// 1) Linear interpolation from pre-computed data
// ---------------------------------------------------------------------------

/**
 * Linearly interpolate ephemeris values between the two samples that bracket
 * `targetTime`.
 *
 * If the target falls exactly on a sample or outside the data range, the
 * nearest sample is returned without interpolation.
 */
export function interpolateEphemeris(
  ephemeris: SiteEphemeris,
  targetTime: string,
): EphemerisPoint {
  const targetMs = new Date(targetTime).getTime();

  // Fast-path: single-point dataset.
  if (ephemeris.data.length <= 1) {
    return pointFromIndex(ephemeris, 0);
  }

  const startMs = new Date(ephemeris.timestamps[0]).getTime();
  const stepMs = ephemeris.stepSeconds * 1000;

  // Locate the bracketing index.
  const rawIdx = (targetMs - startMs) / stepMs;
  const loIdx = Math.max(0, Math.min(Math.floor(rawIdx), ephemeris.data.length - 2));
  const hiIdx = loIdx + 1;

  // Edge cases: clamp to the first / last sample.
  if (rawIdx <= 0) return pointFromIndex(ephemeris, 0);
  if (rawIdx >= ephemeris.data.length - 1) {
    return pointFromIndex(ephemeris, ephemeris.data.length - 1);
  }

  // Fractional position between lo and hi.
  const frac = rawIdx - loIdx;

  const lo = ephemeris.data[loIdx];
  const hi = ephemeris.data[hiIdx];

  return {
    t: targetTime,
    sunAz: lerp(lo[0], hi[0], frac),
    sunEl: lerp(lo[1], hi[1], frac),
    earthAz: lerp(lo[2], hi[2], frac),
    earthEl: lerp(lo[3], hi[3], frac),
  };
}

// ---------------------------------------------------------------------------
// 2) Geometric approximation (no pre-computed data required)
// ---------------------------------------------------------------------------

/**
 * Approximate the Sun and Earth positions for a site at a given time using a
 * simplified geometric model.
 *
 * The sub-solar and sub-Earth points are estimated from the synodic period
 * (29.53 days for the Sun) and mean libration. This is intentionally a rough
 * first-order model — it gives useful results for planning but should be
 * replaced with real ephemeris data wherever available.
 */
export function approximateEphemeris(
  lat: number,
  lon: number,
  timestamp: string,
): EphemerisPoint {
  const tMs = new Date(timestamp).getTime();

  // --- Sub-solar point ---
  // The sub-solar longitude completes one revolution per synodic month
  // (~29.530589 days). We pick an arbitrary epoch (J2000) and zero meridian.
  const SYNODIC_DAYS = 29.530589;
  const EPOCH_MS = Date.UTC(2000, 0, 6, 18, 14, 0); // approximate new Moon
  const daysSinceEpoch = (tMs - EPOCH_MS) / 86_400_000;

  const subSolarLon = ((daysSinceEpoch / SYNODIC_DAYS) * 360) % 360;
  const subSolarLat = 1.5 * Math.sin(daysSinceEpoch * DEG2RAD * (360 / 6793.5));
  // 6793.5 days ≈ 18.6-year nodal cycle simplified; sub-solar lat stays small.

  // --- Sub-Earth point ---
  // Mean sub-Earth coordinates from optical libration (simplified).
  const subEarthLon =
    6.29 * Math.sin(daysSinceEpoch * DEG2RAD * (360 / 27.5546));
  const subEarthLat =
    6.68 * Math.sin(daysSinceEpoch * DEG2RAD * (360 / 27.2122));

  // --- Sun el / az ---
  const sunEl0 = bodyElevation(lat, lon, subSolarLat, subSolarLon);
  const sunAz = bodyAzimuth(lat, lon, subSolarLat, subSolarLon);
  // Sun is far enough that parallax is negligible.
  const sunEl = sunEl0;

  // --- Earth el / az ---
  const earthEl0 = bodyElevation(lat, lon, subEarthLat, subEarthLon);
  const earthAz = bodyAzimuth(lat, lon, subEarthLat, subEarthLon);
  // Apply Earth parallax correction.
  const earthEl = parallaxCorrection(earthEl0, D_EARTH_MOON_KM, R_MOON_KM);

  return {
    t: timestamp,
    sunAz: normAz(sunAz),
    sunEl: clampEl(sunEl),
    earthAz: normAz(earthAz),
    earthEl: clampEl(earthEl),
  };
}

/**
 * Generate a complete hourly SiteEphemeris using the geometric approximation
 * model across a given window (defaults to 45 days to safely span 30-day missions + slip).
 * Labeled with source = 'APPROXIMATE' and quality = 'fallback'.
 */
export function generateApproximateSiteEphemeris(
  siteId: string,
  lat: number,
  lon: number,
  startDateStr: string,
  days: number = 45,
): SiteEphemeris {
  const startMs = new Date(`${startDateStr}T00:00:00Z`).getTime() - 2 * 86_400_000; // 2 days buffer before
  const totalHours = (days + 4) * 24;
  const stepSeconds = 3600;

  const timestamps: string[] = [];
  const data: [number, number, number, number][] = [];

  for (let i = 0; i < totalHours; i++) {
    const curTime = new Date(startMs + i * 3600 * 1000).toISOString();
    const pt = approximateEphemeris(lat, lon, curTime);
    timestamps.push(curTime);
    data.push([
      Math.round(pt.sunAz * 100) / 100,
      Math.round(pt.sunEl * 100) / 100,
      Math.round(pt.earthAz * 100) / 100,
      Math.round(pt.earthEl * 100) / 100,
    ]);
  }

  return {
    siteId,
    source: 'APPROXIMATE',
    startTime: timestamps[0],
    endTime: timestamps[timestamps.length - 1],
    stepSeconds,
    quality: 'fallback',
    count: timestamps.length,
    data,
    timestamps,
  };
}

// ---------------------------------------------------------------------------
// Internal geometry helpers
// ---------------------------------------------------------------------------

/**
 * Geometric body elevation (centre of disc) above the horizon (degrees).
 *
 *     sin(el) = sin(φ)·sin(φ₀) + cos(φ)·cos(φ₀)·cos(λ − λ₀)
 */
function bodyElevation(
  obsLat: number,
  obsLon: number,
  subLat: number,
  subLon: number,
): number {
  const phi = obsLat * DEG2RAD;
  const phi0 = subLat * DEG2RAD;
  const dLon = (obsLon - subLon) * DEG2RAD;

  const sinEl =
    Math.sin(phi) * Math.sin(phi0) +
    Math.cos(phi) * Math.cos(phi0) * Math.cos(dLon);

  return Math.asin(clamp(sinEl, -1, 1)) * RAD2DEG;
}

/**
 * Geometric azimuth of the sub-body point (degrees, north = 0, east = 90).
 */
function bodyAzimuth(
  obsLat: number,
  obsLon: number,
  subLat: number,
  subLon: number,
): number {
  const phi = obsLat * DEG2RAD;
  const phi0 = subLat * DEG2RAD;
  const dLon = (subLon - obsLon) * DEG2RAD;

  const x = Math.sin(dLon) * Math.cos(phi0);
  const y =
    Math.cos(phi) * Math.sin(phi0) -
    Math.sin(phi) * Math.cos(phi0) * Math.cos(dLon);

  return Math.atan2(x, y) * RAD2DEG;
}

/**
 * Earth parallax correction.
 *
 *     el = asin((D·sin(el₀) − R) / √(D² + R² − 2·D·R·sin(el₀)))
 */
function parallaxCorrection(el0Deg: number, D: number, R: number): number {
  const sinEl0 = Math.sin(el0Deg * DEG2RAD);
  const numerator = D * sinEl0 - R;
  const denominator = Math.sqrt(D * D + R * R - 2 * D * R * sinEl0);

  if (denominator === 0) return el0Deg;

  return Math.asin(clamp(numerator / denominator, -1, 1)) * RAD2DEG;
}

// ---------------------------------------------------------------------------
// Trivial helpers
// ---------------------------------------------------------------------------

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Normalise an azimuth to [0, 360). */
function normAz(az: number): number {
  return ((az % 360) + 360) % 360;
}

/** Clamp elevation to [-90, 90]. */
function clampEl(el: number): number {
  return clamp(el, -90, 90);
}

function pointFromIndex(eph: SiteEphemeris, i: number): EphemerisPoint {
  const row = eph.data[i];
  return {
    t: eph.timestamps[i],
    sunAz: row[0],
    sunEl: row[1],
    earthAz: row[2],
    earthEl: row[3],
  };
}
