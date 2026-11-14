# MOONIX — Validation Report

## Methodology

MOONIX ephemeris outputs are validated against the **JPL Horizons** system, the
de-facto reference for solar-system body positions. Validation compares computed
sun and Earth elevation/azimuth values at selected sites and dates.

### Procedure

1. For each validation sample, the MOONIX SPICE pipeline computes sun/earth
   elevation and azimuth for a given site at a given UTC timestamp.
2. The same query is submitted to
   [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) using the Horizons API
   with matching observer coordinates and epoch.
3. The absolute difference (Δ) between MOONIX and Horizons values is recorded.
4. Each sample is marked **PASS** or **FAIL** against the applicable accuracy
   threshold.

### Pass Criteria

| Model | Parameter | Threshold |
|-------|-----------|-----------|
| **SPICE pipeline** | Sun/Earth elevation | \|Δ\| < 0.1° |
| **SPICE pipeline** | Sun/Earth azimuth | \|Δ\| < 0.1° |
| **Approximate model** | Sun/Earth elevation | \|Δ\| < 2.0° |
| **Approximate model** | Sun/Earth azimuth | \|Δ\| < 2.0° |

---

## Validation Samples

> [!NOTE]
> Validation data will be populated when the SPICE pipeline is executed and
> Horizons queries are run. The rows below are placeholders.

| # | Site | Date (UTC) | Parameter | SPICE Value | Horizons Value | Δ (°) | Status |
|---|------|------------|-----------|-------------|----------------|--------|--------|
| 1 | Shackleton Rim | 2027-03-01 12:00 | Sun Elevation | — | — | — | **PENDING** |
| 2 | Aristarchus Plateau | 2027-06-15 00:00 | Earth Elevation | — | — | — | **PENDING** |
| 3 | Malapert Massif | 2027-09-10 06:00 | Sun Azimuth | — | — | — | **PENDING** |

---

## Aggregate Statistics

These statistics will be computed once all validation samples are populated.

| Metric | Sun Elevation | Sun Azimuth | Earth Elevation | Earth Azimuth |
|--------|---------------|-------------|-----------------|---------------|
| **Mean Absolute Error** | — | — | — | — |
| **Max Absolute Error** | — | — | — | — |
| **Samples** | — | — | — | — |
| **Pass Rate** | — | — | — | — |

---

## Approximate Model Validation

A separate validation pass compares the **approximate (sub-solar/sub-Earth
point)** model against SPICE outputs across a range of sites and dates. This
measures the internal consistency between the two MOONIX computation paths.

| Metric | Sun Elevation | Earth Elevation |
|--------|---------------|-----------------|
| **Mean Absolute Error** | — | — |
| **Max Absolute Error** | — | — |

Expected approximate-model error is **~1–2°** for elevation values.

---

## Notes

- Horizons queries use observer type **COORD** with body-fixed coordinates on
  the Moon (body 301), reference frame **MOON_ME**.
- Angular quantities are compared in the topocentric (local horizon) frame.
- Validation covers representative samples across the full time range
  (2026-11 to 2028-12) and multiple sites at different latitudes.
- See [`ASSUMPTIONS.md`](./ASSUMPTIONS.md) for full details on modelling
  simplifications.

---

*Last updated: November 2026*
