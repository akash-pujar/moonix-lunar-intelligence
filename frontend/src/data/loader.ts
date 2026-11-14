/**
 * MOONIX Data Loader
 *
 * Fetches and caches JSON data files for sites, ephemeris, terrain horizons,
 * and the data manifest. All results are typed and cached in memory.
 */

import type { SiteCatalogue, SiteEphemeris, TerrainHorizon, DataManifest } from './types';

// ---------------------------------------------------------------------------
// In-memory cache
// ---------------------------------------------------------------------------

const cache: {
  catalogue: SiteCatalogue | null;
  manifest: DataManifest | null;
  ephemeris: Map<string, SiteEphemeris | null>;
  horizon: Map<string, TerrainHorizon | null>;
} = {
  catalogue: null,
  manifest: null,
  ephemeris: new Map(),
  horizon: new Map(),
};

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/**
 * Fetch JSON from `url`. Returns the parsed body, or `null` when the server
 * responds with 404 and `nullOn404` is true. Throws on any other error.
 */
async function fetchJson<T>(url: string, nullOn404: false): Promise<T>;
async function fetchJson<T>(url: string, nullOn404: true): Promise<T | null>;
async function fetchJson<T>(url: string, nullOn404: boolean): Promise<T | null> {
  const res = await fetch(url);

  if (res.status === 404 && nullOn404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load the full site catalogue (`/data/sites.json`).
 * Results are cached after the first successful fetch.
 */
export async function loadSiteCatalogue(): Promise<SiteCatalogue> {
  if (cache.catalogue) return cache.catalogue;

  const data = await fetchJson<SiteCatalogue>('/data/sites.json', false);
  cache.catalogue = data;
  return data;
}

/**
 * Load ephemeris data for a given site (`/data/ephemeris/{siteId}.json`).
 * Returns `null` when the file does not exist (404).
 * Results are cached per site after the first fetch.
 */
export async function loadEphemeris(siteId: string): Promise<SiteEphemeris | null> {
  if (cache.ephemeris.has(siteId)) return cache.ephemeris.get(siteId)!;

  const data = await fetchJson<SiteEphemeris>(`/data/ephemeris/${siteId}.json`, true);
  cache.ephemeris.set(siteId, data);
  return data;
}

/**
 * Load the terrain horizon profile for a given site
 * (`/data/horizon/{siteId}.json`).
 * Returns `null` when the file does not exist (404).
 * Results are cached per site after the first fetch.
 */
export async function loadTerrainHorizon(siteId: string): Promise<TerrainHorizon | null> {
  if (cache.horizon.has(siteId)) return cache.horizon.get(siteId)!;

  const data = await fetchJson<TerrainHorizon>(`/data/horizon/${siteId}.json`, true);
  cache.horizon.set(siteId, data);
  return data;
}

/**
 * Load the data manifest (`/data/manifest.json`).
 * Results are cached after the first successful fetch.
 */
export async function loadManifest(): Promise<DataManifest> {
  if (cache.manifest) return cache.manifest;

  const data = await fetchJson<DataManifest>('/data/manifest.json', false);
  cache.manifest = data;
  return data;
}

/**
 * Clear the entire loader cache.  Useful in tests or after a hot-reload.
 */
export function clearCache(): void {
  cache.catalogue = null;
  cache.manifest = null;
  cache.ephemeris.clear();
  cache.horizon.clear();
}
