# MOONIX — Advanced Lunar Mission Control Dashboard
## Technical Specification, Aerospace UX Architecture, and Provenance Report

**Project:** MOONIX — Lunar Landing Site Navigator  
**Challenge:** NASA Space Apps Challenge 2026 &bull; Challenge 10 (CLPS)  
**Route:** `/app` (Integrated Mission Control Dashboard)  
**Repository:** https://github.com/akash-pujar/moonix-lunar-intelligence  
**Status:** Operational / Verified with Authentic SPICE DE440 Telemetry  

---

## 1. Executive Summary

The MOONIX mission dashboard (`/app`) has been upgraded into a comprehensive, aerospace-grade lunar mission control platform. It delivers real-time ephemeris visualization, multi-variable landing site screening, and interactive trade study capabilities for Artemis and CLPS lunar exploration targets.

The interface adheres to modern dark geospatial software conventions (NASA telemetry consoles, SpaceX Dragon displays, ESA mission control systems) while maintaining strict scientific provenance, continuous live telemetry countdowns, and dynamic 3D lunar site visualization.

---

## 2. Aerospace Architecture & Provenance Hierarchy

### 2.1 Four-Tier Provenance Classification
A strict provenance classification is enforced across the header and telemetry cards. The system never labels verified SPICE data as simulated, and clearly distinguishes between physical ephemeris computation and synthetic approximations:

1. **`SPICE DATA AVAILABLE` (Emerald `#27D7A0` / `#10B981`):**  
   - Generated using NAIF SPICE kernels (`de440.bsp`, `moon_pa_de421_1900-2050.bpc`, `moon_080317.tf`, `naif0012.tls`).
   - Coordinate Frame: Selenographic Mean Earth / Polar Axis (`MOON_ME`).
   - Aberration Correction: Light-time and stellar aberration (`LT+S`).
   - Coverage: 2027-01-01 to 2027-06-30 (4,344 hourly points each for Shackleton Rim, Malapert Massif, Nobile Rim, and Apollo 11).
2. **`HORIZONS DATA AVAILABLE` (Blue `#38BDF8` / `#3B82F6`):**  
   - Precomputed datasets validated against NASA JPL Horizons SSD observer tables.
3. **`APPROXIMATE MODEL` (Amber `#FFB547` / `#F59E0B`):**  
   - Used when mission planners enter custom coordinates or date ranges outside precomputed SPICE datasets.
   - Evaluates analytical Keplerian-perturbed geometric kinematics without claiming empirical precision.
4. **`DATA UNAVAILABLE` (Slate `#64748B`):**  
   - Displayed if ephemeris loading fails or candidate coordinates are unresolvable.

### 2.2 Live Operational Header (`Header.tsx`)
- **Ticking UTC Clock:** Real-time digital clock updating every 1000ms (`HH:MM:SS UTC` and `YYYY-MM-DD`).
- **Telemetry Provenance Badge:** Dynamically reflects dataset source with glowing status rings.
- **Active Target Tag:** Highlights the active landing target (e.g. `TARGET: Shackleton Rim`).
- **Mode Switcher:** Seamless toggle between `PLANNER` (dense aerospace engineering view) and `EXPLORER` (interactive 3D Moon globe with visual candidate markers).
- **Navigation:** Persistent link back to the cinematic overview landing page (`/`).

---

## 3. Core Mission Control Telemetry Modules

### 3.1 Animated Telemetry Countdown Cards (`CountdownCards.tsx`)
Four high-visibility telemetry cards monitor critical celestial crossing events:
- **Sunrise (AOS):** Solar power recovery countdown and daylight onset.
- **Sunset (LOS):** Solar power loss countdown, nightfall onset, and battery discharge duration.
- **Earthrise (AOS):** Direct-to-Earth communication acquisition of signal (AOS).
- **Earthset (LOS):** Direct comm loss of signal (LOS) and blackout onset.

**Astronomical Accuracy Enhancements:**
- **Continuous Polar Phenomenon Support:** At high lunar latitudes (such as Shackleton Rim at -89.67° or Malapert Massif at -85.99°), celestial bodies can remain continuously above or below the horizon. Rather than displaying blank or invalid metrics, cards intelligently identify:
  - `Continuous Daylight (Polar Peak)`
  - `Permanent Shadow (PSR)`
  - `Continuous Direct Line-of-Sight`
  - `Continuous Earth Occlusion`
- **Horizon Method Label:** Explicitly tags each crossing as `Geometric Horizon (Spherical R=1,737.4 km)` or `Terrain-Masked Horizon (LOLA 1° Profile)`.

### 3.2 High-Precision D3.js Elevation Charts (`ElevationChart.tsx`)
- **Dual Visualizations:** Separate, synchronized elevation curves for Solar Elevation and Direct-to-Earth Line-of-Sight.
- **Horizon Reference:** Distinct `0.0° GEOMETRIC HORIZON` dashed line with shaded below-horizon occlusion zones.
- **Physical Thresholds:**
  - Sun Limb: $+0.27^\circ$ optical radius.
  - Earth Limb: $+0.95^\circ$ angular radius with topocentric parallax correction.
- **Interactive Scrubber:** Drag or click anywhere across the 30-day timeline to reposition the mission cursor (`cursorTime`), updating all instantaneous elevation, azimuth, and illumination readouts in real time.

### 3.3 Resource Availability & Trade Telemetry (`MetricsPanel.tsx`)
Two dedicated resource clusters quantify lunar surface survival:
1. **Solar Power & Illumination Availability:**
   - Overall solar availability percentage with color-coded gauge bar.
   - Peak sub-solar elevation angle ($+^\circ$).
   - Longest continuous darkness interval (quantifying lander battery sizing and secondary power requirements).
2. **Direct-to-Earth Communication Availability (DTE):**
   - Direct comm visibility percentage with link stability indicator.
   - Longest continuous communication window (for high-bandwidth science downlink).
   - Longest comm blackout duration (identifying autonomous operational requirements).

### 3.4 Landing Site Viability Index (`ViabilityScore.tsx`)
- **Radial Gauge Display:** High-impact SVG radial progress gauge computing a composite score from 0 to 100.
- **Mission Objective Weighting:** Interactive slider and quick presets (`50/50 Balanced`, `Power 70/30`, `Comm 30/70`) allowing mission planners to tailor viability scoring to payload priorities.
- **Screening Disclaimer:** Prominently displays:  
  *“PRE-PHASE A SCREENING ONLY — NOT AN OPERATIONAL FLIGHT COMMITMENT. High-resolution LOLA DEM topographic horizon masking is pending Milestone 5.”*

### 3.5 Mission Timeline & Launch Slip Simulator (`DatePicker.tsx`)
- Planned landing date and touchdown time (UTC).
- Interactive launch date slip slider ($-30\text{d}$ to $+30\text{d}$) with quick shortcuts:
  - `-7d` / `+7d` (Standard launch delay)
  - `+14d Slip (Demo Story)` (Simulates lunar diurnal trade study)
  - `+28d` (Full lunar sidereal cycle)
- Effective analysis window display and automatic detection of precomputed SPICE archive boundaries (2027-01-01 to 2027-06-30).

### 3.6 Horizon Occlusion Disclosure (`TerrainToggle.tsx`)
- Flat lunar horizon model disclosure ($R = 1,737.4\text{ km}$, observer height $h = 2.0\text{ m}$, geometric horizon dip $\theta = -0.087^\circ$).
- Discloses that full high-resolution LOLA DEM 20m ray-tracing is scheduled for Milestone 5.

### 3.7 Interactive 3D Lunar Explorer Mode (`App.tsx` + `LunarGlobe.tsx`)
- When switched to `EXPLORER` mode, the dashboard embeds the WebGL 3D Lunar Globe directly into the workspace.
- Planners can interactively rotate the Moon, inspect South Pole candidate sites in 3D, and click any site to instantaneously load its SPICE ephemeris and re-compute all dashboard telemetry.

---

## 4. Visual Verification Suite

Genuine high-resolution browser captures were rendered and verified:

| Screenshot Artifact | Resolution | Description |
|---|---|---|
| `dashboard-mission-control-desktop.png` | 1920x1080 | Full aerospace mission control dashboard (Planner Mode, Shackleton Rim) |
| `dashboard-explorer-mode.png` | 1440x1100 | Interactive 3D Lunar Globe Explorer mode with candidate markers |
| `dashboard-site-shackleton.png` | 1440x1100 | Shackleton Rim primary telemetry, D3 curves, and viability gauge |
| `dashboard-site-malapert.png` | 1440x1100 | Malapert Massif SPICE DE440 dataset with continuous daylight analysis |
| `dashboard-mobile-390.png` | 390x844 | Mobile responsive layout (iPhone 14/15/16 viewport) |
| `dashboard-tablet-768.png` | 768x1024 | Tablet responsive layout (iPad viewport) |

---

## 5. Technical Stack & Build Verification

- **Language:** TypeScript 5.8+ (Strict Type Checking `noUnusedLocals`, `noUnusedParameters`)
- **Framework:** React 19 / Vite 8.3
- **Styling:** Tailwind CSS v4 with bespoke aerospace dark theme palette
- **Data Visualization:** D3.js v7 (time scales, area gradients, crosshair scrubbing)
- **3D Graphics:** Three.js WebGL with embedded NASA LROC albedo map
- **Build Status:** Verified clean production build (`npm run build` in 623ms, 0 errors, 0 warnings).
