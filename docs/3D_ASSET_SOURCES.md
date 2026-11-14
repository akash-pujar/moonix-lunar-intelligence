# MOONIX — 3D Asset Sources & Texture Provenance

**Project:** MOONIX — Lunar Landing Site Navigator  
**Document:** 3D Asset Sources & Texture Documentation  
**Date:** 2026-11-14  

---

## 1. Lunar Texture Map (`moon_albedo.jpg`)

| Attribute | Specification |
|---|---|
| **Asset Name** | `moon_albedo.jpg` |
| **Location** | `frontend/public/textures/moon_albedo.jpg` |
| **Source** | NASA Goddard Space Flight Center / Scientific Visualization Studio (SVS) |
| **Dataset ID** | SVS Entry 4720 — **CGI Moon Kit** |
| **Direct URL** | `https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_1k.jpg` |
| **Origin Mission** | NASA Lunar Reconnaissance Orbiter (LRO) |
| **Instrument** | LROC (Lunar Reconnaissance Orbiter Camera) Wide Angle Camera (WAC) global multispectral mosaic |
| **Creator / Visualizer** | Ernie Wright (NASA GSFC / USRA) |
| **License** | Public Domain (NASA Open Data & Visual Content Guidelines) |
| **Projection** | Equirectangular ($360^\circ \times 180^\circ$), centered on prime meridian ($0^\circ\text{ Longitude}$) |
| **Native Dimensions** | $1024 \times 512$ pixels |
| **File Size** | 135.8 KB (optimized for web performance and low memory footprint) |
| **Usage** | Diffuse surface map and bump map (`bumpScale: 0.04`) in Three.js `MeshStandardMaterial` |

---

## 2. Procedural & Fallback Texture Engine

In environments where external network fetching is restricted or WebGL cannot load remote textures, MOONIX includes an inline procedural canvas texture generator:
- Generates a 512x256 grayscale equirectangular map simulating maria low-albedo basins (Oceanus Procellarum, Mare Tranquillitatis) and high-albedo cratered highlands.
- Applied automatically if texture loading encounters a network error.
- Static fallback canvas / SVG representation provided for non-WebGL devices.

---

## 3. Scientific Separation

- **Visual vs Analytical Distinction:**  
  The texture map on the 3D globe is solely a **visual and spatial orientation reference**.
- **Topographic Terrain Separation:**  
  Local terrain obstruction, line-of-sight elevation, and horizon profile analysis are calculated separately using the Python SPICE ephemeris pipeline and LOLA DEM products. The visual globe texture is never used as elevation ground truth for mission navigation decisions.

