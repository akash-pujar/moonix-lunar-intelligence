/**
 * MOONIX Ephemeris Loading Hook
 *
 * Fetches `SiteEphemeris` and `TerrainHorizon` data for a given site.
 * Re-fetches whenever `site` or `startDate` changes. If the static ephemeris
 * file does not exist (404), it computes a simulated approximate ephemeris
 * from the site coordinates and date, clearly tagged as 'APPROXIMATE'.
 */

import { useState, useEffect } from 'react';
import type { LandingSite, SiteEphemeris, TerrainHorizon } from '../data/types';
import { loadEphemeris, loadTerrainHorizon } from '../data/loader';
import { generateApproximateSiteEphemeris } from '../engine/interpolation';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseEphemerisResult {
  /** Loaded ephemeris data, or approximate fallback. */
  data: SiteEphemeris | null;
  /** Loaded terrain horizon, or null if flat-horizon fallback. */
  terrain: TerrainHorizon | null;
  /** Whether a fetch is currently in progress. */
  loading: boolean;
  /** Human-readable error message, or null. */
  error: string | null;
  /** Whether this dataset is approximate/simulated rather than SPICE/Horizons */
  isSimulated: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useEphemeris(
  site: LandingSite | null,
  startDateStr: string = '2027-03-01',
): UseEphemerisResult {
  const [data, setData] = useState<SiteEphemeris | null>(null);
  const [terrain, setTerrain] = useState<TerrainHorizon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(true);

  useEffect(() => {
    if (!site) {
      setData(null);
      setTerrain(null);
      setLoading(false);
      setError(null);
      setIsSimulated(true);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [ephResult, terrResult] = await Promise.all([
          loadEphemeris(site!.id),
          loadTerrainHorizon(site!.id),
        ]);

        if (cancelled) return;

        if (ephResult) {
          setData(ephResult);
          setIsSimulated(ephResult.source === 'APPROXIMATE');
        } else {
          // Fall back to approximate ephemeris model using site coordinates
          const approx = generateApproximateSiteEphemeris(
            site!.id,
            site!.latitude,
            site!.longitude,
            startDateStr,
            45,
          );
          setData(approx);
          setIsSimulated(true);
        }

        setTerrain(terrResult);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : `Failed to load data for site "${site!.id}"`,
          );
          // Still provide approximate fallback on fetch failure
          const approx = generateApproximateSiteEphemeris(
            site!.id,
            site!.latitude,
            site!.longitude,
            startDateStr,
            45,
          );
          setData(approx);
          setIsSimulated(true);
          setTerrain(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [site?.id, site?.latitude, site?.longitude, startDateStr]);

  return { data, terrain, loading, error, isSimulated };
}
