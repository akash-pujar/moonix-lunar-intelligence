/**
 * MOONIX Type Definitions
 * 
 * All TypeScript interfaces for the Lunar Landing Site Navigator.
 * These types define the static data schema, ephemeris data format,
 * terrain data, mission state, and computed metrics.
 */

// ============================================================
// Landing Site Types
// ============================================================

/** Coordinate reference frame for a landing site */
export type CoordinateFrame = 'MOON_ME' | 'MOON_PA' | 'IAU_MOON';

/** Data availability for terrain horizon masking */
export type TerrainAvailability = 'available' | 'pending' | 'unavailable';

/** A single lunar landing site entry */
export interface LandingSite {
  /** Unique identifier (kebab-case) */
  id: string;
  /** Display name */
  name: string;
  /** Selenographic latitude in degrees (positive = north) */
  latitude: number;
  /** Selenographic longitude in degrees (positive = east) */
  longitude: number;
  /** Coordinate reference frame */
  frame: CoordinateFrame;
  /** Associated mission name */
  mission: string;
  /** Operating nation or agency */
  nation: string;
  /** Brief description of the site */
  description: string;
  /** Source reference for coordinates */
  source: string;
  /** Whether terrain horizon data is available */
  terrainAvailability: TerrainAvailability;
  /** Region grouping for UI */
  region: 'south-pole' | 'near-side' | 'far-side' | 'equatorial';
}

/** The full site catalogue file schema */
export interface SiteCatalogue {
  version: string;
  generated: string;
  coordinateNote: string;
  sites: LandingSite[];
}

// ============================================================
// Ephemeris Data Types
// ============================================================

/** Data source for ephemeris values */
export type EphemerisSource = 'SPICE' | 'HORIZONS' | 'APPROXIMATE';

/** Quality flag for individual data points */
export type QualityFlag = 'nominal' | 'interpolated' | 'fallback' | 'missing';

/** A single hourly ephemeris data point */
export interface EphemerisPoint {
  /** ISO 8601 UTC timestamp */
  t: string;
  /** Sun azimuth in degrees [0, 360) */
  sunAz: number;
  /** Sun elevation in degrees [-90, 90] */
  sunEl: number;
  /** Earth azimuth in degrees [0, 360) */
  earthAz: number;
  /** Earth elevation in degrees [-90, 90] */
  earthEl: number;
}

/**
 * Compact ephemeris data format for a single site.
 * Stores metadata once and data as arrays for efficient storage.
 */
export interface SiteEphemeris {
  /** Site ID matching sites.json */
  siteId: string;
  /** Data source */
  source: EphemerisSource;
  /** ISO 8601 start timestamp */
  startTime: string;
  /** ISO 8601 end timestamp */
  endTime: string;
  /** Time step in seconds (3600 = hourly) */
  stepSeconds: number;
  /** Quality flags for the dataset */
  quality: QualityFlag;
  /** Number of data points */
  count: number;
  /** 
   * Compact data: array of [sunAz, sunEl, earthAz, earthEl]
   * Values in degrees, rounded to 2 decimal places
   */
  data: [number, number, number, number][];
  /** Array of ISO 8601 timestamps, one per data point */
  timestamps: string[];
}

// ============================================================
// Terrain Horizon Types
// ============================================================

/** Terrain horizon model for a single site */
export interface TerrainHorizon {
  /** Site ID */
  siteId: string;
  /** Observer height in metres above surface */
  observerHeightM: number;
  /** Azimuth step in degrees */
  azimuthStepDeg: number;
  /** Ray-march range in km */
  rayRangeKm: number;
  /** Data source description */
  source: string;
  /** Whether this is real terrain or flat-horizon fallback */
  isTerrain: boolean;
  /**
   * Horizon elevation at each azimuth.
   * Index 0 = 0° (north), index 90 = 90° (east), etc.
   * Values in degrees above geometric horizon.
   */
  elevations: number[];
}

// ============================================================
// Mission State Types
// ============================================================

/** Application mode */
export type AppMode = 'planner' | 'explorer';

/** The central mission configuration state */
export interface MissionState {
  /** Primary landing site ID */
  primarySiteId: string;
  /** Comparison site ID (null if not comparing) */
  comparisonSiteId: string | null;
  /** Mission start date (ISO 8601 date string YYYY-MM-DD) */
  missionDate: string;
  /** Landing time within the day (HH:MM UTC) */
  landingTime: string;
  /** Analysis window in days */
  analysisWindowDays: number;
  /** Current cursor position (ISO 8601 timestamp) */
  cursorTime: string;
  /** Date slip offset in days */
  dateSlipDays: number;
  /** Power weight for viability scoring (0-1) */
  powerWeight: number;
  /** Communication weight for viability scoring (0-1) */
  commWeight: number;
  /** Current application mode */
  mode: AppMode;
  /** Whether to use terrain horizon (true) or flat horizon (false) */
  useTerrainHorizon: boolean;
}

// ============================================================
// Computed Metrics Types
// ============================================================

/** Visibility interval */
export interface VisibilityInterval {
  /** Start timestamp ISO 8601 */
  start: string;
  /** End timestamp ISO 8601 */
  end: string;
  /** Duration in hours */
  durationHours: number;
}

/** A single sun/earth event */
export interface CelestialEvent {
  type: 'sunrise' | 'sunset' | 'earthrise' | 'earthset';
  time: string;
}

/** Viability status level */
export type ViabilityStatus = 'green' | 'amber' | 'red';

/** Computed metrics for a mission scenario */
export interface MissionMetrics {
  /** Percentage of analysis window with sun above horizon */
  solarAvailabilityPct: number;
  /** Percentage of analysis window with Earth above horizon */
  earthVisibilityPct: number;
  /** Maximum sun elevation in degrees */
  peakSolarElevation: number;
  /** Longest continuous darkness in hours */
  longestDarknessHours: number;
  /** Longest communication outage in hours */
  longestCommOutageHours: number;
  /** Longest continuous communication window in hours */
  longestCommWindowHours: number;
  /** List of sunlight intervals */
  sunlightIntervals: VisibilityInterval[];
  /** List of darkness intervals */
  darknessIntervals: VisibilityInterval[];
  /** List of Earth-visible intervals */
  earthVisibleIntervals: VisibilityInterval[];
  /** List of Earth-occluded intervals */
  earthOccludedIntervals: VisibilityInterval[];
  /** Ordered list of celestial events */
  events: CelestialEvent[];
}

/** Viability score breakdown */
export interface ViabilityScore {
  /** Overall score 0-100 */
  overall: number;
  /** Power component score 0-100 */
  powerScore: number;
  /** Communication component score 0-100 */
  commScore: number;
  /** Power weight used */
  powerWeight: number;
  /** Communication weight used */
  commWeight: number;
  /** Status classification */
  status: ViabilityStatus;
  /** Human-readable explanation */
  explanation: string;
}

/** Countdown to next event */
export interface Countdown {
  /** Event type */
  type: 'sunrise' | 'sunset' | 'earthrise' | 'earthset';
  /** Label for display */
  label: string;
  /** Time remaining in hours */
  hoursRemaining: number | null;
  /** Target event time */
  eventTime: string | null;
  /** Whether the body is currently visible */
  isCurrentlyVisible: boolean;
}

// ============================================================
// Data Manifest Types
// ============================================================

/** Data manifest tracking available datasets */
export interface DataManifest {
  version: string;
  generated: string;
  timeRange: {
    start: string;
    end: string;
  };
  stepSeconds: number;
  sites: {
    siteId: string;
    ephemerisFile: string | null;
    horizonFile: string | null;
    source: EphemerisSource;
    quality: QualityFlag;
  }[];
}

// ============================================================
// Date-Slip Heatmap Types
// ============================================================

/** A single cell in the date-slip heatmap */
export interface DateSlipCell {
  /** Date offset from base date */
  dayOffset: number;
  /** The date (YYYY-MM-DD) */
  date: string;
  /** Viability score for this date */
  score: number;
  /** Status classification */
  status: ViabilityStatus;
}

/** Heatmap data for date-slip analysis */
export interface DateSlipHeatmap {
  siteId: string;
  baseDate: string;
  range: number;
  cells: DateSlipCell[];
}

