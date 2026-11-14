# 🌙 MOONIX — Lunar Landing Site Navigator

<!-- Badges -->
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-In%20Development-yellow)
![NASA Space Apps](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-red)

**MOONIX** is an interactive planning tool that helps mission planners and space
enthusiasts evaluate lunar landing sites by visualising sun illumination, Earth
visibility, and surface conditions over time. Select a site, pick a date, and
instantly see whether your mission window has the power and communication
coverage you need.

---

## ✨ Key Features

- **Site Selection** — Browse a curated catalogue of scientifically significant
  landing sites from Apollo-era classics to Artemis-era polar targets.
- **Date & Window Planning** — Set a mission date and analysis window; see how
  conditions evolve hour by hour.
- **Sun & Earth Tracking** — Real-time (interpolated) elevation and azimuth of
  the Sun and Earth as seen from the landing site.
- **Terrain Awareness** — Terrain horizon profiles from NASA LOLA data show
  when nearby mountains block the view.
- **Viability Scoring** — A weighted composite score rates each site/date
  combination for solar power and Earth communications availability.
- **Site Comparison** — Compare two sites side-by-side for the same mission
  window.
- **Date-Slip Analysis** — Shift your landing date forward or backward and
  instantly see the impact on viability.

---

## 📸 Screenshots

> *Screenshots will be added after the UI is complete.*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Visualisation** | [D3.js](https://d3js.org/) |
| **Data Pipeline** | [Python 3.10+](https://python.org/) + [SpiceyPy](https://spiceypy.readthedocs.io/) |
| **Ephemeris** | [NASA NAIF SPICE](https://naif.jpl.nasa.gov/naif/) kernels |
| **Terrain** | [NASA LOLA](https://lola.gsfc.nasa.gov/) DEM via [Rasterio](https://rasterio.readthedocs.io/) |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 and **npm** (or pnpm)
- **Python** ≥ 3.10 (for the data pipeline, optional for frontend-only use)

### Clone & Install

```bash
git clone https://github.com/<your-org>/moonix.git
cd moonix

# Frontend
cd frontend
npm install
npm run dev          # → http://localhost:5173
```

### Generate Ephemeris Data (Optional)

```bash
# Install Python dependencies
cd pipeline
pip install -r requirements.txt

# Download SPICE kernels (see pipeline/config.py for list)
python download_kernels.py

# Generate ephemeris JSON files
python generate_ephemeris.py
```

The generated files are written to `frontend/public/data/` and picked up
automatically by the dev server.

---

## 📊 Data Generation

MOONIX computes ephemeris data in two tiers:

1. **SPICE Pipeline** (high accuracy, < 0.1° vs JPL Horizons) — runs offline
   in Python using NASA NAIF SPICE kernels. Produces hourly sun/earth position
   data for each site as JSON files.

2. **Approximate Model** (fallback, ~1–2° accuracy) — runs in the browser
   using sub-solar/sub-Earth point geometry. Used when SPICE data has not been
   generated for a site.

See [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) for full methodology details
and [`docs/VALIDATION.md`](docs/VALIDATION.md) for accuracy validation.

---

## 🔬 Scientific Methodology

Body positions (elevation, azimuth) are computed in the **MOON_ME** body-fixed
frame for an observer at 2 m above the surface. The horizon is modelled as
either a flat plane (0° at all azimuths) or a terrain profile ray-marched from
NASA LOLA DEM data at 1° azimuth resolution.

Visibility is determined by comparing the body's elevation plus its angular
radius (Sun: 0.27°, Earth: 0.95°) against the horizon elevation at the body's
azimuth. A body is considered visible when any part of its disc is above the
local horizon.

---

## 📚 Data Credits

- **Ephemeris:** [NASA NAIF SPICE Toolkit](https://naif.jpl.nasa.gov/naif/) and
  [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)
- **Terrain:** [NASA Lunar Orbiter Laser Altimeter (LOLA)](https://lola.gsfc.nasa.gov/)
- **Imagery reference:** [Lunar Reconnaissance Orbiter Camera (LROC)](https://www.lroc.asu.edu/)

---

## ⚠️ Limitations

- Approximate model accuracy is ~1–2°; not suitable for engineering decisions.
- No thermal, RF link-budget, or trajectory analysis.
- Terrain horizon data is not yet processed — all sites currently use a flat
  horizon.
- Viability score is a screening metric, not an engineering certification.
- Site coordinates may be approximate centroids of landing ellipses.

See [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) for a complete list.

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for
details.

---

## 🚫 Disclaimer

> **MOONIX is an educational and planning-support tool developed for the NASA
> Space Apps Challenge. It is not affiliated with, endorsed by, or funded by
> NASA, JPL, or any space agency. Do not use MOONIX outputs as the sole basis
> for mission-critical decisions. Always validate results against authoritative
> sources and high-fidelity mission planning tools.**

---

*Built with 🚀 for the NASA Space Apps Challenge*
