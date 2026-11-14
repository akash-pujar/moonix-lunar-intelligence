# MOONIX — Assumptions & Simplifications

> This document records every modelling assumption and simplification made in
> MOONIX so that users can judge whether the tool is appropriate for their use
> case. Items are grouped by category and ordered roughly by impact.

---

## 1. Time Domain

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Start epoch | 2026-11-01 00:00:00 UTC | Covers near-term Artemis-era missions |
| End epoch | 2028-12-31 23:59:59 UTC | ~26-month planning window |
| Sample interval | 3 600 s (1 hour) | Balances data volume vs temporal resolution for slowly-varying lunar geometry |

- **Interpolation** between hourly samples is **linear**. Estimated interpolation error is < 0.5° for sun/earth elevation and azimuth, which change slowly from the lunar surface.
- All timestamps are in **UTC**. No leap-second handling beyond what SPICE provides.

## 2. Observer Model

| Parameter | Value |
|-----------|-------|
| Observer height above surface | **2 metres** |
| Atmospheric refraction | **None** (the Moon has no appreciable atmosphere) |
| Coordinate frame | **MOON_ME** (Mean Earth / Mean Rotation) body-fixed frame |

- The 2 m height represents a nominal crew eye-level or instrument mast on a lander.
- Because the Moon lacks an atmosphere, there is no refraction correction — what you compute geometrically is what you see.

## 3. Angular Sizes

| Body | Apparent angular radius | Notes |
|------|------------------------|-------|
| **Sun** | 0.27° | Mean value as seen from the Moon (≈ 1 AU distance) |
| **Earth** | 0.95° | Mean value at the Moon's mean geocentric distance (~384 400 km) |

- These are **mean values**; the actual angular size varies with orbital distance by a few percent over the course of a synodic period.
- Angular size matters for determining the exact moment a body clears or dips below the horizon (limb contact vs centre-of-disc).

## 4. Horizon Models

### 4.1 Flat Horizon (Default)

- All azimuths are assigned **0° elevation**.
- Used whenever terrain data is unavailable for a site.
- Suitable for sites on relatively flat maria but will over-estimate visibility near crater rims and mountain ranges.

### 4.2 Terrain Horizon (When Available)

| Parameter | Value |
|-----------|-------|
| Azimuth resolution | **1°** (360 bins) |
| Ray-march range | **50–100 km** from observer |
| Curvature correction | **Included** (lunar radius 1 737.4 km) |
| Elevation source | NASA LOLA gridded DEM |

- The ray-march accounts for lunar curvature so that distant terrain is correctly foreshortened.
- **Current status:** No terrain data is currently processed. All sites use the flat horizon model until the LOLA DEM pipeline is implemented and run.

## 5. Ephemeris Data Provenance Tiers

MOONIX strictly differentiates its astronomical data sources so that users always know the provenance and fidelity of every displayed value:

### 5.1 Tier 1: SPICE-Derived Ephemeris (Production Standard)
- **Engine:** NASA NAIF SPICE toolkit (CSPICE N0067 via SpiceyPy 8.4.0).
- **Kernels:** JPL DE440 planetary ephemeris (`de440s.bsp`), high-precision physical libration orientation (`moon_pa_de421_1900-2050.bpc`), lunar frames (`moon_080317.tf`, `moon_assoc_me.tf`).
- **Coordinate Frame:** `MOON_ME` (Mean Earth / Polar Axis body-fixed selenographic frame).
- **Aberration:** `LT+S` (Light-time and stellar aberration correction).
- **Accuracy:** Tested against JPL Horizons with mean absolute error **$< 0.0001^\circ$** ($0.36\text{ arcseconds}$).
- **UI Badge:** `SPICE EPHEMERIS (DE440 / MOON_ME)` in emerald green.
- **Coverage:** Precomputed hourly datasets stored in `public/data/ephemeris/<siteId>.json` for primary mission candidates.

### 5.2 Tier 2: JPL Horizons Ephemeris (Validation Baseline)
- **Engine:** NASA JPL Solar System Dynamics (SSD) Horizons On-line Ephemeris System API.
- **Observer Code:** `coord@301` on Moon geodetic ellipsoid.
- **Role:** Independent gold-standard scientific benchmark used to validate SPICE outputs and furnish fallback queries.
- **UI Badge:** `HORIZONS EPHEMERIS (JPL SSD)` in blue.

### 5.3 Tier 3: Approximate Geometric Model (Runtime Fallback)
- **Engine:** Client-side closed-form trigonometric calculation based on sub-solar and sub-Earth points with mean orbital periods and lunar radius parallax correction.
- **Formula:**
  $$\sin(\text{el}_0) = \sin(\phi) \sin(\phi_0) + \cos(\phi) \cos(\phi_0) \cos(\lambda - \lambda_0)$$
  $$\text{el} = \arcsin\left(\frac{D \sin(\text{el}_0) - R}{\sqrt{D^2 + R^2 - 2DR \sin(\text{el}_0)}}\right)$$
- **Role:** Used automatically when evaluating custom user-entered coordinates or sites where offline SPICE datasets are pending.
- **Accuracy:** $\sim 1^\circ \text{ to } 2^\circ$ typical error. Suitable for initial scouting, NOT for flight clearance.
- **UI Badge:** `APPROXIMATE (GEOMETRIC MODEL)` in amber.

### 5.4 Tier 4: Simulated Development Values (Legacy M1)
- **Engine:** Synthetic waveforms used during initial UI scaffold testing.
- **Role:** Completely replaced in M2 by authenticated SPICE/Horizons or Tier 3 approximate geometry.
- **UI Badge:** `SIMULATED (M1 PLACEHOLDER)` in rose (flagged for replacement).

## 6. Landing Site Coordinates

- Coordinates are sourced from **published mission reports**, peer-reviewed papers, and NASA fact sheets.
- Some coordinates represent **approximate centroids of landing ellipses** rather than pin-point locations.
- Users should verify coordinates against authoritative sources before using them for mission-critical planning.

## 7. Viability Score

- The viability score is a **weighted composite** of solar availability and Earth communication availability:

  ```
  overall = powerWeight × solarAvailabilityPct + commWeight × earthVisibilityPct
  ```

- Default weights: power = 0.6, communications = 0.4.
- Status thresholds: **Green ≥ 70**, **Amber ≥ 40**, **Red < 40**.

> [!CAUTION]
> The viability score is a **screening metric** designed to help narrow down
> candidate sites and date windows. It is **NOT** an engineering certification,
> a mission-readiness indicator, or a probability of mission success. Actual
> mission planning requires high-fidelity thermal, power, communications link
> budget, and trajectory analyses.

## 8. General Limitations

1. **No libration modelling** in the approximate model — SPICE handles libration implicitly through precise ephemerides.
2. **No occultation by local terrain features** smaller than the DEM resolution (currently N/A since terrain is not yet processed).
3. **No solar/Earth eclipses** are modelled (lunar eclipses are rare and brief).
4. **No thermal modelling** — surface temperature is not computed.
5. **No RF link-budget analysis** — Earth "visibility" means geometric line-of-sight only.
6. **Single-point observer** — no modelling of distributed assets or relay satellites.

---

*Last updated: November 2026*
