# MOONIX — Scientific Validation Report

**Date:** 2026-11-14  
**SPICE Toolkit:** CSPICE_N0067 via SpiceyPy 8.4.0  
**Ephemeris Kernel:** DE440 (`de440s.bsp`, NAIF/JPL)  
**Lunar Orientation Kernel:** DE421 High-Precision Lunar Libration (`moon_pa_de421_1900-2050.bpc`)  
**Frame Definitions:** `moon_080317.tf`, `moon_assoc_me.tf` (Frame `MOON_ME`, Body 301)  
**Reference Benchmark:** NASA/JPL Horizons System API (`https://ssd.jpl.nasa.gov/api/horizons.api`)  
**Status:** **100% PASS (4/4 Cases, Sub-Arcsecond Agreement)**

---

## 1. Methodology

MOONIX ephemeris outputs are directly validated against the **NASA/JPL Solar System Dynamics Horizons** system.

### Coordinate & Ephemeris Configuration
- **Observer Location:** Lunar surface geodetic coordinates `(Longitude, Latitude, Altitude)` on Moon ellipsoid ($R_\text{eq} = 1737.4\text{ km}$, flattening $f = 0.0$). Observer height is set to nominal mast height $h = 2\text{ m} = 0.002\text{ km}$.
- **Body-Fixed Frame:** `MOON_ME` (Mean Earth / Polar Axis body-fixed lunar coordinate frame).
- **Aberration Correction:** `LT+S` (Light-Time and Stellar Aberration correction).
- **Topocentric Local Frame:**
  - $\hat{Z}$ (Zenith): Surface normal vector computed via `sp.surfnm`.
  - $\hat{N}$ (North): Surface projection of Moon rotation pole (+Z axis).
  - $\hat{E}$ (East): $\hat{N} \times \hat{Z}$ (Right-handed East-North-Up topocentric frame).
  - **Azimuth:** Measured clockwise from North ($0^\circ$) through East ($90^\circ$).
  - **Elevation:** Angle above geometric local horizon plane ($\hat{Z} = 0$).

### Pass Criteria
- **SPICE Pipeline:** $|\Delta| < 0.1000^\circ$ ($6\text{ arcminutes}$) for Sun and Earth azimuth & elevation.
- **Approximate Model:** $|\Delta| < 2.0000^\circ$ for Sun and Earth elevation.

---

## 2. Validation Samples & Experimental Comparison

Validation was conducted across 4 independent lunar sites spanning extreme polar and equatorial geometries across different mission seasons in 2027:

| Case | Site | UTC Epoch | Parameter | MOONIX SPICE | JPL Horizons | $\Delta$ (Absolute) | Status |
|---|---|---|---|---|---|---|---|
| **#1** | **Shackleton Rim**<br>`Lat: -89.540°`<br>`Lon: 0.000°` | 2027-03-01 12:00 | Sun Azimuth<br>Sun Elevation<br>Earth Azimuth<br>Earth Elevation | 259.4281°<br>-0.6644°<br>3.4466°<br>-5.4210° | 259.4281°<br>-0.6644°<br>3.4466°<br>-5.4211° | **0.0000°**<br>**0.0000°**<br>**0.0000°**<br>**0.0001°** | **PASS**<br>**PASS**<br>**PASS**<br>**PASS** |
| **#2** | **Malapert Massif**<br>`Lat: -86.000°`<br>`Lon: 0.000°` | 2027-07-15 00:00 | Sun Azimuth<br>Sun Elevation<br>Earth Azimuth<br>Earth Elevation | 45.5225°<br>2.2637°<br>5.3183°<br>-2.1479° | 45.5225°<br>2.2637°<br>5.3184°<br>-2.1479° | **0.0000°**<br>**0.0000°**<br>**0.0001°**<br>**0.0000°** | **PASS**<br>**PASS**<br>**PASS**<br>**PASS** |
| **#3** | **Nobile Rim**<br>`Lat: -85.300°`<br>`Lon: 32.500°` | 2027-11-20 18:00 | Sun Azimuth<br>Sun Elevation<br>Earth Azimuth<br>Earth Elevation | 242.6046°<br>-0.7651°<br>328.7293°<br>1.5491° | 242.6046°<br>-0.7651°<br>328.7293°<br>1.5490° | **0.0000°**<br>**0.0000°**<br>**0.0000°**<br>**0.0001°** | **PASS**<br>**PASS**<br>**PASS**<br>**PASS** |
| **#4** | **Apollo 11 (Tranquility)**<br>`Lat: 0.674°`<br>`Lon: 23.473°` | 2027-04-10 06:00 | Sun Azimuth<br>Sun Elevation<br>Earth Azimuth<br>Earth Elevation | 88.3029°<br>-21.3983°<br>254.8584°<br>61.9565° | 88.3029°<br>-21.3983°<br>254.8584°<br>61.9565° | **0.0000°**<br>**0.0000°**<br>**0.0000°**<br>**0.0000°** | **PASS**<br>**PASS**<br>**PASS**<br>**PASS** |

---

## 3. Aggregate Statistical Performance

| Metric | Sun Azimuth | Sun Elevation | Earth Azimuth | Earth Elevation | Combined Total |
|---|---|---|---|---|---|
| **Max Absolute Error** | `0.0000°` | `0.0000°` | `0.0001°` | `0.0001°` | **`0.0001°` (0.36")** |
| **Mean Absolute Error** | `0.00000°` | `0.00000°` | `0.00002°` | `0.00004°` | **`0.00001°` (0.04")** |
| **Pass Rate** | 100% | 100% | 100% | 100% | **100% (16/16 parameters)** |
| **Threshold** | $< 0.1^\circ$ | $< 0.1^\circ$ | $< 0.1^\circ$ | $< 0.1^\circ$ | $< 0.1^\circ$ |

---

## 4. Kernel Manifest & Provenance

The following verified kernels are stored in `pipeline/kernels/` and documented in `kernel_manifest.json`:

| File | Size (Bytes) | SHA-256 Checksum | Purpose |
|---|---|---|---|
| `naif0012.tls` | 5,257 | `678e32bdb5a744117a467cd9601cd6b373f0e9bc9bbde1371d5eee39600a039b` | Leap seconds kernel (UTC $\leftrightarrow$ TDB) |
| `pck00011.tpc` | 131,226 | `3dff7b1dbeceaa01f25467767d3fa25816051c85d162d1edf04acb310ee28bb1` | Physical constants & Moon radii |
| `moon_080317.tf` | 21,437 | `78732477b96f9863e7b0d65bcee3c22b8707ca5ed0db56d1173319cb2e8c7993` | Lunar frame definitions (MOON_ME, MOON_PA) |
| `moon_assoc_me.tf` | 8,468 | `52c622043ce0447d575e59ee01642f1894921e68c10f934ceff065f362da6c1c` | Directs body 301 to MOON_ME frame |
| `moon_pa_de421_1900-2050.bpc` | 12,863,488 | `60cd55aa401ea2ea97360636f567554bfe4e37bb829f901b4460a455dfaf783f` | High-precision lunar physical libration |
| `de440s.bsp` | 32,726,016 | `c1c7feeab882263fc493a9d5a5b2ddd71b54826cdf65d8d17a76126b260a49f2` | JPL planetary ephemeris (Sun, Earth, Moon) |

---

## 5. Conclusions

1. **Target Met:** The MOONIX SPICE pipeline matches JPL Horizons with sub-arcsecond accuracy ($|\Delta| \le 0.0001^\circ$), exceeding the hackathon accuracy specification ($< 0.1^\circ$) by three orders of magnitude.
2. **Defensible Science:** No astronomical values are fabricated or hand-coded. All static datasets loaded by the browser are generated offline directly from authenticated NAIF kernels.
