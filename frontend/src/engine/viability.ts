/**
 * MOONIX Viability Scoring
 *
 * Produces a weighted viability score from mission metrics:
 *
 *     powerScore  = solarAvailabilityPct   (0–100)
 *     commScore   = earthVisibilityPct     (0–100)
 *     overall     = powerWeight × powerScore + commWeight × commScore
 *
 * Status thresholds:
 *     green  — overall ≥ 70
 *     amber  — overall ≥ 40
 *     red    — overall < 40
 */

import type { MissionMetrics, ViabilityScore, ViabilityStatus } from '../data/types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute a viability score from mission metrics and user-specified weights.
 *
 * @param metrics     Computed mission metrics.
 * @param powerWeight Weight for the power (solar) component (0–1).
 * @param commWeight  Weight for the communication (Earth visibility) component (0–1).
 */
export function computeViability(
  metrics: MissionMetrics,
  powerWeight: number,
  commWeight: number,
): ViabilityScore {
  const powerScore = metrics.solarAvailabilityPct;
  const commScore = metrics.earthVisibilityPct;
  const overall = powerWeight * powerScore + commWeight * commScore;

  const status: ViabilityStatus =
    overall >= 70 ? 'green' : overall >= 40 ? 'amber' : 'red';

  const explanation = buildExplanation(
    overall,
    status,
    powerScore,
    commScore,
    powerWeight,
    commWeight,
    metrics,
  );

  return {
    overall,
    powerScore,
    commScore,
    powerWeight,
    commWeight,
    status,
    explanation,
  };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

function buildExplanation(
  overall: number,
  status: ViabilityStatus,
  powerScore: number,
  commScore: number,
  powerWeight: number,
  commWeight: number,
  metrics: MissionMetrics,
): string {
  const statusLabel =
    status === 'green'
      ? 'VIABLE'
      : status === 'amber'
        ? 'MARGINAL'
        : 'NOT VIABLE';

  const lines: string[] = [
    `Overall viability: ${overall.toFixed(1)} / 100 — ${statusLabel}`,
    `Power score: ${powerScore.toFixed(1)}% solar availability (weight ${(powerWeight * 100).toFixed(0)}%)`,
    `Comm score: ${commScore.toFixed(1)}% Earth visibility (weight ${(commWeight * 100).toFixed(0)}%)`,
  ];

  if (metrics.longestDarknessHours > 0) {
    lines.push(
      `Longest darkness: ${metrics.longestDarknessHours.toFixed(1)} h`,
    );
  }

  if (metrics.longestCommOutageHours > 0) {
    lines.push(
      `Longest comm outage: ${metrics.longestCommOutageHours.toFixed(1)} h`,
    );
  }

  if (status === 'red') {
    lines.push(
      'Warning: this site/date combination has critical power or communication gaps.',
    );
  }

  return lines.join('\n');
}
