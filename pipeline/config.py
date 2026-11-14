"""
MOONIX Pipeline Configuration
==============================
Central configuration for the SPICE ephemeris generation pipeline.
All paths are relative to the repository root unless otherwise noted.
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# Time domain
# ---------------------------------------------------------------------------
TIME_START = "2026-11-01T00:00:00"  # UTC start epoch
TIME_END = "2028-12-31T23:59:59"    # UTC end epoch
STEP_SECONDS = 3600                  # 1-hour sampling interval

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_ROOT = Path(__file__).resolve().parent.parent

KERNEL_DIR = _ROOT / "pipeline" / "kernels"       # SPICE kernel storage
OUTPUT_DIR = _ROOT / "frontend" / "public" / "data"  # JSON output for the frontend
LOLA_DIR = _ROOT / "pipeline" / "lola"             # LOLA DEM tiles (if available)

# ---------------------------------------------------------------------------
# JPL Horizons API
# ---------------------------------------------------------------------------
HORIZONS_API_URL = "https://ssd.jpl.nasa.gov/api/horizons.api"

# Rate limiting for Horizons validation queries
HORIZONS_RATE_LIMIT_SECONDS = 2.0   # Minimum seconds between API requests
HORIZONS_MAX_RETRIES = 3            # Retry count on transient failures
HORIZONS_TIMEOUT_SECONDS = 30       # HTTP request timeout

# ---------------------------------------------------------------------------
# SPICE Kernel Files
# ---------------------------------------------------------------------------
# Each kernel and its purpose. Download from https://naif.jpl.nasa.gov/naif/
REQUIRED_KERNELS = [
    # Leap-seconds kernel — maps UTC ↔ TDB
    "naif0012.tls",

    # Planetary constants — Moon radii, orientation (MOON_ME frame)
    "pck00011.tpc",

    # Lunar frame kernel — defines MOON_ME and MOON_PA frames
    "moon_pa_de440_200625.bpc",

    # Planetary + lunar ephemeris — positions of Sun, Earth, Moon barycentre
    "de440.bsp",

    # Lunar-specific ephemeris — high-accuracy Moon position/libration
    "moon_de440_220930.bsp",

    # Solar system body frame definitions
    "moon_080317.tf",
]

# Optional high-resolution kernels (download if available)
OPTIONAL_KERNELS = [
    # Lunar gravity field (used by some SPICE routines for surface normals)
    # "moon_grail_grgm1200a.bds",
]

# ---------------------------------------------------------------------------
# Site Catalogue
# ---------------------------------------------------------------------------
# The authoritative site list lives in frontend/public/data/sites.json.
# The pipeline reads it at runtime; do not duplicate site data here.
SITES_JSON = OUTPUT_DIR / "sites.json"

# ---------------------------------------------------------------------------
# Observer Parameters
# ---------------------------------------------------------------------------
OBSERVER_HEIGHT_KM = 0.002  # 2 metres above surface, in km

# Body angular radii (degrees, mean values as seen from the Moon)
SUN_ANGULAR_RADIUS_DEG = 0.27
EARTH_ANGULAR_RADIUS_DEG = 0.95

# Lunar mean radius (km)
LUNAR_RADIUS_KM = 1737.4

# Mean Earth–Moon distance (km)
MEAN_EARTH_MOON_DIST_KM = 384_400

# ---------------------------------------------------------------------------
# Terrain Horizon
# ---------------------------------------------------------------------------
HORIZON_AZIMUTH_BINS = 360        # 1° resolution
HORIZON_RAY_MAX_KM = 100          # Maximum ray-march distance (km)
HORIZON_RAY_MIN_KM = 0.5          # Skip terrain within this distance
