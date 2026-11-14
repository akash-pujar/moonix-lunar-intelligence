/**
 * MOONIX Countdown Engine
 *
 * Computes countdown timers to the next sunrise, sunset, earthrise, and
 * earthset relative to a cursor time.
 */

import type { CelestialEvent, Countdown } from '../data/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EVENT_TYPES: CelestialEvent['type'][] = [
  'sunrise',
  'sunset',
  'earthrise',
  'earthset',
];

const LABELS: Record<CelestialEvent['type'], string> = {
  sunrise: 'Next Sunrise',
  sunset: 'Next Sunset',
  earthrise: 'Next Earthrise',
  earthset: 'Next Earthset',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build countdown objects for each of the four event types relative to
 * `cursorTime`.
 *
 * For each type, finds the first event **after** the cursor. If none exists
 * within the data range the countdown's `hoursRemaining` and `eventTime` are
 * both `null`.
 *
 * The `isCurrentlyVisible` flag for sun events is `true` when the most recent
 * sun event before the cursor was a sunrise (meaning the Sun is currently up),
 * and analogously for Earth events.
 *
 * @param cursorTime ISO 8601 timestamp of the current cursor position.
 * @param events     Chronologically sorted list of all celestial events.
 * @returns An array of four `Countdown` objects (one per event type).
 */
export function computeCountdowns(
  cursorTime: string,
  events: CelestialEvent[],
): Countdown[] {
  const cursorMs = new Date(cursorTime).getTime();

  // Determine current visibility state per body by finding the latest event
  // of each category that is at or before the cursor.
  let sunVisible = false;
  let earthVisible = false;

  for (const ev of events) {
    if (new Date(ev.time).getTime() > cursorMs) break;
    if (ev.type === 'sunrise') sunVisible = true;
    else if (ev.type === 'sunset') sunVisible = false;
    else if (ev.type === 'earthrise') earthVisible = true;
    else if (ev.type === 'earthset') earthVisible = false;
  }

  return EVENT_TYPES.map((type): Countdown => {
    // Find first event of this type after cursor.
    const next = events.find(
      (ev) => ev.type === type && new Date(ev.time).getTime() > cursorMs,
    );

    const isSunType = type === 'sunrise' || type === 'sunset';

    return {
      type,
      label: LABELS[type],
      hoursRemaining: next
        ? (new Date(next.time).getTime() - cursorMs) / 3_600_000
        : null,
      eventTime: next ? next.time : null,
      isCurrentlyVisible: isSunType ? sunVisible : earthVisible,
    };
  });
}
